import { describe, expect, it } from 'vitest';
import { evaluateBoard, getAvailableMoves, getBestMove } from './gameLogic.js';

describe('evaluateBoard', () => {
  it('detects a winner and winning line', () => {
    const result = evaluateBoard(['X', 'X', 'X', '', '', '', '', '', '']);
    expect(result.winner).toBe('X');
    expect(result.line).toEqual([0, 1, 2]);
    expect(result.isDraw).toBe(false);
  });

  it('detects draw', () => {
    const result = evaluateBoard(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']);
    expect(result.winner).toBe(null);
    expect(result.isDraw).toBe(true);
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
    expect(getBestMove(board, 'O', 'X')).toBe(2);
  });

  it('blocks opponent winning move', () => {
    const board = ['X', 'X', '', '', 'O', '', '', '', ''];
    expect(getBestMove(board, 'O', 'X')).toBe(2);
  });
});
