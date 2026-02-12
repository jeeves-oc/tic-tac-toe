import { evaluateBoard, getBestMove } from './gameLogic.js';

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const clearScoresBtn = document.getElementById('clearScores');
const modeSelect = document.getElementById('modeSelect');
const themeSelect = document.getElementById('themeSelect');
const sizeSelect = document.getElementById('sizeSelect');
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const scoreDrawEl = document.getElementById('scoreDraw');
const confettiCanvas = document.getElementById('confetti');

const STORAGE_KEY = 'ttt-state-v3';

let boardSize = 3;
let board = Array(boardSize * boardSize).fill('');
let current = 'X';
let gameOver = false;
let mode = 'pvp';
let theme = 'midnight';
let scores = { X: 0, O: 0, draw: 0 };
let cells = [];

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const state = JSON.parse(raw);
    mode = state.mode === 'ai' ? 'ai' : 'pvp';
    boardSize = [3, 4, 5].includes(Number(state.boardSize)) ? Number(state.boardSize) : 3;
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
    JSON.stringify({ mode, boardSize, theme, scores }),
  );
}

function drawConfetti() {
  const ctx = confettiCanvas.getContext('2d');
  const rect = confettiCanvas.parentElement.getBoundingClientRect();
  confettiCanvas.width = rect.width;
  confettiCanvas.height = rect.height;

  const particles = Array.from({ length: 220 }, () => ({
    x: Math.random() * confettiCanvas.width,
    y: -10 - Math.random() * confettiCanvas.height,
    size: 3 + Math.random() * 8,
    speed: 1 + Math.random() * 4,
    drift: -1.5 + Math.random() * 3,
    color: `hsl(${Math.random() * 360} 100% 60%)`,
    rot: Math.random() * Math.PI,
    spin: -0.3 + Math.random() * 0.6,
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

    if (frame < 280) {
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

function rebuildBoard() {
  boardEl.innerHTML = '';
  boardEl.style.setProperty('--size', String(boardSize));

  for (let i = 0; i < boardSize * boardSize; i += 1) {
    const btn = document.createElement('button');
    btn.className = 'cell';
    btn.dataset.i = String(i);
    btn.setAttribute('aria-label', `Cell ${i + 1}`);
    boardEl.appendChild(btn);
  }

  cells = [...boardEl.querySelectorAll('.cell')];
}

function renderBoard() {
  const result = evaluateBoard(board, boardSize);
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
  const result = evaluateBoard(board, boardSize);
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
    const move = getBestMove([...board], 'O', 'X', boardSize);
    if (move < 0 || board[move] || gameOver) return;
    board[move] = 'O';
    const result = evaluateBoard(board, boardSize);
    if (!result.winner && !result.isDraw) current = 'X';
    updateStatus();
    renderBoard();
  }, 350);
}

function playMove(index) {
  if (gameOver || board[index]) return;
  if (mode === 'ai' && current === 'O') return;

  board[index] = current;
  const result = evaluateBoard(board, boardSize);
  if (!result.winner && !result.isDraw) {
    current = current === 'X' ? 'O' : 'X';
  }
  updateStatus();
  renderBoard();
  maybePlayAi();
}

function resetRound(startingPlayer = 'X') {
  board = Array(boardSize * boardSize).fill('');
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

sizeSelect.addEventListener('change', () => {
  boardSize = Number(sizeSelect.value);
  rebuildBoard();
  saveState();
  resetRound('X');
});

themeSelect.addEventListener('change', () => {
  theme = themeSelect.value;
  applyTheme();
});

loadState();
modeSelect.value = mode;
sizeSelect.value = String(boardSize);
themeSelect.value = theme;
applyTheme();
renderScores();
rebuildBoard();
resetRound('X');
