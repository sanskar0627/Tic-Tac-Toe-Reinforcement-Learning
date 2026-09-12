import torch
import torch.nn as nn
import torch.nn.functional as F


class TicTacToeNet(nn.Module):
    """
    nn.Module is PyTorch's base class for all neural networks.
    Think of it like extending a base Router class in Express:
    
        class MyRouter extends express.Router { ... }
    
    You define the layers (middleware) in __init__,
    and define how data flows through them in forward().
    """

    def __init__(self):
        super().__init__()  # Initialize the parent class (like calling super() in JS)

        # === Shared layers (the "backbone") ===
        # These learn general board understanding used by BOTH heads.

        # nn.Linear(9, 128) = a layer that takes 9 inputs and produces 128 outputs.
        # "Linear" means it does: output = input * weights + bias
        # 9 inputs because our board has 9 cells.
        # 128 outputs is a choice — it's the "width" of the hidden layer.
        # Think of it as: 9 raw features get expanded into 128 learned features.
        # Like going from 9 database columns to 128 computed columns.
        self.shared1 = nn.Linear(9, 128)
        self.shared2 = nn.Linear(128, 128)

        # === Policy head (move prediction) ===
        # Takes the 128 learned features and produces 9 move probabilities.
        self.policy_head = nn.Linear(128, 9)

        # === Value head (position evaluation) ===
        # Takes the 128 learned features and produces 1 score.
        self.value_head = nn.Linear(128, 1)

    def forward(self, x):
        """
        forward() defines how data flows through the network.
        PyTorch calls this automatically when you do: output = model(input)
        
        Think of it as the handler function in your Express route:
            router.get('/predict', (req, res) => { ... })
        
        x is the input tensor — a board state of shape [batch_size, 9]
        """
        # === Shared backbone ===
        # Pass through layer 1, then ReLU activation
        # ReLU = if negative, make it 0. If positive, keep it.
        # Why? Without ReLU, stacking layers is pointless (see Step 1).
        x = F.relu(self.shared1(x))

        # Pass through layer 2, then ReLU again
        x = F.relu(self.shared2(x))

        # === Policy head ===
        # Linear layer: 128 features → 9 raw scores (called "logits")
        # Softmax: converts raw scores into probabilities that sum to 1.0
        # dim=-1 means "apply softmax across the last dimension" (the 9 cells)
        #
        # Example: logits [2.0, 1.0, 0.1, ...] → softmax → [0.59, 0.22, 0.09, ...]
        # Higher logit = higher probability = network thinks this move is better.
        policy = F.softmax(self.policy_head(x), dim=-1)

        # === Value head ===
        # Linear layer: 128 features → 1 raw number
        # Tanh: squashes any number into the range (-1, +1)
        #   - Large positive → close to +1 (winning)
        #   - Large negative → close to -1 (losing)  
        #   - Near zero → close to 0 (even position)
        # .squeeze(-1) removes the last dimension: shape [batch, 1] → [batch]
        value = torch.tanh(self.value_head(x)).squeeze(-1)

        return policy, value

if __name__ == "__main__":
    # Create the network (all weights start random)
    net = TicTacToeNet()

    # Count total trainable parameters (weights + biases)
    total_params = sum(p.numel() for p in net.parameters())
    print(f"Total trainable parameters: {total_params}")

    # Create a fake board state: X in center, O in top-left
    # unsqueeze(0) adds a "batch" dimension: shape [9] → [1, 9]
    # PyTorch expects batches even for a single input, like how an API
    # endpoint expects an array even if you're sending one item.
    import sys
    sys.path.append('.')
    from game import TicTacToe

    game = TicTacToe()
    game.make_move(4)  # X center
    game.make_move(0)  # O top-left
    game.display()

    state = game.get_state_tensor().unsqueeze(0)  # [9] → [1, 9]
    print(f"Input shape: {state.shape}")
    print(f"Input: {state}")

    # Run it through the network
    policy, value = net(state)

    print(f"\nPolicy (move probabilities): {policy.detach().numpy()}")
    print(f"Policy sum: {policy.sum().item():.4f}")  # Should be ~1.0
    print(f"Value (position score): {value.item():.4f}")  # Random number between -1 and 1
    print(f"\nBest move according to (untrained) network: cell {policy.argmax().item()}")