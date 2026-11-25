import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TETRIS_COLS,
  TETRIS_ROWS,
  TetrisGameState,
  type TetrominoType,
} from './tetrisEngine';

test('7-bag randomizer yields all 7 distinct tetrominoes within the first 7 spawns', () => {
  const game = new TetrisGameState({ seed: 2026 });
  const seen = new Set<TetrominoType>([game.active.type]);
  for (let i = 0; i < 6; i++) {
    game.hardDrop();
    seen.add(game.active.type);
  }
  assert.equal(seen.size, 7);
});

test('Horizontal movement respects walls and ghost projection lands cleanly above floor', () => {
  const game = new TetrisGameState({ seed: 7 });
  for (let i = 0; i < 12; i++) {
    game.moveHorizontal(-1);
  }
  const leftCells = game.getActiveCells();
  assert.equal(Math.min(...leftCells.map((c) => c.x)), 0);

  for (let i = 0; i < 12; i++) {
    game.moveHorizontal(1);
  }
  const rightCells = game.getActiveCells();
  assert.equal(Math.max(...rightCells.map((c) => c.x)), TETRIS_COLS - 1);

  const ghostCells = game.getGhostCells();
  assert.equal(Math.max(...ghostCells.map((c) => c.y)), TETRIS_ROWS - 1);
});

test('SRS wall kick allows smooth rotation when pressed flush against the left/right wall', () => {
  const game = new TetrisGameState({ seed: 11 });
  game.active = { type: 'T', rotation: 1, x: -1, y: 5 };
  // Rotate CW (1 -> 2) should wall-kick inward instead of jamming
  const res = game.rotate(1);
  assert.equal(res.rotated, true);
  assert.equal(game.active.rotation, 2);
  assert.ok(game.getActiveCells().every((c) => c.x >= 0 && c.x < TETRIS_COLS));
});

test('Hold swaps active piece once per lock cycle and unlocks again after hard drop', () => {
  const game = new TetrisGameState({ seed: 99 });
  const firstType = game.active.type;
  const h1 = game.hold();
  assert.equal(h1.held, true);
  assert.equal(game.holdType, firstType);
  assert.equal(game.canHold, false);

  // Second hold before lock is blocked
  const h2 = game.hold();
  assert.equal(h2.held, false);

  // Hard drop locks piece and re-enables hold
  game.hardDrop();
  assert.equal(game.canHold, true);
});

test('Completing a full row awards score/coins, clears the line after flash, and triggers victory at targetLines', () => {
  const game = new TetrisGameState({ seed: 5, targetLines: 1 });
  // Fill bottom row except columns 3..6 for an I piece
  for (let x = 0; x < TETRIS_COLS; x++) {
    if (x < 3 || x > 6) {
      game.board[TETRIS_ROWS - 1][x] = 'J';
    }
  }
  game.active = { type: 'I', rotation: 0, x: 3, y: 0 };
  const dropEv = game.hardDrop();
  assert.equal(dropEv.locked, true);
  assert.equal(dropEv.linesCleared, 1);
  assert.equal(dropEv.coinsAwarded > 0, true);
  assert.deepEqual(game.clearingRows, [TETRIS_ROWS - 1]);

  // Advance past the 0.16s clear-flash shatter animation
  let victoryHit = false;
  for (let i = 0; i < 6; i++) {
    const step = game.tick(0.04);
    if (step.victory) victoryHit = true;
  }
  assert.equal(victoryHit, true);
  assert.equal(game.victory, true);
  assert.equal(game.clearingRows.length, 0);
  assert.equal(game.board[TETRIS_ROWS - 1].every((c) => c === null), true);
});

test('Lock delay grants brief forgiveness before locking when touching the floor', () => {
  const game = new TetrisGameState({ seed: 3 });
  game.active = { type: 'O', rotation: 0, x: 4, y: TETRIS_ROWS - 2 };
  assert.equal(game.isGrounded(), true);

  // After 0.2s it should still be movable (not locked yet)
  const early = game.tick(0.05);
  assert.equal(early.locked, false);
  assert.equal(game.moveHorizontal(1).moved, true);

  // After > 0.55s without input it locks naturally
  let locked = false;
  for (let i = 0; i < 14; i++) {
    if (game.tick(0.05).locked) locked = true;
  }
  assert.equal(locked, true);
});

test('Word Blast vocabulary power-up blasts bottom occupied row and awards bonus lines & coins', () => {
  const game = new TetrisGameState({ seed: 19, targetLines: 10 });
  game.board[TETRIS_ROWS - 1][0] = 'L';
  game.board[TETRIS_ROWS - 1][1] = 'L';

  const blast = game.triggerWordBlastClear();
  assert.equal(blast.linesCleared, 1);
  assert.deepEqual(blast.clearedRows, [TETRIS_ROWS - 1]);
  assert.equal(blast.coinsAwarded >= 16, true);

  for (let i = 0; i < 6; i++) {
    game.tick(0.04);
  }
  assert.equal(game.board[TETRIS_ROWS - 1][0], null);
  assert.equal(game.lines, 1);
});
