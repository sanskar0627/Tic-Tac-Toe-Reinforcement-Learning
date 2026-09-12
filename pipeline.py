import os
import numpy as np
import torch
from model import TicTacToeNet
from self_play import self_play_batch
from train import train_network
from game import TicTacToe
from mcts import mcts_search


def play_against_random(neural_net, num_games=40, num_simulations=25):
    """
    Pit the AI against a random player to measure strength.
    AI plays as both X and O (half the games each) to be fair.
    """
    wins = 0
    draws = 0
    losses = 0

    for game_num in range(num_games):
        game = TicTacToe()
        ai_player = 1 if game_num < num_games // 2 else -1

        while True:
            if game.current_player == ai_player:
                probs = mcts_search(game, neural_net, num_simulations=num_simulations)
                action = np.argmax(probs)
            else:
                legal_moves = game.get_legal_moves()
                action = np.random.choice(legal_moves)

            game.make_move(action)
            winner = game.check_winner()

            if winner is not None:
                if winner == ai_player:
                    wins += 1
                elif winner == 0:
                    draws += 1
                else:
                    losses += 1
                break

    win_rate = wins / num_games
    return win_rate, wins, draws, losses


def evaluate_against_old(new_net, old_net, num_games=40, num_simulations=25):
    """
    Play the new model against the old model WITH randomness.
    Uses temperature sampling for the first 2 moves to create game variety,
    then plays best moves after that.
    """
    new_wins = 0
    old_wins = 0
    draws = 0

    for game_num in range(num_games):
        game = TicTacToe()
        new_plays_as = 1 if game_num < num_games // 2 else -1
        move_count = 0

        while True:
            if game.current_player == new_plays_as:
                probs = mcts_search(game, new_net, num_simulations=num_simulations)
            else:
                probs = mcts_search(game, old_net, num_simulations=num_simulations)

            # Add randomness in early moves for game variety
            if move_count < 2:
                probs = probs + 1e-6
                probs = probs / probs.sum()
                action = np.random.choice(9, p=probs)
            else:
                action = np.argmax(probs)

            move_count += 1
            game.make_move(action)
            winner = game.check_winner()

            if winner is not None:
                if winner == new_plays_as:
                    new_wins += 1
                elif winner == 0:
                    draws += 1
                else:
                    old_wins += 1
                break

    # Count draws as half a win (standard in game AI evaluation)
    # Like Elo: a draw = 0.5 points, not 0
    score = (new_wins + 0.5 * draws) / num_games
    return score, new_wins, draws, old_wins


def run_training_pipeline(
    num_iterations=20,
    games_per_iteration=50,
    simulations_per_move=25,
    epochs_per_iteration=10,
    batch_size=32,
    learning_rate=0.001,
    checkpoint_dir="checkpoints"
):
    """
    The full AlphaGo Zero training loop.
    """
    os.makedirs(checkpoint_dir, exist_ok=True)

    net = TicTacToeNet()
    all_metrics = []
    replay_buffer = []

    print("=" * 60)
    print("ALPHAZERO TRAINING PIPELINE")
    print("=" * 60)

    # Baseline
    print("\n--- Baseline (untrained) ---")
    win_rate, w, d, l = play_against_random(net, num_games=40, num_simulations=simulations_per_move)
    print(f"vs Random: {w}W / {d}D / {l}L (win rate: {win_rate:.1%})")
    all_metrics.append({'iteration': 0, 'win_rate': win_rate, 'loss': None})

    for iteration in range(1, num_iterations + 1):
        print(f"\n{'=' * 60}")
        print(f"ITERATION {iteration}/{num_iterations}")
        print(f"{'=' * 60}")

        # --- Step 1: Self-play ---
        print(f"\n[1/4] Self-play: {games_per_iteration} games...")
        net.eval()
        examples = self_play_batch(
            net,
            num_games=games_per_iteration,
            num_simulations=simulations_per_move
        )

        # Add to replay buffer, keep last 5000 examples
        replay_buffer.extend(examples)
        if len(replay_buffer) > 5000:
            replay_buffer = replay_buffer[-5000:]
        print(f"Replay buffer size: {len(replay_buffer)}")

        # --- Step 2: Train on accumulated data ---
        print(f"\n[2/4] Training on {len(replay_buffer)} examples...")
        net.train()
        losses = train_network(
            net, replay_buffer,
            epochs=epochs_per_iteration,
            batch_size=batch_size,
            lr=learning_rate
        )

        # --- Step 3: Evaluate against random ---
        print(f"\n[3/4] Evaluating against random player...")
        net.eval()
        win_rate, w, d, l = play_against_random(
            net, num_games=40,
            num_simulations=simulations_per_move
        )
        print(f"vs Random: {w}W / {d}D / {l}L (win rate: {win_rate:.1%})")

        # --- Step 4: Evaluate against previous version (no rollback) ---
        # For Tic-Tac-Toe, model-vs-model rollback is counterproductive:
        # the game is too simple for head-to-head to distinguish improvements.
        # We log the comparison but always keep the new model.
        # For your 5x5 Go project, rollback WILL make sense.
        if iteration > 1:
            print(f"\n[4/4] Comparing to previous model (no rollback)...")
            old_net = TicTacToeNet()
            old_checkpoint = os.path.join(checkpoint_dir, f"model_iter_{iteration - 1}.pt")
            old_net.load_state_dict(torch.load(old_checkpoint, weights_only=True))
            old_net.eval()

            new_score, nw, nd, ow = evaluate_against_old(
                net, old_net, num_games=40,
                num_simulations=simulations_per_move
            )
            print(f"vs Old model: {nw}W / {nd}D / {ow}L (score: {new_score:.1%})")
            print(f"Keeping new model (rollback disabled for Tic-Tac-Toe).")
        else:
            print(f"\n[4/4] First iteration, skipping model comparison.")

        # Track metrics
        avg_loss = np.mean(losses)
        all_metrics.append({
            'iteration': iteration,
            'win_rate': win_rate,
            'loss': avg_loss
        })

        # Checkpoint
        checkpoint_path = os.path.join(checkpoint_dir, f"model_iter_{iteration}.pt")
        torch.save(net.state_dict(), checkpoint_path)
        print(f"Saved checkpoint: {checkpoint_path}")

    # Final summary
    print(f"\n{'=' * 60}")
    print("TRAINING COMPLETE")
    print(f"{'=' * 60}")
    print(f"\nWin rate progression:")
    for m in all_metrics:
        bar = '█' * int(m['win_rate'] * 30)
        loss_str = f"loss={m['loss']:.3f}" if m['loss'] else "baseline"
        print(f"  Iter {m['iteration']:2d}: {m['win_rate']:.1%} {bar}  ({loss_str})")

    final_path = os.path.join(checkpoint_dir, "model_final.pt")
    torch.save(net.state_dict(), final_path)
    print(f"\nFinal model saved: {final_path}")

    return net, all_metrics


if __name__ == "__main__":
    net, metrics = run_training_pipeline(
        num_iterations=15,
        games_per_iteration=50,
        simulations_per_move=50,
        epochs_per_iteration=10,
        batch_size=64,
        learning_rate=0.001
    )