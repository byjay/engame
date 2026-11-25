import * as THREE from 'three';
import { buildFeverAuraRig, type FeverAuraRig } from './shimmerSystem';
import {
  getGestureByCode,
  IDLE_BREATH_CLASS,
  type HumanRigMotionClass,
} from '../game/gestureSystem';

/**
 * Flagship Stylized Three.js 3D Character Studio
 * ----------------------------------------------
 * 100% procedural, zero external asset dependencies, rich multi-part articulated
 * character rigs designed for crisp flagship mobile 3D visual fidelity:
 *
 * - buildStylizedCharacter(): Full 2-segment articulated humanoid adventurer / costumed
 *   village NPC (hips, knees, shoulders, elbows, sculpted LatheGeometry blazer/tunic,
 *   flowing animated scarf, layered sculpted hair + bouncing ponytail, blinking eyelids,
 *   3-layer expressive anime/Pixar eyes with dual catchlights, rosy cheeks, job outfits
 *   & held props: barista latte mug, professor spectacles & open tome, florist bouquet,
 *   baker baguette basket, explorer lantern & goggles, plus built-in Fever Aura rig).
 * - buildScholarOwlCharacter(): Sculpted pear-shaped LatheGeometry Scholar Owl with
 *   procedural feathered belly plumage CanvasTexture, independent articulated head,
 *   blinking eyelids, perky ear tufts, gold spectacles with lenses, 3-feather fanned
 *   articulated wings, academy striped scarf, mortarboard with dangling tassel, and
 *   built-in Fever Aura rig.
 */

export type CharacterAnimState = 'idle' | 'walk' | 'talk' | 'celebrate' | 'wave';
export type NpcArchetype = 'barista' | 'professor' | 'florist' | 'baker' | 'explorer';

export interface StylizedCharacterConfig {
  shirtColor: number;
  accentColor: number;
  isPlayer?: boolean;
  archetypeIndex?: number;
  showQuestMarker?: boolean;
  skinToneHex?: number;
}

export interface StylizedCharacterRig {
  group: THREE.Group;
  rootMotion: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  leftShoulder: THREE.Group;
  leftElbow: THREE.Group;
  rightShoulder: THREE.Group;
  rightElbow: THREE.Group;
  leftHip: THREE.Group;
  leftKnee: THREE.Group;
  rightHip: THREE.Group;
  rightKnee: THREE.Group;
  leftEyelid: THREE.Mesh;
  rightEyelid: THREE.Mesh;
  leftBrow: THREE.Mesh;
  rightBrow: THREE.Mesh;
  scarfTail?: THREE.Object3D;
  hairTail?: THREE.Object3D;
  questMarker?: THREE.Group;
  auraRig: FeverAuraRig;
  blinkSeed: number;
  // Backward-compatible aliases
  leftArm: THREE.Object3D;
  rightArm: THREE.Object3D;
  leftLeg: THREE.Object3D;
  rightLeg: THREE.Object3D;
}

export interface ScholarOwlRig {
  group: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  leftWing: THREE.Group;
  rightWing: THREE.Group;
  leftEyelid: THREE.Mesh;
  rightEyelid: THREE.Mesh;
  leftTuft: THREE.Mesh;
  rightTuft: THREE.Mesh;
  tasselPivot: THREE.Group;
  scarfTail: THREE.Mesh;
  auraRig: FeverAuraRig;
  blinkSeed: number;
}

let cachedOwlPlumageTex: THREE.CanvasTexture | null = null;

function createSoftContactShadow(radius = 0.72, opacity = 0.28): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
  grad.addColorStop(0, `rgba(15, 23, 42, ${opacity})`);
  grad.addColorStop(0.62, `rgba(15, 23, 42, ${opacity * 0.45})`);
  grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  const disc = new THREE.Mesh(
    new THREE.PlaneGeometry(radius * 2, radius * 2),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.025;
  disc.userData.ignoreShimmer = true;
  return disc;
}

/** Procedural scalloped feather belly texture for the flagship Scholar Owl */
function getOwlPlumageTexture(): THREE.CanvasTexture {
  if (cachedOwlPlumageTex) return cachedOwlPlumageTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#FEFCE8');
  grad.addColorStop(0.65, '#ECFCCB');
  grad.addColorStop(1, '#D9F99D');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Scalloped V-chevron belly feathers
  ctx.strokeStyle = 'rgba(101, 163, 13, 0.34)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (let row = 0; row < 7; row++) {
    const y = 34 + row * 32;
    const cols = 6;
    const offset = (row % 2) * 20;
    for (let c = 0; c < cols; c++) {
      const x = 18 + c * 42 + offset;
      ctx.beginPath();
      ctx.arc(x, y, 14, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.userData.__sharedTexture = true;
  tex.needsUpdate = true;
  cachedOwlPlumageTex = tex;
  return tex;
}

const ARCHETYPES: NpcArchetype[] = ['barista', 'professor', 'florist', 'baker', 'explorer'];
const HAIR_PALETTE = [0x3b1d0a, 0x7c2d12, 0x1e293b, 0x92400e, 0x581c87, 0x451a03];
const IRIS_PALETTE = [0x0284c7, 0x16a34a, 0x9333ea, 0xd97706, 0x0f766e];
const SKIN_PALETTE = [0xfde2c4, 0xfcd5b5, 0xf8cfa9, 0xfee5cf];

/**
 * Builds a high-detail, fully articulated 3D stylized humanoid character in Three.js
 * with bottom-center ground pivot, 2-segment arms & legs, blinking eyelids, layered
 * sculpted hair, academy jacket/costume, flowing scarf, and Fever Aura rig.
 */
export function buildStylizedCharacter(config: StylizedCharacterConfig): StylizedCharacterRig {
  const group = new THREE.Group();
  const rootMotion = new THREE.Group();
  group.add(rootMotion);

  const idx = config.archetypeIndex ?? 0;
  const archetype: NpcArchetype = ARCHETYPES[idx % ARCHETYPES.length];

  const skinHex = config.skinToneHex ?? SKIN_PALETTE[idx % SKIN_PALETTE.length];
  const skinMat = new THREE.MeshStandardMaterial({ color: skinHex, roughness: 0.56, metalness: 0.02 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: config.shirtColor, roughness: 0.48, metalness: 0.06 });
  const accentMat = new THREE.MeshStandardMaterial({ color: config.accentColor, roughness: 0.36, metalness: 0.14 });
  const whiteShirtMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.52 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: config.isPlayer ? 0x1e293b : 0x334155, roughness: 0.72 });
  const leatherMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.62, metalness: 0.08 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.22, metalness: 0.86 });
  const hairMat = new THREE.MeshStandardMaterial({
    color: config.isPlayer ? 0x1e293b : HAIR_PALETTE[idx % HAIR_PALETTE.length],
    roughness: 0.58,
    metalness: 0.08,
  });
  const irisMat = new THREE.MeshStandardMaterial({
    color: config.isPlayer ? 0x0284c7 : IRIS_PALETTE[idx % IRIS_PALETTE.length],
    roughness: 0.16,
    metalness: 0.12,
  });

  // Ground contact shadow + Fever Aura rig
  group.add(createSoftContactShadow(0.72, 0.28));
  const auraRig = buildFeverAuraRig(1.1);
  group.add(auraRig.group);

  // ── ARTICULATED 2-SEGMENT LEGS (Hip -> Thigh -> Knee -> Shin + Sculpted Sneaker) ──
  const buildLeg = (side: -1 | 1) => {
    const hip = new THREE.Group();
    hip.position.set(side * 0.19, 0.86, 0);

    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.125, 0.24, 8, 12), pantsMat);
    thigh.position.y = -0.18;
    thigh.castShadow = true;
    hip.add(thigh);

    const knee = new THREE.Group();
    knee.position.set(0, -0.36, 0);

    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.105, 0.22, 8, 12), pantsMat);
    shin.position.y = -0.18;
    shin.castShadow = true;

    // Ankle sock cuff
    const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.112, 0.1, 12), whiteShirtMat);
    sock.position.y = -0.32;

    // Multi-part sculpted sneaker/boot (midsole + upper + toe cap + lace accent)
    const shoeGroup = new THREE.Group();
    shoeGroup.position.set(0, -0.42, 0.05);
    const midsole = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.08, 0.42), whiteShirtMat);
    midsole.position.y = -0.04;
    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.34), accentMat);
    upper.position.set(0, 0.05, -0.02);
    const toeCap = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), whiteShirtMat);
    toeCap.scale.set(1.0, 0.72, 1.15);
    toeCap.position.set(0, 0.03, 0.13);
    shoeGroup.add(midsole, upper, toeCap);

    knee.add(shin, sock, shoeGroup);
    hip.add(knee);
    return { hip, knee };
  };

  const leftLegBuilt = buildLeg(-1);
  const rightLegBuilt = buildLeg(1);
  rootMotion.add(leftLegBuilt.hip, rightLegBuilt.hip);

  // ── SCULPTED TORSO (LatheGeometry Jacket + Collar + Tie/Ribbon + Belt + Apron/Backpack) ──
  const torso = new THREE.Group();
  torso.position.set(0, 0.88, 0);

  const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.3, 0.22, 16), pantsMat);
  pelvis.position.y = 0.05;

  const torsoLathePts = [
    new THREE.Vector2(0.31, 0.08),
    new THREE.Vector2(0.36, 0.24),
    new THREE.Vector2(0.39, 0.56),
    new THREE.Vector2(0.35, 0.78),
    new THREE.Vector2(0.22, 0.86),
    new THREE.Vector2(0.14, 0.88),
  ];
  const jacket = new THREE.Mesh(new THREE.LatheGeometry(torsoLathePts, 18), shirtMat);
  jacket.castShadow = true;
  jacket.receiveShadow = true;

  // Crisp inner white shirt V-front + necktie / bow tie
  const shirtFront = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.38, 6), whiteShirtMat);
  shirtFront.rotation.x = Math.PI;
  shirtFront.position.set(0, 0.65, 0.29);

  const tie = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.32, 0.04), accentMat);
  tie.position.set(0, 0.56, 0.365);
  const tieKnot = new THREE.Mesh(new THREE.OctahedronGeometry(0.065, 0), accentMat);
  tieKnot.position.set(0, 0.72, 0.37);

  // Golden academy chest crest emblem
  const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.025, 10), goldMat);
  badge.rotation.x = Math.PI / 2;
  badge.position.set(0.19, 0.61, 0.35);

  // Sculpted leather belt with golden buckle & pocket pouches
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.045, 8, 20), leatherMat);
  belt.rotation.x = Math.PI / 2;
  belt.position.y = 0.16;
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 0.07), goldMat);
  buckle.position.set(0, 0.16, 0.365);

  // Rolled neck scarf + dynamic trailing scarf tail
  const scarfRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.082, 10, 20), accentMat);
  scarfRing.rotation.x = Math.PI / 2;
  scarfRing.position.y = 0.84;

  const scarfTailPivot = new THREE.Group();
  scarfTailPivot.position.set(0.15, 0.8, -0.22);
  const scarfStrip = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.48, 0.055), accentMat);
  scarfStrip.position.set(0, -0.22, -0.06);
  scarfStrip.rotation.x = 0.28;
  const scarfTrim = new THREE.Mesh(new THREE.BoxGeometry(0.165, 0.07, 0.06), goldMat);
  scarfTrim.position.set(0, -0.42, -0.11);
  scarfTailPivot.add(scarfStrip, scarfTrim);

  torso.add(pelvis, jacket, shirtFront, tie, tieKnot, badge, belt, buckle, scarfRing, scarfTailPivot);

  // Player Adventure Backpack (with straps, brass clasps & rolled parchment map) vs NPC Apron/Satchel
  if (config.isPlayer) {
    const packGroup = new THREE.Group();
    // Remember: Player faces -Z in RPG street via group.rotation.y = Math.PI,
    // so local -Z is the character's BACK!
    packGroup.position.set(0, 0.48, -0.38);
    const packMain = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.54, 0.24), leatherMat);
    packMain.castShadow = true;
    const packFlap = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.18, 0.27), accentMat);
    packFlap.position.set(0, 0.2, -0.02);
    const packBuckle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.05), goldMat);
    packBuckle.position.set(0, 0.1, -0.15);
    const scroll = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.56, 10),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.72 })
    );
    scroll.rotation.z = Math.PI / 2;
    scroll.position.set(0, 0.34, -0.02);
    const scrollBand = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.018, 6, 12), accentMat);
    scrollBand.rotation.y = Math.PI / 2;
    scrollBand.position.set(0, 0.34, -0.02);
    packGroup.add(packMain, packFlap, packBuckle, scroll, scrollBand);
    torso.add(packGroup);
  } else if (archetype === 'barista' || archetype === 'florist' || archetype === 'baker') {
    // Crisp craft apron on front of NPC
    const apronMat = new THREE.MeshStandardMaterial({
      color: archetype === 'florist' ? 0xecfdf5 : 0xfffbeb,
      roughness: 0.65,
    });
    const apron = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.56, 0.08), apronMat);
    apron.position.set(0, 0.32, 0.34);
    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.05), accentMat);
    pocket.position.set(0, 0.2, 0.39);
    torso.add(apron, pocket);
  }

  // ── ARTICULATED 2-SEGMENT ARMS (Shoulder -> Upper Arm -> Elbow -> Forearm + Hand + Prop) ──
  const buildArm = (side: -1 | 1) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.44, 0.74, 0);

    const shoulderPad = new THREE.Mesh(new THREE.SphereGeometry(0.125, 10, 10), shirtMat);
    const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.098, 0.2, 6, 10), shirtMat);
    upperArm.position.y = -0.14;
    upperArm.castShadow = true;
    shoulder.add(shoulderPad, upperArm);

    const elbow = new THREE.Group();
    elbow.position.set(0, -0.28, 0);

    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.088, 0.18, 6, 10), shirtMat);
    forearm.position.y = -0.12;
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.095, 0.06, 10), whiteShirtMat);
    cuff.position.y = -0.22;

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.105, 10, 10), skinMat);
    hand.position.y = -0.3;
    const thumb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), skinMat);
    thumb.position.set(-side * 0.075, -0.28, 0.05);

    elbow.add(forearm, cuff, hand, thumb);
    shoulder.add(elbow);
    return { shoulder, elbow };
  };

  const leftArmBuilt = buildArm(-1);
  const rightArmBuilt = buildArm(1);
  torso.add(leftArmBuilt.shoulder, rightArmBuilt.shoulder);

  // Detailed Job Props held in NPC right hand
  if (!config.isPlayer) {
    if (archetype === 'barista') {
      const mug = new THREE.Group();
      mug.position.set(0, -0.31, 0.14);
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.088, 0.22, 12),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.22 })
      );
      const sleeve = new THREE.Mesh(
        new THREE.CylinderGeometry(0.106, 0.096, 0.09, 12),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 })
      );
      const foam = new THREE.Mesh(
        new THREE.SphereGeometry(0.095, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.5 })
      );
      foam.scale.set(1, 0.38, 1);
      foam.position.y = 0.11;
      mug.add(cup, sleeve, foam);
      rightArmBuilt.elbow.add(mug);
    } else if (archetype === 'professor') {
      // Open gilded vocabulary tome
      const tome = new THREE.Group();
      tome.position.set(0, -0.3, 0.18);
      tome.rotation.x = 0.45;
      const coverL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.3), accentMat);
      coverL.position.x = -0.1;
      coverL.rotation.z = 0.18;
      const coverR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.3), accentMat);
      coverR.position.x = 0.1;
      coverR.rotation.z = -0.18;
      const pages = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.05, 0.26),
        new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.6 })
      );
      pages.position.y = 0.03;
      tome.add(coverL, coverR, pages);
      rightArmBuilt.elbow.add(tome);
    } else if (archetype === 'florist') {
      // Wrapped multi-blossom flower bouquet
      const bouquet = new THREE.Group();
      bouquet.position.set(0, -0.3, 0.16);
      const wrap = new THREE.Mesh(
        new THREE.ConeGeometry(0.17, 0.32, 8),
        new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.7 })
      );
      wrap.rotation.x = Math.PI;
      bouquet.add(wrap);
      const bloomPalette = [0xf43f5e, 0xfacc15, 0xec4899, 0x38bdf8];
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const fl = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.095, 0),
          new THREE.MeshStandardMaterial({ color: bloomPalette[i], roughness: 0.42 })
        );
        fl.position.set(Math.cos(a) * 0.09, 0.16, Math.sin(a) * 0.09);
        bouquet.add(fl);
      }
      rightArmBuilt.elbow.add(bouquet);
    } else if (archetype === 'baker') {
      const basket = new THREE.Group();
      basket.position.set(0, -0.32, 0.16);
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.13, 0.16, 10), leatherMat);
      const loaf = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.075, 0.18, 6, 8),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.55 })
      );
      loaf.rotation.z = 0.6;
      loaf.position.y = 0.1;
      basket.add(bowl, loaf);
      rightArmBuilt.elbow.add(basket);
    } else {
      // Glowing brass explorer lantern
      const lantern = new THREE.Group();
      lantern.position.set(0, -0.36, 0.12);
      const core = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.2, 8),
        new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          emissive: 0xfbbf24,
          emissiveIntensity: 1.4,
        })
      );
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.1, 8), goldMat);
      cap.position.y = 0.14;
      lantern.add(core, cap);
      rightArmBuilt.elbow.add(lantern);
    }
  }

  // ── EXPRESSIVE HEAD (Neck + Sculpted Head + 3-Layer Eyes + Blinking Eyelids + Hair + Hat) ──
  const head = new THREE.Group();
  head.position.set(0, 1.18, 0);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.2, 10), skinMat);
  neck.position.y = -0.28;

  const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.4, 22, 18), skinMat);
  headSphere.scale.set(1.0, 0.96, 0.96);
  headSphere.castShadow = true;

  // Ears & subtle cute sculpted nose
  [-0.38, 0.38].forEach((ex) => {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.088, 10, 8), skinMat);
    ear.scale.set(0.65, 1.0, 0.85);
    ear.position.set(ex, -0.02, 0.0);
    head.add(ear);
  });
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 8), skinMat);
  nose.position.set(0, -0.03, 0.385);
  head.add(neck, headSphere, nose);

  // 3-Layer Stylized Eyes (Sclera + Colored Iris + Glossy Pupil + Dual Catchlights + Blinking Eyelids)
  const scleraMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.18 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.06, metalness: 0.2 });
  const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const blushMat = new THREE.MeshStandardMaterial({ color: 0xfb7185, roughness: 0.72 });

  const buildEye = (side: -1 | 1) => {
    const ex = side * 0.142;
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.088, 12, 12), scleraMat);
    sclera.scale.set(0.95, 1.12, 0.55);
    sclera.position.set(ex, 0.035, 0.345);

    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 10), irisMat);
    iris.scale.set(0.92, 1.06, 0.45);
    iris.position.set(ex, 0.035, 0.376);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 8), pupilMat);
    pupil.scale.set(0.9, 1.0, 0.4);
    pupil.position.set(ex, 0.035, 0.394);

    const glintMain = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), glintMat);
    glintMain.position.set(ex + 0.022, 0.064, 0.408);
    const glintSub = new THREE.Mesh(new THREE.SphereGeometry(0.011, 6, 6), glintMat);
    glintSub.position.set(ex - 0.018, 0.012, 0.406);

    // Blinking upper eyelid shell
    const eyelid = new THREE.Mesh(
      new THREE.SphereGeometry(0.095, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
      skinMat
    );
    eyelid.scale.set(1.0, 1.12, 0.65);
    eyelid.position.set(ex, 0.038, 0.348);
    eyelid.rotation.x = -0.95; // open by default

    const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.09, 4, 6), hairMat);
    brow.rotation.z = Math.PI / 2 - side * 0.14;
    brow.position.set(ex, 0.165, 0.355);

    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.056, 8, 8), blushMat);
    blush.scale.set(1.3, 0.65, 0.3);
    blush.position.set(side * 0.22, -0.06, 0.33);

    head.add(sclera, iris, pupil, glintMain, glintSub, eyelid, brow, blush);
    return { eyelid, brow };
  };

  const leftEye = buildEye(-1);
  const rightEye = buildEye(1);

  // Warm sculpted smile
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.072, 0.016, 6, 14, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x9f1239, roughness: 0.38 })
  );
  smile.rotation.z = Math.PI;
  smile.position.set(0, -0.095, 0.372);
  head.add(smile);

  // Layered Sculpted Hair (Crown + Sleek Parted Bangs cleanly ABOVE eyebrows + Side Locks)
  const hairCrown = new THREE.Mesh(
    new THREE.SphereGeometry(0.425, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.52),
    hairMat
  );
  hairCrown.position.y = 0.06;
  head.add(hairCrown);

  // Sleek parted forehead bangs resting neatly above the eyebrows (never blocking the eyes!)
  [-0.25, -0.12, 0.12, 0.25].forEach((bx, bi) => {
    const bang = new THREE.Mesh(new THREE.ConeGeometry(0.082, 0.17, 7), hairMat);
    bang.rotation.x = Math.PI + 0.42;
    bang.rotation.z = bx * 0.65;
    bang.position.set(bx, 0.295 + (bi === 1 || bi === 2 ? 0.025 : 0), 0.305);
    head.add(bang);
  });

  // Framing side hair locks tucked behind cheeks
  [-0.36, 0.36].forEach((sx) => {
    const lock = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.24, 6, 8), hairMat);
    lock.position.set(sx, 0.02, 0.04);
    lock.rotation.z = sx > 0 ? -0.16 : 0.16;
    head.add(lock);
  });

  // Back hair & animated bouncing ponytail/tuft
  const backHair = new THREE.Mesh(new THREE.SphereGeometry(0.38, 14, 12), hairMat);
  backHair.scale.set(1.0, 1.05, 0.72);
  backHair.position.set(0, 0.0, -0.14);
  head.add(backHair);

  const hairTailPivot = new THREE.Group();
  hairTailPivot.position.set(0, 0.1, -0.4);
  const ponyTail = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.46, 10), hairMat);
  ponyTail.rotation.x = Math.PI + 0.38;
  ponyTail.position.set(0, -0.16, -0.1);
  const hairTie = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.028, 6, 12), accentMat);
  hairTailPivot.add(ponyTail, hairTie);
  head.add(hairTailPivot);

  // Distinct Headwear & Accessories (Player Academy Cap vs NPC Costumed Hats & Glasses)
  if (config.isPlayer) {
    const capCrown = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.46),
      accentMat
    );
    capCrown.position.y = 0.2;
    const capBand = new THREE.Mesh(new THREE.CylinderGeometry(0.415, 0.415, 0.06, 18), shirtMat);
    capBand.position.y = 0.25;
    const capVisor = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.38, 0.04, 16), accentMat);
    capVisor.scale.set(1.0, 1.0, 0.65);
    capVisor.position.set(0, 0.26, 0.34);
    capVisor.rotation.x = 0.14;
    const wingBadge = new THREE.Mesh(new THREE.OctahedronGeometry(0.072, 0), goldMat);
    wingBadge.position.set(0, 0.37, 0.37);
    head.add(capCrown, capBand, capVisor, wingBadge);
  } else if (archetype === 'barista') {
    const strawMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.72 });
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.54, 0.05, 18), strawMat);
    brim.position.y = 0.31;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.24, 16), strawMat);
    top.position.y = 0.44;
    const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.345, 0.345, 0.07, 16), accentMat);
    ribbon.position.y = 0.36;
    head.add(brim, top, ribbon);
  } else if (archetype === 'professor') {
    // Scholar Beret + Gold Wire Spectacles!
    const beret = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 10), accentMat);
    beret.scale.set(1.16, 0.42, 1.16);
    beret.position.set(0.08, 0.39, -0.02);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.12, 6), accentMat);
    stem.position.set(0.08, 0.57, -0.02);
    head.add(beret, stem);

    [-0.142, 0.142].forEach((gx) => {
      const frame = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.016, 8, 18), goldMat);
      frame.position.set(gx, 0.035, 0.42);
      head.add(frame);
    });
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.018, 0.02), goldMat);
    bridge.position.set(0, 0.04, 0.42);
    head.add(bridge);
  } else if (archetype === 'florist') {
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.58, 0.05, 20), accentMat);
    brim.position.y = 0.3;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.36, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), accentMat);
    dome.position.y = 0.32;
    const daisy = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.1, 0),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 })
    );
    daisy.position.set(0.34, 0.36, 0.24);
    head.add(brim, dome, daisy);
  } else if (archetype === 'baker') {
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.16, 16), whiteShirtMat);
    band.position.y = 0.36;
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 12), whiteShirtMat);
    puff.scale.set(1.05, 0.78, 1.05);
    puff.position.y = 0.56;
    head.add(band, puff);
  } else {
    // Explorer cap with brass aviation goggles
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.415, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.52),
      leatherMat
    );
    cap.position.y = 0.14;
    [-0.14, 0.14].forEach((gx) => {
      const goggle = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.024, 8, 16), goldMat);
      goggle.position.set(gx, 0.28, 0.37);
      const lens = new THREE.Mesh(
        new THREE.CircleGeometry(0.085, 12),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.35 })
      );
      lens.position.set(gx, 0.28, 0.375);
      head.add(goggle, lens);
    });
    head.add(cap);
  }

  torso.add(head);
  rootMotion.add(torso);

  // Floating golden RPG Quest Marker Beacon above NPCs
  let questMarker: THREE.Group | undefined;
  if (config.showQuestMarker) {
    questMarker = new THREE.Group();
    questMarker.position.set(0, 3.15, 0);
    const beaconGold = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.9,
      roughness: 0.18,
      metalness: 0.75,
    });
    const bar = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.42, 6, 10), beaconGold);
    bar.position.y = 0.28;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), beaconGold);
    dot.position.y = -0.14;
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.46, 0.048, 8, 24),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.65,
      })
    );
    halo.position.y = 0.18;
    questMarker.add(bar, dot, halo);
    group.add(questMarker);
  }

  return {
    group,
    rootMotion,
    torso,
    head,
    leftShoulder: leftArmBuilt.shoulder,
    leftElbow: leftArmBuilt.elbow,
    rightShoulder: rightArmBuilt.shoulder,
    rightElbow: rightArmBuilt.elbow,
    leftHip: leftLegBuilt.hip,
    leftKnee: leftLegBuilt.knee,
    rightHip: rightLegBuilt.hip,
    rightKnee: rightLegBuilt.knee,
    leftEyelid: leftEye.eyelid,
    rightEyelid: rightEye.eyelid,
    leftBrow: leftEye.brow,
    rightBrow: rightEye.brow,
    scarfTail: scarfTailPivot,
    hairTail: hairTailPivot,
    questMarker,
    auraRig,
    blinkSeed: (idx * 1.37 + (config.isPlayer ? 0.5 : 1.9)) % 4.1,
    leftArm: leftArmBuilt.shoulder,
    rightArm: rightArmBuilt.shoulder,
    leftLeg: leftLegBuilt.hip,
    rightLeg: rightLegBuilt.hip,
  };
}

/**
 * Smooth procedural skeletal-style animation for StylizedCharacterRig:
 * handles natural blinking, chest breathing, 2-joint knee-bending stride,
 * expressive forearm waving, dialogue head nods, and celebratory jumps.
 */
export function animateStylizedCharacter(
  rig: StylizedCharacterRig,
  state: CharacterAnimState,
  elapsed: number,
  dt: number,
  energyBoost = 0,
  gestureClass?: HumanRigMotionClass
): void {
  const damp = (cur: number, target: number, lambda = 11) =>
    THREE.MathUtils.damp(cur, target, lambda, Math.max(dt, 0.008));

  const activeGesture =
    gestureClass && gestureClass !== IDLE_BREATH_CLASS ? getGestureByCode(gestureClass) : null;

  // Automatic natural eyelid blinking every ~3.6 seconds
  const blinkCycle = (elapsed + rig.blinkSeed) % 3.6;
  const isBlinking = blinkCycle > 3.46;
  const lidTarget = state === 'celebrate' ? -0.35 : isBlinking ? 0.08 : -0.95;
  rig.leftEyelid.rotation.x = damp(rig.leftEyelid.rotation.x, lidTarget, 26);
  rig.rightEyelid.rotation.x = damp(rig.rightEyelid.rotation.x, lidTarget, 26);

  // Subtle eyebrow expression lift driven by active gesture emotion or speech state
  const browY = activeGesture
    ? 0.165 + activeGesture.pose.browOffsetY + Math.sin(elapsed * 3.6) * 0.006
    : state === 'celebrate'
      ? 0.195
      : state === 'talk'
        ? 0.175 + Math.sin(elapsed * 4) * 0.01
        : 0.165;
  rig.leftBrow.position.y = damp(rig.leftBrow.position.y, browY, 12);
  rig.rightBrow.position.y = damp(rig.rightBrow.position.y, browY, 12);

  if (state === 'walk') {
    const phase = elapsed * 10.5;
    const stride = Math.sin(phase);
    const bounce = Math.abs(Math.cos(phase)) * 0.09;

    rig.rootMotion.position.y = damp(rig.rootMotion.position.y, bounce, 18);
    rig.torso.rotation.x = damp(rig.torso.rotation.x, 0.1, 10);
    rig.torso.rotation.y = damp(rig.torso.rotation.y, stride * 0.12, 12);
    rig.head.rotation.x = damp(rig.head.rotation.x, 0, 10);
    rig.head.rotation.y = damp(rig.head.rotation.y, -stride * 0.06, 10);
    rig.head.rotation.z = damp(rig.head.rotation.z, Math.sin(phase) * 0.04, 10);

    // 2-segment knee-bending walk stride
    rig.leftHip.rotation.x = stride * 0.62;
    rig.rightHip.rotation.x = -stride * 0.62;
    rig.leftKnee.rotation.x = Math.max(0, -Math.cos(phase)) * 0.72;
    rig.rightKnee.rotation.x = Math.max(0, Math.cos(phase)) * 0.72;

    // Opposing arm & bent elbow swing
    rig.leftShoulder.rotation.x = -stride * 0.56;
    rig.rightShoulder.rotation.x = stride * 0.56;
    rig.leftShoulder.rotation.z = damp(rig.leftShoulder.rotation.z, 0.08, 10);
    rig.rightShoulder.rotation.z = damp(rig.rightShoulder.rotation.z, -0.08, 10);
    rig.leftElbow.rotation.x = -0.35 - Math.max(0, -stride) * 0.35;
    rig.rightElbow.rotation.x = -0.35 - Math.max(0, stride) * 0.35;

    if (rig.scarfTail) rig.scarfTail.rotation.x = 0.32 + Math.sin(phase * 2) * 0.2;
    if (rig.hairTail) rig.hairTail.rotation.x = 0.25 + Math.cos(phase * 2) * 0.18;
    return;
  }

  if (state === 'celebrate') {
    const hop = Math.abs(Math.sin(elapsed * 9.5)) * (0.34 + energyBoost * 0.12);
    rig.rootMotion.position.y = damp(rig.rootMotion.position.y, hop, 18);
    rig.torso.rotation.x = damp(rig.torso.rotation.x, -0.06, 10);
    rig.torso.rotation.y = damp(rig.torso.rotation.y, Math.sin(elapsed * 5) * 0.18, 10);
    rig.head.rotation.x = damp(rig.head.rotation.x, -0.05, 10);
    rig.head.rotation.z = Math.sin(elapsed * 9.5) * 0.12;

    rig.leftShoulder.rotation.z = 2.45 + Math.sin(elapsed * 14) * 0.28;
    rig.rightShoulder.rotation.z = -2.45 - Math.sin(elapsed * 14) * 0.28;
    rig.leftShoulder.rotation.x = damp(rig.leftShoulder.rotation.x, -0.3, 12);
    rig.rightShoulder.rotation.x = damp(rig.rightShoulder.rotation.x, -0.3, 12);
    rig.leftElbow.rotation.x = damp(rig.leftElbow.rotation.x, -0.45, 12);
    rig.rightElbow.rotation.x = damp(rig.rightElbow.rotation.x, -0.45, 12);

    rig.leftHip.rotation.x = damp(rig.leftHip.rotation.x, -0.15, 12);
    rig.rightHip.rotation.x = damp(rig.rightHip.rotation.x, 0.15, 12);
    rig.leftKnee.rotation.x = damp(rig.leftKnee.rotation.x, 0.32, 12);
    rig.rightKnee.rotation.x = damp(rig.rightKnee.rotation.x, 0.32, 12);

    if (rig.scarfTail) rig.scarfTail.rotation.x = 0.45 + Math.sin(elapsed * 12) * 0.25;
    if (rig.hairTail) rig.hairTail.rotation.x = 0.35 + Math.sin(elapsed * 12) * 0.22;
    return;
  }

  // Active Speech Gesture Pose from GESTURES dataset (g-01 .. g-24)
  if (activeGesture) {
    const p = activeGesture.pose;
    const wave = Math.sin(elapsed * p.armWaveSpeed + rig.blinkSeed);
    const breath = Math.sin(elapsed * 2.6 + rig.blinkSeed);
    const lam = p.dampLambda;

    rig.rootMotion.position.y = damp(
      rig.rootMotion.position.y,
      Math.abs(wave) * p.bounceAmp + breath * 0.015,
      lam
    );
    rig.torso.rotation.x = damp(rig.torso.rotation.x, p.torsoLeanX + breath * 0.012, lam);
    rig.torso.rotation.y = damp(
      rig.torso.rotation.y,
      Math.sin(elapsed * 1.9 + rig.blinkSeed) * p.torsoSwayAmp,
      lam
    );
    rig.head.rotation.x = damp(rig.head.rotation.x, p.headPitchX + Math.sin(elapsed * 3.2) * 0.03, lam);
    rig.head.rotation.y = damp(
      rig.head.rotation.y,
      Math.sin(elapsed * 2.1 + rig.blinkSeed) * p.headYawAmp,
      lam
    );
    rig.head.rotation.z = damp(
      rig.head.rotation.z,
      p.headTiltZ + Math.cos(elapsed * 1.8 + rig.blinkSeed) * 0.03,
      lam
    );

    rig.leftHip.rotation.x = damp(rig.leftHip.rotation.x, 0, 10);
    rig.rightHip.rotation.x = damp(rig.rightHip.rotation.x, 0, 10);
    rig.leftKnee.rotation.x = damp(rig.leftKnee.rotation.x, 0, 10);
    rig.rightKnee.rotation.x = damp(rig.rightKnee.rotation.x, 0, 10);

    rig.leftShoulder.rotation.z = damp(rig.leftShoulder.rotation.z, p.leftShoulderZ + wave * p.armWaveAmp * 0.35, lam);
    rig.leftShoulder.rotation.x = damp(rig.leftShoulder.rotation.x, p.leftShoulderX, lam);
    rig.leftElbow.rotation.x = damp(rig.leftElbow.rotation.x, p.leftElbowX, lam);

    rig.rightShoulder.rotation.z = damp(rig.rightShoulder.rotation.z, p.rightShoulderZ + wave * p.armWaveAmp, lam);
    rig.rightShoulder.rotation.x = damp(rig.rightShoulder.rotation.x, p.rightShoulderX, lam);
    rig.rightElbow.rotation.x = damp(rig.rightElbow.rotation.x, p.rightElbowX + wave * 0.08, lam);

    if (rig.scarfTail) rig.scarfTail.rotation.x = 0.16 + Math.sin(elapsed * 3.4 + rig.blinkSeed) * 0.1;
    if (rig.hairTail) rig.hairTail.rotation.x = 0.1 + Math.sin(elapsed * 3.0 + rig.blinkSeed) * 0.08;
    return;
  }

  // Smooth idleBreath / Default Talk / Friendly Hub Wave
  const breath = Math.sin(elapsed * 2.6 + rig.blinkSeed);
  rig.rootMotion.position.y = damp(rig.rootMotion.position.y, breath * 0.032, 8);
  rig.torso.rotation.x = damp(rig.torso.rotation.x, 0.02 + breath * 0.015, 8);
  rig.torso.rotation.y = damp(rig.torso.rotation.y, state === 'talk' ? Math.sin(elapsed * 1.8) * 0.08 : 0, 7);
  rig.head.rotation.x = damp(rig.head.rotation.x, breath * 0.018, 7);
  rig.head.rotation.y = damp(rig.head.rotation.y, Math.sin(elapsed * 1.9 + rig.blinkSeed) * 0.14, 7);
  rig.head.rotation.z = damp(rig.head.rotation.z, Math.cos(elapsed * 1.4 + rig.blinkSeed) * 0.06, 7);

  rig.leftHip.rotation.x = damp(rig.leftHip.rotation.x, 0, 10);
  rig.rightHip.rotation.x = damp(rig.rightHip.rotation.x, 0, 10);
  rig.leftKnee.rotation.x = damp(rig.leftKnee.rotation.x, 0, 10);
  rig.rightKnee.rotation.x = damp(rig.rightKnee.rotation.x, 0, 10);

  rig.leftShoulder.rotation.x = damp(rig.leftShoulder.rotation.x, breath * 0.05, 8);
  rig.leftShoulder.rotation.z = damp(rig.leftShoulder.rotation.z, 0.12, 8);
  rig.leftElbow.rotation.x = damp(rig.leftElbow.rotation.x, -0.18, 8);

  if (state === 'wave' || state === 'talk') {
    const waveAngle = state === 'wave' ? -2.25 + Math.sin(elapsed * 6.5) * 0.34 : -0.68 + Math.sin(elapsed * 4.4) * 0.22;
    rig.rightShoulder.rotation.z = damp(rig.rightShoulder.rotation.z, waveAngle, 12);
    rig.rightShoulder.rotation.x = damp(rig.rightShoulder.rotation.x, -0.25, 10);
    rig.rightElbow.rotation.x = damp(rig.rightElbow.rotation.x, state === 'wave' ? -0.55 : -0.78, 10);
  } else {
    rig.rightShoulder.rotation.x = damp(rig.rightShoulder.rotation.x, -breath * 0.05, 8);
    rig.rightShoulder.rotation.z = damp(rig.rightShoulder.rotation.z, -0.12, 8);
    rig.rightElbow.rotation.x = damp(rig.rightElbow.rotation.x, -0.18, 8);
  }

  if (rig.scarfTail) rig.scarfTail.rotation.x = 0.14 + Math.sin(elapsed * 3.1 + rig.blinkSeed) * 0.09;
  if (rig.hairTail) rig.hairTail.rotation.x = 0.08 + Math.sin(elapsed * 2.8 + rig.blinkSeed) * 0.07;
}

/**
 * Builds the Flagship Three.js Sculpted Scholar Owl 3D Mascot Character:
 * - Sculpted pear-shaped LatheGeometry feathered torso with procedural plumage belly map
 * - Independent articulated head with blinking eyelids & perky feathered ear tufts
 * - 3-layer expressive eyes + brass scholar spectacles with sky-tinted lenses
 * - Multi-feather fanned articulated wings, striped academy scarf, mortarboard with dangling tassel
 * - Grounded 3-toed talons + built-in Fever Aura rig
 */
export function buildScholarOwlCharacter(): ScholarOwlRig {
  const group = new THREE.Group();
  const bodyGroup = new THREE.Group();
  group.add(bodyGroup);

  const featherMainMat = new THREE.MeshStandardMaterial({ color: 0x58cc02, roughness: 0.44, metalness: 0.04 });
  const featherLightMat = new THREE.MeshStandardMaterial({ color: 0x84cc16, roughness: 0.42 });
  const featherTipMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.48 });
  const bellyMat = new THREE.MeshStandardMaterial({ map: getOwlPlumageTexture(), roughness: 0.52 });
  const beakMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.26, metalness: 0.12 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.18 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.06, metalness: 0.25 });
  const irisMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.15, metalness: 0.15 });
  const capMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.88 });
  const scarfRedMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.55 });
  const lensMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.28,
    roughness: 0.06,
    metalness: 0.2,
  });

  // Ground shadow + Fever Aura
  group.add(createSoftContactShadow(1.22, 0.26));
  const auraRig = buildFeverAuraRig(1.42);
  group.add(auraRig.group);

  // Sculpted pear-shaped owl torso via LatheGeometry
  const owlBodyPts = [
    new THREE.Vector2(0.0, 0.16),
    new THREE.Vector2(0.55, 0.24),
    new THREE.Vector2(0.88, 0.58),
    new THREE.Vector2(0.92, 0.98),
    new THREE.Vector2(0.76, 1.32),
    new THREE.Vector2(0.56, 1.46),
  ];
  const torsoMesh = new THREE.Mesh(new THREE.LatheGeometry(owlBodyPts, 24), featherMainMat);
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;

  // Textured feathered belly apron
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.66, 18, 16), bellyMat);
  belly.scale.set(0.96, 0.95, 0.56);
  belly.position.set(0, 0.78, 0.52);

  // Cute layered tail feathers at rear (-Z)
  for (let i = -1; i <= 1; i++) {
    const tailFeather = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 6), featherTipMat);
    tailFeather.rotation.x = -Math.PI * 0.65;
    tailFeather.rotation.z = i * 0.24;
    tailFeather.position.set(i * 0.22, 0.36, -0.78);
    bodyGroup.add(tailFeather);
  }

  // Striped Academy Neck Scarf + animated trailing tail (prominently visible under beak)
  const scarfCollar = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.125, 10, 26), scarfRedMat);
  scarfCollar.rotation.x = Math.PI / 2;
  scarfCollar.position.set(0, 1.24, 0.06);
  const scarfStripe = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.045, 8, 26), goldMat);
  scarfStripe.rotation.x = Math.PI / 2;
  scarfStripe.position.set(0, 1.24, 0.06);

  const scarfTail = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.58, 0.08), scarfRedMat);
  scarfTail.position.set(0.48, 0.96, 0.54);
  scarfTail.rotation.z = 0.24;
  scarfTail.rotation.x = -0.22;

  // Sculpted 3-toed owl talons grounded at y = 0
  [-0.32, 0.32].forEach((fx) => {
    const footGroup = new THREE.Group();
    footGroup.position.set(fx, 0.08, 0.16);
    for (let t = -1; t <= 1; t++) {
      const toe = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.16, 6, 8), beakMat);
      toe.rotation.x = Math.PI / 2;
      toe.rotation.z = t * 0.28;
      toe.position.set(t * 0.1, 0, 0.08);
      footGroup.add(toe);
    }
    bodyGroup.add(footGroup);
  });

  // Multi-Feather Articulated Wings (Pivot at shoulder so flapping looks lush!)
  const buildFannedWing = (side: -1 | 1) => {
    const wingGroup = new THREE.Group();
    wingGroup.position.set(side * 0.86, 1.18, 0.02);

    const wingMain = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 12), featherMainMat);
    wingMain.scale.set(0.45, 1.12, 0.72);
    wingMain.position.set(side * 0.12, -0.32, 0);
    wingMain.castShadow = true;
    wingGroup.add(wingMain);

    for (let f = 0; f < 3; f++) {
      const feather = new THREE.Mesh(
        new THREE.ConeGeometry(0.14, 0.46, 6),
        f === 1 ? featherLightMat : featherTipMat
      );
      feather.rotation.x = Math.PI;
      feather.rotation.z = side * (0.16 + f * 0.14);
      feather.position.set(side * (0.16 + f * 0.04), -0.7 + f * 0.07, -0.14 + f * 0.14);
      wingGroup.add(feather);
    }
    return wingGroup;
  };

  const leftWing = buildFannedWing(-1);
  const rightWing = buildFannedWing(1);
  bodyGroup.add(torsoMesh, belly, scarfCollar, scarfStripe, scarfTail, leftWing, rightWing);

  // ── INDEPENDENT ARTICULATED HEAD GROUP ──
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.68, 0.04);

  const headDome = new THREE.Mesh(new THREE.SphereGeometry(0.76, 22, 18), featherMainMat);
  headDome.scale.set(1.06, 0.92, 0.94);
  headDome.castShadow = true;

  // Facial feather discs (classic owl heart-mask)
  [-0.28, 0.28].forEach((mx) => {
    const mask = new THREE.Mesh(new THREE.SphereGeometry(0.36, 14, 12), featherLightMat);
    mask.scale.set(1.0, 1.0, 0.45);
    mask.position.set(mx, 0.02, 0.56);
    headGroup.add(mask);
  });

  // Perky feathered ear tufts
  const leftTuft = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.46, 6), featherTipMat);
  leftTuft.position.set(-0.56, 0.62, 0.04);
  leftTuft.rotation.z = 0.42;
  const rightTuft = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.46, 6), featherTipMat);
  rightTuft.position.set(0.56, 0.62, 0.04);
  rightTuft.rotation.z = -0.42;

  // Expressive 3-layer owl eyes + blinking eyelids + brass scholar spectacles
  const buildOwlEye = (side: -1 | 1) => {
    const ex = side * 0.31;
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.25, 14, 14), whiteMat);
    eyeWhite.scale.set(1, 1, 0.62);
    eyeWhite.position.set(ex, 0.04, 0.62);

    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.175, 12, 12), irisMat);
    iris.scale.set(1, 1, 0.5);
    iris.position.set(ex, 0.04, 0.72);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.115, 10, 10), pupilMat);
    pupil.scale.set(1, 1, 0.45);
    pupil.position.set(ex, 0.04, 0.77);

    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), whiteMat);
    glint.position.set(ex + 0.055, 0.095, 0.815);

    const eyelid = new THREE.Mesh(
      new THREE.SphereGeometry(0.265, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
      featherMainMat
    );
    eyelid.scale.set(1.02, 1.02, 0.68);
    eyelid.position.set(ex, 0.04, 0.62);
    eyelid.rotation.x = -0.98;

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.275, 0.032, 8, 22), goldMat);
    rim.position.set(ex, 0.04, 0.83);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.255, 18), lensMat);
    lens.position.set(ex, 0.04, 0.835);
    lens.userData.ignoreShimmer = true;

    headGroup.add(eyeWhite, iris, pupil, glint, eyelid, rim, lens);
    return eyelid;
  };

  const leftEyelid = buildOwlEye(-1);
  const rightEyelid = buildOwlEye(1);

  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.04), goldMat);
  bridge.position.set(0, 0.06, 0.84);

  // Two-part hooked golden beak
  const upperBeak = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.34, 4), beakMat);
  upperBeak.rotation.x = Math.PI * 0.62;
  upperBeak.position.set(0, -0.14, 0.78);
  const lowerBeak = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.18, 4), beakMat);
  lowerBeak.rotation.x = Math.PI * 0.78;
  lowerBeak.position.set(0, -0.22, 0.71);

  // Graduation Mortarboard Cap + Animated Golden Tassel
  const capBase = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.58, 0.24, 16), capMat);
  capBase.position.y = 0.66;
  const capBoard = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.08, 1.42), capMat);
  capBoard.position.y = 0.82;
  capBoard.rotation.y = Math.PI / 4;
  const capButton = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), goldMat);
  capButton.position.y = 0.88;

  const tasselPivot = new THREE.Group();
  tasselPivot.position.set(0.64, 0.82, 0.1);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.36, 6), goldMat);
  cord.position.y = -0.18;
  const tasselCone = new THREE.Mesh(new THREE.ConeGeometry(0.095, 0.28, 8), goldMat);
  tasselCone.position.y = -0.4;
  tasselPivot.add(cord, tasselCone);

  headGroup.add(headDome, leftTuft, rightTuft, bridge, upperBeak, lowerBeak, capBase, capBoard, capButton, tasselPivot);
  bodyGroup.add(headGroup);

  return {
    group,
    bodyGroup,
    headGroup,
    leftWing,
    rightWing,
    leftEyelid,
    rightEyelid,
    leftTuft,
    rightTuft,
    tasselPivot,
    scarfTail,
    auraRig,
    blinkSeed: 0.9,
  };
}

/** Smooth procedural animation for the flagship Scholar Owl character */
export function animateScholarOwl(
  rig: ScholarOwlRig,
  mode: 'idle' | 'jump' | 'celebrate',
  elapsed: number,
  dt: number,
  shimmerIntensity = 0
): void {
  const damp = (cur: number, target: number, lambda = 12) =>
    THREE.MathUtils.damp(cur, target, lambda, Math.max(dt, 0.008));

  // Natural blinking
  const blinkCycle = (elapsed + rig.blinkSeed) % 3.2;
  const isBlinking = blinkCycle > 3.06;
  const lidTarget = mode === 'celebrate' ? -0.45 : isBlinking ? 0.08 : -0.98;
  rig.leftEyelid.rotation.x = damp(rig.leftEyelid.rotation.x, lidTarget, 24);
  rig.rightEyelid.rotation.x = damp(rig.rightEyelid.rotation.x, lidTarget, 24);

  // Perky ear tufts & dangling graduation tassel + scarf flutter
  const perk = shimmerIntensity * 0.18 + (mode === 'jump' ? 0.25 : 0);
  rig.leftTuft.rotation.z = damp(rig.leftTuft.rotation.z, 0.42 - perk, 10);
  rig.rightTuft.rotation.z = damp(rig.rightTuft.rotation.z, -0.42 + perk, 10);
  rig.tasselPivot.rotation.z = Math.sin(elapsed * (mode === 'jump' ? 14 : 3.2)) * (mode === 'jump' ? 0.45 : 0.14);
  rig.scarfTail.rotation.x = -0.18 + Math.sin(elapsed * 4.2) * 0.14;

  if (mode === 'jump') {
    rig.leftWing.rotation.z = damp(rig.leftWing.rotation.z, 1.05 + Math.sin(elapsed * 22) * 0.25, 16);
    rig.rightWing.rotation.z = damp(rig.rightWing.rotation.z, -1.05 - Math.sin(elapsed * 22) * 0.25, 16);
    rig.headGroup.rotation.x = damp(rig.headGroup.rotation.x, -0.12, 10);
    rig.headGroup.rotation.y = damp(rig.headGroup.rotation.y, 0, 10);
  } else if (mode === 'celebrate') {
    rig.leftWing.rotation.z = 0.72 + Math.sin(elapsed * 14) * 0.35;
    rig.rightWing.rotation.z = -0.72 - Math.sin(elapsed * 14) * 0.35;
    rig.headGroup.rotation.z = Math.sin(elapsed * 8) * 0.16;
  } else {
    rig.leftWing.rotation.z = damp(rig.leftWing.rotation.z, 0.18 + Math.sin(elapsed * 4.2) * 0.12, 10);
    rig.rightWing.rotation.z = damp(rig.rightWing.rotation.z, -0.18 - Math.sin(elapsed * 4.2) * 0.12, 10);
    rig.headGroup.rotation.y = damp(rig.headGroup.rotation.y, Math.sin(elapsed * 1.6) * 0.22, 8);
    rig.headGroup.rotation.z = damp(rig.headGroup.rotation.z, Math.cos(elapsed * 1.2) * 0.08, 8);
    rig.headGroup.rotation.x = damp(rig.headGroup.rotation.x, 0, 8);
  }
}
