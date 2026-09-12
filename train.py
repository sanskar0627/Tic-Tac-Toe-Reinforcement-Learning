import numpy as np
import torch
import torch.nn.functional as F
from model import TicTacToeNet
from self_play import self_play_batch


def train_network(neural_net, training_examples, epochs=10, batch_size=32, lr=0.001):
    """
    Train the neural network on self-play data.
    
    Args:
        neural_net: the TicTacToeNet model
        training_examples: list of (state_tensor, mcts_probs, result) from self-play
        epochs: how many times to loop through the entire dataset
                (like re-reading your textbook multiple times)
        batch_size: how many examples to process at once
                    (like processing API requests in batches instead of one by one)
        lr: learning rate (how big each weight adjustment is)
    
    Returns:
        losses: list of average loss per epoch (for tracking progress)
    """
    # === Set up the optimizer ===
    # Adam is a popular optimizer. It's like an auto-tuning rate limiter:
    # it adjusts the learning rate per-weight based on past updates.
    # You could use basic SGD, but Adam converges faster and is more forgiving.
    optimizer = torch.optim.Adam(neural_net.parameters(), lr=lr)

    # Put the network in training mode
    # (This enables certain behaviors like dropout, though we don't use it.
    #  Good habit to always do this. Like setting NODE_ENV=development.)
    neural_net.train()

    losses = []

    for epoch in range(epochs):
        # Shuffle the data each epoch so the network doesn't memorize the order
        # Like randomizing your test suite to catch order-dependent bugs
        np.random.shuffle(training_examples)

        epoch_losses = []

        # Process in batches
        for batch_start in range(0, len(training_examples), batch_size):
            batch = training_examples[batch_start:batch_start + batch_size]

            # Unpack the batch into separate tensors
            # Stack = combine a list of tensors into one big tensor
            # Like Promise.all() — wait for all items, then process together
            states = torch.stack([example[0] for example in batch])
            target_probs = torch.FloatTensor(np.array([example[1] for example in batch]))
            target_values = torch.FloatTensor(np.array([example[2] for example in batch]))

            # === Forward pass: run the batch through the network ===
            predicted_probs, predicted_values = neural_net(states)

            # === Calculate policy loss (cross-entropy) ===
            # We can't use PyTorch's built-in cross_entropy because our targets
            # are probability distributions, not class labels.
            # Manual cross-entropy: -sum(target * log(predicted))
            # The clamp(min=1e-8) prevents log(0) which would be -infinity.
            policy_loss = -torch.sum(target_probs * torch.log(predicted_probs.clamp(min=1e-8))) / len(batch)

            # === Calculate value loss (MSE) ===
            # (predicted - target)^2, averaged over the batch
            value_loss = F.mse_loss(predicted_values, target_values)

            # === Total loss ===
            total_loss = policy_loss + value_loss

            # === Backward pass + weight update ===
            optimizer.zero_grad()  # Clear old gradients (like clearing a cache before recomputing)
            total_loss.backward()  # Backpropagation: compute gradients for every weight
            optimizer.step()       # Update weights: weight += -learning_rate * gradient

            epoch_losses.append(total_loss.item())

        avg_loss = np.mean(epoch_losses)
        losses.append(avg_loss)
        print(f"  Epoch {epoch + 1}/{epochs} — Loss: {avg_loss:.4f}")

    return losses


if __name__ == "__main__":
    # Create an untrained network
    net = TicTacToeNet()

    # Generate training data from 10 self-play games
    print("=== Generating training data (10 self-play games) ===\n")
    examples = self_play_batch(net, num_games=10, num_simulations=25)

    # Train on that data for 10 epochs
    print("\n=== Training ===\n")
    losses = train_network(net, examples, epochs=10, batch_size=32, lr=0.001)

    print(f"\nLoss went from {losses[0]:.4f} → {losses[-1]:.4f}")
    if losses[-1] < losses[0]:
        print("Loss decreased! The network is learning from the self-play data.")
    else:
        print("Loss didn't decrease. This can happen with very little data — not a bug.")

    # Quick sanity check: run the network on an empty board
    print("\n=== Quick test on empty board ===\n")
    from game import TicTacToe
    game = TicTacToe()
    state = game.get_state_tensor().unsqueeze(0)

    net.eval()  # Switch to evaluation mode (opposite of .train())
    with torch.no_grad():
        policy, value = net(state)

    print(f"Policy: [{', '.join(f'{p:.3f}' for p in policy.squeeze().numpy())}]")
    print(f"Value:  {value.item():.4f}")
    print(f"Best move: cell {policy.argmax().item()}")

