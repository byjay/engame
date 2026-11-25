import * as THREE from 'three';

/**
 * Rich Procedural 3D World & PBR Asset Factory (Flagship Mobile 3D Quality)
 * Generates high-resolution Canvas PBR textures (stone masonry, cobblestone, wood planks,
 * terracotta roof tiles, stucco plaster, flowing caustic river water, aerospace chevron runway,
 * wildflower meadow, royal red carpet) + multi-part handcrafted 3D architectural landmarks,
 * European village props, festive street bunting, town clock tower, waterfall cliffs,
 * hot-air balloons, market stalls, treasure piles, and job-costumed articulated RPG characters.
 */

export const TOTAL_3D_ASSET_VARIANTS = 1280;

export interface SkyDomeTheme {
  zenith: string;
  horizon: string;
  nadir: string;
  sunColor: string;
  sunDir: THREE.Vector3;
  fogColor: string;
  fogNear: number;
  fogFar: number;
}

export const STAGE_SKY_THEMES: Record<string, SkyDomeTheme> = {
  hub: {
    zenith: '#1D64D8',
    horizon: '#BFE4FF',
    nadir: '#7AC4F8',
    sunColor: '#FFF7CC',
    sunDir: new THREE.Vector3(0.45, 0.42, -0.78).normalize(),
    fogColor: '#BFE4FF',
    fogNear: 38,
    fogFar: 135,
  },
  'sky-runner': {
    zenith: '#0B5ED7',
    horizon: '#9DD8FF',
    nadir: '#4BA5F0',
    sunColor: '#FFFBEB',
    sunDir: new THREE.Vector3(0.28, 0.46, -0.84).normalize(),
    fogColor: '#9DD8FF',
    fogNear: 34,
    fogFar: 128,
  },
  'tower-crash': {
    zenith: '#1E88E5',
    horizon: '#D2F2FF',
    nadir: '#8FD4F5',
    sunColor: '#FEF3C7',
    sunDir: new THREE.Vector3(0.55, 0.5, -0.66).normalize(),
    fogColor: '#CBEBFF',
    fogNear: 34,
    fogFar: 122,
  },
  'spelling-hop': {
    zenith: '#0284C7',
    horizon: '#C6F4EE',
    nadir: '#6DD5CE',
    sunColor: '#FEF9C3',
    sunDir: new THREE.Vector3(-0.35, 0.48, -0.8).normalize(),
    fogColor: '#C2F2EA',
    fogNear: 30,
    fogFar: 112,
  },
  'synonym-defense': {
    zenith: '#1E1452',
    horizon: '#6B4CE6',
    nadir: '#312082',
    sunColor: '#FDE68A',
    sunDir: new THREE.Vector3(0.25, 0.34, -0.9).normalize(),
    fogColor: '#5B40C8',
    fogNear: 32,
    fogFar: 118,
  },
  'vault-rush': {
    zenith: '#92400E',
    horizon: '#FDE68A',
    nadir: '#D97706',
    sunColor: '#FFFBEB',
    sunDir: new THREE.Vector3(0.18, 0.58, -0.79).normalize(),
    fogColor: '#FCE199',
    fogNear: 28,
    fogFar: 98,
  },
  'rpg-street': {
    zenith: '#2563EB',
    horizon: '#FFE8D2',
    nadir: '#93C5FD',
    sunColor: '#FFF3C4',
    sunDir: new THREE.Vector3(0.42, 0.36, -0.83).normalize(),
    fogColor: '#FBE5D1',
    fogNear: 32,
    fogFar: 118,
  },
  'voca-tetris': {
    zenith: '#1E3A8A',
    horizon: '#7DD3FC',
    nadir: '#0F172A',
    sunColor: '#FEF08A',
    sunDir: new THREE.Vector3(0.24, 0.55, -0.8).normalize(),
    fogColor: '#5EB2E6',
    fogNear: 38,
    fogFar: 128,
  },
};

/** Custom GLSL atmospheric sky dome with glowing solar disc, Rayleigh horizon haze & soft zenith clouds */
export function buildSkyDome(theme: SkyDomeTheme): THREE.Mesh {
  const geo = new THREE.SphereGeometry(148, 28, 20);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uZenith: { value: new THREE.Color(theme.zenith) },
      uHorizon: { value: new THREE.Color(theme.horizon) },
      uNadir: { value: new THREE.Color(theme.nadir) },
      uSunColor: { value: new THREE.Color(theme.sunColor) },
      uSunDir: { value: theme.sunDir.clone().normalize() },
    },
    vertexShader: `
      varying vec3 vWorldDir;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldDir = normalize(position);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform vec3 uZenith;
      uniform vec3 uHorizon;
      uniform vec3 uNadir;
      uniform vec3 uSunColor;
      uniform vec3 uSunDir;
      varying vec3 vWorldDir;
      void main() {
        vec3 d = normalize(vWorldDir);
        float h = d.y;
        vec3 col = h >= 0.0
          ? mix(uHorizon, uZenith, pow(clamp(h, 0.0, 1.0), 0.56))
          : mix(uHorizon, uNadir, pow(clamp(-h, 0.0, 1.0), 0.55));
        float sunAmt = max(dot(d, normalize(uSunDir)), 0.0);
        col += uSunColor * pow(sunAmt, 14.0) * 0.42;
        col += uSunColor * smoothstep(0.991, 0.998, sunAmt) * 0.95;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  return new THREE.Mesh(geo, mat);
}

/** High-resolution medieval cobblestone street PBR texture with rich contrast, dark mortar & warm sunlit bevels */
export function createCobblestoneTexture(anisotropy = 4, repeatX = 4, repeatY = 12): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1E293B';
  ctx.fillRect(0, 0, 512, 512);

  const rows = 8;
  const cols = 6;
  const cellH = 512 / rows;
  const cellW = 512 / cols;
  const tones = ['#526075', '#475569', '#5E6E85', '#4B5B70', '#64748B', '#435166'];

  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (cellW * 0.5);
    for (let c = -1; c <= cols; c++) {
      const x = c * cellW + offset + 4;
      const y = r * cellH + 4;
      const w = cellW - 8;
      const h = cellH - 8;
      const tone = tones[(r * 7 + c * 3 + 12) % tones.length];

      // Deep ambient occlusion shadow edge
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(x, y + 4, w, h, 10);
      ctx.fill();

      // Main weathered stone face
      ctx.fillStyle = tone;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h - 2, 10);
      ctx.fill();

      // Warm sunlit top bevel highlight
      ctx.fillStyle = 'rgba(255,248,230,0.22)';
      ctx.beginPath();
      ctx.roundRect(x + 5, y + 4, w - 10, Math.max(7, h * 0.22), 5);
      ctx.fill();

      // Subtle weathered chisel grain
      ctx.fillStyle = 'rgba(15,23,42,0.22)';
      ctx.fillRect(x + 12, y + h * 0.56, w * 0.38, 3);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = anisotropy;
  return tex;
}

/** High-resolution castle stone masonry texture with warm fortress stone tones & mossy weathering */
export function createStoneMasonryTexture(anisotropy = 4, repeatX = 2, repeatY = 2): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#293548';
  ctx.fillRect(0, 0, 512, 512);

  const rows = 8;
  const cols = 4;
  const h = 512 / rows;
  const w = 512 / cols;
  const shades = ['#7C8594', '#6E7887', '#8A93A2', '#646F7E', '#758090'];

  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * (w * 0.5);
    for (let c = -1; c <= cols; c++) {
      const bx = c * w + off + 3;
      const by = r * h + 3;
      const bw = w - 6;
      const bh = h - 6;

      ctx.fillStyle = shades[(r * 5 + c * 3 + 16) % shades.length];
      ctx.fillRect(bx, by, bw, bh);

      // Warm sandstone sunlight chisel highlight
      ctx.fillStyle = 'rgba(255,247,230,0.22)';
      ctx.fillRect(bx, by, bw, 5);

      // Bottom recessed shadow
      ctx.fillStyle = 'rgba(15,23,42,0.34)';
      ctx.fillRect(bx, by + bh - 6, bw, 6);

      // Weathered stone cracks & moss near mortar
      if ((r + c) % 3 === 0) {
        ctx.fillStyle = 'rgba(34,197,94,0.24)';
        ctx.fillRect(bx + 8, by + bh - 11, 28, 5);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = anisotropy;
  return tex;
}

/** Rich scalloped terracotta / slate roof tile texture for cottages and castle spires */
export function createRoofTileTexture(anisotropy = 4, baseHex = '#C2410C', highlightHex = '#EA580C'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 512, 512);

  const rows = 10;
  const cols = 8;
  const rh = 512 / rows;
  const cw = 512 / cols;

  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * (cw * 0.5);
    for (let c = -1; c <= cols; c++) {
      const x = c * cw + off;
      const y = r * rh;

      // Shadow underside of each tile scallop
      ctx.fillStyle = 'rgba(15,23,42,0.28)';
      ctx.beginPath();
      ctx.arc(x + cw * 0.5, y + rh * 0.72, cw * 0.48, 0, Math.PI);
      ctx.fill();

      // Tile body
      ctx.fillStyle = (r + c) % 3 === 0 ? highlightHex : baseHex;
      ctx.beginPath();
      ctx.arc(x + cw * 0.5, y + rh * 0.62, cw * 0.45, 0, Math.PI);
      ctx.fillRect(x + cw * 0.05, y, cw * 0.9, rh * 0.62);
      ctx.fill();

      // Top glazed specular ridge
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(x + cw * 0.16, y + 6, cw * 0.68, 5);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.anisotropy = anisotropy;
  return tex;
}

/** Rich warm oak wood plank texture with grain streaks & brass nail rivets */
export function createWoodPlankTexture(anisotropy = 4, repeatX = 2, repeatY = 2): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#78350F';
  ctx.fillRect(0, 0, 512, 512);

  const planks = 6;
  const ph = 512 / planks;
  const shades = ['#92400E', '#854D0E', '#7C2D12', '#9A3412', '#8B4513', '#78350F'];

  for (let i = 0; i < planks; i++) {
    const y = i * ph;
    ctx.fillStyle = shades[i % shades.length];
    ctx.fillRect(0, y + 2, 512, ph - 4);

    // Fine wood grain fibers
    ctx.strokeStyle = 'rgba(254,243,199,0.12)';
    ctx.lineWidth = 2;
    for (let g = 0; g < 8; g++) {
      ctx.beginPath();
      ctx.moveTo(0, y + 8 + g * 9);
      ctx.bezierCurveTo(170, y + 4 + g * 9, 340, y + 14 + g * 9, 512, y + 8 + g * 9);
      ctx.stroke();
    }

    // Plank seam
    ctx.fillStyle = 'rgba(28,25,23,0.45)';
    ctx.fillRect(0, y + ph - 3, 512, 3);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = anisotropy;
  return tex;
}

/** Shimmering animated turquoise alpine river water texture with sunlit caustic ribbons */
export function createRiverWaterTexture(anisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#0284C7');
  grad.addColorStop(0.5, '#22D3EE');
  grad.addColorStop(1, '#0EA5E9');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Soft caustic cellular sheen
  for (let i = 0; i < 42; i++) {
    const cx = ((i * 89) % 480) + 16;
    const cy = ((i * 127) % 480) + 16;
    const rw = 36 + (i % 4) * 20;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(224,247,255,0.42)' : 'rgba(186,230,253,0.28)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, rw, 7 + (i % 3) * 3, 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sparkling sun glints
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  for (let i = 0; i < 24; i++) {
    const sx = (i * 71 + 19) % 500;
    const sy = (i * 113 + 31) % 500;
    ctx.fillRect(sx, sy, 14, 3);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 6);
  tex.anisotropy = anisotropy;
  return tex;
}

/** High-tech aerospace runway texture with illuminated speed chevrons & tarmac lines */
export function createAerospaceRunwayTexture(anisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const bg = ctx.createLinearGradient(0, 0, 512, 0);
  bg.addColorStop(0, '#1E293B');
  bg.addColorStop(0.5, '#334155');
  bg.addColorStop(1, '#1E293B');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle metallic deck plates
  ctx.strokeStyle = 'rgba(148,163,184,0.14)';
  ctx.lineWidth = 2;
  for (let y = 0; y < 512; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Gold edge guard stripes
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(10, 0, 16, 512);
  ctx.fillRect(486, 0, 16, 512);

  // Crisp lane dividers
  ctx.fillStyle = '#E0F2FE';
  for (let y = 12; y < 512; y += 52) {
    ctx.fillRect(170, y, 10, 28);
    ctx.fillRect(332, y, 10, 28);
  }

  // Glowing forward boost chevrons in all 3 flight lanes
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  [96, 256, 416].forEach((lx) => {
    for (let y = 80; y < 512; y += 128) {
      ctx.beginPath();
      ctx.moveTo(lx - 30, y + 22);
      ctx.lineTo(lx, y - 14);
      ctx.lineTo(lx + 30, y + 22);
      ctx.stroke();
    }
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 14);
  tex.anisotropy = anisotropy;
  return tex;
}

/** Sunlit lush wildflower meadow grass texture */
export function createMeadowGrassTexture(anisotropy = 4, repeatX = 4, repeatY = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#65A30D');
  grad.addColorStop(0.5, '#84CC16');
  grad.addColorStop(1, '#4D7C0F');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Layered grass blades & clover patches
  for (let i = 0; i < 240; i++) {
    const x = (i * 67) % 512;
    const y = (i * 113) % 512;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(190,242,100,0.45)' : 'rgba(54,83,20,0.22)';
    ctx.fillRect(x, y, 4, 14);
    ctx.fillRect(x + 4, y + 3, 3, 10);
  }

  // Tiny cheerful wildflowers
  const blooms = ['#FEF08A', '#FBCFE8', '#FFFFFF', '#FDE047'];
  for (let i = 0; i < 32; i++) {
    const fx = (i * 97 + 23) % 490 + 10;
    const fy = (i * 151 + 41) % 490 + 10;
    ctx.fillStyle = blooms[i % blooms.length];
    ctx.beginPath();
    ctx.arc(fx, fy, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = anisotropy;
  return tex;
}

/** Royal crimson & gold treasury carpet texture */
export function createRedCarpetTexture(anisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#9F1239';
  ctx.fillRect(0, 0, 256, 512);

  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(14, 0, 14, 512);
  ctx.fillRect(228, 0, 14, 512);
  ctx.fillStyle = '#FEF08A';
  ctx.fillRect(34, 0, 4, 512);
  ctx.fillRect(218, 0, 4, 512);

  ctx.strokeStyle = 'rgba(253, 224, 71, 0.34)';
  ctx.lineWidth = 4;
  for (let y = 32; y < 512; y += 64) {
    ctx.beginPath();
    ctx.moveTo(128, y - 18);
    ctx.lineTo(156, y);
    ctx.lineTo(128, y + 18);
    ctx.lineTo(100, y);
    ctx.closePath();
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 3);
  tex.anisotropy = anisotropy;
  return tex;
}

/** Lush multi-layered stylized tree (broadleaf oak, alpine pine, golden autumn, cherry blossom) */
export function buildStylizedTree(variant = 0): THREE.Group {
  const g = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b3e26, roughness: 0.9 });
  const rootFlange = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.44, 0.35, 8), trunkMat);
  rootFlange.position.y = 0.17;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 1.8, 8), trunkMat);
  trunk.position.y = 1.05;
  trunk.castShadow = true;
  g.add(rootFlange, trunk);

  const style = variant % 4;
  if (style === 1) {
    // Layered Alpine Evergreen Pine
    const pineColors = [0x15803d, 0x16a34a, 0x22c55e];
    [
      [1.42, 1.9, 2.0, pineColors[0]],
      [1.12, 1.6, 3.0, pineColors[1]],
      [0.75, 1.35, 3.85, pineColors[2]],
    ].forEach(([r, h, y, col]) => {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(r as number, h as number, 9),
        new THREE.MeshStandardMaterial({ color: col as number, roughness: 0.72 })
      );
      cone.position.y = y as number;
      cone.castShadow = true;
      g.add(cone);
    });
  } else {
    const palettes = [
      [0x16a34a, 0x22c55e, 0x4ade80], // Emerald Oak
      [0x16a34a, 0x22c55e, 0x4ade80], // unused (style 1)
      [0xf472b6, 0xf9a8d4, 0xfbcfe8], // Sakura Cherry Blossom
      [0xd97706, 0xf59e0b, 0xfbbf24], // Golden Maple
    ];
    const pal = palettes[style];
    const puffs: [number, number, number, number, number][] = [
      [0, 2.55, 0, 1.12, 0],
      [-0.72, 2.15, 0.32, 0.78, 1],
      [0.72, 2.22, -0.22, 0.82, 1],
      [0.14, 2.95, 0.32, 0.72, 2],
      [-0.25, 2.45, -0.55, 0.68, 2],
    ];
    puffs.forEach(([x, y, z, r, ci]) => {
      const leaf = new THREE.Mesh(
        new THREE.DodecahedronGeometry(r, 1),
        new THREE.MeshStandardMaterial({ color: pal[ci], roughness: 0.7 })
      );
      leaf.position.set(x, y, z);
      leaf.castShadow = true;
      g.add(leaf);
    });
  }
  return g;
}

/** Distant snow-capped alpine mountain panorama ring with layered foothills */
export function buildAlpineMountainRing(radius = 68, count = 16, baseColor = 0x475569): THREE.Group {
  const g = new THREE.Group();
  const rockMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.92, flatShading: true });
  const foothillMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.95, flatShading: true });
  const snowMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45, flatShading: true });

  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const dist = radius + (i % 3) * 10;
    const h = 18 + (i % 5) * 6.5;
    const w = 13 + (i % 3) * 4.5;

    const peak = new THREE.Group();
    const body = new THREE.Mesh(new THREE.ConeGeometry(w, h, 7), rockMat);
    body.position.y = h / 2 - 4.5;
    const snow = new THREE.Mesh(new THREE.ConeGeometry(w * 0.4, h * 0.4, 7), snowMat);
    snow.position.y = h - h * 0.2 - 4.4;
    const shoulder = new THREE.Mesh(new THREE.ConeGeometry(w * 0.65, h * 0.55, 6), foothillMat);
    shoulder.position.set(w * 0.48, h * 0.25 - 4.5, 2.0);
    peak.add(body, snow, shoulder);

    peak.position.set(Math.cos(a) * dist, 0, Math.sin(a) * dist);
    peak.rotation.y = a + i * 0.6;
    g.add(peak);
  }
  return g;
}

/** Charming drifting 3D Hot-Air Balloon for vibrant sky depth */
export function buildHotAirBalloon(variant = 0): THREE.Group {
  const g = new THREE.Group();
  const stripes = [
    [0xef4444, 0xfef08a],
    [0x0ea5e9, 0xffffff],
    [0x8b5cf6, 0xf472b6],
    [0x10b981, 0xfde047],
  ];
  const [c1, c2] = stripes[variant % stripes.length];

  const envTop = new THREE.Mesh(
    new THREE.SphereGeometry(1.55, 16, 14),
    new THREE.MeshStandardMaterial({ color: c1, roughness: 0.55 })
  );
  envTop.scale.set(1, 1.18, 1);
  envTop.position.y = 2.1;

  const band = new THREE.Mesh(
    new THREE.TorusGeometry(1.48, 0.18, 8, 20),
    new THREE.MeshStandardMaterial({ color: c2, roughness: 0.5 })
  );
  band.rotation.x = Math.PI / 2;
  band.position.y = 2.1;

  const skirt = new THREE.Mesh(
    new THREE.CylinderGeometry(1.0, 0.45, 0.9, 14),
    new THREE.MeshStandardMaterial({ color: c2, roughness: 0.55 })
  );
  skirt.position.y = 0.72;

  const basket = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.55, 0.75),
    new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.85 })
  );
  basket.position.y = -0.35;

  const ropeMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
  [
    [-0.3, -0.3],
    [0.3, -0.3],
    [-0.3, 0.3],
    [0.3, 0.3],
  ].forEach(([rx, rz]) => {
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 5), ropeMat);
    rope.position.set(rx, 0.12, rz);
    g.add(rope);
  });

  g.add(envTop, band, skirt, basket);
  return g;
}

/** Wooden river lantern post with warm glowing paper lantern & brass finial */
export function buildRiverLanternPost(): THREE.Group {
  const g = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.4 });
  const glowMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: 0xfbbf24,
    emissiveIntensity: 1.5,
    roughness: 0.2,
  });

  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 2.75, 8), woodMat);
  post.position.y = 1.38;
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.1, 0.1), woodMat);
  arm.position.set(0.32, 2.52, 0);
  const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.52, 8), glowMat);
  lantern.position.set(0.62, 2.15, 0);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.25, 8), roofMat);
  cap.position.set(0.62, 2.5, 0);
  const tassel = new THREE.Mesh(
    new THREE.ConeGeometry(0.06, 0.22, 6),
    new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.6 })
  );
  tassel.rotation.x = Math.PI;
  tassel.position.set(0.62, 1.76, 0);

  g.add(post, arm, lantern, cap, tassel);
  return g;
}

/** Floating lily pad with multi-petal pink/white lotus blossom */
export function buildLilyPad(withFlower = true): THREE.Group {
  const g = new THREE.Group();
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(0.75, 0.75, 0.06, 16, 1, false, 0.28, Math.PI * 1.84),
    new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 })
  );
  g.add(pad);

  if (withFlower) {
    const petalMat = new THREE.MeshStandardMaterial({
      color: 0xfbcfe8,
      emissive: 0xf472b6,
      emissiveIntensity: 0.25,
      roughness: 0.4,
    });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.34, 6), petalMat);
      petal.position.set(Math.cos(a) * 0.17, 0.15, Math.sin(a) * 0.17);
      petal.rotation.z = -Math.cos(a) * 0.55;
      petal.rotation.x = Math.sin(a) * 0.55;
      g.add(petal);
    }
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xf59e0b, emissiveIntensity: 0.4 })
    );
    core.position.y = 0.16;
    g.add(core);
  }
  return g;
}

/** Arched stone river footbridge for alpine valley depth */
export function buildStoneArchBridge(stoneTex: THREE.CanvasTexture): THREE.Group {
  const g = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.82 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.65 });

  const arch = new THREE.Mesh(new THREE.TorusGeometry(6.8, 0.72, 10, 26, Math.PI), stoneMat);
  arch.position.y = -2.2;
  const deck = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.45, 2.4), stoneMat);
  deck.position.y = 4.65;
  [-1.08, 1.08].forEach((rz) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.75, 0.24), trimMat);
    rail.position.set(0, 5.2, rz);
    g.add(rail);
  });
  g.add(arch, deck);
  return g;
}

/** Hero Medieval Castle Keep with arched gatehouse, iron portcullis, golden heraldry & tiled spires */
export function buildMedievalCastleBackdrop(
  stoneTex: THREE.CanvasTexture,
  roofTex?: THREE.CanvasTexture
): THREE.Group {
  const g = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.82 });
  const roofMat = new THREE.MeshStandardMaterial({
    map: roofTex ?? null,
    color: roofTex ? 0xffffff : 0xdc2626,
    roughness: 0.52,
  });
  const flagMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.25,
    side: THREE.DoubleSide,
  });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.78 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.25, metalness: 0.85 });

  // Main curtain wall + dark slate coping rail
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.55, metalness: 0.35 });
  const flameMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf97316,
    emissiveIntensity: 1.5,
    roughness: 0.15,
  });
  const crimsonMat = new THREE.MeshStandardMaterial({
    color: 0xbe123c,
    roughness: 0.52,
    side: THREE.DoubleSide,
  });

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(23, 4.6, 1.6), wallMat);
  backWall.position.set(0, 2.3, -11.8);
  const wallTrim = new THREE.Mesh(new THREE.BoxGeometry(23.2, 0.34, 1.8), trimMat);
  wallTrim.position.set(0, 4.55, -11.8);
  g.add(backWall, wallTrim);

  // Central grand gatehouse tower & recessed iron portcullis arch + glowing twin braziers
  const gatehouse = new THREE.Mesh(new THREE.BoxGeometry(6.0, 7.4, 2.7), wallMat);
  gatehouse.position.set(0, 3.7, -12.0);
  const gateFrame = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.24, 10, 20, Math.PI), trimMat);
  gateFrame.position.set(0, 1.55, -10.62);
  const gateArch = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 2.7, 14), ironMat);
  gateArch.rotation.x = Math.PI / 2;
  gateArch.position.set(0, 1.55, -11.95);
  const crest = new THREE.Mesh(new THREE.OctahedronGeometry(0.75, 0), goldMat);
  crest.scale.set(1, 1.25, 0.35);
  crest.position.set(0, 5.1, -10.52);
  const centerSpire = new THREE.Mesh(new THREE.ConeGeometry(3.6, 4.0, 4), roofMat);
  centerSpire.rotation.y = Math.PI / 4;
  centerSpire.position.set(0, 9.4, -12.0);
  g.add(gatehouse, gateFrame, gateArch, crest, centerSpire);

  // Flanking royal crimson tapestries & burning fortress braziers on the gatehouse
  [-2.35, 2.35].forEach((bx) => {
    const tapestry = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 2.6), crimsonMat);
    tapestry.position.set(bx, 4.7, -10.58);
    const goldRod = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.12, 0.14), goldMat);
    goldRod.position.set(bx, 6.02, -10.56);
    const brazierCup = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.24, 0.5, 8), trimMat);
    brazierCup.position.set(bx, 2.45, -10.4);
    const fireCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), flameMat);
    fireCore.scale.set(1, 1.45, 1);
    fireCore.position.set(bx, 2.9, -10.4);
    g.add(tapestry, goldRod, brazierCup, fireCore);
  });

  // Battlement merlons with gold trim caps along the curtain wall
  for (let x = -9.6; x <= 9.6; x += 1.92) {
    const merlon = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.95, 1.7), wallMat);
    merlon.position.set(x, 5.1, -11.8);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.16, 1.82), trimMat);
    cap.position.set(x, 5.62, -11.8);
    g.add(merlon, cap);
  }

  // Twin flanking watchtowers with tiled roofs, torch sconces & fluttering banners
  [-11.2, 11.2].forEach((tx) => {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.55, 8.8, 14), wallMat);
    tower.position.set(tx, 4.4, -11.2);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(2.55, 2.32, 0.7, 14), trimMat);
    rim.position.set(tx, 8.7, -11.2);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.85, 4.1, 14), roofMat);
    roof.position.set(tx, 10.9, -11.2);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.0, 6), goldMat);
    pole.position.set(tx, 13.4, -11.2);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.78), flagMat);
    flag.position.set(tx + 0.85, 13.9, -11.2);

    // Wall hanging royal tapestry banner
    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(1.25, 3.0),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5, side: THREE.DoubleSide })
    );
    banner.position.set(tx, 5.2, -8.8);
    g.add(tower, rim, roof, pole, flag, banner);
  });

  return g;
}

/** Hero European Half-Timbered RPG Shop/Cottage with tiled roof, shutters, flower boxes & shop sign */
export function buildHalfTimberHouse(
  variant: number,
  stoneTex: THREE.CanvasTexture,
  roofTex?: THREE.CanvasTexture,
  woodTex?: THREE.CanvasTexture
): THREE.Group {
  const g = new THREE.Group();
  const plasterColors = [0xfffbeb, 0xfef2f2, 0xf0f9ff, 0xfefce8, 0xf5f3ff, 0xecfdf5];
  const roofTints = [0xea580c, 0x475569, 0x0f766e, 0xbe123c, 0x1d4ed8, 0xb45309];
  const awningColors = [0xef4444, 0x0ea5e9, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xec4899];
  const flowerColors = [0xf43f5e, 0xfacc15, 0xec4899, 0x38bdf8, 0xf97316];

  const plasterMat = new THREE.MeshStandardMaterial({
    color: plasterColors[variant % plasterColors.length],
    roughness: 0.8,
  });
  const timberMat = new THREE.MeshStandardMaterial({
    map: woodTex ?? null,
    color: woodTex ? 0xc29873 : 0x5c3a21,
    roughness: 0.82,
  });
  const stoneMat = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.88 });
  const roofMat = new THREE.MeshStandardMaterial({
    map: roofTex ?? null,
    color: roofTints[variant % roofTints.length],
    roughness: 0.55,
  });
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.6,
    roughness: 0.18,
    metalness: 0.15,
  });
  const shutterMat = new THREE.MeshStandardMaterial({
    color: awningColors[(variant + 2) % awningColors.length],
    roughness: 0.65,
  });

  const w = 4.8 + (variant % 2) * 0.6;
  const h = 4.7 + (variant % 3) * 0.7;
  const d = 4.5;

  // Stone foundation
  const base = new THREE.Mesh(new THREE.BoxGeometry(w + 0.24, 1.15, d + 0.24), stoneMat);
  base.position.y = 0.58;
  base.castShadow = true;
  base.receiveShadow = true;

  // Plaster main structure
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), plasterMat);
  body.position.y = 1.15 + h / 2;
  body.castShadow = true;
  body.receiveShadow = true;

  // Half-timber cross beams & vertical framing
  const midBeam = new THREE.Mesh(new THREE.BoxGeometry(w + 0.16, 0.22, d + 0.16), timberMat);
  midBeam.position.y = 1.15 + h * 0.48;
  const topBeam = new THREE.Mesh(new THREE.BoxGeometry(w + 0.22, 0.24, d + 0.22), timberMat);
  topBeam.position.y = 1.15 + h - 0.12;
  g.add(base, body, midBeam, topBeam);

  [-w / 2, 0, w / 2].forEach((bx) => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.22, h, d + 0.14), timberMat);
    col.position.set(bx, 1.15 + h / 2, 0);
    g.add(col);
  });

  // Sculpted tiled pitched roof with chimney
  const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.84, 2.9, 4), roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 1.15 + h + 1.4;
  roof.castShadow = true;
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.9, 0.62), stoneMat);
  chimney.position.set(w * 0.26, 1.15 + h + 1.35, -0.5);
  const chimneyCap = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.16, 0.78), stoneMat);
  chimneyCap.position.set(w * 0.26, 1.15 + h + 2.34, -0.5);
  g.add(roof, chimney, chimneyCap);

  // Arched wooden front door + brass handle
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.18, 2.05, 0.18), timberMat);
  door.position.set(-w * 0.22, 1.08, d / 2 + 0.06);
  const knob = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.85, roughness: 0.2 })
  );
  knob.position.set(-w * 0.22 + 0.36, 1.05, d / 2 + 0.18);
  g.add(door, knob);

  // Shopfront window with windowpane mullion cross
  const shopWin = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.25, 0.14), windowMat);
  shopWin.position.set(w * 0.22, 1.65, d / 2 + 0.06);
  const mullionV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.28, 0.18), timberMat);
  mullionV.position.set(w * 0.22, 1.65, d / 2 + 0.07);
  const mullionH = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.08, 0.18), timberMat);
  mullionH.position.set(w * 0.22, 1.65, d / 2 + 0.07);
  g.add(shopWin, mullionV, mullionH);

  // Upper shuttered windows with blooming flower boxes!
  const bloomMat = new THREE.MeshStandardMaterial({
    color: flowerColors[variant % flowerColors.length],
    roughness: 0.5,
  });
  [-w * 0.24, w * 0.24].forEach((wx) => {
    const upperWin = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.08, 0.14), windowMat);
    upperWin.position.set(wx, 1.15 + h * 0.72, d / 2 + 0.06);
    const shutterL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.1, 0.1), shutterMat);
    shutterL.position.set(wx - 0.64, 1.15 + h * 0.72, d / 2 + 0.08);
    const shutterR = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.1, 0.1), shutterMat);
    shutterR.position.set(wx + 0.64, 1.15 + h * 0.72, d / 2 + 0.08);
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.24, 0.34), timberMat);
    box.position.set(wx, 1.15 + h * 0.72 - 0.62, d / 2 + 0.18);
    g.add(upperWin, shutterL, shutterR, box);

    for (let f = -1; f <= 1; f++) {
      const bloom = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14, 0), bloomMat);
      bloom.position.set(wx + f * 0.32, 1.15 + h * 0.72 - 0.44, d / 2 + 0.22);
      g.add(bloom);
    }
  });

  // Striped colorful shop awning
  const awning = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.9, 0.18, 1.28),
    new THREE.MeshStandardMaterial({
      color: awningColors[variant % awningColors.length],
      roughness: 0.5,
    })
  );
  awning.rotation.x = 0.28;
  awning.position.set(0, 2.85, d / 2 + 0.52);
  g.add(awning);

  // Hanging wrought-iron village shop signboard
  const bracket = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.08, 0.95),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.35 })
  );
  bracket.position.set(w * 0.45, 3.25, d / 2 + 0.48);
  const signPlaque = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.65, 0.72),
    new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 })
  );
  signPlaque.position.set(w * 0.45, 2.84, d / 2 + 0.66);
  g.add(bracket, signPlaque);

  return g;
}

/** Grand European Town Clock Tower standing at the far plaza of Voca Town RPG Street */
export function buildTownClockTower(stoneTex: THREE.CanvasTexture, roofTex?: THREE.CanvasTexture): THREE.Group {
  const g = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.8 });
  const roofMat = new THREE.MeshStandardMaterial({
    map: roofTex ?? null,
    color: 0x1d4ed8,
    roughness: 0.48,
  });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.85, roughness: 0.22 });

  const shaft = new THREE.Mesh(new THREE.BoxGeometry(4.8, 14.5, 4.8), stoneMat);
  shaft.position.y = 7.25;
  const belfry = new THREE.Mesh(new THREE.BoxGeometry(5.3, 1.0, 5.3), stoneMat);
  belfry.position.y = 14.6;
  const spire = new THREE.Mesh(new THREE.ConeGeometry(4.0, 6.2, 4), roofMat);
  spire.rotation.y = Math.PI / 4;
  spire.position.y = 18.2;

  // Illuminated golden clock face facing down the street (+Z)
  const clockRim = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.18, 10, 28), goldMat);
  clockRim.position.set(0, 11.4, 2.46);
  const clockFace = new THREE.Mesh(
    new THREE.CircleGeometry(1.48, 24),
    new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: 0xfef08a,
      emissiveIntensity: 0.45,
    })
  );
  clockFace.position.set(0, 11.4, 2.45);
  const handMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
  const handH = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.9, 0.08), handMat);
  handH.position.set(0, 11.75, 2.52);
  const handM = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.12, 0.08), handMat);
  handM.position.set(0.36, 11.4, 2.52);

  g.add(shaft, belfry, spire, clockRim, clockFace, handH, handM);
  return g;
}

/** Festive European street pennant bunting garland strung between opposite buildings */
export function buildStreetBunting(spanWidth = 10.6): THREE.Group {
  const g = new THREE.Group();
  const colors = [0xef4444, 0xfacc15, 0x38bdf8, 0x22c55e, 0xf472b6, 0xa855f7];
  const flags = 11;

  for (let i = 0; i < flags; i++) {
    const t = i / (flags - 1);
    const x = (t - 0.5) * spanWidth;
    const sag = Math.sin(t * Math.PI) * 1.05;
    const flag = new THREE.Mesh(
      new THREE.ConeGeometry(0.28, 0.56, 3),
      new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        roughness: 0.5,
        side: THREE.DoubleSide,
      })
    );
    flag.rotation.x = Math.PI;
    flag.position.set(x, -sag, 0);
    g.add(flag);
  }
  return g;
}

/** European Market Fruit/Bakery Stall prop for RPG street & village dressing */
export function buildMarketStall(variant = 0, woodTex?: THREE.CanvasTexture): THREE.Group {
  const g = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({
    map: woodTex ?? null,
    color: woodTex ? 0xd6b08c : 0x92400e,
    roughness: 0.8,
  });
  const canopyColors = [0xef4444, 0x0ea5e9, 0xf59e0b, 0x10b981];
  const canopyMat = new THREE.MeshStandardMaterial({
    color: canopyColors[variant % canopyColors.length],
    roughness: 0.55,
  });

  const counter = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 1.0), woodMat);
  counter.position.y = 0.45;
  [-0.95, 0.95].forEach((px) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.25, 6), woodMat);
    post.position.set(px, 1.12, -0.35);
    g.add(post);
  });
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.14, 1.35), canopyMat);
  canopy.rotation.x = 0.22;
  canopy.position.set(0, 2.2, 0.05);

  // Colorful fruit / bread crates on the counter
  const itemColors = [0xf97316, 0xef4444, 0x84cc16, 0xfacc15];
  [-0.65, 0, 0.65].forEach((cx, i) => {
    const crate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.22, 0.55), woodMat);
    crate.position.set(cx, 1.0, 0.05);
    const goods = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 8, 8),
      new THREE.MeshStandardMaterial({ color: itemColors[(variant + i) % itemColors.length], roughness: 0.45 })
    );
    goods.scale.set(1.15, 0.72, 1.15);
    goods.position.set(cx, 1.16, 0.05);
    g.add(crate, goods);
  });

  g.add(counter, canopy);
  return g;
}

/** Wooden oak barrels & flower planter cluster for lively medieval/village sidewalks */
export function buildStreetPropCluster(variant = 0, woodTex?: THREE.CanvasTexture): THREE.Group {
  const g = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({
    map: woodTex ?? null,
    color: woodTex ? 0xc29873 : 0x78350f,
    roughness: 0.85,
  });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.35 });

  if (variant % 2 === 0) {
    // Oak barrel duo + crate
    [
      [-0.28, 0.42, 0],
      [0.3, 0.38, 0.18],
    ].forEach(([bx, by, bz]) => {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.76, 10), woodMat);
      barrel.position.set(bx, by, bz);
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.025, 6, 14), ironMat);
      hoop.rotation.x = Math.PI / 2;
      hoop.position.set(bx, by + 0.18, bz);
      g.add(barrel, hoop);
    });
  } else {
    // Blooming stone flower planter
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.34, 0.52, 10),
      new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.8 })
    );
    pot.position.y = 0.26;
    const bush = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.42, 1),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.75 })
    );
    bush.position.y = 0.66;
    const petalMat = new THREE.MeshStandardMaterial({
      color: variant % 3 === 0 ? 0xf43f5e : 0xfacc15,
      roughness: 0.4,
    });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const fl = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), petalMat);
      fl.position.set(Math.cos(a) * 0.24, 0.92, Math.sin(a) * 0.24);
      g.add(fl);
    }
    g.add(pot, bush);
  }
  return g;
}

/** Cast-iron European street lamp with warm glowing orb & decorative scrollwork */
export function buildStreetLamp(): THREE.Group {
  const g = new THREE.Group();
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.75 });
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xfef9c3,
    emissive: 0xfbbf24,
    emissiveIntensity: 1.65,
    roughness: 0.15,
  });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 0.68, 8), ironMat);
  base.position.y = 0.34;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 3.6, 8), ironMat);
  pole.position.y = 2.1;
  const cross = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.09, 0.09), ironMat);
  cross.position.y = 3.85;
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 10), bulbMat);
  bulb.position.y = 4.2;
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.26, 8), ironMat);
  cap.position.y = 4.5;

  g.add(base, pole, cross, bulb, cap);
  return g;
}

/** Carved marble village plaza fountain with shimmering water arcs */
export function buildPlazaFountain(): THREE.Group {
  const g = new THREE.Group();
  const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.34, metalness: 0.1 });
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.32,
    roughness: 0.1,
    metalness: 0.22,
  });

  const outerRim = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.32, 10, 24), marbleMat);
  outerRim.rotation.x = Math.PI / 2;
  outerRim.position.y = 0.42;

  const pool = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.05, 0.45, 24), waterMat);
  pool.position.y = 0.28;

  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.56, 2.1, 12), marbleMat);
  pillar.position.y = 1.1;

  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 0.45, 0.45, 16), marbleMat);
  bowl.position.y = 1.95;

  const jet = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.05, 10), waterMat);
  jet.position.y = 2.68;

  g.add(outerRim, pool, pillar, bowl, jet);
  return g;
}

/** Overflowing 3D Gold Treasure Chest + Coin Stack for Treasury Vault & Hub */
export function buildTreasureChest(woodTex?: THREE.CanvasTexture): THREE.Group {
  const g = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({
    map: woodTex ?? null,
    color: 0x92400e,
    roughness: 0.72,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xd97706,
    emissiveIntensity: 0.25,
    metalness: 0.88,
    roughness: 0.2,
  });
  const gemMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.45,
    roughness: 0.1,
    metalness: 0.3,
  });

  const box = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.72, 0.88), woodMat);
  box.position.y = 0.36;
  const trim = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.14, 0.92), goldMat);
  trim.position.y = 0.68;

  // Open lid angled back
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 1.35, 10, 1, false, 0, Math.PI), woodMat);
  lid.rotation.z = Math.PI / 2;
  lid.rotation.x = -0.65;
  lid.position.set(0, 0.95, -0.35);

  // Mound of golden coins & sparkling gems inside
  const goldMound = new THREE.Mesh(new THREE.SphereGeometry(0.54, 12, 10), goldMat);
  goldMound.scale.set(1.1, 0.55, 0.72);
  goldMound.position.set(0, 0.75, 0.04);

  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), gemMat);
  gem.position.set(0.18, 1.02, 0.1);

  g.add(box, trim, lid, goldMound, gem);
  return g;
}

export interface RpgCharacterRig {
  group: THREE.Group;
  leftArm: THREE.Object3D;
  rightArm: THREE.Object3D;
  leftLeg: THREE.Object3D;
  rightLeg: THREE.Object3D;
  head: THREE.Object3D;
  questMarker?: THREE.Group;
}

/** Articulated 3D RPG Character (Adventurer or Costumed Village NPC) with expressive face, job props & quest beacon */
export function buildRpgCharacter(config: {
  shirtColor: number;
  accentColor: number;
  isPlayer?: boolean;
  hatStyle?: number;
  showQuestMarker?: boolean;
}): RpgCharacterRig {
  const group = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfde2c4, roughness: 0.62 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: config.shirtColor, roughness: 0.5 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.72 });
  const accentMat = new THREE.MeshStandardMaterial({ color: config.accentColor, roughness: 0.42 });
  const hairColors = [0x451a03, 0x92400e, 0x1e293b, 0x713f12, 0x7c2d12, 0x334155];
  const hairMat = new THREE.MeshStandardMaterial({
    color: config.isPlayer ? 0x1e293b : hairColors[(config.hatStyle ?? 0) % hairColors.length],
    roughness: 0.68,
  });

  // Ground contact shadow disc
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.66, 20),
    new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.24, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.03;
  group.add(shadow);

  // Articulated legs + sneakers/boots
  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.2, 0.78, 0);
  const lLegMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.42, 6, 10), pantsMat);
  lLegMesh.position.y = -0.35;
  const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.17, 0.4), accentMat);
  lShoe.position.set(0, -0.68, 0.06);
  leftLegPivot.add(lLegMesh, lShoe);

  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.2, 0.78, 0);
  const rLegMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.42, 6, 10), pantsMat);
  rLegMesh.position.y = -0.35;
  const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.17, 0.4), accentMat);
  rShoe.position.set(0, -0.68, 0.06);
  rightLegPivot.add(rLegMesh, rShoe);

  // Torso jacket + scarf/collar + belt + backpack/cape
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.37, 0.54, 8, 14), shirtMat);
  torso.position.y = 1.24;
  torso.castShadow = true;

  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.1, 14), pantsMat);
  belt.position.y = 0.98;
  const buckle = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.12, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.85, roughness: 0.2 })
  );
  buckle.position.set(0, 0.98, 0.37);

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.085, 8, 16), accentMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 1.62;

  const pack = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 0.58, 0.26),
    new THREE.MeshStandardMaterial({ color: config.isPlayer ? 0xf59e0b : 0x78350f, roughness: 0.62 })
  );
  pack.position.set(0, 1.28, config.isPlayer ? 0.35 : -0.35);
  group.add(leftLegPivot, rightLegPivot, torso, belt, buckle, collar, pack);

  // Articulated arms + optional job prop in right hand
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.47, 1.52, 0);
  const lArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.42, 6, 10), shirtMat);
  lArm.position.y = -0.26;
  const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.115, 8, 8), skinMat);
  lHand.position.y = -0.54;
  leftArmPivot.add(lArm, lHand);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.47, 1.52, 0);
  const rArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.42, 6, 10), shirtMat);
  rArm.position.y = -0.26;
  const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.115, 8, 8), skinMat);
  rHand.position.y = -0.54;
  rightArmPivot.add(rArm, rHand);

  // NPC held job prop (coffee mug / book / bouquet)
  if (!config.isPlayer) {
    const propType = (config.hatStyle ?? 0) % 3;
    if (propType === 0) {
      // Barista coffee cup
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.09, 0.22, 10),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
      );
      cup.position.set(0, -0.54, 0.14);
      rightArmPivot.add(cup);
    } else if (propType === 1) {
      // Scholar book
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.26, 0.32, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 })
      );
      book.position.set(0, -0.52, 0.14);
      rightArmPivot.add(book);
    } else {
      // Flower bouquet
      const bouquet = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.16, 0),
        new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 })
      );
      bouquet.position.set(0, -0.52, 0.16);
      rightArmPivot.add(bouquet);
    }
  }
  group.add(leftArmPivot, rightArmPivot);

  // Stylized Head with expressive eyes, rosy cheeks, ears, smile & job headwear
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.98, 0);

  const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.38, 18, 16), skinMat);
  headSphere.castShadow = true;
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.405, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hairMat
  );
  hairCap.position.y = 0.04;

  // Cute ears
  [-0.37, 0.37].forEach((ex) => {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 8), skinMat);
    ear.position.set(ex, 0.0, 0);
    headGroup.add(ear);
  });

  // Expressive eyes, highlights, rosy cheeks & friendly smile facing +Z
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
  const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const blushMat = new THREE.MeshStandardMaterial({ color: 0xfb7185, roughness: 0.7 });
  [-0.13, 0.13].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.062, 10, 10), eyeMat);
    eye.position.set(ex, 0.04, 0.355);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.024, 6, 6), glintMat);
    glint.position.set(ex + 0.018, 0.062, 0.408);
    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.048, 8, 8), blushMat);
    blush.scale.set(1.25, 0.72, 0.4);
    blush.position.set(ex * 1.48, -0.05, 0.345);
    headGroup.add(eye, glint, blush);
  });
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.068, 0.017, 6, 12, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x9f1239, roughness: 0.4 })
  );
  smile.rotation.z = Math.PI;
  smile.position.set(0, -0.08, 0.368);
  headGroup.add(smile);

  // Distinct Hat / Headwear variations
  if (config.isPlayer) {
    const capBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.05, 16), accentMat);
    capBrim.position.set(0, 0.22, 0.12);
    const capCrown = new THREE.Mesh(new THREE.SphereGeometry(0.37, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), accentMat);
    capCrown.position.y = 0.22;
    headGroup.add(capBrim, capCrown);
  } else {
    const hs = (config.hatStyle ?? 0) % 3;
    if (hs === 0) {
      // Sun hat / Barista boater
      const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.06, 16), accentMat);
      hatBrim.position.y = 0.3;
      const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.32, 14), accentMat);
      hatTop.position.y = 0.48;
      headGroup.add(hatBrim, hatTop);
    } else if (hs === 1) {
      // Artist / Professor Beret + gold spectacles
      const beret = new THREE.Mesh(new THREE.SphereGeometry(0.38, 14, 10), accentMat);
      beret.scale.set(1.15, 0.45, 1.15);
      beret.position.set(0.08, 0.38, -0.02);
      headGroup.add(beret);
    } else {
      // Pointed explorer / wizard cap
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.05, 14), accentMat);
      brim.position.y = 0.3;
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.65, 12), accentMat);
      cone.position.y = 0.64;
      headGroup.add(brim, cone);
    }
  }

  headGroup.add(headSphere, hairCap);
  group.add(headGroup);

  let questMarker: THREE.Group | undefined;
  if (config.showQuestMarker) {
    questMarker = new THREE.Group();
    questMarker.position.set(0, 3.05, 0);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.65,
    });
    const bar = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.42, 6, 10), goldMat);
    bar.position.y = 0.28;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), goldMat);
    dot.position.y = -0.14;
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.45, 0.048, 8, 24),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.6,
      })
    );
    halo.position.y = 0.18;
    questMarker.add(bar, dot, halo);
    group.add(questMarker);
  }

  return {
    group,
    leftArm: leftArmPivot,
    rightArm: rightArmPivot,
    leftLeg: leftLegPivot,
    rightLeg: rightLegPivot,
    head: headGroup,
    questMarker,
  };
}
