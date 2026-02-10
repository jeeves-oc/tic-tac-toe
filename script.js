const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const cells = [...document.querySelectorAll('.cell')];

let board = Array(9).fill('');
let current = 'X';
let gameOver = false;

const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function checkWinner() {
  for (const [a,b,c] of wins) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) return board[a];
  }
  if (board.every(Boolean)) return 'draw';
  return null;
}

function render() {
  cells.forEach((cell, i) => {
    cell.textContent = board[i];
    cell.disabled = gameOver || Boolean(board[i]);
  });
}

function updateStatus() {
  const result = checkWinner();
  if (result === 'draw') {
    statusEl.textContent = "It's a draw!";
    gameOver = true;
  } else if (result) {
    statusEl.textContent = `Player ${result} wins!`;
    gameOver = true;
  } else {
    statusEl.textContent = `Player ${current}'s turn`;
  }
}

boardEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.cell');
  if (!btn || gameOver) return;
  const i = Number(btn.dataset.i);
  if (board[i]) return;

  board[i] = current;
  const result = checkWinner();
  if (!result) current = current === 'X' ? 'O' : 'X';
  updateStatus();
  render();
});

resetBtn.addEventListener('click', () => {
  board = Array(9).fill('');
  current = 'X';
  gameOver = false;
  updateStatus();
  render();
});

updateStatus();
render();
