import numpy as np
import torch

class TicTacToe:
    """
    Board representation:
      1  = Player 1 (X)
     -1  = Player 2 (O)
      0  = Empty

    We use 1 and -1 (not 1 and 2) because:
    - Multiplying by -1 flips the perspective (handy for self-play)
    - The neural network later will see values centered around 0
    """

    def __init__(self):
        # A flat array of 9 zeros. Think of it as a 1D database row.
        # Index mapping:
        #  0 | 1 | 2
        #  3 | 4 | 5
        #  6 | 7 | 8
        self.board = np.zeros(9, dtype=np.float32)
        self.current_player = 1  # Player 1 (X) goes first.  basically current player

    def get_legal_moves(self):
        """Returns indices of empty cells. Like querying: SELECT index WHERE value = 0"""
        return np.where(self.board == 0)[0]

    def make_move(self, action):
        """
        Place current player's mark at the given cell index.
        Like an INSERT — validates first, then mutates state.
        Returns True if the move was valid.
        """
        if self.board[action] != 0:
            return False  # Cell already taken, invalid move

        self.board[action] = self.current_player
        self.current_player = -self.current_player  # Swap turns (1 becomes -1, -1 becomes 1)
        return True

    def check_winner(self):
        """
        Check all possible three-in-a-row lines.
        Returns:
           1  if Player 1 (X) won
          -1  if Player 2 (O) won
           0  if draw (board full, no winner)
          None if game is still going
        """
        b = self.board

        # All 8 ways to win: 3 rows, 3 columns, 2 diagonals
        lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],  # rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8],  # columns
            [0, 4, 8], [2, 4, 6],              # diagonals
        ]

        for line in lines:
            total = b[line[0]] + b[line[1]] + b[line[2]]
            if total == 3:
                return 1   # Player 1 wins (1+1+1)
            if total == -3:
                return -1  # Player 2 wins (-1+-1+-1)

        # No winner found. Is the board full?
        if len(self.get_legal_moves()) == 0:
            return 0  # Draw

        return None  # Game still in progress

    def get_board_copy(self):
        """Return a copy of the board. Like a database snapshot — changes to the copy don't affect the original."""
        return self.board.copy()

    def get_state_tensor(self):
        """
        Convert the board to a PyTorch tensor.
        
        This is like serializing a database row into JSON for your API response.
        The numpy array is the internal storage, the tensor is the format
        the neural network consumes.
        
        We multiply by self.current_player so the board is ALWAYS from
        the perspective of "the player about to move."
        This means:
           +1 = current player's pieces
           -1 = opponent's pieces
            0 = empty
        
        Why? The neural network always thinks it's Player 1. 
        Instead of teaching it two different strategies (one for X, one for O),
        we flip the board so it only needs to learn one: "how to win as the
        current player."
        """
        board_from_current_perspective = self.board * self.current_player
        return torch.FloatTensor(board_from_current_perspective)
    

    def display(self):
        """Print the board in a human-readable format."""
        symbols = {1: 'X', -1: 'O', 0: '.'}
        print()
        for row in range(3):
            cells = []
            for col in range(3):
                cells.append(symbols[self.board[row * 3 + col]])
            print(f"  {cells[0]} | {cells[1]} | {cells[2]}")
            if row < 2:
                print("  ---------")
        print()


def play_human_vs_human():
    """Interactive game loop. Like a REPL or CLI tool."""
    game = TicTacToe()
    player_names = {1: "Player 1 (X)", -1: "Player 2 (O)"}

    print("Tic-Tac-Toe! Enter cell number 0-8:")
    print("  0 | 1 | 2")
    print("  ---------")
    print("  3 | 4 | 5")
    print("  ---------")
    print("  6 | 7 | 8")

    while True:
        game.display()
        legal = game.get_legal_moves()
        print(f"{player_names[game.current_player]}'s turn. Legal moves: {legal}")

        try:
            action = int(input("Your move: "))
        except (ValueError, EOFError):
            print("Enter a number 0-8.")
            continue

        if action not in legal:
            print(f"Illegal move. Choose from {legal}")
            continue

        game.make_move(action)
        winner = game.check_winner()

        if winner is not None:
            game.display()
            if winner == 0:
                print("It's a draw!")
            else:
                print(f"{player_names[winner]} wins!")
            break


if __name__ == "__main__":
    game = TicTacToe()
    game.make_move(4)  # X plays center
    game.make_move(0)  # O plays top-left

    game.display()

    print("Raw board:", game.board)
    print("Current player:", game.current_player, "(1=X, -1=O)")
    print("Tensor (from current player's view):", game.get_state_tensor())
    print("Tensor shape:", game.get_state_tensor().shape)
    print("Tensor dtype:", game.get_state_tensor().dtype)