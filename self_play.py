import numpy as np
import torch
from game import TicTacToe
from mcts import mcts_search


def self_play_game(neural_net, num_simulations=50, temp_threshold=3):
    """
    Play one full game of self-play.
    
    The neural network plays BOTH sides, using MCTS to pick each move.
    
    Args:
        neural_net: the TicTacToeNet model
        num_simulations: how many MCTS simulations per move
        temp_threshold: use exploration (temperature=1) for the first N moves,
                        then play greedy (temperature→0) after that
    
    Returns:
        training_examples: list of (board_tensor, mcts_probs, result)
        
    Think of this as a data pipeline:
    - Input: a neural network
    - Process: play a complete game, recording every move
    - Output: labeled training data
    """
    game = TicTacToe()
    training_examples = []  # Will collect (state, probs, player) tuples
    move_count = 0

    while True:
        # Get the board state tensor BEFORE making a move
        # (from current player's perspective, thanks to get_state_tensor)
        state_tensor = game.get_state_tensor()

        # Run MCTS to get move probabilities
        mcts_probs = mcts_search(game, neural_net, num_simulations=num_simulations)

        # Store the example. We don't know the result yet (game isn't over),
        # so we store the current player and fill in the result later.
        # Like creating a database record with a NULL column you'll UPDATE later.
        training_examples.append({
            'state': state_tensor,
            'mcts_probs': mcts_probs,
            'player': game.current_player
        })

        # Pick a move based on temperature
        if move_count < temp_threshold:
            # Temperature = 1: sample proportionally to visit counts
            # More exploration → more diverse training data
            action = np.random.choice(9, p=mcts_probs)
        else:
            # Temperature → 0: always pick the best move
            action = np.argmax(mcts_probs)

        move_count += 1
        game.make_move(action)

        # Check if game is over
        winner = game.check_winner()
        if winner is not None:
            # Game is done! Now fill in the results.
            # Like running an UPDATE query: SET result = ... WHERE game_id = ...
            completed_examples = []
            for example in training_examples:
                if winner == 0:
                    # Draw: result is 0 for everyone
                    result = 0.0
                else:
                    # The result is +1 if this player won, -1 if they lost
                    result = 1.0 if example['player'] == winner else -1.0

                completed_examples.append((
                    example['state'],       # Board tensor (network input)
                    example['mcts_probs'],  # MCTS probabilities (policy target)
                    result                  # Game outcome (value target)
                ))

            return completed_examples

def self_play_batch(neural_net, num_games=10, num_simulations=25):
    """
    Play multiple self-play games and collect all training examples.
    
    Like a batch job that runs N data pipeline jobs and merges the output.
    
    Args:
        neural_net: the TicTacToeNet model
        num_games: how many games to play
        num_simulations: MCTS simulations per move
    
    Returns:
        all_examples: list of (state, mcts_probs, result) from ALL games
    """
    all_examples = []

    for game_num in range(num_games):
        examples = self_play_game(neural_net, num_simulations=num_simulations)
        all_examples.extend(examples)
        
        # Progress update
        result = examples[-1][2]  # Last move's result tells us who won
        result_str = {1.0: "X wins", -1.0: "O wins", 0.0: "Draw"}
        # The last example's player determines the display:
        # If last move result is +1, the last player won. 
        # But since we alternate, the game winner is player 1 if odd moves, etc.
        # Simpler: just count moves
        moves = len(examples)
        print(f"  Game {game_num + 1}/{num_games}: {moves} moves, "
              f"collected {len(examples)} examples")

    print(f"\nTotal: {len(all_examples)} training examples from {num_games} games")
    return all_examples

if __name__ == "__main__":
    from model import TicTacToeNet

    net = TicTacToeNet()

    print("Playing 10 self-play games...\n")
    all_examples = self_play_batch(net, num_games=10, num_simulations=25)

    # Show what the data looks like
    print(f"\n--- Sample training example ---")
    state, probs, result = all_examples[0]
    print(f"State tensor: {state}")
    print(f"MCTS probs:   [{', '.join(f'{p:.2f}' for p in probs)}]")
    print(f"Result:       {result} ({'WIN' if result == 1 else 'LOSS' if result == -1 else 'DRAW'})")
    print(f"\nThis is what the neural network will train on:")
    print(f"  Input:  board state (9 numbers)")
    print(f"  Target: MCTS probs (policy target) + result (value target)")
