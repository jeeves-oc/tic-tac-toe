import { describe, expect, it } from 'vitest';
import { buildWinLines, evaluateBoard, getAvailableMoves, getBestMove } from './gameLogic.js';

describe('buildWinLines', () => {
  it('builds expected win-line count for 5x5', () => {
    expect(buildWinLines(5)).toHaveLength(12);
  });
});

describe('evaluateBoard', () => {
  it('detects a winner and winning line on 3x3', () => {
    const result = evaluateBoard(['X', 'X', 'X', '', '', '', '', '', ''], 3);
    expect(result.winner).toBe('X');
    expect(result.line).toEqual([0, 1, 2]);
    expect(result.isDraw).toBe(false);
  });

  it('detects draw', () => {
    const result = evaluateBoard(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'], 3);
    expect(result.winner).toBe(null);
    expect(result.isDraw).toBe(true);
  });

  it('detects winner on 4x4 row', () => {
    const result = evaluateBoard([
      'O', 'O', 'O', 'O',
      '', '', '', '',
      '', '', '', '',
      '', '', '', '',
    ], 4);
    expect(result.winner).toBe('O');
    expect(result.line).toEqual([0, 1, 2, 3]);
  });
});

describe('getAvailableMoves', () => {
  it('returns only empty indexes', () => {
    expect(getAvailableMoves(['X', '', 'O', '', '', 'X', '', '', 'O'])).toEqual([1, 3, 4, 6, 7]);
  });
});

describe('getBestMove', () => {
  it('takes a winning move', () => {
    const board = ['O', 'O', '', 'X', 'X', '', '', '', ''];
    expect(getBestMove(board, 'O', 'X', 3)).toBe(2);
  });

  it('blocks opponent winning move', () => {
    const board = ['X', 'X', '', '', 'O', '', '', '', ''];
    expect(getBestMove(board, 'O', 'X', 3)).toBe(2);
  });

  it('returns a legal move for larger boards', () => {
    const board = Array(16).fill('');
    board[0] = 'X';
    board[5] = 'O';
    const move = getBestMove(board, 'O', 'X', 4);
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThan(16);
    expect(board[move]).toBe('');
  });
});
