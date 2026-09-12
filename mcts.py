import numpy as np
import math
from game import TicTacToe
import torch
from model import TicTacToeNet


class MCTSNode:
    """
    One node in the MCTS search tree.
    
    Think of it as a row in a database table:
    
    | field          | type        | description                          |
    |----------------|-------------|--------------------------------------|
    | game_state     | TicTacToe   | the board position at this node      |
    | parent         | MCTSNode    | who expanded me (None for root)      |
    | action         | int         | what move was played to get here     |
    | children       | dict        | {move_index: child_node}             |
    | visit_count    | int         | how many times MCTS passed through   |
    | value_sum      | float       | total value accumulated              |
    | prior          | float       | network's initial probability for    |
    |                |             | this move (before any search)        |
    """

    def __init__(self, game_state, parent=None, action=None, prior=0.0):
        self.game_state = game_state    # The TicTacToe instance at this node
        self.parent = parent            # Parent node (None for root)
        self.action = action            # The move that led to this node
        self.prior = prior              # P: network's prior probability for this move

        self.children = {}              # Dictionary: {action_int: MCTSNode}
        self.visit_count = 0            # N: how many times we've visited
        self.value_sum = 0.0            # W: sum of all values backpropagated through here

    def is_expanded(self):
        """
        A node is expanded if it has children.
        Unexpanded = leaf node = we haven't explored from here yet.
        Like checking if a cache entry exists.
        """
        return len(self.children) > 0

    def average_value(self):
        """
        Q = W / N (average value).
        If never visited, return 0 (no data yet).
        Like calculating average response time: total_time / num_requests.
        """
        if self.visit_count == 0:
            return 0.0
        return self.value_sum / self.visit_count

    def puct_score(self, c_puct=1.41):
        """
        The PUCT formula from Step 10.
        
        Score = exploitation + exploration
             = Q           + c * P * sqrt(parent_N) / (1 + N)
        
        Higher score = MCTS is more likely to visit this node next.
        """
        # Exploitation: how well has this move done so far?
        exploitation = self.average_value()

        # Exploration: bonus for being underexplored but promising
        # - self.prior (P): network said this move looks good
        # - parent visits: more parent visits = more pressure to explore children
        # - 1 + self.visit_count: visited a lot = less exploration bonus
        exploration = c_puct * self.prior * (
            math.sqrt(self.parent.visit_count) / (1 + self.visit_count)
        )

        return exploitation + exploration

    def select_child(self):
        """
        Pick the child with the highest PUCT score.
        This is the Selection step of MCTS.
        Like picking the A/B test variant with the best score.
        """
        best_score = -float('inf')
        best_child = None

        for child in self.children.values():
            score = child.puct_score()
            if score > best_score:
                best_score = score
                best_child = child

        return best_child

    def expand(self, policy):
        """
        Create child nodes for all legal moves.
        
        policy: the network's move probabilities (9 numbers from the policy head).
        Each legal move gets a child node with that move's prior probability.
        Illegal moves (occupied cells) are skipped.
        
        This is the Expansion step of MCTS.
        Like populating a cache: create entries for all possible next states.
        """
        legal_moves = self.game_state.get_legal_moves()

        for action in legal_moves:
            # Create a copy of the game and make the move
            child_game = TicTacToe()
            child_game.board = self.game_state.get_board_copy()
            child_game.current_player = self.game_state.current_player
            child_game.make_move(action)

            # Create the child node with the network's prior for this move
            child_node = MCTSNode(
                game_state=child_game,
                parent=self,
                action=action,
                prior=policy[action]  # Network's probability for this specific move
            )
            self.children[action] = child_node

    def backpropagate(self, value):
        """
        Walk back up the tree, updating stats at each node.
        
        The value gets NEGATED at each level because players alternate.
        If this position is +0.7 for the current player, it's -0.7 for 
        the opponent (the parent node's player).
        
        This is like propagating an error up through a chain of microservices:
        each service logs the error from its own perspective.
        """
        self.value_sum += value
        self.visit_count += 1

        if self.parent is not None:
            # Negate because parent is the opponent's perspective
            self.parent.backpropagate(-value)





def mcts_search(game_state, neural_net, num_simulations=50):
    """
    Run MCTS from the given game state.
    
    Returns: a numpy array of 9 move probabilities based on visit counts.
    
    Think of this as the main API endpoint that orchestrates everything:
    - Creates the search tree (database)
    - Runs simulations (batch processing)
    - Returns results (API response)
    """
    # Create the root node
    root = MCTSNode(game_state=game_state)

    # Evaluate the root position with the neural network to get priors
    # We need to expand the root before we start simulating
    state_tensor = game_state.get_state_tensor().unsqueeze(0)  # [9] → [1, 9]
    
    with torch.no_grad():  # "no_grad" = don't track gradients, we're not training right now
        policy, value = neural_net(state_tensor)
    
    policy = policy.squeeze(0).numpy()  # [1, 9] → [9], convert to numpy
    
    # Mask illegal moves: set their probability to 0, then re-normalize
    legal_moves = game_state.get_legal_moves()
    mask = np.zeros(9)
    mask[legal_moves] = 1
    policy = policy * mask
    
    policy_sum = policy.sum()
    if policy_sum > 0:
        policy = policy / policy_sum  # Re-normalize so probabilities sum to 1
    else:
        # Edge case: all legal moves had ~0 probability. Fall back to uniform.
        policy = mask / mask.sum()
    
    root.expand(policy)

    # === Run simulations ===
    for _ in range(num_simulations):
        node = root

        # --- STEP 1: SELECTION ---
        # Walk down the tree, picking the best child (by PUCT score),
        # until we reach a node that hasn't been expanded yet.
        while node.is_expanded():
            node = node.select_child()

        # --- Check if the game is over at this node ---
        winner = node.game_state.check_winner()

        if winner is not None:
            # Game is over. No need to expand or evaluate with the network.
            # The value is the actual game result.
            if winner == 0:
                value = 0.0  # Draw
            else:
                # winner is 1 or -1. We need the value from the perspective
                # of the player who just moved (the node's PARENT's player).
                # If the winner matches the parent's player, that's good (+1).
                # We're at the node AFTER the winning move was made.
                # current_player has already swapped, so:
                # node.game_state.current_player is the player who DIDN'T just move.
                # The player who DID just move is -node.game_state.current_player.
                # If that player is the winner, value = +1 from their perspective.
                if winner == -node.game_state.current_player:
                    value = 1.0   # The player who moved here won
                else:
                    value = -1.0  # The player who moved here lost
        else:
            # --- STEP 2: EXPANSION ---
            # Evaluate this position with the neural network
            state_tensor = node.game_state.get_state_tensor().unsqueeze(0)
            
            with torch.no_grad():
                policy, value_tensor = neural_net(state_tensor)
            
            policy = policy.squeeze(0).numpy()
            value = value_tensor.item()

            # Mask illegal moves and re-normalize
            legal_moves = node.game_state.get_legal_moves()
            mask = np.zeros(9)
            mask[legal_moves] = 1
            policy = policy * mask
            
            policy_sum = policy.sum()
            if policy_sum > 0:
                policy = policy / policy_sum
            else:
                policy = mask / mask.sum()

            # Expand: create children for all legal moves
            node.expand(policy)

        # --- STEP 4: BACKPROPAGATION ---
        # (Step 3 was the evaluation above — getting the value)
        node.backpropagate(value)

    # === Collect results ===
    # Convert visit counts to move probabilities
    action_probs = np.zeros(9)
    for action, child in root.children.items():
        action_probs[action] = child.visit_count

    # Normalize to get probabilities
    total_visits = action_probs.sum()
    if total_visits > 0:
        action_probs = action_probs / total_visits

    return action_probs


if __name__ == "__main__":
    # Create a game in a mid-game position
    game = TicTacToe()
    game.make_move(4)  # X center
    game.make_move(0)  # O top-left
    game.make_move(2)  # X top-right
    game.make_move(6)  # O bottom-left
    # X has: center + top-right. O has: top-left + bottom-left.
    # X should play cell 8 (bottom-right) to get a diagonal win!
    # Or cell 1 to set up a fork.

    game.display()
    print(f"Current player: {'X' if game.current_player == 1 else 'O'}")
    print(f"Legal moves: {game.get_legal_moves()}")

    # Create an untrained network
    net = TicTacToeNet()

    # Run MCTS with 50 simulations
    print("\nRunning MCTS with 50 simulations...")
    probs = mcts_search(game, net, num_simulations=50)

    print("\nMove probabilities from MCTS:")
    for i in range(9):
        bar = '█' * int(probs[i] * 30)
        print(f"  Cell {i}: {probs[i]:.3f} {bar}")

    print(f"\nMCTS best move: cell {np.argmax(probs)}")
    print("(This will be bad since the network is untrained — that's expected!)")