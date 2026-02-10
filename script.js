import { evaluateBoard, getBestMove } from './gameLogic.js';

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const clearScoresBtn = document.getElementById('clearScores');
const modeSelect = document.getElementById('modeSelect');
const themeSelect = document.getElementById('themeSelect');
const cells = [...document.querySelectorAll('.cell')];
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const scoreDrawEl = document.getElementById('scoreDraw');
const confettiCanvas = document.getElementById('confetti');

const STORAGE_KEY = 'ttt-state-v2';

let board = Array(9).fill('');
let current = 'X';
let gameOver = false;
let mode = 'pvp';
let theme = 'midnight';
let scores = { X: 0, O: 0, draw: 0 };

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const state = JSON.parse(raw);
    mode = state.mode === 'ai' ? 'ai' : 'pvp';
    theme = state.theme || 'midnight';
    scores = {
      X: Number(state.scores?.X || 0),
      O: Number(state.scores?.O || 0),
      draw: Number(state.scores?.draw || 0),
    };
  } catch {
    // ignore malformed storage
  }
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ mode, theme, scores }),
  );
}

function drawConfetti() {
  const ctx = confettiCanvas.getContext('2d');
  const rect = confettiCanvas.parentElement.getBoundingClientRect();
  confettiCanvas.width = rect.width;
  confettiCanvas.height = rect.height;

  const particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * confettiCanvas.width,
    y: -10 - Math.random() * confettiCanvas.height * 0.5,
    size: 4 + Math.random() * 6,
    speed: 1 + Math.random() * 3,
    drift: -1 + Math.random() * 2,
    color: `hsl(${Math.random() * 360} 100% 60%)`,
    rot: Math.random() * Math.PI,
    spin: -0.2 + Math.random() * 0.4,
  }));

  let frame = 0;
  function tick() {
    frame += 1;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    for (const p of particles) {
      p.y += p.speed;
      p.x += p.drift;
      p.rot += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }

    if (frame < 160) {
      requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  tick();
}

function renderScores() {
  scoreXEl.textContent = String(scores.X);
  scoreOEl.textContent = String(scores.O);
  scoreDrawEl.textContent = String(scores.draw);
}

function renderBoard() {
  const result = evaluateBoard(board);
  const winningSet = new Set(result.line);

  cells.forEach((cell, i) => {
    cell.textContent = board[i];
    cell.disabled = gameOver || Boolean(board[i]);
    cell.classList.remove('x', 'o', 'win');

    if (board[i] === 'X') cell.classList.add('x');
    if (board[i] === 'O') cell.classList.add('o');
    if (winningSet.has(i)) cell.classList.add('win');
  });
}

function updateStatus() {
  const result = evaluateBoard(board);
  if (result.isDraw) {
    statusEl.textContent = "It's a draw!";
    gameOver = true;
    scores.draw += 1;
    saveState();
    renderScores();
    return;
  }

  if (result.winner) {
    statusEl.textContent = `Player ${result.winner} wins!`;
    gameOver = true;
    scores[result.winner] += 1;
    saveState();
    renderScores();
    drawConfetti();
    return;
  }

  statusEl.textContent =
    mode === 'ai' && current === 'O' ? 'AI is thinking…' : `Player ${current}'s turn`;
}

function maybePlayAi() {
  if (mode !== 'ai' || gameOver || current !== 'O') return;

  window.setTimeout(() => {
    const move = getBestMove([...board], 'O', 'X');
    if (move < 0 || board[move] || gameOver) return;
    board[move] = 'O';
    const result = evaluateBoard(board);
    if (!result.winner && !result.isDraw) current = 'X';
    updateStatus();
    renderBoard();
  }, 350);
}

function playMove(index) {
  if (gameOver || board[index]) return;
  if (mode === 'ai' && current === 'O') return;

  board[index] = current;
  const result = evaluateBoard(board);
  if (!result.winner && !result.isDraw) {
    current = current === 'X' ? 'O' : 'X';
  }
  updateStatus();
  renderBoard();
  maybePlayAi();
}

function resetRound(startingPlayer = 'X') {
  board = Array(9).fill('');
  current = startingPlayer;
  gameOver = false;
  updateStatus();
  renderBoard();
  maybePlayAi();
}

function clearScores() {
  scores = { X: 0, O: 0, draw: 0 };
  renderScores();
  saveState();
}

function applyTheme() {
  document.documentElement.dataset.theme = theme;
  saveState();
}

boardEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.cell');
  if (!btn) return;
  playMove(Number(btn.dataset.i));
});

resetBtn.addEventListener('click', () => {
  resetRound(current === 'X' ? 'O' : 'X');
});

clearScoresBtn.addEventListener('click', clearScores);

modeSelect.addEventListener('change', () => {
  mode = modeSelect.value;
  saveState();
  resetRound('X');
});

themeSelect.addEventListener('change', () => {
  theme = themeSelect.value;
  applyTheme();
});

loadState();
modeSelect.value = mode;
themeSelect.value = theme;
applyTheme();
renderScores();
resetRound('X');
