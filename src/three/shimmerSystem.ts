import * as THREE from 'three';

export interface ShimmerInput {
  combo: number;
  isFever: boolean;
  elapsed: number;
  hitBoost: number;
}

export interface ShimmerFrameState {
  active: boolean;
  isFever: boolean;
  /** Normalized 0..1 overall shimmer intensity */
  intensity: number;
  /** 0..1 smooth harmonic pulse wave */
  pulseWave: number;
  /** Calibrated subtle PBR emissive boost (0..0.46) */
  emissiveStrength: number;
  /** World-space traveling shimmer phase */
  wavePhase: number;
  /** Primary shimmer tint hex (sky-cyan -> warm gold -> amber-gold in Fever) */
  tintColorHex: number;
  /** Secondary accent ring color hex */
  ringAccentHex: number;
  /** Scale multiplier for orbiting 3D Fever aura rings */
  auraScale: number;
}

const HIGH_COMBO_THRESHOLD = 2;
const FEVER_COMBO_THRESHOLD = 3;

const _tintColor = new THREE.Color();
const _baseEmissive = new THREE.Color();
const _blendedEmissive = new THREE.Color();

/**
 * Pure, deterministic calculation for subtle 3D asset shimmer/glow during
 * high-combo streaks (combo >= 2) and Fever Mode (combo >= 3).
 */
export function computeShimmerState(input: ShimmerInput): ShimmerFrameState {
  const combo = Math.max(0, Math.floor(input.combo));
  const hitBoost = Math.max(0, Math.min(1, input.hitBoost));
  const isFever = input.isFever || combo >= FEVER_COMBO_THRESHOLD;
  const isHighCombo = combo >= HIGH_COMBO_THRESHOLD;

  if (!isHighCombo && !isFever && hitBoost <= 0.02) {
    return {
      active: false,
      isFever: false,
      intensity: 0,
      pulseWave: 0,
      emissiveStrength: 0,
      wavePhase: 0,
      tintColorHex: 0x38bdf8,
      ringAccentHex: 0xfbbf24,
      auraScale: 0,
    };
  }

  const freq = isFever ? 6.8 : 4.2;
  const pulseWave = 0.5 + 0.5 * Math.sin(input.elapsed * freq);
  const secondaryWave = 0.5 + 0.5 * Math.sin(input.elapsed * (freq * 0.55) + 1.2);

  // Subtle glow at 2-combo; richer luminous gold-prismatic shimmer in Fever
  const comboBase = isFever
    ? Math.min(0.82, 0.58 + (combo - FEVER_COMBO_THRESHOLD) * 0.06)
    : isHighCombo
      ? 0.32
      : 0;

  const intensity = Math.min(1, comboBase + hitBoost * 0.34);

  // Keep emissive boost tasteful so textures & ACES filmic highlights stay crisp
  const emissiveStrength = intensity * (0.14 + pulseWave * 0.24 + secondaryWave * 0.08);

  // Prismatic gold <-> cyan shimmer cycling in Fever, cool sapphire-gold at 2-combo
  let tintColorHex = 0x38bdf8;
  let ringAccentHex = 0x7dd3fc;
  if (isFever) {
    const cycle = (Math.sin(input.elapsed * 2.4) + 1) * 0.5;
    tintColorHex = cycle > 0.62 ? 0xfbbf24 : cycle > 0.28 ? 0xf59e0b : 0x38bdf8;
    ringAccentHex = cycle > 0.5 ? 0x38bdf8 : 0xfde047;
  } else if (hitBoost > 0.35) {
    tintColorHex = 0xfbbf24;
    ringAccentHex = 0x38bdf8;
  }

  const auraScale = isFever
    ? 0.96 + pulseWave * 0.14 + hitBoost * 0.12
    : 0.72 + pulseWave * 0.08 + hitBoost * 0.08;

  return {
    active: true,
    isFever,
    intensity,
    pulseWave,
    emissiveStrength,
    wavePhase: input.elapsed * (isFever ? 5.6 : 3.4),
    tintColorHex,
    ringAccentHex,
    auraScale,
  };
}

/**
 * Applies a subtle traveling-wave PBR emissive shimmer across all MeshStandardMaterial
 * surfaces inside a 3D hero or target group, caching original emissive values safely.
 */
export function applyAssetShimmer(
  root: THREE.Object3D | null | undefined,
  state: ShimmerFrameState,
  strengthMultiplier = 1.0
): void {
  if (!root) return;

  _tintColor.setHex(state.tintColorHex);

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    if (mesh.userData.ignoreShimmer) return;

    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    // Spatial phase offset creates a sleek light sheen traveling across 3D parts
    const spatialOffset = (mesh.position.y * 1.45 + mesh.position.x * 0.85) * 0.9;

    for (let i = 0; i < mats.length; i++) {
      const mat = mats[i];
      if (!(mat instanceof THREE.MeshStandardMaterial)) continue;

      if (mat.userData.__baseEmissiveHex === undefined) {
        mat.userData.__baseEmissiveHex = mat.emissive.getHex();
        mat.userData.__baseEmissiveIntensity = mat.emissiveIntensity;
      }

      const baseHex = mat.userData.__baseEmissiveHex as number;
      const baseIntensity = mat.userData.__baseEmissiveIntensity as number;

      if (!state.active || strengthMultiplier <= 0) {
        if (mat.userData.__shimmerDirty) {
          mat.emissive.setHex(baseHex);
          mat.emissiveIntensity = baseIntensity;
          mat.userData.__shimmerDirty = false;
        }
        continue;
      }

      const localWave = 0.55 + 0.45 * Math.sin(state.wavePhase - spatialOffset);
      const boost = state.emissiveStrength * localWave * strengthMultiplier;

      _baseEmissive.setHex(baseHex);
      const blendFactor = Math.min(0.85, state.intensity * 0.72 * localWave);
      _blendedEmissive.copy(_baseEmissive).lerp(_tintColor, blendFactor);

      mat.emissive.copy(_blendedEmissive);
      mat.emissiveIntensity = baseIntensity + boost;
      mat.userData.__shimmerDirty = true;
    }
  });
}

export interface FeverAuraRig {
  group: THREE.Group;
  innerRing: THREE.Mesh;
  outerRing: THREE.Mesh;
  motesGroup: THREE.Group;
  innerMat: THREE.MeshBasicMaterial;
  outerMat: THREE.MeshBasicMaterial;
  moteMat: THREE.MeshBasicMaterial;
}

/**
 * Lightweight 3D holographic dual-ring + orbiting star-mote Fever Aura
 * attached to hero 3D characters and vehicles. Hidden during normal combos,
 * blooms smoothly with golden-cyan shimmer at combo >= 2 and Fever Mode.
 */
export function buildFeverAuraRig(radius = 1.25): FeverAuraRig {
  const group = new THREE.Group();
  group.visible = false;
  group.position.y = 0.12;

  const innerMat = new THREE.MeshBasicMaterial({
    color: 0xfbbf24,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const outerMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const moteMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const innerRing = new THREE.Mesh(
    new THREE.RingGeometry(radius * 0.78, radius * 0.96, 32),
    innerMat
  );
  innerRing.rotation.x = -Math.PI / 2;
  innerRing.userData.ignoreShimmer = true;

  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 1.12, 0.045, 8, 36),
    outerMat
  );
  outerRing.rotation.x = Math.PI / 2;
  outerRing.position.y = 0.25;
  outerRing.userData.ignoreShimmer = true;

  const motesGroup = new THREE.Group();
  const moteGeo = new THREE.OctahedronGeometry(radius * 0.1, 0);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const mote = new THREE.Mesh(moteGeo, moteMat);
    mote.position.set(
      Math.cos(a) * radius * 1.04,
      0.35 + (i % 3) * 0.48,
      Math.sin(a) * radius * 1.04
    );
    mote.userData.ignoreShimmer = true;
    mote.userData.baseY = mote.position.y;
    motesGroup.add(mote);
  }

  group.add(innerRing, outerRing, motesGroup);
  return { group, innerRing, outerRing, motesGroup, innerMat, outerMat, moteMat };
}

export function updateFeverAuraRig(
  rig: FeverAuraRig | null | undefined,
  state: ShimmerFrameState,
  elapsed: number,
  dt: number
): void {
  if (!rig) return;

  if (!state.active) {
    rig.group.visible = false;
    return;
  }

  rig.group.visible = true;
  rig.group.scale.setScalar(state.auraScale);

  const spinSpeed = state.isFever ? 2.6 : 1.3;
  rig.outerRing.rotation.z += dt * spinSpeed;
  rig.outerRing.position.y = 0.28 + Math.sin(elapsed * 4.5) * 0.14;
  rig.motesGroup.rotation.y -= dt * (spinSpeed * 0.85);

  for (let i = 0; i < rig.motesGroup.children.length; i++) {
    const m = rig.motesGroup.children[i];
    const baseY = (m.userData.baseY as number) ?? 0.5;
    m.position.y = baseY + Math.sin(elapsed * 5.2 + i * 1.1) * 0.22;
    m.rotation.y += dt * 3.8;
    m.rotation.x += dt * 2.4;
  }

  rig.innerMat.color.setHex(state.tintColorHex);
  rig.outerMat.color.setHex(state.ringAccentHex);
  rig.moteMat.color.setHex(state.isFever ? 0xfef08a : 0xe0f2fe);

  rig.innerMat.opacity = Math.min(0.62, state.intensity * (0.28 + state.pulseWave * 0.28));
  rig.outerMat.opacity = Math.min(0.75, state.intensity * (0.35 + state.pulseWave * 0.35));
  rig.moteMat.opacity = Math.min(0.92, state.intensity * (0.5 + state.pulseWave * 0.42));
}
