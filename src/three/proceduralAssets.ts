import * as THREE from 'three';

/**
 * High-Detail Procedural 3D Hero Models & Canvas Word Signboards
 * - Sculpted prop-jet fighter with spinning nose propeller (-Z) & plasma afterburners (+Z)
 * - Detailed medieval stone word watchtowers with crenelated battlements & target rings
 * - Twin-barrel brass & cobalt siege cannon with spoked wheels & geared turntable
 * - Scholar Owl mascot with brass spectacles, feathered chest & mortarboard tassel
 * - Geodesic astral shield observatory with counter-rotating plasma rings
 * - Burning comet crystal meteors with trailing plasma cones
 * - Steampunk 3-gear grand treasury vault with hydraulic O/X levers
 */

export function createWordSignTexture(
  word: string,
  badgeNumber: number | string,
  accentHex: string,
  maxAnisotropy: number,
  options?: { selected?: boolean; subtitle?: string }
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 384;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 768, 384);

  const frameColor = options?.selected ? '#FACC15' : accentHex;

  // Deep outer drop shadow backing
  ctx.fillStyle = 'rgba(2, 6, 23, 0.55)';
  ctx.beginPath();
  ctx.roundRect(14, 18, 740, 356, 46);
  ctx.fill();

  // Vibrant arcade neon/gold bevel border
  ctx.fillStyle = frameColor;
  ctx.beginPath();
  ctx.roundRect(10, 8, 748, 356, 44);
  ctx.fill();

  // High-contrast Midnight Slate interior plaque (eliminates white-on-white washout!)
  const bgGrad = ctx.createLinearGradient(0, 24, 0, 350);
  if (options?.selected) {
    bgGrad.addColorStop(0, '#1E3A8A');
    bgGrad.addColorStop(1, '#0F172A');
  } else {
    bgGrad.addColorStop(0, '#1E293B');
    bgGrad.addColorStop(1, '#0B1220');
  }
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.roundRect(24, 22, 720, 328, 32);
  ctx.fill();

  // Subtle top glossy arcade strip
  ctx.fillStyle = frameColor;
  ctx.globalAlpha = 0.24;
  ctx.beginPath();
  ctx.roundRect(24, 22, 720, 76, [32, 32, 0, 0]);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Crisp inner hairline rim
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(28, 26, 712, 320, 30);
  ctx.stroke();

  // Luminous index badge (E1, K1, 1, 2, 3)
  ctx.fillStyle = frameColor;
  ctx.beginPath();
  ctx.roundRect(44, 38, 86, 54, 16);
  ctx.fill();

  ctx.fillStyle = options?.selected ? '#0F172A' : '#FFFFFF';
  ctx.font = '900 34px "Plus Jakarta Sans", "Noto Sans KR", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(badgeNumber), 87, 67);

  // Main word label — HUGE, ultra-crisp pure white with bold dark outline for instant 3D legibility!
  const len = word.length;
  const hasKorean = /[가-힣]/.test(word);
  let fontSize = hasKorean ? 76 : 96;
  if (len > 14) fontSize = hasKorean ? 52 : 60;
  else if (len > 10) fontSize = hasKorean ? 60 : 72;
  else if (len > 7) fontSize = hasKorean ? 68 : 84;

  const textY = options?.subtitle ? 196 : 216;
  ctx.font = `900 ${fontSize}px "Plus Jakarta Sans", "Noto Sans KR", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Crisp drop shadow stroke for razor-sharp readability at distance
  ctx.lineWidth = 10;
  ctx.strokeStyle = 'rgba(2, 6, 23, 0.92)';
  ctx.strokeText(word, 384, textY, 680);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(word, 384, textY, 680);

  if (options?.subtitle) {
    ctx.fillStyle = '#FDE047';
    ctx.font = '800 34px "Plus Jakarta Sans", "Noto Sans KR", sans-serif';
    ctx.fillText(options.subtitle, 384, 286, 660);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, maxAnisotropy);
  tex.needsUpdate = true;
  return tex;
}

export function createContactShadowDisc(radius = 1.4, opacity = 0.28): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 62);
  grad.addColorStop(0, `rgba(15, 23, 42, ${opacity})`);
  grad.addColorStop(0.65, `rgba(15, 23, 42, ${opacity * 0.45})`);
  grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const tex = new THREE.CanvasTexture(canvas);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(radius * 2, radius * 2),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.03;
  return mesh;
}

export interface SkyGliderRig {
  group: THREE.Group;
  propeller: THREE.Object3D;
  flames: THREE.Mesh[];
}

/**
 * High-Detail Sculpted Aerospace Prop-Jet Fighter
 * ORIENTATION CONTRACT:
 *   - Nose & spinning 3-blade propeller point strictly toward -Z (forward into the runway!)
 *   - Tail vertical rudder & glowing plasma afterburners point strictly toward +Z (rear facing camera!)
 */
export function buildSkyGlider(): SkyGliderRig {
  const g = new THREE.Group();

  const hullMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.24, metalness: 0.25 });
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.35 });
  const wingMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.28, metalness: 0.25 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.22, metalness: 0.8 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.7 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x0369a1,
    emissiveIntensity: 0.25,
    roughness: 0.08,
    metalness: 0.4,
  });
  const flameMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0x38bdf8,
    emissiveIntensity: 1.8,
    roughness: 0.1,
    transparent: true,
    opacity: 0.9,
  });

  // Sculpted fuselage via LatheGeometry oriented along Z (tip at -Z, tail at +Z)
  const lathePts = [
    new THREE.Vector2(0.0, 1.45), // nose tip (will become -Z after rotateX(-PI/2))
    new THREE.Vector2(0.24, 1.25),
    new THREE.Vector2(0.46, 0.75),
    new THREE.Vector2(0.54, 0.1),
    new THREE.Vector2(0.48, -0.65),
    new THREE.Vector2(0.26, -1.3),
    new THREE.Vector2(0.14, -1.55),
  ];
  const fuselage = new THREE.Mesh(new THREE.LatheGeometry(lathePts, 18), hullMat);
  fuselage.rotation.x = -Math.PI / 2;
  fuselage.position.y = 0.68;
  fuselage.castShadow = true;

  // Racing dorsal stripe
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 2.2), stripeMat);
  stripe.position.set(0, 1.12, -0.05);

  // Nose cowling & spinning 3-blade propeller AT -Z (FRONT!)
  const noseSpinner = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.42, 14), goldMat);
  noseSpinner.rotation.x = -Math.PI / 2;
  noseSpinner.position.set(0, 0.68, -1.55);

  const propeller = new THREE.Group();
  propeller.position.set(0, 0.68, -1.5);
  for (let i = 0; i < 3; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.86, 0.03), darkMetal);
    blade.rotation.z = (i * Math.PI * 2) / 3;
    propeller.add(blade);
  }
  const propBlur = new THREE.Mesh(
    new THREE.RingGeometry(0.22, 0.45, 20),
    new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
  );
  propeller.add(propBlur);

  // Tinted bubble cockpit canopy
  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 12), glassMat);
  cockpit.scale.set(0.95, 0.78, 1.65);
  cockpit.position.set(0, 1.04, -0.15);

  // Swept main wings + gold winglets + red/green nav lights
  const leftWing = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.11, 0.92), wingMat);
  leftWing.position.set(-1.15, 0.62, 0.05);
  leftWing.rotation.y = 0.24;
  leftWing.castShadow = true;

  const rightWing = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.11, 0.92), wingMat);
  rightWing.position.set(1.15, 0.62, 0.05);
  rightWing.rotation.y = -0.24;
  rightWing.castShadow = true;

  const leftWinglet = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.42, 0.55), goldMat);
  leftWinglet.position.set(-2.12, 0.78, 0.25);
  leftWinglet.rotation.z = 0.22;

  const rightWinglet = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.42, 0.55), goldMat);
  rightWinglet.position.set(2.12, 0.78, 0.25);
  rightWinglet.rotation.z = -0.22;

  // Navigation strobes (Port Red, Starboard Green)
  const portLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xff4b4b })
  );
  portLight.position.set(-2.18, 0.96, 0.2);
  const starLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x58cc02 })
  );
  starLight.position.set(2.18, 0.96, 0.2);

  // Proper Rear Tail Stabilizer (Vertical Rudder + Horizontal Elevators) AT +Z (REAR!)
  const verticalTail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.85, 0.72), goldMat);
  verticalTail.position.set(0, 1.12, 1.28);
  verticalTail.rotation.x = -0.25;

  const horizTail = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.08, 0.46), stripeMat);
  horizTail.position.set(0, 0.72, 1.32);

  // Twin under-wing turbine pods with glowing exhaust nozzles facing +Z
  const flames: THREE.Mesh[] = [];
  [-0.78, 0.78].forEach((tx) => {
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.95, 12), darkMetal);
    pod.rotation.x = Math.PI / 2;
    pod.position.set(tx, 0.44, 0.28);

    const nozzleRing = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 8, 16), goldMat);
    nozzleRing.position.set(tx, 0.44, 0.76);

    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.75, 10), flameMat);
    flame.rotation.x = Math.PI / 2;
    flame.position.set(tx, 0.44, 1.12);
    flames.push(flame);
    g.add(pod, nozzleRing, flame);
  });

  g.add(
    fuselage,
    stripe,
    noseSpinner,
    propeller,
    cockpit,
    leftWing,
    rightWing,
    leftWinglet,
    rightWinglet,
    portLight,
    starLight,
    verticalTail,
    horizTail,
    createContactShadowDisc(1.55, 0.24)
  );
  return { group: g, propeller, flames };
}

/** High-Detail Aerospace Holographic Word Gate Arch for Sky Runner */
export function buildWordGateArch(
  word: string,
  laneNumber: number,
  accentHex: string,
  maxAnisotropy: number
): THREE.Group {
  const g = new THREE.Group();
  const accentColor = new THREE.Color(accentHex);

  const frameMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.32, metalness: 0.45 });
  const accentMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 0.35,
    roughness: 0.25,
    metalness: 0.35,
  });
  const energyMat = new THREE.MeshBasicMaterial({
    color: accentColor,
    transparent: true,
    opacity: 0.16,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.32, 3.0, 0.44), frameMat);
  leftPillar.position.set(-1.42, 1.5, 0);
  const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(0.32, 3.0, 0.44), frameMat);
  rightPillar.position.set(1.42, 1.5, 0);

  // Glowing side beacons
  [-1.42, 1.42].forEach((px) => {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.4, 0.48), accentMat);
    strip.position.set(px, 1.5, 0);
    g.add(strip);
  });

  const topBeam = new THREE.Mesh(new THREE.BoxGeometry(3.25, 0.36, 0.5), accentMat);
  topBeam.position.set(0, 3.12, 0);

  const energyCurtain = new THREE.Mesh(new THREE.PlaneGeometry(2.55, 2.8), energyMat);
  energyCurtain.position.set(0, 1.45, 0);

  const signTex = createWordSignTexture(word, laneNumber, accentHex, maxAnisotropy);
  const signMat = new THREE.MeshBasicMaterial({ map: signTex, transparent: true });
  const signBoard = new THREE.Mesh(new THREE.PlaneGeometry(3.25, 1.62), signMat);
  signBoard.position.set(0, 2.42, 0.3);

  g.add(leftPillar, rightPillar, topBeam, energyCurtain, signBoard);
  return g;
}

export interface TurretRig {
  group: THREE.Group;
  turretHead: THREE.Group;
}

/** High-Detail Twin-Barrel Brass & Cobalt Siege Cannon for Tower Crash */
export function buildArcadeTurret(): TurretRig {
  const group = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.65, metalness: 0.35 });
  const cobaltMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.28, metalness: 0.45 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.24, metalness: 0.85 });
  const barrelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.22, metalness: 0.72 });

  // Heavy octagonal geared turntable base
  const basePedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.75, 0.55, 8), stoneMat);
  basePedestal.position.y = 0.275;
  basePedestal.castShadow = true;

  const gearRing = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.14, 10, 24), goldMat);
  gearRing.rotation.x = Math.PI / 2;
  gearRing.position.y = 0.58;
  group.add(basePedestal, gearRing, createContactShadowDisc(1.9, 0.32));

  const turretHead = new THREE.Group();
  turretHead.position.y = 0.95;

  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.95, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62), cobaltMat);
  dome.castShadow = true;

  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.26, 0.5),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.9,
      roughness: 0.1,
    })
  );
  visor.position.set(0, 0.48, -0.72);

  [-0.34, 0.34].forEach((bx) => {
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.65, 14), barrelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(bx, 0.26, -1.05);
    barrel.castShadow = true;

    const muzzle = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.06, 8, 16), goldMat);
    muzzle.position.set(bx, 0.26, -1.85);
    turretHead.add(barrel, muzzle);
  });

  turretHead.add(dome, visor);
  group.add(turretHead);
  return { group, turretHead };
}

/** Detailed Medieval Castle Watchtower Word Block (used in 3-Pair Tower Crash!) */
export function buildWordMonolith(
  word: string,
  badgeNumber: number | string,
  accentHex: string,
  maxAnisotropy: number,
  options?: { stoneTex?: THREE.CanvasTexture; selected?: boolean; subtitle?: string }
): THREE.Group {
  const g = new THREE.Group();
  const accentColor = new THREE.Color(accentHex);

  const stoneMat = options?.stoneTex
    ? new THREE.MeshStandardMaterial({
        map: options.stoneTex,
        color: 0x64748b,
        roughness: 0.72,
        metalness: 0.14,
      })
    : new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.65, metalness: 0.2 });

  const darkSlateMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.48,
    metalness: 0.42,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.26,
    metalness: 0.85,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: options?.selected ? 0.75 : 0.28,
    roughness: 0.28,
    metalness: 0.32,
  });

  // Grounded dark armored fortress plinth + gold belt trim
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.85, 0.44, 1.45), darkSlateMat);
  plinth.position.y = 0.22;
  const goldBelt = new THREE.Mesh(new THREE.BoxGeometry(2.68, 0.12, 1.32), goldMat);
  goldBelt.position.y = 0.46;

  // Armored fortress tower body + twin glowing corner rune pillars
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.55, 2.0, 1.2), stoneMat);
  body.position.y = 1.44;
  body.castShadow = true;

  [-1.28, 1.28].forEach((px) => {
    const corner = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.05, 1.28), darkSlateMat);
    corner.position.set(px, 1.44, 0);
    const rune = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.55, 1.34), accentMat);
    rune.position.set(px, 1.44, 0);
    g.add(corner, rune);
  });

  // Battlement crown & fluttering pennant flag
  const crown = new THREE.Mesh(new THREE.BoxGeometry(2.85, 0.34, 1.4), accentMat);
  crown.position.y = 2.52;
  for (let x = -1.05; x <= 1.06; x += 0.7) {
    const merlon = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.3, 0.4), accentMat);
    merlon.position.set(x, 2.82, 0.44);
    g.add(merlon);
  }

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.92, 6), goldMat);
  pole.position.set(1.05, 3.15, 0);
  const pennant = new THREE.Mesh(
    new THREE.PlaneGeometry(0.65, 0.34),
    new THREE.MeshStandardMaterial({
      color: accentColor,
      emissive: accentColor,
      emissiveIntensity: 0.3,
      side: THREE.DoubleSide,
    })
  );
  pennant.position.set(1.38, 3.4, 0);

  // Target lock-on glowing halo on the ground (visible when selected)
  const lockRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.75, 0.11, 8, 30),
    new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.4,
      transparent: true,
      opacity: options?.selected ? 0.95 : 0.0,
    })
  );
  lockRing.rotation.x = Math.PI / 2;
  lockRing.position.y = 0.1;
  lockRing.name = 'targetLockRing';

  // Large, slightly upward-angled high-contrast word billboard for crystal-clear readability
  const signTex = createWordSignTexture(word, badgeNumber, accentHex, maxAnisotropy, {
    selected: options?.selected,
    subtitle: options?.subtitle,
  });
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.75, 1.42),
    new THREE.MeshBasicMaterial({ map: signTex, transparent: true })
  );
  signMesh.position.set(0, 1.56, 0.72);
  signMesh.rotation.x = -0.16;
  signMesh.name = 'wordSignMesh';

  g.add(
    plinth,
    goldBelt,
    body,
    crown,
    pole,
    pennant,
    lockRing,
    signMesh,
    createContactShadowDisc(1.75, 0.38)
  );
  return g;
}

export interface OwlMascotRig {
  group: THREE.Group;
  leftWing: THREE.Object3D;
  rightWing: THREE.Object3D;
}

/** High-Detail Scholar Owl Mascot with Brass Spectacles, Feathered Belly & Graduation Cap */
export function buildOwlMascot(): OwlMascotRig {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x58cc02, roughness: 0.42 });
  const bellyMat = new THREE.MeshStandardMaterial({ color: 0xf7fee7, roughness: 0.5 });
  const beakMat = new THREE.MeshStandardMaterial({ color: 0xff9600, roughness: 0.28 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.22 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.08, metalness: 0.2 });
  const capMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.55 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.22, metalness: 0.85 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.95, 22, 18), bodyMat);
  body.scale.set(1.0, 1.14, 0.92);
  body.position.y = 1.05;
  body.castShadow = true;

  // Ear feather tufts
  [-0.58, 0.58].forEach((tx) => {
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.42, 6), bodyMat);
    tuft.position.set(tx, 1.98, 0.05);
    tuft.rotation.z = tx > 0 ? -0.35 : 0.35;
    group.add(tuft);
  });

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.68, 16, 14), bellyMat);
  belly.scale.set(0.95, 1.02, 0.65);
  belly.position.set(0, 0.88, 0.46);

  // Expressive eyes + scholarly brass spectacles
  [-0.33, 0.33].forEach((ex) => {
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 14), whiteMat);
    eyeWhite.position.set(ex, 1.32, 0.72);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.145, 12, 12), pupilMat);
    pupil.position.set(ex, 1.32, 0.94);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.048, 8, 8), whiteMat);
    glint.position.set(ex + 0.05, 1.37, 1.06);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.032, 8, 20), goldMat);
    rim.position.set(ex, 1.32, 0.88);
    group.add(eyeWhite, pupil, glint, rim);
  });

  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.04), goldMat);
  bridge.position.set(0, 1.34, 0.96);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.36, 4), beakMat);
  beak.rotation.x = Math.PI * 0.62;
  beak.position.set(0, 1.08, 0.94);

  const leftWing = new THREE.Mesh(new THREE.SphereGeometry(0.46, 12, 12), bodyMat);
  leftWing.scale.set(0.44, 1.15, 0.7);
  leftWing.position.set(-0.98, 1.04, 0.05);
  leftWing.rotation.z = 0.25;

  const rightWing = new THREE.Mesh(new THREE.SphereGeometry(0.46, 12, 12), bodyMat);
  rightWing.scale.set(0.44, 1.15, 0.7);
  rightWing.position.set(0.98, 1.04, 0.05);
  rightWing.rotation.z = -0.25;

  // Graduation mortarboard + golden tassel
  const capBase = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.58, 0.26, 14), capMat);
  capBase.position.y = 2.02;
  const capBoard = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.08, 1.42), capMat);
  capBoard.position.y = 2.18;
  capBoard.rotation.y = Math.PI / 4;
  const tassel = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.44, 8), goldMat);
  tassel.position.set(0.64, 1.94, 0.14);

  [-0.32, 0.32].forEach((fx) => {
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), beakMat);
    foot.scale.set(1.1, 0.65, 1.4);
    foot.position.set(fx, 0.14, 0.2);
    group.add(foot);
  });

  group.add(
    body,
    belly,
    bridge,
    beak,
    leftWing,
    rightWing,
    capBase,
    capBoard,
    tassel,
    createContactShadowDisc(1.15, 0.24)
  );
  return { group, leftWing, rightWing };
}

/** Mossy River Stepping Stone with Rune Trim & Crisp Syllable Plaque */
export function buildSteppingIsland(
  chunk: string,
  badgeNumber: number,
  accentHex: string,
  maxAnisotropy: number
): THREE.Group {
  const g = new THREE.Group();
  const accentColor = new THREE.Color(accentHex);

  const rockMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.88 });
  const mossMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.65 });
  const trimMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 0.3,
    roughness: 0.3,
  });

  // Underwater rock column
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.55, 1.4, 7), rockMat);
  pillar.position.y = -0.7;

  // Flat carved stepping slab with mossy top
  const stoneDeck = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.25, 0.32, 7), mossMat);
  stoneDeck.position.y = -0.05;
  stoneDeck.receiveShadow = true;

  // Glowing rune trim around stepping stone edge
  const runeRing = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.07, 8, 21), trimMat);
  runeRing.rotation.x = Math.PI / 2;
  runeRing.position.y = 0.08;

  // Water foam collar around rock base
  const foam = new THREE.Mesh(
    new THREE.RingGeometry(1.28, 1.62, 18),
    new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
  );
  foam.rotation.x = -Math.PI / 2;
  foam.position.y = -0.18;

  const signTex = createWordSignTexture(chunk, badgeNumber, accentHex, maxAnisotropy);
  const plaque = new THREE.Mesh(
    new THREE.PlaneGeometry(2.35, 1.18),
    new THREE.MeshBasicMaterial({ map: signTex, transparent: true })
  );
  plaque.position.set(0, 1.12, 0.18);
  plaque.rotation.x = -0.14;

  g.add(pillar, stoneDeck, runeRing, foam, plaque);
  return g;
}

export interface LibraryDomeRig {
  group: THREE.Group;
  ring: THREE.Object3D;
  outerRing: THREE.Object3D;
}

/** High-Detail Astral Observatory & Geodesic Energy Shield Dome for Synonym/Antonym Defense */
export function buildLibraryDome(): LibraryDomeRig {
  const group = new THREE.Group();
  const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.45, metalness: 0.15 });
  const violetMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.35, metalness: 0.35 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.22, metalness: 0.85 });
  const shieldMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x0284c7,
    emissiveIntensity: 0.42,
    roughness: 0.12,
    metalness: 0.2,
    transparent: true,
    opacity: 0.72,
  });

  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(2.45, 2.8, 0.65, 12), marbleMat);
  plinth.position.y = 0.325;
  const trim = new THREE.Mesh(new THREE.CylinderGeometry(2.15, 2.35, 0.35, 12), violetMat);
  trim.position.y = 0.78;

  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.78, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.62), shieldMat);
  dome.position.y = 0.82;

  const wireGrid = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.82, 1),
    new THREE.MeshBasicMaterial({ color: 0xbae6fd, wireframe: true, transparent: true, opacity: 0.32 })
  );
  wireGrid.position.y = 0.95;

  const coreCrystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.68, 0),
    new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.8,
      roughness: 0.12,
    })
  );
  coreCrystal.position.y = 1.55;

  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.15, 8), goldMat);
  spire.position.y = 3.05;

  // Inner & outer counter-rotating astrolabe shield rings
  const ring = new THREE.Group();
  ring.position.y = 1.75;
  const torus1 = new THREE.Mesh(new THREE.TorusGeometry(2.25, 0.09, 10, 32), goldMat);
  torus1.rotation.x = Math.PI / 2;
  ring.add(torus1);

  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const node = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), violetMat);
    node.position.set(Math.cos(a) * 2.25, 0.16, Math.sin(a) * 2.25);
    ring.add(node);
  }

  const outerRing = new THREE.Group();
  outerRing.position.y = 1.75;
  const torus2 = new THREE.Mesh(new THREE.TorusGeometry(2.65, 0.06, 8, 36), violetMat);
  torus2.rotation.x = Math.PI * 0.42;
  outerRing.add(torus2);

  group.add(plinth, trim, dome, wireGrid, coreCrystal, spire, ring, outerRing);
  return { group, ring, outerRing };
}

/** Fiery Crystal Comet Meteor with Trailing Plasma Cone & Crisp Word Signboard */
export function buildCrystalMeteor(
  word: string,
  badgeNumber: number,
  accentHex: string,
  maxAnisotropy: number
): THREE.Group {
  const g = new THREE.Group();
  const accentColor = new THREE.Color(accentHex);

  const crystal = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.82, 0),
    new THREE.MeshStandardMaterial({
      color: accentColor,
      emissive: accentColor,
      emissiveIntensity: 0.42,
      roughness: 0.18,
      metalness: 0.35,
    })
  );
  crystal.castShadow = true;

  // Fiery atmospheric entry comet tail rising above the meteor
  const tail = new THREE.Mesh(
    new THREE.ConeGeometry(0.65, 1.9, 10),
    new THREE.MeshBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    })
  );
  tail.position.y = 1.05;

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(1.06, 0.075, 8, 22),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.22, metalness: 0.85 })
  );
  halo.rotation.x = Math.PI * 0.38;

  const signTex = createWordSignTexture(word, badgeNumber, accentHex, maxAnisotropy);
  const plaque = new THREE.Mesh(
    new THREE.PlaneGeometry(2.85, 1.42),
    new THREE.MeshBasicMaterial({ map: signTex, transparent: true })
  );
  plaque.position.set(0, 1.45, 0.38);

  g.add(crystal, tail, halo, plaque);
  return g;
}

export interface VaultLockRig {
  group: THREE.Group;
  outerGear: THREE.Object3D;
  midGear: THREE.Object3D;
  innerDial: THREE.Object3D;
  leftLever: THREE.Object3D;
  rightLever: THREE.Object3D;
}

/** High-Detail Steampunk Golden Treasury Vault with 3 Counter-Rotating Gears & O/X Hydraulic Levers */
export function buildVaultLock(): VaultLockRig {
  const group = new THREE.Group();
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.32, metalness: 0.82 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.22, metalness: 0.9 });
  const creamMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.4, metalness: 0.2 });
  const gemMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.65,
    roughness: 0.1,
    metalness: 0.3,
  });

  // Heavy arched vault doorway pillars
  const frameBase = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.65, 2.2), steelMat);
  frameBase.position.y = 0.325;
  [-3.2, 3.2].forEach((px) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 5.4, 12), brassMat);
    col.position.set(px, 2.9, -0.35);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.48, 12, 10), steelMat);
    cap.position.set(px, 5.7, -0.35);
    group.add(col, cap);
  });

  const outerFrame = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.36, 14, 36), steelMat);
  outerFrame.position.y = 2.8;
  const backPlate = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.25, 0.42, 28), creamMat);
  backPlate.rotation.x = Math.PI / 2;
  backPlate.position.set(0, 2.8, -0.2);

  // Outer brass gear ring
  const outerGear = new THREE.Group();
  outerGear.position.set(0, 2.8, 0.12);
  const gearBody = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.18, 10, 28), brassMat);
  outerGear.add(gearBody);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.34, 0.22), brassMat);
    tooth.position.set(Math.cos(a) * 1.84, Math.sin(a) * 1.84, 0);
    tooth.rotation.z = a;
    outerGear.add(tooth);
  }

  // Counter-rotating mid steel spokes
  const midGear = new THREE.Group();
  midGear.position.set(0, 2.8, 0.26);
  for (let i = 0; i < 6; i++) {
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.35, 8), steelMat);
    spoke.rotation.z = (i * Math.PI) / 3;
    midGear.add(spoke);
  }

  // Central sapphire gem dial
  const innerDial = new THREE.Mesh(new THREE.OctahedronGeometry(0.82, 0), gemMat);
  innerDial.position.set(0, 2.8, 0.36);

  // Left O (Emerald) & Right X (Crimson) industrial arcade levers
  const leftLever = new THREE.Group();
  leftLever.position.set(-2.95, 0.82, 0.85);
  const lSocket = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 0.4, 12), steelMat);
  const lStick = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.35, 10), steelMat);
  lStick.position.y = 0.72;
  const lKnob = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 14, 14),
    new THREE.MeshStandardMaterial({ color: 0x58cc02, emissive: 0x22c55e, emissiveIntensity: 0.35, roughness: 0.2 })
  );
  lKnob.position.y = 1.48;
  leftLever.add(lSocket, lStick, lKnob);

  const rightLever = new THREE.Group();
  rightLever.position.set(2.95, 0.82, 0.85);
  const rSocket = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 0.4, 12), steelMat);
  const rStick = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.35, 10), steelMat);
  rStick.position.y = 0.72;
  const rKnob = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 14, 14),
    new THREE.MeshStandardMaterial({ color: 0xff4b4b, emissive: 0xef4444, emissiveIntensity: 0.35, roughness: 0.2 })
  );
  rKnob.position.y = 1.48;
  rightLever.add(rSocket, rStick, rKnob);

  group.add(frameBase, outerFrame, backPlate, outerGear, midGear, innerDial, leftLever, rightLever);
  return { group, outerGear, midGear, innerDial, leftLever, rightLever };
}

/** Sunlit volumetric cloud cluster */
export function buildSkyCloud(): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92, metalness: 0.0 });
  const puffs: [number, number, number, number][] = [
    [0, 0.12, 0, 1.25],
    [-1.1, -0.08, 0.1, 0.92],
    [1.15, -0.05, -0.1, 0.95],
    [0.45, 0.48, 0.15, 0.82],
    [-0.45, 0.38, -0.15, 0.78],
  ];
  for (const [x, y, z, r] of puffs) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), mat);
    m.position.set(x, y, z);
    g.add(m);
  }
  return g;
}

/** Zero-GC InstancedMesh particle burst pool */
const MAX_PARTICLES = 180;
const _dummy = new THREE.Object3D();
const _tempColor = new THREE.Color();

interface ParticleSlot {
  active: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  age: number;
  maxAge: number;
  scale: number;
}

export class ParticlePool {
  public readonly mesh: THREE.InstancedMesh;
  private slots: ParticleSlot[] = [];
  private cursor = 0;

  constructor() {
    const geo = new THREE.OctahedronGeometry(0.18, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.22,
      metalness: 0.45,
      emissive: 0x333333,
      emissiveIntensity: 0.35,
    });
    this.mesh = new THREE.InstancedMesh(geo, mat, MAX_PARTICLES);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;

    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.slots.push({
        active: false,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        age: 0,
        maxAge: 0.6,
        scale: 1,
      });
      _dummy.position.set(0, -100, 0);
      _dummy.scale.setScalar(0.0001);
      _dummy.updateMatrix();
      this.mesh.setMatrixAt(i, _dummy.matrix);
      this.mesh.setColorAt(i, _tempColor.setHex(0xffb800));
    }
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }

  public burst(origin: THREE.Vector3, colorHex: number, count = 18, speed = 8): void {
    _tempColor.setHex(colorHex);
    for (let i = 0; i < count; i++) {
      const slot = this.slots[this.cursor];
      this.cursor = (this.cursor + 1) % MAX_PARTICLES;
      slot.active = true;
      slot.pos.copy(origin);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.72;
      const spd = speed * (0.45 + Math.random() * 0.75);
      slot.vel.set(
        Math.sin(phi) * Math.cos(theta) * spd,
        Math.cos(phi) * spd + 2.8,
        Math.sin(phi) * Math.sin(theta) * spd
      );
      slot.age = 0;
      slot.maxAge = 0.45 + Math.random() * 0.38;
      slot.scale = 0.75 + Math.random() * 0.85;
      this.mesh.setColorAt(this.cursor, _tempColor);
    }
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }

  public update(dt: number): void {
    let anyChanged = false;
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const slot = this.slots[i];
      if (!slot.active) continue;
      anyChanged = true;
      slot.age += dt;
      if (slot.age >= slot.maxAge) {
        slot.active = false;
        _dummy.position.set(0, -100, 0);
        _dummy.scale.setScalar(0.0001);
        _dummy.updateMatrix();
        this.mesh.setMatrixAt(i, _dummy.matrix);
        continue;
      }
      slot.vel.y -= 17 * dt;
      slot.pos.addScaledVector(slot.vel, dt);
      const lifeRatio = 1 - slot.age / slot.maxAge;
      _dummy.position.copy(slot.pos);
      _dummy.rotation.set(slot.age * 7, slot.age * 5, 0);
      _dummy.scale.setScalar(Math.max(0.001, slot.scale * lifeRatio));
      _dummy.updateMatrix();
      this.mesh.setMatrixAt(i, _dummy.matrix);
    }
    if (anyChanged) {
      this.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  public dispose(): void {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}
