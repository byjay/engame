import type { SpeedSetting } from './types';

export const TETRIS_COLS = 10;
export const TETRIS_ROWS = 20;
export const TETRIS_TARGET_LINES = 10;

export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export type RotationIndex = 0 | 1 | 2 | 3;

export interface CellCoord {
  x: number;
  y: number;
}

export interface ActiveTetromino {
  type: TetrominoType;
  rotation: RotationIndex;
  x: number; // left-origin of 4x4 / 3x3 matrix
  y: number; // row index from top (0 = top visible row, 19 = floor)
}

export interface TetrisVisualMeta {
  colorHex: number;
  emissiveHex: number;
  cssColor: string;
}

export const TETROMINO_VISUALS: Record<TetrominoType, TetrisVisualMeta> = {
  I: { colorHex: 0x06b6d4, emissiveHex: 0x22d3ee, cssColor: '#06B6D4' },
  O: { colorHex: 0xfacc15, emissiveHex: 0xfde047, cssColor: '#FACC15' },
  T: { colorHex: 0xa855f7, emissiveHex: 0xc084fc, cssColor: '#A855F7' },
  S: { colorHex: 0x22c55e, emissiveHex: 0x4ade80, cssColor: '#22C55E' },
  Z: { colorHex: 0xef4444, emissiveHex: 0xf87171, cssColor: '#EF4444' },
  J: { colorHex: 0x3b82f6, emissiveHex: 0x60a5fa, cssColor: '#3B82F6' },
  L: { colorHex: 0xf97316, emissiveHex: 0xfb923c, cssColor: '#F97316' },
};

const ALL_TYPES: readonly TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

/**
 * Standard SRS tetromino cell offsets per rotation state (0: spawn, 1: R, 2: 2, 3: L)
 * in top-down grid coordinates (+x right, +y down).
 */
export const TETROMINO_SHAPES: Record<TetrominoType, readonly (readonly CellCoord[])[]> = {
  I: [
    [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }],
    [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }],
    [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }],
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }],
  ],
  O: [
    [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
  ],
  T: [
    [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }],
    [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }],
    [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
  ],
  S: [
    [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
    [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
  ],
  Z: [
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    [{ x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }],
    [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
    [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 0, y: 2 }],
  ],
  J: [
    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
    [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
  ],
  L: [
    [{ x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
    [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 0, y: 2 }],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
  ],
};

// SRS Wall Kick offset tables (+y is downward in grid space)
const JLSTZ_KICKS: Record<string, readonly [number, number][]> = {
  '0>1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '1>0': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '1>2': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '2>1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '2>3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '3>2': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '3>0': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '0>3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
};

const I_KICKS: Record<string, readonly [number, number][]> = {
  '0>1': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  '1>0': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  '1>2': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
  '2>1': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  '2>3': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  '3>2': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  '3>0': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  '0>3': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
};

export interface TetrisStepEvent {
  moved: boolean;
  rotated: boolean;
  held: boolean;
  locked: boolean;
  hardDroppedCells: number;
  linesCleared: number;
  clearedRows: number[];
  pointsAwarded: number;
  coinsAwarded: number;
  isTetris: boolean;
  combo: number;
  toppedOut: boolean;
  victory: boolean;
}

export interface TetrisHudState {
  lines: number;
  targetLines: number;
  level: number;
  holdType: TetrominoType | null;
  canHold: boolean;
  nextTypes: TetrominoType[];
  clearingRows: number[];
  lastClearLabel: string | null;
}

function createMulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function emptyEvent(): TetrisStepEvent {
  return {
    moved: false,
    rotated: false,
    held: false,
    locked: false,
    hardDroppedCells: 0,
    linesCleared: 0,
    clearedRows: [],
    pointsAwarded: 0,
    coinsAwarded: 0,
    isTetris: false,
    combo: 0,
    toppedOut: false,
    victory: false,
  };
}

const LOCK_DELAY_SEC = 0.52;
const MAX_LOCK_RESETS = 15;
const CLEAR_FLASH_SEC = 0.16;

export class TetrisGameState {
  public readonly cols = TETRIS_COLS;
  public readonly rows = TETRIS_ROWS;
  public readonly targetLines: number;

  public board: (TetrominoType | null)[][];
  public active: ActiveTetromino;
  public holdType: TetrominoType | null = null;
  public canHold = true;

  public score = 0;
  public coins = 0;
  public lines = 0;
  public level = 1;
  public combo = 0;
  public maxCombo = 0;
  public backToBack = false;
  public piecesLocked = 0;
  public gameOver = false;
  public victory = false;
  public lastClearLabel: string | null = null;

  // Sub-second timing for buttery gravity, lock delay, and line-clear shatter flash
  public gravityAccum = 0;
  public lockTimer = 0;
  public lockResets = 0;
  public softDropping = false;
  public clearingRows: number[] = [];
  public clearFlashTimer = 0;

  private bag: TetrominoType[] = [];
  private rng: () => number;
  private speedSetting: SpeedSetting;

  constructor(options?: { seed?: number; speed?: SpeedSetting; targetLines?: number }) {
    this.rng = createMulberry32(options?.seed ?? Date.now());
    this.speedSetting = options?.speed ?? 'normal';
    this.targetLines = Math.max(1, options?.targetLines ?? TETRIS_TARGET_LINES);
    this.board = Array.from({ length: this.rows }, () => Array<TetrominoType | null>(this.cols).fill(null));
    this.refillBag();
    this.refillBag();
    this.active = this.createSpawnPiece(this.popNextType());
  }

  public getNextTypes(count = 3): TetrominoType[] {
    while (this.bag.length < count) {
      this.refillBag();
    }
    return this.bag.slice(0, count);
  }

  public getActiveCells(piece: ActiveTetromino = this.active): CellCoord[] {
    return TETROMINO_SHAPES[piece.type][piece.rotation].map((c) => ({
      x: piece.x + c.x,
      y: piece.y + c.y,
    }));
  }

  public getGhostY(piece: ActiveTetromino = this.active): number {
    let testY = piece.y;
    while (this.canPlace({ ...piece, y: testY + 1 })) {
      testY += 1;
    }
    return testY;
  }

  public getGhostCells(): CellCoord[] {
    const gy = this.getGhostY(this.active);
    return this.getActiveCells({ ...this.active, y: gy });
  }

  public isGrounded(piece: ActiveTetromino = this.active): boolean {
    return !this.canPlace({ ...piece, y: piece.y + 1 });
  }

  public getGravityIntervalSec(): number {
    const speedFactor =
      this.speedSetting === 'slow'
        ? 1.28
        : this.speedSetting === 'fast'
          ? 0.74
          : this.speedSetting === 'extreme'
            ? 0.54
            : 1.0;
    const base = Math.max(0.11, 0.84 * Math.pow(0.86, this.level - 1)) * speedFactor;
    return this.softDropping ? Math.min(base, 0.045) : base;
  }

  public getHudState(): TetrisHudState {
    return {
      lines: this.lines,
      targetLines: this.targetLines,
      level: this.level,
      holdType: this.holdType,
      canHold: this.canHold,
      nextTypes: this.getNextTypes(3),
      clearingRows: [...this.clearingRows],
      lastClearLabel: this.lastClearLabel,
    };
  }

  public moveHorizontal(dx: -1 | 1): TetrisStepEvent {
    const ev = emptyEvent();
    if (this.gameOver || this.victory || this.clearingRows.length > 0) return ev;
    const candidate: ActiveTetromino = { ...this.active, x: this.active.x + dx };
    if (this.canPlace(candidate)) {
      this.active = candidate;
      ev.moved = true;
      this.tryResetLockDelay();
    }
    return ev;
  }

  public rotate(dir: 1 | -1): TetrisStepEvent {
    const ev = emptyEvent();
    if (this.gameOver || this.victory || this.clearingRows.length > 0) return ev;

    const fromRot = this.active.rotation;
    const toRot = (((fromRot + dir) % 4) + 4) % 4 as RotationIndex;

    if (this.active.type === 'O') {
      this.active = { ...this.active, rotation: toRot };
      ev.rotated = true;
      return ev;
    }

    const key = `${fromRot}>${toRot}`;
    const kicks = this.active.type === 'I' ? I_KICKS[key] : JLSTZ_KICKS[key];
    for (const [kx, ky] of kicks ?? [[0, 0]]) {
      const candidate: ActiveTetromino = {
        type: this.active.type,
        rotation: toRot,
        x: this.active.x + kx,
        y: this.active.y + ky,
      };
      if (this.canPlace(candidate)) {
        this.active = candidate;
        ev.rotated = true;
        this.tryResetLockDelay();
        return ev;
      }
    }
    return ev;
  }

  public softDropStep(): TetrisStepEvent {
    const ev = emptyEvent();
    if (this.gameOver || this.victory || this.clearingRows.length > 0) return ev;
    const candidate: ActiveTetromino = { ...this.active, y: this.active.y + 1 };
    if (this.canPlace(candidate)) {
      this.active = candidate;
      this.gravityAccum = 0;
      this.score += 1;
      ev.moved = true;
      ev.pointsAwarded = 1;
    }
    return ev;
  }

  public hardDrop(): TetrisStepEvent {
    const ev = emptyEvent();
    if (this.gameOver || this.victory || this.clearingRows.length > 0) return ev;
    const targetY = this.getGhostY(this.active);
    const dropDist = Math.max(0, targetY - this.active.y);
    this.active = { ...this.active, y: targetY };
    ev.hardDroppedCells = dropDist;
    if (dropDist > 0) {
      this.score += dropDist * 2;
      ev.pointsAwarded += dropDist * 2;
    }
    this.lockCurrentPiece(ev);
    return ev;
  }

  public hold(): TetrisStepEvent {
    const ev = emptyEvent();
    if (this.gameOver || this.victory || this.clearingRows.length > 0 || !this.canHold) return ev;
    const prevType = this.active.type;
    if (this.holdType === null) {
      this.holdType = prevType;
      this.active = this.createSpawnPiece(this.popNextType());
    } else {
      const swap = this.holdType;
      this.holdType = prevType;
      this.active = this.createSpawnPiece(swap);
    }
    this.canHold = false;
    this.gravityAccum = 0;
    this.lockTimer = 0;
    this.lockResets = 0;
    ev.held = true;
    return ev;
  }

  /**
   * Word-First Arcade Power-Up: Answering the active English vocabulary word
   * triggers a golden Word Blast that clears the bottom-most occupied row
   * (or grants a direct Word Bonus line clear when the stack is clean).
   */
  public triggerWordBlastClear(): TetrisStepEvent {
    const ev = emptyEvent();
    if (this.gameOver || this.victory) return ev;

    let targetRow = -1;
    for (let r = this.rows - 1; r >= 0; r--) {
      if (this.board[r].some((cell) => cell !== null)) {
        targetRow = r;
        break;
      }
    }

    this.combo += 1;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    const pts = Math.round((150 + (this.combo - 1) * 45) * (1 + (this.level - 1) * 0.1));
    const coinsEarned = 16 + (this.combo >= 3 ? 6 : 0);
    this.score += pts;
    this.coins += coinsEarned;
    this.lines += 1;
    this.level = Math.min(10, 1 + Math.floor(this.lines / 2));
    this.lastClearLabel =
      this.combo >= 2 ? `WORD BLAST! · ${this.combo} COMBO` : 'WORD BLAST!';

    ev.linesCleared = 1;
    ev.pointsAwarded = pts;
    ev.coinsAwarded = coinsEarned;
    ev.combo = this.combo;

    if (targetRow >= 0 && this.clearingRows.length === 0) {
      this.clearingRows = [targetRow];
      this.clearFlashTimer = CLEAR_FLASH_SEC;
      ev.clearedRows = [targetRow];
    } else if (this.lines >= this.targetLines) {
      this.victory = true;
      ev.victory = true;
    }

    return ev;
  }

  /** Advance continuous physics step (gravity, lock delay, line-clear collapse) */
  public tick(dt: number): TetrisStepEvent {
    const ev = emptyEvent();
    if (this.gameOver || this.victory || dt <= 0) return ev;
    const safeDt = Math.min(dt, 0.05);

    // 1. Complete line-clear shatter flash before collapsing rows cleanly
    if (this.clearingRows.length > 0) {
      this.clearFlashTimer -= safeDt;
      if (this.clearFlashTimer <= 0) {
        this.collapseClearedRows();
        if (this.lines >= this.targetLines) {
          this.victory = true;
          ev.victory = true;
        } else {
          this.spawnNextPiece(ev);
        }
      }
      return ev;
    }

    // 2. Grounded lock delay with natural move-reset forgiveness
    if (this.isGrounded()) {
      this.lockTimer += safeDt;
      if (this.lockTimer >= LOCK_DELAY_SEC) {
        this.lockCurrentPiece(ev);
      }
      return ev;
    }

    // 3. Smooth gravity accumulation
    this.lockTimer = 0;
    const interval = this.getGravityIntervalSec();
    this.gravityAccum += safeDt;
    while (this.gravityAccum >= interval) {
      this.gravityAccum -= interval;
      const next: ActiveTetromino = { ...this.active, y: this.active.y + 1 };
      if (this.canPlace(next)) {
        this.active = next;
        ev.moved = true;
        if (this.softDropping) {
          this.score += 1;
          ev.pointsAwarded += 1;
        }
      } else {
        break;
      }
    }

    return ev;
  }

  public canPlace(piece: ActiveTetromino): boolean {
    const cells = this.getActiveCells(piece);
    for (const c of cells) {
      if (c.x < 0 || c.x >= this.cols || c.y >= this.rows) {
        return false;
      }
      if (c.y >= 0 && this.board[c.y][c.x] !== null) {
        return false;
      }
    }
    return true;
  }

  private tryResetLockDelay(): void {
    if (this.isGrounded() && this.lockResets < MAX_LOCK_RESETS) {
      this.lockTimer = 0;
      this.lockResets += 1;
    }
  }

  private lockCurrentPiece(ev: TetrisStepEvent): void {
    const cells = this.getActiveCells(this.active);
    let aboveTop = true;
    for (const c of cells) {
      if (c.y >= 0 && c.y < this.rows && c.x >= 0 && c.x < this.cols) {
        this.board[c.y][c.x] = this.active.type;
        aboveTop = false;
      }
    }

    this.piecesLocked += 1;
    this.canHold = true;
    this.gravityAccum = 0;
    this.lockTimer = 0;
    this.lockResets = 0;
    ev.locked = true;

    if (aboveTop) {
      this.gameOver = true;
      ev.toppedOut = true;
      return;
    }

    // Detect full horizontal lines
    const fullRows: number[] = [];
    for (let r = 0; r < this.rows; r++) {
      if (this.board[r].every((cell) => cell !== null)) {
        fullRows.push(r);
      }
    }

    if (fullRows.length > 0) {
      const count = fullRows.length;
      this.combo += 1;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      const basePts = count === 1 ? 120 : count === 2 ? 320 : count === 3 ? 580 : 950;
      const isTetris = count === 4;
      const b2bMult = isTetris && this.backToBack ? 1.5 : 1.0;
      this.backToBack = isTetris;
      const comboBonus = this.combo > 1 ? (this.combo - 1) * 60 : 0;
      const pts = Math.round((basePts * this.level + comboBonus) * b2bMult);
      const coinsEarned = Math.round((count * 12 + (isTetris ? 20 : 0) + (this.combo >= 3 ? 10 : 0)));

      this.score += pts;
      this.coins += coinsEarned;
      this.lines += count;
      this.level = Math.min(10, 1 + Math.floor(this.lines / 2));

      const labels = ['', 'SINGLE', 'DOUBLE!', 'TRIPLE!!', 'TETRIS!!!'];
      this.lastClearLabel =
        this.combo >= 2
          ? `${labels[count] ?? `${count} LINES`} · ${this.combo} COMBO`
          : labels[count] ?? `${count} LINES`;

      this.clearingRows = fullRows;
      this.clearFlashTimer = CLEAR_FLASH_SEC;

      ev.linesCleared = count;
      ev.clearedRows = fullRows;
      ev.pointsAwarded += pts;
      ev.coinsAwarded = coinsEarned;
      ev.isTetris = isTetris;
      ev.combo = this.combo;
    } else {
      this.combo = 0;
      this.spawnNextPiece(ev);
    }
  }

  private collapseClearedRows(): void {
    const clearSet = new Set(this.clearingRows);
    const remaining = this.board.filter((_, idx) => !clearSet.has(idx));
    while (remaining.length < this.rows) {
      remaining.unshift(Array<TetrominoType | null>(this.cols).fill(null));
    }
    this.board = remaining;
    this.clearingRows = [];
    this.clearFlashTimer = 0;
  }

  private spawnNextPiece(ev: TetrisStepEvent): void {
    const nextPiece = this.createSpawnPiece(this.popNextType());
    this.active = nextPiece;
    if (!this.canPlace(nextPiece)) {
      this.gameOver = true;
      ev.toppedOut = true;
    }
  }

  private createSpawnPiece(type: TetrominoType): ActiveTetromino {
    return {
      type,
      rotation: 0,
      x: 3,
      y: type === 'I' ? -1 : 0,
    };
  }

  private popNextType(): TetrominoType {
    if (this.bag.length <= 4) {
      this.refillBag();
    }
    return this.bag.shift()!;
  }

  private refillBag(): void {
    const nextBag = [...ALL_TYPES];
    for (let i = nextBag.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      const tmp = nextBag[i];
      nextBag[i] = nextBag[j];
      nextBag[j] = tmp;
    }
    this.bag.push(...nextBag);
  }
}
