export const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function evaluateBoard(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return { winner: board[a], line: [a, b, c], isDraw: false };
    }
  }

  if (board.every(Boolean)) {
    return { winner: null, line: [], isDraw: true };
  }

  return { winner: null, line: [], isDraw: false };
}

export function getAvailableMoves(board) {
  return board.map((value, index) => (value ? -1 : index)).filter((index) => index >= 0);
}

function minimax(board, depth, isMaximizing, aiPlayer, humanPlayer) {
  const result = evaluateBoard(board);
  if (result.winner === aiPlayer) return 10 - depth;
  if (result.winner === humanPlayer) return depth - 10;
  if (result.isDraw) return 0;

  const moves = getAvailableMoves(board);

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const move of moves) {
      board[move] = aiPlayer;
      const score = minimax(board, depth + 1, false, aiPlayer, humanPlayer);
      board[move] = '';
      bestScore = Math.max(bestScore, score);
    }
    return bestScore;
  }

  let bestScore = Infinity;
  for (const move of moves) {
    board[move] = humanPlayer;
    const score = minimax(board, depth + 1, true, aiPlayer, humanPlayer);
    board[move] = '';
    bestScore = Math.min(bestScore, score);
  }
  return bestScore;
}

export function getBestMove(board, aiPlayer = 'O', humanPlayer = 'X') {
  let bestScore = -Infinity;
  let move = -1;

  for (const index of getAvailableMoves(board)) {
    board[index] = aiPlayer;
    const score = minimax(board, 0, false, aiPlayer, humanPlayer);
    board[index] = '';
    if (score > bestScore) {
      bestScore = score;
      move = index;
    }
  }

  return move;
}
