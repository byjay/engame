import * as THREE from 'three';
import {
  TETRIS_COLS,
  TETRIS_ROWS,
  TETROMINO_VISUALS,
  type TetrisGameState,
  type TetrominoType,
} from '../game/tetrisEngine';

const CELL_SIZE = 0.86;
const BOARD_W = TETRIS_COLS * CELL_SIZE;
const BOARD_H = TETRIS_ROWS * CELL_SIZE;

function createBeveledBlockGeometry(): THREE.ExtrudeGeometry {
  const s = CELL_SIZE * 0.44;
  const r = 0.08;
  const shape = new THREE.Shape();
  shape.moveTo(-s + r, -s);
  shape.lineTo(s - r, -s);
  shape.quadraticCurveTo(s, -s, s, -s + r);
  shape.lineTo(s, s - r);
  shape.quadraticCurveTo(s, s, s - r, s);
  shape.lineTo(-s + r, s);
  shape.quadraticCurveTo(-s, s, -s, s - r);
  shape.lineTo(-s, -s + r);
  shape.quadraticCurveTo(-s, -s, -s + r, -s);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: CELL_SIZE * 0.68,
    bevelEnabled: true,
    bevelThickness: 0.075,
    bevelSize: 0.065,
    bevelSegments: 2,
    curveSegments: 4,
  });
  geo.center();
  return geo;
}

function createWellGridTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0, '#0F172A');
  grad.addColorStop(0.55, '#172554');
  grad.addColorStop(1, '#0F172A');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 1024);

  const cellW = 512 / TETRIS_COLS;
  const cellH = 1024 / TETRIS_ROWS;

  // Subtle checkerboard micro-shading for instant column alignment readability
  for (let r = 0; r < TETRIS_ROWS; r++) {
    for (let c = 0; c < TETRIS_COLS; c++) {
      if ((r + c) % 2 === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.028)';
        ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
      }
    }
  }

  // Crisp grid hairlines
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
  ctx.lineWidth = 2;
  for (let c = 0; c <= TETRIS_COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * cellW, 0);
    ctx.lineTo(c * cellW, 1024);
    ctx.stroke();
  }
  for (let r = 0; r <= TETRIS_ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * cellH);
    ctx.lineTo(512, r * cellH);
    ctx.stroke();
  }

  // Danger zone top warning horizon line (row 2)
  ctx.strokeStyle = 'rgba(248, 113, 113, 0.42)';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.moveTo(0, cellH * 2);
  ctx.lineTo(512, cellH * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, maxAnisotropy);
  tex.needsUpdate = true;
  return tex;
}

export interface TetrisStage3D {
  root: THREE.Group;
  wellGroup: THREE.Group;
  syncFromState: (state: TetrisGameState, dt: number, elapsed: number, shimmerBoost: number) => void;
  triggerDropImpact: (intensity: number) => void;
  triggerLateralNudge: (dx: number) => void;
  cellToWorld: (col: number, row: number, out: THREE.Vector3) => THREE.Vector3;
}

/**
 * Builds a composite, tactile 3D arcade well and zero-GC pooled beveled tetromino
 * renderer with spring drop impact, smooth sub-cell interpolation, ghost landing
 * holograms, and radiant line-clear shatter highlights.
 */
export function buildTetrisStage3D(maxAnisotropy: number): TetrisStage3D {
  const root = new THREE.Group();
  const wellGroup = new THREE.Group();
  root.add(wellGroup);

  const blockGeo = createBeveledBlockGeometry();
  const ghostGeo = new THREE.BoxGeometry(CELL_SIZE * 0.88, CELL_SIZE * 0.88, CELL_SIZE * 0.72);
  const ghostEdgeGeo = new THREE.EdgesGeometry(ghostGeo);

  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.24,
    metalness: 0.78,
  });
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.56,
    metalness: 0.32,
  });
  const accentCyanMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.55,
    roughness: 0.22,
    metalness: 0.2,
  });

  const gridTex = createWellGridTexture(maxAnisotropy);
  const backMat = new THREE.MeshStandardMaterial({
    map: gridTex,
    roughness: 0.78,
    metalness: 0.08,
  });

  // Backplate centered around wellGroup origin (x: [-BOARD_W/2, BOARD_W/2], y: [0, BOARD_H])
  const backplate = new THREE.Mesh(new THREE.PlaneGeometry(BOARD_W, BOARD_H), backMat);
  backplate.position.set(0, BOARD_H / 2, -CELL_SIZE * 0.48);
  backplate.userData.ignoreShimmer = true;
  wellGroup.add(backplate);

  // Sculpted composite 3D arcade frame: Pedestal base + twin bevelled pillars + top crown
  const pillarW = 0.52;
  const pillarGeo = new THREE.BoxGeometry(pillarW, BOARD_H + 0.55, 1.18);
  [-1, 1].forEach((side) => {
    const px = side * (BOARD_W / 2 + pillarW / 2 + 0.04);
    const pillar = new THREE.Mesh(pillarGeo, frameMat);
    pillar.position.set(px, BOARD_H / 2 - 0.1, -0.05);
    pillar.castShadow = true;
    pillar.receiveShadow = true;

    const innerRail = new THREE.Mesh(new THREE.BoxGeometry(0.12, BOARD_H + 0.15, 0.26), goldTrimMat);
    innerRail.position.set(side * (BOARD_W / 2 + 0.06), BOARD_H / 2, 0.36);

    const glowStrip = new THREE.Mesh(new THREE.BoxGeometry(0.08, BOARD_H * 0.94, 0.14), accentCyanMat);
    glowStrip.position.set(px + side * 0.22, BOARD_H / 2, 0.38);

    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.36, 12), goldTrimMat);
    cap.position.set(px, BOARD_H + 0.36, -0.05);

    wellGroup.add(pillar, innerRail, glowStrip, cap);
  });

  // Grounded multi-tier pedestal plinth beneath the playfield
  const floorBeam = new THREE.Mesh(new THREE.BoxGeometry(BOARD_W + pillarW * 2 + 0.36, 0.56, 1.48), frameMat);
  floorBeam.position.set(0, -0.32, -0.05);
  floorBeam.receiveShadow = true;
  const floorLip = new THREE.Mesh(new THREE.BoxGeometry(BOARD_W + 0.24, 0.14, 1.24), goldTrimMat);
  floorLip.position.set(0, -0.04, 0.14);
  const plinthBase = new THREE.Mesh(new THREE.BoxGeometry(BOARD_W + 3.4, 0.72, 3.2), frameMat);
  plinthBase.position.set(0, -0.94, -0.15);
  plinthBase.receiveShadow = true;
  wellGroup.add(floorBeam, floorLip, plinthBase);

  // Subtle decorative sky-island floating crystals framing the well periphery
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x0284c7,
    emissiveIntensity: 0.3,
    roughness: 0.18,
    metalness: 0.35,
  });
  const crystalPositions: [number, number, number, number][] = [
    [-BOARD_W / 2 - 2.6, 3.4, -2.5, 0.9],
    [BOARD_W / 2 + 2.6, 5.2, -2.8, 1.1],
    [-BOARD_W / 2 - 3.2, 11.4, -3.4, 0.8],
    [BOARD_W / 2 + 3.1, 13.0, -3.1, 0.85],
  ];
  const crystals: THREE.Mesh[] = [];
  for (const [cx, cy, cz, sc] of crystalPositions) {
    const crys = new THREE.Mesh(new THREE.OctahedronGeometry(0.65 * sc, 0), crystalMat);
    crys.position.set(cx, cy, cz);
    crys.scale.set(0.85, 1.45, 0.85);
    root.add(crys);
    crystals.push(crys);
  }

  // Shared materials per Tetromino type + radiant line-clear flash material
  const blockMaterials: Record<TetrominoType, THREE.MeshStandardMaterial> = {
    I: new THREE.MeshStandardMaterial({ color: TETROMINO_VISUALS.I.colorHex, emissive: TETROMINO_VISUALS.I.emissiveHex, emissiveIntensity: 0.14, roughness: 0.22, metalness: 0.14 }),
    O: new THREE.MeshStandardMaterial({ color: TETROMINO_VISUALS.O.colorHex, emissive: TETROMINO_VISUALS.O.emissiveHex, emissiveIntensity: 0.14, roughness: 0.22, metalness: 0.14 }),
    T: new THREE.MeshStandardMaterial({ color: TETROMINO_VISUALS.T.colorHex, emissive: TETROMINO_VISUALS.T.emissiveHex, emissiveIntensity: 0.14, roughness: 0.22, metalness: 0.14 }),
    S: new THREE.MeshStandardMaterial({ color: TETROMINO_VISUALS.S.colorHex, emissive: TETROMINO_VISUALS.S.emissiveHex, emissiveIntensity: 0.14, roughness: 0.22, metalness: 0.14 }),
    Z: new THREE.MeshStandardMaterial({ color: TETROMINO_VISUALS.Z.colorHex, emissive: TETROMINO_VISUALS.Z.emissiveHex, emissiveIntensity: 0.14, roughness: 0.22, metalness: 0.14 }),
    J: new THREE.MeshStandardMaterial({ color: TETROMINO_VISUALS.J.colorHex, emissive: TETROMINO_VISUALS.J.emissiveHex, emissiveIntensity: 0.14, roughness: 0.22, metalness: 0.14 }),
    L: new THREE.MeshStandardMaterial({ color: TETROMINO_VISUALS.L.colorHex, emissive: TETROMINO_VISUALS.L.emissiveHex, emissiveIntensity: 0.14, roughness: 0.22, metalness: 0.14 }),
  };

  const clearFlashMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xfef08a,
    emissiveIntensity: 1.35,
    roughness: 0.12,
    metalness: 0.1,
  });

  const ghostFillMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
  });
  const ghostLineMat = new THREE.LineBasicMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.72,
  });

  const cellToLocalX = (col: number) => (col - TETRIS_COLS / 2 + 0.5) * CELL_SIZE;
  const cellToLocalY = (row: number) => (TETRIS_ROWS - 1 - row + 0.5) * CELL_SIZE;

  // Pre-allocated 10x20 pool of locked board meshes (zero GC inside tick)
  const boardMeshes: THREE.Mesh[][] = Array.from({ length: TETRIS_ROWS }, (_, r) =>
    Array.from({ length: TETRIS_COLS }, (_, c) => {
      const m = new THREE.Mesh(blockGeo, blockMaterials.I);
      m.position.set(cellToLocalX(c), cellToLocalY(r), 0);
      m.visible = false;
      wellGroup.add(m);
      return m;
    })
  );

  // Pre-allocated 4 active piece meshes + 4 ghost preview meshes
  const activeMeshes: THREE.Mesh[] = Array.from({ length: 4 }, () => {
    const m = new THREE.Mesh(blockGeo, blockMaterials.I);
    m.visible = false;
    wellGroup.add(m);
    return m;
  });

  const ghostMeshes: THREE.Group[] = Array.from({ length: 4 }, () => {
    const g = new THREE.Group();
    const fill = new THREE.Mesh(ghostGeo, ghostFillMat);
    const wire = new THREE.LineSegments(ghostEdgeGeo, ghostLineMat);
    fill.userData.ignoreShimmer = true;
    wire.userData.ignoreShimmer = true;
    g.add(fill, wire);
    g.visible = false;
    wellGroup.add(g);
    return g;
  });

  // Spring physics state for tactile natural weight on drops & lateral slides
  let bumpY = 0;
  let bumpVelY = 0;
  let tiltZ = 0;
  let visualPieceX = 3;
  let visualPieceY = 0;
  let lastTrackedType: TetrominoType | null = null;
  let lastTrackedPieceCount = -1;

  return {
    root,
    wellGroup,
    triggerDropImpact(intensity: number) {
      bumpVelY -= Math.min(8.5, 2.8 + intensity * 0.45);
    },
    triggerLateralNudge(dx: number) {
      tiltZ = THREE.MathUtils.clamp(tiltZ - dx * 0.018, -0.05, 0.05);
    },
    cellToWorld(col: number, row: number, out: THREE.Vector3) {
      return out.set(
        wellGroup.position.x + cellToLocalX(col),
        wellGroup.position.y + cellToLocalY(row),
        wellGroup.position.z + 0.3
      );
    },
    syncFromState(state: TetrisGameState, dt: number, elapsed: number, shimmerBoost: number) {
      const safeDt = Math.max(dt, 0.008);

      // Second-order damped harmonic spring for physical board landing weight!
      const springK = 240;
      const springDamp = 22;
      const accel = -springK * bumpY - springDamp * bumpVelY;
      bumpVelY += accel * safeDt;
      bumpY += bumpVelY * safeDt;
      if (Math.abs(bumpY) < 0.0005 && Math.abs(bumpVelY) < 0.0005) {
        bumpY = 0;
        bumpVelY = 0;
      }
      tiltZ = THREE.MathUtils.damp(tiltZ, 0, 12, safeDt);
      wellGroup.position.y = bumpY;
      wellGroup.rotation.z = tiltZ;

      // Ambient floating crystals gentle motion
      for (let i = 0; i < crystals.length; i++) {
        crystals[i].rotation.y = elapsed * (0.5 + i * 0.12);
        crystals[i].position.y += Math.sin(elapsed * 1.8 + i * 1.5) * safeDt * 0.25;
      }

      // Sync locked board cells + radiant clearing-row pop animation
      const clearSet = state.clearingRows.length > 0 ? new Set(state.clearingRows) : null;
      const baseEmissive = 0.14 + shimmerBoost * 0.24;
      for (const t of Object.keys(blockMaterials) as TetrominoType[]) {
        blockMaterials[t].emissiveIntensity = baseEmissive;
      }

      for (let r = 0; r < TETRIS_ROWS; r++) {
        const isClearingRow = clearSet?.has(r) ?? false;
        for (let c = 0; c < TETRIS_COLS; c++) {
          const cellType = state.board[r][c];
          const mesh = boardMeshes[r][c];
          if (cellType) {
            mesh.visible = true;
            mesh.material = isClearingRow ? clearFlashMat : blockMaterials[cellType];
            const popScale = isClearingRow ? 1.14 + Math.sin(elapsed * 38) * 0.08 : 1.0;
            mesh.scale.setScalar(popScale);
          } else {
            mesh.visible = false;
          }
        }
      }

      // Hide active/ghost pieces cleanly during line-clear flash or game over
      const showActive = !state.gameOver && !state.victory && state.clearingRows.length === 0;
      if (!showActive) {
        activeMeshes.forEach((m) => (m.visible = false));
        ghostMeshes.forEach((g) => (g.visible = false));
        return;
      }

      // Snap visual origin immediately on new piece spawn/hold; smoothly damp during live play!
      const pieceChanged =
        lastTrackedType !== state.active.type ||
        lastTrackedPieceCount !== state.piecesLocked ||
        Math.abs(state.active.y - visualPieceY) > 3.5;

      if (pieceChanged) {
        visualPieceX = state.active.x;
        visualPieceY = state.active.y;
        lastTrackedType = state.active.type;
        lastTrackedPieceCount = state.piecesLocked;
      } else {
        visualPieceX = THREE.MathUtils.damp(visualPieceX, state.active.x, 26, safeDt);
        visualPieceY = THREE.MathUtils.damp(visualPieceY, state.active.y, 24, safeDt);
      }

      const activeCells = state.getActiveCells();
      const ghostCells = state.getGhostCells();
      const dxInterp = visualPieceX - state.active.x;
      const dyInterp = visualPieceY - state.active.y;
      const activeMat = blockMaterials[state.active.type];
      const visualMeta = TETROMINO_VISUALS[state.active.type];
      ghostLineMat.color.setHex(visualMeta.emissiveHex);
      ghostFillMat.color.setHex(visualMeta.colorHex);

      // Subtle breathing pulse when grounded during lock-delay forgiveness
      const lockPulse = state.isGrounded() ? 0.96 + Math.sin(elapsed * 18) * 0.04 : 1.0;

      for (let i = 0; i < 4; i++) {
        const ac = activeCells[i];
        const am = activeMeshes[i];
        if (ac && ac.y >= 0) {
          am.visible = true;
          am.material = activeMat;
          am.position.set(
            cellToLocalX(ac.x + dxInterp),
            cellToLocalY(ac.y + dyInterp),
            0.05
          );
          am.scale.setScalar(lockPulse);
        } else {
          am.visible = false;
        }

        const gc = ghostCells[i];
        const gm = ghostMeshes[i];
        if (gc && gc.y >= 0 && gc.y !== ac?.y) {
          gm.visible = true;
          gm.position.set(cellToLocalX(gc.x), cellToLocalY(gc.y), -0.02);
        } else {
          gm.visible = false;
        }
      }
    },
  };
}
