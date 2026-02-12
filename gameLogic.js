export function buildWinLines(size = 3) {
  const lines = [];

  for (let row = 0; row < size; row += 1) {
    lines.push(Array.from({ length: size }, (_, col) => row * size + col));
  }

  for (let col = 0; col < size; col += 1) {
    lines.push(Array.from({ length: size }, (_, row) => row * size + col));
  }

  lines.push(Array.from({ length: size }, (_, i) => i * size + i));
  lines.push(Array.from({ length: size }, (_, i) => i * size + (size - 1 - i)));

  return lines;
}

export function evaluateBoard(board, size = 3) {
  const winLines = buildWinLines(size);

  for (const line of winLines) {
    const [first, ...rest] = line;
    const firstValue = board[first];
    if (!firstValue) continue;
    if (rest.every((idx) => board[idx] === firstValue)) {
      return { winner: firstValue, line, isDraw: false };
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
  const result = evaluateBoard(board, 3);
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

export function getBestMove(board, aiPlayer = 'O', humanPlayer = 'X', size = 3) {
  if (size !== 3) {
    const moves = getAvailableMoves(board);
    return moves.length ? moves[Math.floor(Math.random() * moves.length)] : -1;
  }

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
