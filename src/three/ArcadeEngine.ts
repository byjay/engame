import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type {
  ArcadeOption,
  ArcadeQuestion,
  CsatWord,
  GameId,
  GamePhase,
  GameSettings,
  HudSnapshot,
  RunStats,
} from '../game/types';
import { generateGameQuestions, getGameMeta, getWordMemoryTip } from '../game/vocabulary';
import { buildRunSummary, evaluateAnswer, getSpeedMultiplier, MAX_HEARTS } from '../game/rules';
import {
  HumanRigGestureQueue,
  type GestureQueueItem,
  type HumanRigElementLike,
  type SpeechSegmentInput,
} from '../game/gestureSystem';
import {
  TETRIS_COLS,
  TETRIS_TARGET_LINES,
  TetrisGameState,
  type TetrisStepEvent,
} from '../game/tetrisEngine';
import { soundEngine } from '../audio/soundEngine';
import {
  buildArcadeTurret,
  buildCrystalMeteor,
  buildLibraryDome,
  buildSkyCloud,
  buildSkyGlider,
  buildSteppingIsland,
  buildVaultLock,
  buildWordGateArch,
  buildWordMonolith,
  ParticlePool,
  type LibraryDomeRig,
  type SkyGliderRig,
  type TurretRig,
  type VaultLockRig,
} from './proceduralAssets';
import {
  buildAlpineMountainRing,
  buildHalfTimberHouse,
  buildHotAirBalloon,
  buildLilyPad,
  buildMarketStall,
  buildMedievalCastleBackdrop,
  buildPlazaFountain,
  buildRiverLanternPost,
  buildSkyDome,
  buildStoneArchBridge,
  buildStreetBunting,
  buildStreetLamp,
  buildStreetPropCluster,
  buildStylizedTree,
  buildTownClockTower,
  buildTreasureChest,
  createAerospaceRunwayTexture,
  createCobblestoneTexture,
  createMeadowGrassTexture,
  createRedCarpetTexture,
  createRiverWaterTexture,
  createRoofTileTexture,
  createStoneMasonryTexture,
  createWoodPlankTexture,
  STAGE_SKY_THEMES,
} from './worldBuilder';
import {
  animateScholarOwl,
  animateStylizedCharacter,
  buildScholarOwlCharacter,
  buildStylizedCharacter,
  type ScholarOwlRig,
  type StylizedCharacterRig,
} from './characters';
import {
  applyAssetShimmer,
  buildFeverAuraRig,
  computeShimmerState,
  updateFeverAuraRig,
  type FeverAuraRig,
} from './shimmerSystem';
import { buildTetrisStage3D, type TetrisStage3D } from './tetrisStage';

const OPTION_COLORS = ['#1CB0F6', '#58CC02', '#FF9600', '#A855F7'];
const LANE_X = [-3.25, 0, 3.25];

const _pointerNdc = new THREE.Vector2();
const _camBasePos = new THREE.Vector3();
const _camLookTarget = new THREE.Vector3();
const _v1 = new THREE.Vector3();

interface InteractiveTarget {
  optionIndex: number;
  option: ArcadeOption;
  group: THREE.Group;
  basePos: THREE.Vector3;
  hitFlashTimer: number;
  destroying: boolean;
  destroyTimer: number;
  /** Used by 3-pair Tower Crash */
  towerSide?: 'left' | 'right';
  pairId?: string;
  matched?: boolean;
}

interface BeamEffect {
  mesh: THREE.Mesh;
  life: number;
  maxLife: number;
  start: THREE.Vector3;
  end: THREE.Vector3;
  isOrb: boolean;
}

export interface EngineCallbacks {
  onHudUpdate: (snapshot: HudSnapshot) => void;
  onRunFinish: (summary: RunStats, solvedWords: CsatWord[]) => void;
  onPhaseChange: (phase: GamePhase) => void;
}

function detectSoftwareWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (!ext) return false;
    const renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '').toLowerCase();
    return renderer.includes('swiftshader') || renderer.includes('llvmpipe') || renderer.includes('software');
  } catch {
    return false;
  }
}

function disposeObject3D(root: THREE.Object3D, protectedTextures?: Set<THREE.Texture>): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (mesh.material) {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) {
        const std = m as THREE.MeshStandardMaterial;
        if (std.map && !protectedTextures?.has(std.map) && !std.map.userData?.__sharedTexture) {
          std.map.dispose();
        }
        m.dispose();
      }
    }
  });
}

export class ArcadeEngine {
  private readonly mountEl: HTMLDivElement;
  private readonly callbacks: EngineCallbacks;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly raycaster = new THREE.Raycaster();
  private readonly isSoftwareGl: boolean;
  private readonly maxAnisotropy: number;

  // Persistent world layers
  private readonly skyRoot = new THREE.Group();
  private readonly stageRoot = new THREE.Group();
  private readonly dynamicTargetsRoot = new THREE.Group();
  private readonly fxRoot = new THREE.Group();
  private readonly particles: ParticlePool;
  private clouds: THREE.Group[] = [];

  // Shared procedural PBR textures (retained across stage switches)
  private stoneTex: THREE.CanvasTexture;
  private cobbleTex: THREE.CanvasTexture;
  private grassTex: THREE.CanvasTexture;
  private roofTex: THREE.CanvasTexture;
  private woodTex: THREE.CanvasTexture;
  private sharedTextures: Set<THREE.Texture>;

  // Stage-specific animated rigs
  private hubDioramaGroup: THREE.Group | null = null;
  private hubOwl: ScholarOwlRig | null = null;
  private hubHero: StylizedCharacterRig | null = null;
  private hubGlider: SkyGliderRig | null = null;
  private runnerGlider: SkyGliderRig | null = null;
  private runnerTrackTex: THREE.CanvasTexture | null = null;
  private runnerLaneBeam: THREE.Mesh | null = null;
  private runnerBoostActive = false;
  private riverWaterTex: THREE.CanvasTexture | null = null;
  private turretRef: TurretRig | null = null;
  private owlRef: ScholarOwlRig | null = null;
  private domeRef: LibraryDomeRig | null = null;
  private vaultRef: VaultLockRig | null = null;
  private activeHeroAura: FeverAuraRig | null = null;
  private rimLightRef: THREE.DirectionalLight | null = null;

  // High-combo & Fever Mode 3D shimmer/glow state
  private shimmerHitBoost = 0;
  private feverSparkleAccum = 0;

  // RPG Village Street rigs & #humanRig gesture sequence queue
  public readonly humanRigQueue = new HumanRigGestureQueue();
  private rpgPlayer: StylizedCharacterRig | null = null;
  private rpgNpcs: { rig: StylizedCharacterRig; zPos: number; xPos: number; cleared: boolean }[] = [];
  private rpgPlayerZ = 6;
  private rpgTargetZ = 0;
  private rpgWalkVel = 0;
  private rpgSprintBoost = 0;
  private rpgState: 'walking' | 'talking' | 'celebrating' = 'walking';

  // 3D Voca Tetris stage & state
  private tetrisState: TetrisGameState | null = null;
  private tetrisStage: TetrisStage3D | null = null;
  private tetrisFeedbackClearTimer = 0;

  // Simulation & run state
  private phase: GamePhase = 'title';
  private activeGameId: GameId = 'sky-runner';
  private settings: GameSettings = { difficulty: 'ALL', speed: 'normal' };
  private questions: ArcadeQuestion[] = [];
  private roundIndex = 0;
  private score = 0;
  private combo = 0;
  private maxCombo = 0;
  private hearts = MAX_HEARTS;
  private coinsEarnedRun = 0;
  private correctCount = 0;
  private wrongCount = 0;
  private missedWords: CsatWord[] = [];
  private solvedWords: CsatWord[] = [];
  private runElapsedSec = 0;
  private previousBestScore = 0;
  private revengeQueuedCount = 0;

  // Round & smooth natural kinematics state
  private activeLane = 1;
  private gliderX = 0;
  private gliderVelX = 0;
  private gliderRoll = 0;
  private gliderPitch = 0;
  private camLookCurrent = new THREE.Vector3(0, 1.2, -1.0);
  private roundDuration = 14;
  private roundTimeLeft = 14;
  private gatesZ = -24;
  private roundLocked = false;
  private nextRoundDelay = 0;
  private spellingStep = 0;
  private spellingBuilt = '';
  private owlPos = new THREE.Vector3(0, 0, 4.2);
  private owlStartPos = new THREE.Vector3(0, 0, 4.2);
  private owlTargetPos = new THREE.Vector3(0, 0, 4.2);
  private owlJumpT = 1;
  private owlSquashY = 1;
  private turretRecoil = 0;
  private turretTargetYaw = 0;
  private vaultGearSpinBoost = 0;
  private leftLeverTilt = 0;
  private rightLeverTilt = 0;
  private feedbackCounter = 0;
  private lastFeedback: HudSnapshot['feedbackBanner'] = null;

  // Tower Crash 3-pair matching state
  private towerSelectedSide: 'left' | 'right' | null = null;
  private towerSelectedPairId: string | null = null;
  private towerMatchedPairIds: string[] = [];

  // Juice: hitstop + camera trauma + FOV kick
  private hitstopTimer = 0;
  private trauma = 0;
  private fovKick = 0;

  // Active 3D targets & projectiles
  private targets: InteractiveTarget[] = [];
  private beams: BeamEffect[] = [];

  // Loop & lifecycle
  private disposed = false;
  private frameId = 0;
  private lastNow = 0;
  private elapsedTotal = 0;
  private lastHudEmit = 0;
  private resizeObserver: ResizeObserver;

  constructor(
    mountEl: HTMLDivElement,
    callbacks: EngineCallbacks,
    initialAutoStart?: { gameId: GameId; priorityWordIds: string[]; settings?: GameSettings }
  ) {
    this.mountEl = mountEl;
    this.callbacks = callbacks;
    this.isSoftwareGl = detectSoftwareWebGL();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.94;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.maxAnisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());

    const width = mountEl.clientWidth || window.innerWidth;
    const height = mountEl.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);
    mountEl.innerHTML = '';
    mountEl.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.setAttribute('data-testid', 'arcade-webgl-canvas');

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#BFE4FF');
    this.scene.fog = new THREE.Fog('#BFE4FF', 36, 130);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(50, width / Math.max(1, height), 0.1, 220);
    this.camera.position.set(0, 5.2, 13.4);
    this.camera.lookAt(0, 1.4, 0);

    // Calibrated 3-point sunlit studio rig (rich contrast, zero white blow-out)
    const hemi = new THREE.HemisphereLight(0x93c5fd, 0x1e3a2f, 0.78);
    this.scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xffe8b6, 1.65);
    keyLight.position.set(16, 26, 14);
    keyLight.castShadow = !this.isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 85;
    keyLight.shadow.camera.left = -22;
    keyLight.shadow.camera.right = 22;
    keyLight.shadow.camera.top = 22;
    keyLight.shadow.camera.bottom = -22;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.95);
    rimLight.position.set(-16, 12, -18);
    this.scene.add(rimLight);
    this.rimLightRef = rimLight;

    // Pre-generate shared PBR procedural textures
    this.stoneTex = createStoneMasonryTexture(this.maxAnisotropy, 2, 2);
    this.cobbleTex = createCobblestoneTexture(this.maxAnisotropy, 4, 12);
    this.grassTex = createMeadowGrassTexture(this.maxAnisotropy, 4, 4);
    this.roofTex = createRoofTileTexture(this.maxAnisotropy);
    this.woodTex = createWoodPlankTexture(this.maxAnisotropy, 2, 2);
    this.sharedTextures = new Set<THREE.Texture>([
      this.stoneTex,
      this.cobbleTex,
      this.grassTex,
      this.roofTex,
      this.woodTex,
    ]);

    // Volumetric sunlit sky clouds
    for (let i = 0; i < 14; i++) {
      const cloud = buildSkyCloud();
      const angle = (i / 14) * Math.PI * 2;
      const dist = 28 + (i % 3) * 14;
      cloud.position.set(Math.cos(angle) * dist, 11 + (i % 4) * 3.5, Math.sin(angle) * dist - 10);
      cloud.scale.setScalar(1.25 + (i % 3) * 0.45);
      this.clouds.push(cloud);
      this.scene.add(cloud);
    }

    this.particles = new ParticlePool();
    this.scene.add(
      this.skyRoot,
      this.stageRoot,
      this.dynamicTargetsRoot,
      this.fxRoot,
      this.particles.mesh
    );

    if (initialAutoStart) {
      if (initialAutoStart.settings) {
        this.settings = initialAutoStart.settings;
      }
      this.startGame(initialAutoStart.gameId, initialAutoStart.priorityWordIds, 0, this.settings);
    } else {
      this.buildHubScene();
      this.snapCameraToStage();
    }

    this.renderer.domElement.addEventListener('pointerdown', this.handleCanvasPointerDown);
    this.renderer.domElement.addEventListener('webglcontextlost', this.handleContextLost);

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(mountEl);

    this.lastNow = performance.now();
    this.tick();
  }

  private handleContextLost = (e: Event): void => {
    e.preventDefault();
  };

  private handleResize(): void {
    if (this.disposed) return;
    const width = this.mountEl.clientWidth || window.innerWidth;
    const height = this.mountEl.clientHeight || window.innerHeight;
    if (width <= 0 || height <= 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.snapCameraToStage();
    this.renderer.setSize(width, height);
    this.renderer.render(this.scene, this.camera);
  }

  private applySkyTheme(themeKey: string): void {
    disposeObject3D(this.skyRoot, this.sharedTextures);
    this.skyRoot.clear();
    const theme = STAGE_SKY_THEMES[themeKey] ?? STAGE_SKY_THEMES.hub;
    this.scene.background = new THREE.Color(theme.horizon);
    this.scene.fog = new THREE.Fog(theme.fogColor, theme.fogNear, theme.fogFar);
    this.skyRoot.add(buildSkyDome(theme));
  }

  private clearStage(): void {
    disposeObject3D(this.stageRoot, this.sharedTextures);
    disposeObject3D(this.dynamicTargetsRoot, this.sharedTextures);
    disposeObject3D(this.fxRoot, this.sharedTextures);
    this.stageRoot.clear();
    this.dynamicTargetsRoot.clear();
    this.fxRoot.clear();
    this.targets = [];
    this.beams = [];
    this.hubDioramaGroup = null;
    this.hubOwl = null;
    this.hubHero = null;
    this.hubGlider = null;
    this.runnerGlider = null;
    this.runnerTrackTex = null;
    this.runnerLaneBeam = null;
    this.riverWaterTex = null;
    this.turretRef = null;
    this.owlRef = null;
    this.domeRef = null;
    this.vaultRef = null;
    this.activeHeroAura = null;
    this.rpgPlayer = null;
    this.rpgNpcs = [];
    this.tetrisStage = null;
  }

  public attachHumanRigElement(el: HumanRigElementLike | null): void {
    this.humanRigQueue.attachElement(el);
  }

  public triggerSpeechGestureSequence(
    input: readonly SpeechSegmentInput[] | string,
    options?: { interrupt?: boolean; speakText?: string }
  ): GestureQueueItem[] {
    const queued = this.humanRigQueue.enqueueSequence(input, {
      interrupt: options?.interrupt ?? true,
    });
    if (options?.speakText) {
      soundEngine.speakEnglish(options.speakText, {
        onEnd: () => this.humanRigQueue.notifySpeechEnded(),
      });
    }
    return queued;
  }

  private triggerRpgNpcSpeech(q: ArcadeQuestion | undefined): void {
    if (!q) return;
    if (q.rpgDialogue) {
      this.humanRigQueue.playRpgDialogue(q.rpgDialogue);
    } else if (q.speakText) {
      this.humanRigQueue.enqueueSequence(q.speakText, { interrupt: true });
    }
    if (q.speakText) {
      soundEngine.speakEnglish(q.speakText, {
        onEnd: () => this.humanRigQueue.notifySpeechEnded(),
      });
    }
  }

  public showHub(selectedGameId?: GameId): void {
    if (selectedGameId) {
      this.activeGameId = selectedGameId;
    }
    this.humanRigQueue.returnToIdleBreath();
    this.phase = 'title';
    this.callbacks.onPhaseChange('title');
    this.clearStage();
    this.buildHubScene();
    this.snapCameraToStage();
    this.emitHud(true);
  }

  public setHubPreviewGame(gameId: GameId): void {
    this.activeGameId = gameId;
  }

  private buildHubScene(): void {
    this.applySkyTheme('hub');

    const diorama = new THREE.Group();
    diorama.position.set(0, -0.45, 0);

    // Distant alpine mountain panorama framing the floating sky-island
    this.stageRoot.add(buildAlpineMountainRing(68, 14, 0x64748b));

    // Tapered floating island cliff & sunlit textured meadow lawn
    const islandRock = new THREE.Mesh(
      new THREE.ConeGeometry(7.8, 6.2, 11),
      new THREE.MeshStandardMaterial({ map: this.stoneTex, roughness: 0.9 })
    );
    islandRock.rotation.x = Math.PI;
    islandRock.position.y = -3.2;

    const islandGrass = new THREE.Mesh(
      new THREE.CylinderGeometry(8.2, 7.6, 0.72, 16),
      new THREE.MeshStandardMaterial({ map: this.grassTex, roughness: 0.72 })
    );
    islandGrass.position.y = -0.36;
    islandGrass.receiveShadow = true;

    // Cobblestone central sanctuary plaza
    const plazaDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(4.1, 4.3, 0.16, 20),
      new THREE.MeshStandardMaterial({ map: this.cobbleTex, roughness: 0.65 })
    );
    plazaDisc.position.y = 0.08;
    plazaDisc.receiveShadow = true;
    diorama.add(islandRock, islandGrass, plazaDisc);

    // Golden arch halo framing the Scholar Owl
    const hubArchHalo = new THREE.Mesh(
      new THREE.TorusGeometry(2.55, 0.085, 10, 40, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.22, metalness: 0.85 })
    );
    hubArchHalo.position.set(0, 0.45, -1.65);
    diorama.add(hubArchHalo);

    // Center Hero Showcase: Sculpted Scholar Owl + Articulated Student Adventurer waving together!
    const owl = buildScholarOwlCharacter();
    owl.group.position.set(-0.92, 0.16, 0.45);
    owl.group.rotation.y = 0.22;
    owl.group.scale.setScalar(0.95);
    diorama.add(owl.group);
    this.hubOwl = owl;

    const hubHero = buildStylizedCharacter({
      shirtColor: 0x0284c7,
      accentColor: 0xfacc15,
      isPlayer: true,
    });
    hubHero.group.position.set(1.05, 0.16, 0.55);
    hubHero.group.rotation.y = -0.24;
    hubHero.group.scale.setScalar(1.06);
    diorama.add(hubHero.group);
    this.hubHero = hubHero;

    // Flanking detailed miniature landmarks representing all 6 3D worlds
    const miniDome = buildLibraryDome();
    miniDome.group.scale.setScalar(0.5);
    miniDome.group.position.set(-4.3, 0.05, -0.7);
    diorama.add(miniDome.group);

    const miniVault = buildVaultLock();
    miniVault.group.scale.setScalar(0.45);
    miniVault.group.position.set(4.3, 0.05, -0.7);
    miniVault.group.rotation.y = -0.4;
    diorama.add(miniVault.group);

    const miniHouse = buildHalfTimberHouse(0, this.stoneTex, this.roofTex, this.woodTex);
    miniHouse.scale.setScalar(0.38);
    miniHouse.position.set(-4.1, 0.05, -3.7);
    miniHouse.rotation.y = 0.62;
    diorama.add(miniHouse);

    const miniChest = buildTreasureChest(this.woodTex);
    miniChest.scale.setScalar(0.75);
    miniChest.position.set(2.5, 0.06, 1.85);
    miniChest.rotation.y = -0.5;
    diorama.add(miniChest);

    // Stylized trees, flower planters, vintage lamp post & drifting hot-air balloon!
    const tree1 = buildStylizedTree(1);
    tree1.scale.setScalar(0.72);
    tree1.position.set(4.5, 0.0, -3.6);
    const tree2 = buildStylizedTree(2); // Cherry blossom!
    tree2.scale.setScalar(0.68);
    tree2.position.set(-5.2, 0.0, 2.0);
    const planter = buildStreetPropCluster(1, this.woodTex);
    planter.position.set(-2.5, 0.08, 1.9);
    const lamp = buildStreetLamp();
    lamp.scale.setScalar(0.65);
    lamp.position.set(5.7, 0.05, 2.0);
    const balloon = buildHotAirBalloon(0);
    balloon.scale.setScalar(0.68);
    balloon.position.set(-6.4, 5.4, -7.2);
    diorama.add(tree1, tree2, planter, lamp, balloon);

    // Sculpted Prop-Jet Fighter orbiting FORWARD (nose leading!)
    const glider = buildSkyGlider();
    glider.group.scale.setScalar(0.68);
    glider.group.position.set(5.6, 3.4, 0);
    diorama.add(glider.group);
    this.hubGlider = glider;

    this.hubDioramaGroup = diorama;
    this.stageRoot.add(diorama);
  }

  public startGame(
    gameId: GameId,
    priorityWordIds: string[] = [],
    previousBestScore = 0,
    settings?: GameSettings
  ): void {
    this.activeGameId = gameId;
    if (settings) {
      this.settings = settings;
    }
    this.questions = generateGameQuestions(gameId, {
      priorityWordIds,
      difficulty: this.settings.difficulty,
    });
    this.roundIndex = 0;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.hearts = MAX_HEARTS;
    this.coinsEarnedRun = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.missedWords = [];
    this.solvedWords = [];
    this.runElapsedSec = 0;
    this.previousBestScore = previousBestScore;
    this.revengeQueuedCount = 0;
    this.activeLane = 1;
    this.gliderX = 0;
    this.gliderVelX = 0;
    this.gliderRoll = 0;
    this.gliderPitch = 0;
    this.runnerBoostActive = false;
    this.roundLocked = false;
    this.nextRoundDelay = 0;
    this.lastFeedback = null;
    this.towerSelectedSide = null;
    this.towerSelectedPairId = null;
    this.towerMatchedPairIds = [];
    this.rpgState = 'walking';
    this.rpgWalkVel = 0;
    this.rpgSprintBoost = 0;
    this.tetrisState = null;
    this.tetrisFeedbackClearTimer = 0;
    this.hitstopTimer = 0;
    this.trauma = 0;
    this.fovKick = 0;
    this.shimmerHitBoost = 0;
    this.feverSparkleAccum = 0;

    if (gameId === 'voca-tetris') {
      this.tetrisState = new TetrisGameState({
        speed: this.settings.speed,
        targetLines: TETRIS_TARGET_LINES,
      });
    }

    this.phase = 'playing';
    this.callbacks.onPhaseChange('playing');

    this.clearStage();
    this.buildStageForGame(gameId);
    this.setupCurrentRound();
    this.snapCameraToStage();
    soundEngine.playAction(1.1);
    this.emitHud(true);
  }

  public setPaused(paused: boolean): void {
    if (this.phase !== 'playing' && this.phase !== 'paused') return;
    this.phase = paused ? 'paused' : 'playing';
    this.callbacks.onPhaseChange(this.phase);
    this.emitHud(true);
  }

  public getPhase(): GamePhase {
    return this.phase;
  }

  public getActiveGameId(): GameId {
    return this.activeGameId;
  }

  private buildStageForGame(gameId: GameId): void {
    this.applySkyTheme(gameId);

    if (gameId === 'sky-runner') {
      this.stageRoot.add(buildAlpineMountainRing(78, 16, 0x475569));

      // High-contrast Aerospace Carrier Runway
      this.runnerTrackTex = createAerospaceRunwayTexture(this.maxAnisotropy);
      const trackMat = new THREE.MeshStandardMaterial({
        map: this.runnerTrackTex,
        color: 0xffffff,
        roughness: 0.42,
        metalness: 0.28,
      });
      const runway = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.55, 108), trackMat);
      runway.position.set(0, -0.275, -40);
      runway.receiveShadow = true;
      this.stageRoot.add(runway);

      // Active lane luminous targeting strip along the runway
      const laneBeam = new THREE.Mesh(
        new THREE.PlaneGeometry(2.8, 42),
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.22,
          depthWrite: false,
        })
      );
      laneBeam.rotation.x = -Math.PI / 2;
      laneBeam.position.set(0, 0.03, -18);
      this.stageRoot.add(laneBeam);
      this.runnerLaneBeam = laneBeam;

      // Illuminated aerospace guard towers & beacons lining the runway
      const postMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.65 });
      const beaconMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0ea5e9,
        emissiveIntensity: 1.4,
      });
      for (let z = 4; z >= -82; z -= 11) {
        [-6.2, 6.2].forEach((xPos) => {
          const truss = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.34, 3.6, 6), postMat);
          truss.position.set(xPos, 1.5, z);
          const lamp = new THREE.Mesh(new THREE.OctahedronGeometry(0.36, 0), beaconMat);
          lamp.position.set(xPos, 3.55, z);
          this.stageRoot.add(truss, lamp);
        });
      }

      // Drifting hot-air balloons flanking the skyway
      const balloonL = buildHotAirBalloon(0);
      balloonL.position.set(-14, 7.5, -32);
      balloonL.scale.setScalar(1.3);
      const balloonR = buildHotAirBalloon(1);
      balloonR.position.set(14.5, 9.2, -46);
      balloonR.scale.setScalar(1.5);
      this.stageRoot.add(balloonL, balloonR);

      // Forward-facing Prop-Jet Fighter (nose at -Z, spinning prop leading!) + Fever Aura ring
      const glider = buildSkyGlider();
      glider.group.position.set(0, 0.25, 1.15);
      const gliderAura = buildFeverAuraRig(1.95);
      gliderAura.group.position.y = 0.45;
      glider.group.add(gliderAura.group);
      this.stageRoot.add(glider.group);
      this.runnerGlider = glider;
      this.activeHeroAura = gliderAura;
      return;
    }

    if (gameId === 'tower-crash') {
      this.stageRoot.add(buildAlpineMountainRing(66, 14, 0x64748b));

      // Medieval castle stone courtyard + grand gatehouse keep + tiled watchtowers
      const groundMeadow = new THREE.Mesh(
        new THREE.CylinderGeometry(28, 24, 1.0, 18),
        new THREE.MeshStandardMaterial({ map: this.grassTex, roughness: 0.85 })
      );
      groundMeadow.position.set(0, -0.65, -4);
      groundMeadow.receiveShadow = true;

      const courtyard = new THREE.Mesh(
        new THREE.BoxGeometry(20, 0.28, 18),
        new THREE.MeshStandardMaterial({ map: this.cobbleTex, color: 0xcbd5e1, roughness: 0.72 })
      );
      courtyard.position.set(0, 0.0, -3.5);
      courtyard.receiveShadow = true;

      // Royal siege battle arena floor inlay (carpet + gold ring + glowing lane splitters)
      const arenaCarpet = new THREE.Mesh(
        new THREE.PlaneGeometry(3.2, 15.5),
        new THREE.MeshStandardMaterial({
          map: createRedCarpetTexture(this.maxAnisotropy),
          roughness: 0.68,
        })
      );
      arenaCarpet.rotation.x = -Math.PI / 2;
      arenaCarpet.position.set(0, 0.16, -2.5);

      const arenaGoldRing = new THREE.Mesh(
        new THREE.TorusGeometry(6.2, 0.14, 8, 44),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.28, metalness: 0.85 })
      );
      arenaGoldRing.rotation.x = Math.PI / 2;
      arenaGoldRing.position.set(0, 0.17, -3.6);

      const arenaBorderMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.6,
        metalness: 0.35,
      });
      const borderFront = new THREE.Mesh(new THREE.BoxGeometry(20.4, 0.44, 0.55), arenaBorderMat);
      borderFront.position.set(0, 0.18, 5.5);

      this.stageRoot.add(
        groundMeadow,
        courtyard,
        arenaCarpet,
        arenaGoldRing,
        borderFront,
        buildMedievalCastleBackdrop(this.stoneTex, this.roofTex)
      );

      // Lush courtyard trees, barrels & flower planters flanking the castle keep
      [
        [-11.6, -5.0, 0],
        [11.6, -5.0, 1],
        [-10.2, 1.2, 2],
        [10.2, 1.2, 3],
      ].forEach(([tx, tz, v]) => {
        const tree = buildStylizedTree(v);
        tree.position.set(tx, -0.1, tz);
        this.stageRoot.add(tree);
      });
      [
        [-8.6, -2.5, 0],
        [8.6, -2.5, 1],
        [-8.2, 1.8, 1],
        [8.2, 1.8, 0],
      ].forEach(([px, pz, v]) => {
        const prop = buildStreetPropCluster(v, this.woodTex);
        prop.position.set(px, 0.14, pz);
        this.stageRoot.add(prop);
      });

      const turret = buildArcadeTurret();
      turret.group.position.set(0, 0.14, 4.9);
      const turretAura = buildFeverAuraRig(2.05);
      turret.group.add(turretAura.group);
      this.stageRoot.add(turret.group);
      this.turretRef = turret;
      this.activeHeroAura = turretAura;
      return;
    }

    if (gameId === 'spelling-hop') {
      this.stageRoot.add(buildAlpineMountainRing(64, 14, 0x334155));

      // Shimmering animated alpine river valley!
      this.riverWaterTex = createRiverWaterTexture(this.maxAnisotropy);
      const river = new THREE.Mesh(
        new THREE.PlaneGeometry(54, 70),
        new THREE.MeshStandardMaterial({
          map: this.riverWaterTex,
          roughness: 0.18,
          metalness: 0.2,
          emissive: 0x0369a1,
          emissiveIntensity: 0.14,
        })
      );
      river.rotation.x = -Math.PI / 2;
      river.position.set(0, -0.22, -6);
      this.stageRoot.add(river);

      // Mossy rocky riverbanks flanking left & right with trees & glowing lantern posts
      const bankMat = new THREE.MeshStandardMaterial({ map: this.grassTex, roughness: 0.8 });
      [-11.5, 11.5].forEach((bx) => {
        const bank = new THREE.Mesh(new THREE.BoxGeometry(10.5, 2.2, 58), bankMat);
        bank.position.set(bx, 0.25, -6);
        bank.receiveShadow = true;
        this.stageRoot.add(bank);
      });

      for (let z = 4; z >= -18; z -= 5.5) {
        const leftLantern = buildRiverLanternPost();
        leftLantern.position.set(-6.8, 0.85, z);
        const rightLantern = buildRiverLanternPost();
        rightLantern.position.set(6.8, 0.85, z);
        rightLantern.rotation.y = Math.PI;
        this.stageRoot.add(leftLantern, rightLantern);

        const treeL = buildStylizedTree(Math.abs(Math.round(z)));
        treeL.position.set(-9.4, 1.2, z - 1.5);
        const treeR = buildStylizedTree(Math.abs(Math.round(z)) + 2);
        treeR.position.set(9.4, 1.2, z - 2.0);
        this.stageRoot.add(treeL, treeR);
      }

      // Floating lily pads & lotus blooms along the river
      [
        [-5.2, 2.6, true],
        [5.1, 1.4, true],
        [-4.9, -2.4, false],
        [5.4, -4.5, true],
        [-5.3, -7.8, true],
        [4.8, -9.2, false],
      ].forEach(([lx, lz, flower]) => {
        const pad = buildLilyPad(Boolean(flower));
        pad.position.set(Number(lx), -0.17, Number(lz));
        pad.rotation.y = Number(lx) * 0.7;
        this.stageRoot.add(pad);
      });

      // Distant stone arch footbridge spanning the alpine valley & hot-air balloon
      const bridge = buildStoneArchBridge(this.stoneTex);
      bridge.position.set(0, -0.6, -21);
      const valleyBalloon = buildHotAirBalloon(3);
      valleyBalloon.position.set(8.5, 10.5, -28);
      this.stageRoot.add(bridge, valleyBalloon);

      // Starting stone river dock platform
      const dockDeck = new THREE.Mesh(
        new THREE.CylinderGeometry(2.1, 1.9, 0.45, 7),
        new THREE.MeshStandardMaterial({ map: this.stoneTex, roughness: 0.78 })
      );
      dockDeck.position.set(0, -0.12, 4.9);
      dockDeck.receiveShadow = true;
      this.stageRoot.add(dockDeck);

      const owl = buildScholarOwlCharacter();
      owl.group.position.set(0, 0.08, 4.9);
      owl.group.scale.setScalar(0.8);
      this.stageRoot.add(owl.group);
      this.owlRef = owl;
      this.activeHeroAura = owl.auraRig;
      this.owlPos.set(0, 0.08, 4.9);
      this.owlTargetPos.set(0, 0.08, 4.9);
      this.owlJumpT = 1;
      return;
    }

    if (gameId === 'synonym-defense') {
      this.stageRoot.add(buildAlpineMountainRing(70, 14, 0x312e81));

      // Floating marble astral observatory citadel
      const cliff = new THREE.Mesh(
        new THREE.ConeGeometry(13.5, 7.2, 12),
        new THREE.MeshStandardMaterial({ map: this.stoneTex, color: 0x94a3b8, roughness: 0.85 })
      );
      cliff.rotation.x = Math.PI;
      cliff.position.set(0, -3.9, 2.5);
      const terrace = new THREE.Mesh(
        new THREE.CylinderGeometry(13.5, 13.0, 0.65, 18),
        new THREE.MeshStandardMaterial({ map: this.cobbleTex, roughness: 0.62 })
      );
      terrace.position.set(0, -0.325, 2.5);
      terrace.receiveShadow = true;
      this.stageRoot.add(cliff, terrace);

      // 4 glowing astral crystal defense pylons around the perimeter
      const pylonMat = new THREE.MeshStandardMaterial({ color: 0x312e81, roughness: 0.4, metalness: 0.5 });
      const gemMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0ea5e9,
        emissiveIntensity: 1.2,
      });
      [
        [-5.6, 1.2],
        [5.6, 1.2],
        [-4.8, 5.2],
        [4.8, 5.2],
      ].forEach(([px, pz]) => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.4, 2.8, 8), pylonMat);
        col.position.set(px, 1.4, pz);
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), gemMat);
        gem.position.set(px, 3.2, pz);
        this.stageRoot.add(col, gem);
      });

      const dome = buildLibraryDome();
      dome.group.position.set(0, 0, 3.2);
      const domeAura = buildFeverAuraRig(2.9);
      domeAura.group.position.y = 0.55;
      dome.group.add(domeAura.group);
      this.stageRoot.add(dome.group);
      this.domeRef = dome;
      this.activeHeroAura = domeAura;
      return;
    }

    if (gameId === 'rpg-street') {
      // Sunlit 3D European RPG Village Street!
      this.stageRoot.add(buildAlpineMountainRing(85, 16, 0x475569));

      const meadowFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(110, 140),
        new THREE.MeshStandardMaterial({ map: this.grassTex, roughness: 0.85 })
      );
      meadowFloor.rotation.x = -Math.PI / 2;
      meadowFloor.position.set(0, -0.08, -36);
      meadowFloor.receiveShadow = true;

      // Long cobblestone village avenue running from z = +16 down to z = -88
      const streetTex = createCobblestoneTexture(this.maxAnisotropy, 3, 22);
      const road = new THREE.Mesh(
        new THREE.BoxGeometry(8.6, 0.16, 112),
        new THREE.MeshStandardMaterial({ map: streetTex, roughness: 0.72 })
      );
      road.position.set(0, 0, -36);
      road.receiveShadow = true;

      // Stone sidewalks / curbs on both sides
      const curbMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.75 });
      [-4.6, 4.6].forEach((cx) => {
        const curb = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.24, 112), curbMat);
        curb.position.set(cx, 0.08, -36);
        this.stageRoot.add(curb);
      });

      this.stageRoot.add(meadowFloor, road);

      // 16 detailed European half-timbered shops, cottages, market stalls, bunting garlands, lamps & trees!
      for (let i = 0; i < 8; i++) {
        const z = 4 - i * 11.5;
        const leftHouse = buildHalfTimberHouse(i * 2, this.stoneTex, this.roofTex, this.woodTex);
        leftHouse.position.set(-7.6, 0, z);
        leftHouse.rotation.y = Math.PI / 2;

        const rightHouse = buildHalfTimberHouse(i * 2 + 1, this.stoneTex, this.roofTex, this.woodTex);
        rightHouse.position.set(7.6, 0, z - 2.5);
        rightHouse.rotation.y = -Math.PI / 2;

        const lampL = buildStreetLamp();
        lampL.position.set(-4.5, 0.12, z + 4.0);
        const lampR = buildStreetLamp();
        lampR.position.set(4.5, 0.12, z - 5.2);

        const propL = buildStreetPropCluster(i, this.woodTex);
        propL.position.set(-4.2, 0.14, z - 1.2);
        const propR = buildStreetPropCluster(i + 1, this.woodTex);
        propR.position.set(4.2, 0.14, z + 1.8);

        const treeL = buildStylizedTree(i);
        treeL.position.set(-12.2, 0, z - 5.5);
        const treeR = buildStylizedTree(i + 2);
        treeR.position.set(12.2, 0, z + 3.0);

        this.stageRoot.add(leftHouse, rightHouse, lampL, lampR, propL, propR, treeL, treeR);

        // Festive pennant bunting strung overhead across the European avenue
        if (i < 6) {
          const bunting = buildStreetBunting(10.8);
          bunting.position.set(0, 6.2, z - 4.2);
          this.stageRoot.add(bunting);
        }

        // Vibrant street market stalls flanking alternate blocks
        if (i % 2 === 0 && i < 6) {
          const stall = buildMarketStall(i, this.woodTex);
          const side = i % 4 === 0 ? -4.3 : 4.3;
          stall.position.set(side, 0.12, z - 5.2);
          stall.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
          this.stageRoot.add(stall);
        }
      }

      // Grand European Town Clock Tower rising at the far plaza!
      const clockTower = buildTownClockTower(this.stoneTex, this.roofTex);
      clockTower.position.set(0, 0, -82);
      const townBalloon = buildHotAirBalloon(2);
      townBalloon.position.set(-9, 17, -64);
      townBalloon.scale.setScalar(1.3);
      this.stageRoot.add(clockTower, townBalloon);

      // Plaza fountain focal landmark mid-avenue
      const fountain = buildPlazaFountain();
      fountain.position.set(-4.2, 0.05, -24);
      fountain.scale.setScalar(0.75);
      this.stageRoot.add(fountain);

      // Spawn the Flagship 3D Student Adventurer (facing -Z down the cobblestone street!)
      const player = buildStylizedCharacter({
        shirtColor: 0x0284c7,
        accentColor: 0xfacc15,
        isPlayer: true,
      });
      player.group.rotation.y = Math.PI; // local +Z face turns to look down -Z street
      player.group.position.set(0, 0.08, 2.8);
      this.stageRoot.add(player.group);
      this.rpgPlayer = player;
      this.activeHeroAura = player.auraRig;
      this.rpgPlayerZ = 2.8;

      // Spawn all Costumed 3D Villager NPCs along the road ahead!
      this.rpgNpcs = this.questions.map((q, idx) => {
        const dlg = q.rpgDialogue;
        const npcZ = -4 - idx * 11.5;
        const npcX = idx % 2 === 0 ? 1.85 : -1.85;
        const rig = buildStylizedCharacter({
          shirtColor: dlg?.shirtColor ?? 0xf43f5e,
          accentColor: dlg?.accentColor ?? 0xfef08a,
          archetypeIndex: idx,
          showQuestMarker: true,
        });
        rig.group.position.set(npcX, 0.08, npcZ);
        rig.group.rotation.y = npcX > 0 ? -0.48 : 0.48; // Angled warmly toward approaching player
        this.stageRoot.add(rig.group);
        return { rig, zPos: npcZ, xPos: npcX, cleared: false };
      });
      return;
    }

    if (gameId === 'voca-tetris') {
      this.stageRoot.add(buildAlpineMountainRing(84, 15, 0x334155));
      const tetris3d = buildTetrisStage3D(this.maxAnisotropy);
      this.stageRoot.add(tetris3d.root);
      this.tetrisStage = tetris3d;
      return;
    }

    // Game 5: vault-rush — Grand Steampunk Treasury Hall
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(16, 16, 0.5, 24),
      new THREE.MeshStandardMaterial({ map: this.cobbleTex, color: 0xfef3c7, roughness: 0.45, metalness: 0.16 })
    );
    floor.position.set(0, -0.25, 0);
    floor.receiveShadow = true;

    const carpet = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 14),
      new THREE.MeshStandardMaterial({ map: createRedCarpetTexture(this.maxAnisotropy), roughness: 0.72 })
    );
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, 0.02, 3.2);

    const goldRing = new THREE.Mesh(
      new THREE.TorusGeometry(7.2, 0.18, 10, 40),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.22, metalness: 0.88 })
    );
    goldRing.rotation.x = Math.PI / 2;
    goldRing.position.y = 0.05;
    this.stageRoot.add(floor, carpet, goldRing);

    const vault = buildVaultLock();
    vault.group.position.set(0, 0, -2.0);
    const vaultAura = buildFeverAuraRig(3.05);
    vaultAura.group.position.y = 0.25;
    vault.group.add(vaultAura.group);
    this.stageRoot.add(vault.group);
    this.vaultRef = vault;
    this.activeHeroAura = vaultAura;

    // Overflowing golden treasure chests & gilded columns flanking the Grand Vault
    const chestL = buildTreasureChest(this.woodTex);
    chestL.position.set(-3.05, 0.02, 1.0);
    chestL.rotation.y = 0.52;
    const chestR = buildTreasureChest(this.woodTex);
    chestR.position.set(3.05, 0.02, 1.0);
    chestR.rotation.y = -0.52;
    this.stageRoot.add(chestL, chestR);
  }

  private clearDynamicTargets(): void {
    disposeObject3D(this.dynamicTargetsRoot, this.sharedTextures);
    this.dynamicTargetsRoot.clear();
    this.targets = [];
  }

  private setupCurrentRound(): void {
    this.clearDynamicTargets();
    this.roundLocked = false;
    this.runnerBoostActive = false;
    this.lastFeedback = null; // CRITICAL FIX: Never bleed previous round's feedback banner into new round!
    this.spellingStep = 0;
    this.spellingBuilt = '';
    this.towerSelectedSide = null;
    this.towerSelectedPairId = null;
    this.towerMatchedPairIds = [];

    const q = this.questions[this.roundIndex];
    if (!q) {
      this.finishRun();
      return;
    }

    const speedMult = getSpeedMultiplier(this.settings.speed);

    if (this.activeGameId === 'sky-runner') {
      this.roundDuration = 16.0 / speedMult;
      this.roundTimeLeft = this.roundDuration;
      this.gatesZ = -24;
      q.options.forEach((opt, i) => {
        const gate = buildWordGateArch(opt.label, i + 1, OPTION_COLORS[i % OPTION_COLORS.length], this.maxAnisotropy);
        gate.position.set(LANE_X[i], 0, this.gatesZ);
        gate.userData.optionIndex = i;
        this.dynamicTargetsRoot.add(gate);
        this.targets.push({
          optionIndex: i,
          option: opt,
          group: gate,
          basePos: new THREE.Vector3(LANE_X[i], 0, this.gatesZ),
          hitFlashTimer: 0,
          destroying: false,
          destroyTimer: 0,
        });
      });
    } else if (this.activeGameId === 'tower-crash' && q.matchPairs) {
      // 3-Pair Simultaneous Castle Matching Board (3 English Left + 3 Korean Right = 6 Towers!)
      this.roundDuration = 26 / speedMult;
      this.roundTimeLeft = this.roundDuration;

      const leftPositions = [
        new THREE.Vector3(-4.2, 0.14, -0.8),
        new THREE.Vector3(-2.15, 1.45, -4.4),
        new THREE.Vector3(-4.2, 2.75, -7.9),
      ];
      const rightPositions = [
        new THREE.Vector3(4.2, 0.14, -0.8),
        new THREE.Vector3(2.15, 1.45, -4.4),
        new THREE.Vector3(4.2, 2.75, -7.9),
      ];

      const rampartMat = new THREE.MeshStandardMaterial({
        map: this.stoneTex,
        color: 0x475569,
        roughness: 0.78,
      });

      const addRampartBase = (pos: THREE.Vector3) => {
        if (pos.y <= 0.25) return;
        const h = pos.y - 0.14;
        const ped = new THREE.Mesh(new THREE.BoxGeometry(2.75, h, 1.55), rampartMat);
        ped.position.set(pos.x, 0.14 + h / 2, pos.z);
        ped.receiveShadow = true;
        this.dynamicTargetsRoot.add(ped);
      };

      let targetIdx = 0;
      q.matchPairs.leftOrder.forEach((pairId, i) => {
        const pair = q.matchPairs!.pairs.find((p) => p.pairId === pairId)!;
        addRampartBase(leftPositions[i]);
        const tower = buildWordMonolith(pair.leftLabel, `E${i + 1}`, '#0EA5E9', this.maxAnisotropy, {
          stoneTex: this.stoneTex,
          subtitle: `${pair.wordEntry.pos} · ${pair.wordEntry.level}`,
        });
        tower.scale.setScalar(0.86);
        tower.position.copy(leftPositions[i]);
        tower.lookAt(0, leftPositions[i].y + 0.6, 13);
        tower.userData.towerSide = 'left';
        tower.userData.pairId = pairId;
        this.dynamicTargetsRoot.add(tower);
        this.targets.push({
          optionIndex: targetIdx++,
          option: { id: `${pairId}-L`, label: pair.leftLabel, isCorrect: true },
          group: tower,
          basePos: leftPositions[i].clone(),
          hitFlashTimer: 0,
          destroying: false,
          destroyTimer: 0,
          towerSide: 'left',
          pairId,
          matched: false,
        });
      });

      q.matchPairs.rightOrder.forEach((pairId, i) => {
        const pair = q.matchPairs!.pairs.find((p) => p.pairId === pairId)!;
        addRampartBase(rightPositions[i]);
        const tower = buildWordMonolith(pair.rightLabel, `K${i + 1}`, '#22C55E', this.maxAnisotropy, {
          stoneTex: this.stoneTex,
        });
        tower.scale.setScalar(0.86);
        tower.position.copy(rightPositions[i]);
        tower.lookAt(0, rightPositions[i].y + 0.6, 13);
        tower.userData.towerSide = 'right';
        tower.userData.pairId = pairId;
        this.dynamicTargetsRoot.add(tower);
        this.targets.push({
          optionIndex: targetIdx++,
          option: { id: `${pairId}-R`, label: pair.rightLabel, isCorrect: true },
          group: tower,
          basePos: rightPositions[i].clone(),
          hitFlashTimer: 0,
          destroying: false,
          destroyTimer: 0,
          towerSide: 'right',
          pairId,
          matched: false,
        });
      });
    } else if (this.activeGameId === 'spelling-hop') {
      this.roundDuration = 22 / speedMult;
      this.roundTimeLeft = this.roundDuration;
      this.owlPos.set(0, 0.08, 4.9);
      this.owlTargetPos.set(0, 0.08, 4.9);
      this.owlJumpT = 1;
      if (this.owlRef) this.owlRef.group.position.copy(this.owlPos);
      this.spawnSpellingStepIslands();
    } else if (this.activeGameId === 'synonym-defense') {
      this.roundDuration = 16.0 / speedMult;
      this.roundTimeLeft = this.roundDuration;
      const xSlots = [-4.2, -1.4, 1.4, 4.2];
      q.options.forEach((opt, i) => {
        const meteor = buildCrystalMeteor(opt.label, i + 1, OPTION_COLORS[i % OPTION_COLORS.length], this.maxAnisotropy);
        const startPos = new THREE.Vector3(xSlots[i], 4.6 + (i % 2) * 0.55, -5.2);
        meteor.position.copy(startPos);
        meteor.userData.optionIndex = i;
        this.dynamicTargetsRoot.add(meteor);
        this.targets.push({
          optionIndex: i,
          option: opt,
          group: meteor,
          basePos: startPos,
          hitFlashTimer: 0,
          destroying: false,
          destroyTimer: 0,
        });
      });
    } else if (this.activeGameId === 'rpg-street') {
      this.roundDuration = 20 / speedMult;
      this.roundTimeLeft = this.roundDuration;
      const npcSlot = this.rpgNpcs[this.roundIndex];
      if (npcSlot) {
        this.rpgTargetZ = npcSlot.zPos + 3.0;
        // Walk smoothly toward the next villager down the cobblestone road
        this.rpgState = Math.abs(this.rpgPlayerZ - this.rpgTargetZ) > 0.4 ? 'walking' : 'talking';
      } else {
        this.rpgState = 'talking';
      }
      if (this.rpgState === 'talking') {
        this.triggerRpgNpcSpeech(q);
      } else {
        this.humanRigQueue.returnToIdleBreath();
      }
    } else if (this.activeGameId === 'vault-rush') {
      this.roundDuration = 11.5 / speedMult;
      this.roundTimeLeft = this.roundDuration;
      q.options.forEach((opt, i) => {
        const xOff = i === 0 ? -2.25 : 2.25;
        const accent = i === 0 ? '#58CC02' : '#FF4B4B';
        const sign = buildWordMonolith(opt.label, i === 0 ? 'O' : 'X', accent, this.maxAnisotropy);
        sign.scale.setScalar(0.62);
        sign.position.set(xOff, 2.35, -0.8);
        sign.userData.optionIndex = i;
        this.dynamicTargetsRoot.add(sign);
        this.targets.push({
          optionIndex: i,
          option: opt,
          group: sign,
          basePos: new THREE.Vector3(xOff, 2.35, -0.8),
          hitFlashTimer: 0,
          destroying: false,
          destroyTimer: 0,
        });
      });
      if (q.speakText) {
        soundEngine.speakEnglish(q.speakText);
      }
    } else if (this.activeGameId === 'voca-tetris') {
      this.roundDuration = 0;
      this.roundTimeLeft = 0;
    }

    this.emitHud(true);
  }

  private spawnSpellingStepIslands(): void {
    this.clearDynamicTargets();
    const q = this.questions[this.roundIndex];
    if (!q || !q.steps) return;
    const step = q.steps[this.spellingStep];
    if (!step) return;

    const zRow = -0.35 - this.spellingStep * 3.1;
    const xCols = [-3.35, 0, 3.35];
    step.choices.forEach((opt, i) => {
      const island = buildSteppingIsland(opt.label, i + 1, OPTION_COLORS[i % OPTION_COLORS.length], this.maxAnisotropy);
      island.position.set(xCols[i], 0, zRow);
      island.userData.optionIndex = i;
      this.dynamicTargetsRoot.add(island);
      this.targets.push({
        optionIndex: i,
        option: opt,
        group: island,
        basePos: new THREE.Vector3(xCols[i], 0, zRow),
        hitFlashTimer: 0,
        destroying: false,
        destroyTimer: 0,
      });
    });
  }

  /** Steer airplane lane in Sky Runner (-1 left, +1 right) */
  public moveLane(delta: number): void {
    if (this.phase !== 'playing' || this.activeGameId !== 'sky-runner') return;
    const next = Math.max(0, Math.min(2, this.activeLane + delta));
    if (next !== this.activeLane) {
      this.activeLane = next;
      soundEngine.playAction(0.95 + next * 0.12);
      this.emitHud(true);
    }
  }

  public setLane(laneIndex: number): void {
    if (this.phase !== 'playing' || this.activeGameId !== 'sky-runner') return;
    const clamped = Math.max(0, Math.min(2, laneIndex));
    if (clamped !== this.activeLane) {
      this.activeLane = clamped;
      soundEngine.playAction(0.95 + clamped * 0.12);
      this.emitHud(true);
    }
  }

  /** Trigger afterburner boost surge straight through the currently aligned Sky Runner gate */
  public boostDash(): void {
    if (this.phase !== 'playing' || this.roundLocked || this.activeGameId !== 'sky-runner') return;
    this.runnerBoostActive = true;
    this.fovKick = 7.5;
    soundEngine.playAction(1.35);
    this.emitHud(true);
  }

  /** Smooth sprint surge toward the next RPG Villager NPC (no abrupt teleporting!) */
  public walkRpgForward(): void {
    if (this.phase !== 'playing' || this.activeGameId !== 'rpg-street') return;
    if (this.rpgState === 'walking') {
      this.rpgSprintBoost = Math.min(1.6, this.rpgSprintBoost + 0.95);
      this.fovKick = Math.min(4.0, this.fovKick + 2.2);
      soundEngine.playAction(1.06);
    }
  }

  /** 3D Voca Tetris tactile player controls */
  public tetrisMove(dx: -1 | 1): void {
    if (this.phase !== 'playing' || this.activeGameId !== 'voca-tetris' || !this.tetrisState) return;
    const ev = this.tetrisState.moveHorizontal(dx);
    if (ev.moved) {
      this.tetrisStage?.triggerLateralNudge(dx);
      soundEngine.playAction(dx > 0 ? 1.06 : 0.96);
      this.emitHud(true);
    }
  }

  public tetrisRotate(dir: 1 | -1 = 1): void {
    if (this.phase !== 'playing' || this.activeGameId !== 'voca-tetris' || !this.tetrisState) return;
    const ev = this.tetrisState.rotate(dir);
    if (ev.rotated) {
      soundEngine.playAction(dir > 0 ? 1.24 : 1.12);
      this.emitHud(true);
    }
  }

  public tetrisSoftDrop(active: boolean): void {
    if (this.activeGameId !== 'voca-tetris' || !this.tetrisState) return;
    this.tetrisState.softDropping = active;
  }

  public tetrisSoftDropStep(): void {
    if (this.phase !== 'playing' || this.activeGameId !== 'voca-tetris' || !this.tetrisState) return;
    const ev = this.tetrisState.softDropStep();
    if (ev.moved) {
      this.score = this.tetrisState.score;
      soundEngine.playAction(0.88);
      this.emitHud(true);
    }
  }

  public tetrisHardDrop(): void {
    if (this.phase !== 'playing' || this.activeGameId !== 'voca-tetris' || !this.tetrisState) return;
    const ev = this.tetrisState.hardDrop();
    this.handleTetrisStepEvent(ev);
  }

  public tetrisHold(): void {
    if (this.phase !== 'playing' || this.activeGameId !== 'voca-tetris' || !this.tetrisState) return;
    const ev = this.tetrisState.hold();
    if (ev.held) {
      soundEngine.playAction(1.18);
      this.emitHud(true);
    }
  }

  private handleTetrisStepEvent(ev: TetrisStepEvent): void {
    if (!this.tetrisState) return;
    this.score = this.tetrisState.score;
    this.coinsEarnedRun = this.tetrisState.coins;
    this.combo = this.tetrisState.combo;
    this.maxCombo = Math.max(this.maxCombo, this.tetrisState.maxCombo);

    if (ev.hardDroppedCells > 0 || ev.locked) {
      this.tetrisStage?.triggerDropImpact(Math.max(1, ev.hardDroppedCells));
      this.trauma = Math.min(1, this.trauma + (ev.hardDroppedCells > 0 ? 0.22 : 0.08));
      soundEngine.playAction(ev.hardDroppedCells > 0 ? 0.78 : 0.9);
    }

    if (ev.linesCleared > 0) {
      this.correctCount += ev.linesCleared;
      this.hitstopTimer = ev.isTetris ? 0.055 : 0.032;
      this.trauma = Math.min(1, this.trauma + (ev.isTetris ? 0.45 : 0.28));
      this.shimmerHitBoost = Math.min(1, ev.isTetris || this.combo >= 3 ? 1.0 : 0.72);
      this.tetrisStage?.triggerDropImpact(6 + ev.linesCleared * 2);
      soundEngine.playCorrect(Math.max(1, this.combo + ev.linesCleared - 1));

      if (this.tetrisStage) {
        for (const row of ev.clearedRows) {
          for (let col = 1; col < TETRIS_COLS; col += 2) {
            this.tetrisStage.cellToWorld(col, row, _v1);
            this.particles.burst(_v1, ev.isTetris ? 0xfacc15 : 0x38bdf8, 8, 9.5);
          }
        }
      }

      const activeQ = this.questions[this.roundIndex];
      if (activeQ) {
        this.solvedWords.push(activeQ.wordEntry);
        soundEngine.speakEnglish(activeQ.wordEntry.word);
        this.setFeedback(
          'correct',
          `${this.tetrisState.lastClearLabel ?? 'LINE CLEAR!'} · +${ev.pointsAwarded}점 · +${ev.coinsAwarded}C`,
          `${activeQ.wordEntry.word} — ${activeQ.wordEntry.meaning}`,
          getWordMemoryTip(activeQ.wordEntry),
          activeQ.wordEntry
        );
        this.tetrisFeedbackClearTimer = 2.6;
        this.roundIndex = (this.roundIndex + 1) % Math.max(1, this.questions.length);
      }
    }

    if (ev.victory || this.tetrisState.victory) {
      this.hearts = Math.max(1, this.hearts);
      this.finishRun();
      return;
    }

    if (ev.toppedOut || this.tetrisState.gameOver) {
      this.hearts = 0;
      this.wrongCount += 1;
      this.finishRun();
      return;
    }

    this.emitHud(true);
  }

  /** Tower Crash 3-Pair Matching Selection (Click Left English Tower + Right Korean Tower) */
  public selectTowerCard(side: 'left' | 'right', pairId: string): void {
    if (this.phase !== 'playing' || this.roundLocked || this.activeGameId !== 'tower-crash') return;
    if (this.towerMatchedPairIds.includes(pairId)) return;

    const q = this.questions[this.roundIndex];
    if (!q?.matchPairs) return;

    // First selection or switching within the same side
    if (!this.towerSelectedSide || this.towerSelectedSide === side) {
      this.towerSelectedSide = side;
      this.towerSelectedPairId = pairId;
      this.updateTowerHighlightRings();
      soundEngine.playAction(side === 'left' ? 1.05 : 1.15);

      const pairObj = q.matchPairs.pairs.find((p) => p.pairId === pairId);
      if (pairObj && side === 'left') {
        soundEngine.speakEnglish(pairObj.wordEntry.word);
      }
      this.emitHud(true);
      return;
    }

    // Opposite side tapped — check if they form a matching English ↔ Korean pair!
    const firstPairId = this.towerSelectedPairId!;
    const isMatch = firstPairId === pairId;
    const leftTarget = this.targets.find((t) => t.towerSide === 'left' && t.pairId === (side === 'left' ? pairId : firstPairId));
    const rightTarget = this.targets.find((t) => t.towerSide === 'right' && t.pairId === (side === 'right' ? pairId : firstPairId));
    const pairObj = q.matchPairs.pairs.find((p) => p.pairId === pairId);

    this.towerSelectedSide = null;
    this.towerSelectedPairId = null;
    this.updateTowerHighlightRings();

    // Aim & fire twin cannon lasers!
    if (this.turretRef && leftTarget && rightTarget) {
      this.turretRecoil = 0.6;
      soundEngine.playLaser();
      const turretMuzzle = new THREE.Vector3(0, 1.5, 3.8);
      const col = isMatch ? 0x58cc02 : 0xff4b4b;
      this.spawnBeam(turretMuzzle, leftTarget.group.position.clone().add(_v1.set(0, 1.4, 0)), col, true);
      this.spawnBeam(turretMuzzle, rightTarget.group.position.clone().add(_v1.set(0, 1.4, 0)), col, true);
    }

    if (isMatch && leftTarget && rightTarget && pairObj) {
      leftTarget.matched = true;
      rightTarget.matched = true;
      leftTarget.destroying = true;
      rightTarget.destroying = true;
      this.towerMatchedPairIds = [...this.towerMatchedPairIds, pairId];

      const outcome = evaluateAnswer({
        isCorrect: true,
        currentCombo: this.combo,
        currentHearts: this.hearts,
        timerRatio: this.roundDuration > 0 ? this.roundTimeLeft / this.roundDuration : 0.5,
        gameId: 'tower-crash',
        difficulty: this.settings.difficulty,
        speed: this.settings.speed,
      });
      this.combo = outcome.nextCombo;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.score += outcome.pointsAwarded;
      this.coinsEarnedRun += outcome.coinsAwarded;
      this.correctCount += 1;
      this.solvedWords.push(pairObj.wordEntry);
      this.hitstopTimer = 0.04;
      this.trauma = Math.min(1, this.trauma + 0.35);
      if (this.combo >= 2) {
        this.shimmerHitBoost = Math.min(1, outcome.isFever ? 1.0 : 0.72);
      }

      this.particles.burst(leftTarget.group.position.clone().add(_v1.set(0, 1.4, 0)), 0xffb800, 22, 9);
      this.particles.burst(rightTarget.group.position.clone().add(_v1.set(0, 1.4, 0)), 0x58cc02, 22, 9);
      soundEngine.playCorrect(this.combo);

      const allCleared = this.towerMatchedPairIds.length >= q.matchPairs.pairs.length;
      this.setFeedback(
        'correct',
        allCleared
          ? `웨이브 완벽 격파! +${outcome.pointsAwarded}점 · +${outcome.coinsAwarded}코인`
          : `짝 맞추기 성공! (${this.towerMatchedPairIds.length}/3) +${outcome.coinsAwarded}코인`,
        `${pairObj.wordEntry.word} = ${pairObj.wordEntry.meaning}`,
        getWordMemoryTip(pairObj.wordEntry),
        pairObj.wordEntry
      );

      if (allCleared) {
        this.roundLocked = true;
        this.nextRoundDelay = 1.35;
      }
      this.emitHud(true);
    } else {
      // Wrong pair — deduct heart, shake, show correct meaning of the tapped English word, let player keep matching!
      const engPairId = side === 'left' ? pairId : firstPairId;
      const engPair = q.matchPairs.pairs.find((p) => p.pairId === engPairId);
      this.combo = 0;
      this.shimmerHitBoost = 0;
      this.wrongCount += 1;
      this.hearts = Math.max(0, this.hearts - 1);
      this.trauma = Math.min(1, this.trauma + 0.6);
      soundEngine.playWrong();
      if (engPair) {
        if (!this.missedWords.some((w) => w.id === engPair.wordEntry.id)) {
          this.missedWords.push(engPair.wordEntry);
        }
        soundEngine.speakEnglish(engPair.wordEntry.word);
      }

      this.setFeedback(
        'wrong',
        '짝이 맞지 않아요! 하트 -1',
        engPair ? `힌트: ${engPair.wordEntry.word} = ${engPair.wordEntry.meaning}` : undefined,
        engPair ? getWordMemoryTip(engPair.wordEntry) : undefined,
        engPair?.wordEntry
      );

      if (this.hearts <= 0) {
        this.roundLocked = true;
        this.nextRoundDelay = 0.9;
      }
      this.emitHud(true);
    }
  }

  private updateTowerHighlightRings(): void {
    for (const t of this.targets) {
      const ring = t.group.getObjectByName('targetLockRing') as THREE.Mesh | undefined;
      if (ring && ring.material instanceof THREE.MeshStandardMaterial) {
        const isSel =
          t.towerSide === this.towerSelectedSide && t.pairId === this.towerSelectedPairId && !t.matched;
        ring.material.opacity = isSel ? 0.95 : 0.0;
      }
    }
  }

  /** Primary unified player action for single-choice games (sky-runner, spelling-hop, synonym-defense, vault-rush, rpg-street) */
  public selectOption(optionIndex: number): void {
    if (this.phase !== 'playing' || this.roundLocked) return;
    const q = this.questions[this.roundIndex];
    if (!q) return;

    if (this.activeGameId === 'sky-runner') {
      this.setLane(optionIndex);
      this.boostDash();
      return;
    }

    if (this.activeGameId === 'voca-tetris') {
      if (!this.tetrisState || this.tetrisState.gameOver || this.tetrisState.victory) return;
      const opt = q.options[optionIndex];
      if (!opt) return;
      if (opt.isCorrect) {
        const blastEv = this.tetrisState.triggerWordBlastClear();
        this.handleTetrisStepEvent(blastEv);
      } else {
        this.wrongCount += 1;
        if (!this.missedWords.some((w) => w.id === q.wordEntry.id)) {
          this.missedWords.push(q.wordEntry);
        }
        this.tetrisState.combo = 0;
        this.combo = 0;
        this.trauma = Math.min(1, this.trauma + 0.25);
        soundEngine.playWrong();
        soundEngine.speakEnglish(q.wordEntry.word);
        this.setFeedback(
          'wrong',
          `아쉬워요! 정답: ${q.wordEntry.word} = ${q.wordEntry.meaning}`,
          '블록은 계속 진행돼요 · 다음 단어로 폭탄을 노려보세요!',
          getWordMemoryTip(q.wordEntry),
          q.wordEntry
        );
        this.tetrisFeedbackClearTimer = 2.4;
        this.roundIndex = (this.roundIndex + 1) % Math.max(1, this.questions.length);
        this.emitHud(true);
      }
      return;
    }

    if (this.activeGameId === 'rpg-street') {
      if (this.rpgState === 'walking') {
        this.walkRpgForward();
        return;
      }
      const opt = q.options[optionIndex];
      if (!opt) return;
      this.resolveRoundOutcome(opt.isCorrect);
      return;
    }

    const target = this.targets[optionIndex];
    if (!target) return;

    if (this.activeGameId === 'spelling-hop') {
      this.handleSpellingChoice(target);
      return;
    }

    const targetWorld = target.group.position.clone().add(_v1.set(0, 1.0, 0));

    if (this.activeGameId === 'synonym-defense' && this.domeRef) {
      soundEngine.playLaser();
      this.spawnBeam(
        new THREE.Vector3(0, 2.5, 3.2),
        targetWorld,
        target.option.isCorrect ? 0x38bdf8 : 0xff4b4b,
        false
      );
    } else if (this.activeGameId === 'vault-rush' && this.vaultRef) {
      if (optionIndex === 0) this.leftLeverTilt = 0.85;
      else this.rightLeverTilt = 0.85;
      soundEngine.playAction(optionIndex === 0 ? 1.2 : 0.85);
    }

    this.resolveRoundOutcome(target.option.isCorrect, target);
  }

  private handleSpellingChoice(target: InteractiveTarget): void {
    const q = this.questions[this.roundIndex];
    if (!q || !q.steps) return;

    this.owlStartPos.copy(this.owlPos);
    this.owlTargetPos.set(target.group.position.x, 0.1, target.group.position.z);
    this.owlJumpT = 0;
    this.owlSquashY = 1.28;
    soundEngine.playAction(1.15);

    if (target.option.isCorrect) {
      this.spellingBuilt += target.option.label;
      this.particles.burst(target.group.position.clone().add(_v1.set(0, 0.8, 0)), 0x58cc02, 18, 7.5);

      if (this.spellingStep < 2) {
        this.spellingStep += 1;
        soundEngine.playCorrect(this.combo + this.spellingStep);
        this.setFeedback('correct', `징검다리 통과! (${this.spellingStep}/3): ${this.spellingBuilt}···`, '다음 징검다리 음절을 밟으세요!');
        this.spawnSpellingStepIslands();
        this.emitHud(true);
      } else {
        this.resolveRoundOutcome(true, target);
      }
    } else {
      this.particles.burst(target.group.position.clone().add(_v1.set(0, 0.8, 0)), 0xff4b4b, 20, 6.5);
      this.resolveRoundOutcome(false, target);
    }
  }

  private spawnBeam(start: THREE.Vector3, end: THREE.Vector3, colorHex: number, isOrb: boolean): void {
    let mesh: THREE.Mesh;
    if (isOrb) {
      mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.36, 12, 12),
        new THREE.MeshStandardMaterial({
          color: colorHex,
          emissive: colorHex,
          emissiveIntensity: 1.5,
          roughness: 0.12,
        })
      );
      mesh.position.copy(start);
    } else {
      const dist = start.distanceTo(end);
      const geo = new THREE.CylinderGeometry(0.11, 0.11, dist, 8);
      geo.rotateX(Math.PI / 2);
      mesh = new THREE.Mesh(
        geo,
        new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.94 })
      );
      mesh.position.copy(start).lerp(end, 0.5);
      mesh.lookAt(end);
    }
    this.fxRoot.add(mesh);
    this.beams.push({
      mesh,
      life: 0,
      maxLife: isOrb ? 0.26 : 0.28,
      start: start.clone(),
      end: end.clone(),
      isOrb,
    });
  }

  private resolveRoundOutcome(isCorrect: boolean, hitTarget?: InteractiveTarget): void {
    if (this.roundLocked) return;
    this.roundLocked = true;

    const q = this.questions[this.roundIndex];
    const timerRatio = this.roundDuration > 0 ? this.roundTimeLeft / this.roundDuration : 0;
    const outcome = evaluateAnswer({
      isCorrect,
      currentCombo: this.combo,
      currentHearts: this.hearts,
      timerRatio,
      gameId: this.activeGameId,
      difficulty: this.settings.difficulty,
      speed: this.settings.speed,
    });

    this.combo = outcome.nextCombo;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.hearts = outcome.nextHearts;

    let burstOrigin = hitTarget
      ? hitTarget.group.position.clone().add(_v1.set(0, 1.4, 0))
      : new THREE.Vector3(0, 2.0, 0);

    if (this.activeGameId === 'rpg-street') {
      const npcSlot = this.rpgNpcs[this.roundIndex];
      if (npcSlot) {
        burstOrigin = new THREE.Vector3(npcSlot.xPos, 2.4, npcSlot.zPos);
        if (isCorrect) {
          npcSlot.cleared = true;
          this.rpgState = 'celebrating';
          if (npcSlot.rig.questMarker) {
            npcSlot.rig.questMarker.visible = false;
          }
        }
      }
    }

    if (isCorrect) {
      this.score += outcome.pointsAwarded;
      this.coinsEarnedRun += outcome.coinsAwarded;
      this.correctCount += 1;
      if (q) this.solvedWords.push(q.wordEntry);

      this.hitstopTimer = 0.045;
      this.trauma = Math.min(1, this.trauma + 0.32);
      this.fovKick = this.activeGameId === 'sky-runner' ? 6.5 : 2.5;
      this.vaultGearSpinBoost = 12;
      if (this.combo >= 2) {
        this.shimmerHitBoost = Math.min(1, outcome.isFever ? 1.0 : 0.72);
      }

      if (hitTarget) {
        hitTarget.destroying = true;
        hitTarget.hitFlashTimer = 0.08;
      }
      this.particles.burst(burstOrigin, 0xffb800, outcome.isFever ? 38 : 24, outcome.isFever ? 12 : 9.5);
      this.particles.burst(burstOrigin, outcome.isFever ? 0x1cb0f6 : 0x58cc02, 16, 8);
      soundEngine.playCorrect(this.combo);

      const comboLabel = outcome.isFever
        ? ` · FEVER ${this.combo} COMBO!`
        : this.combo >= 2
          ? ` · ${this.combo} COMBO!`
          : '';
      const subText =
        this.activeGameId === 'rpg-street' && q?.rpgDialogue
          ? `${q.rpgDialogue.npcName}: "${q.rpgDialogue.replySuccessKo}"`
          : q
            ? `${q.wordEntry.word} — ${q.wordEntry.meaning}`
            : undefined;

      if (this.activeGameId === 'rpg-street' && q?.rpgDialogue) {
        this.humanRigQueue.enqueueSequence(
          [{ text: q.rpgDialogue.replySuccessKo, emotion: '축하', durationMs: 1100 }],
          { interrupt: true }
        );
      }

      this.setFeedback(
        'correct',
        `+${outcome.pointsAwarded}점 · +${outcome.coinsAwarded}코인${comboLabel}`,
        subText,
        q ? getWordMemoryTip(q.wordEntry) : undefined,
        q?.wordEntry
      );
    } else {
      this.shimmerHitBoost = 0;
      this.wrongCount += 1;
      if (q && !this.missedWords.some((w) => w.id === q.wordEntry.id)) {
        this.missedWords.push(q.wordEntry);
      }
      // Instant Active Recall for non-RPG/non-pair modes
      if (
        q &&
        !q.isRevengeReview &&
        this.activeGameId !== 'rpg-street' &&
        this.activeGameId !== 'tower-crash' &&
        this.hearts > 0 &&
        this.revengeQueuedCount < 2
      ) {
        this.revengeQueuedCount += 1;
        const insertAt = Math.min(this.questions.length, this.roundIndex + 3);
        this.questions.splice(insertAt, 0, {
          ...q,
          id: `${q.id}-revenge-${this.revengeQueuedCount}`,
          promptBadge: `복습 찬스! · ${q.promptBadge}`,
          isRevengeReview: true,
        });
      }
      this.hitstopTimer = 0.055;
      this.trauma = Math.min(1, this.trauma + 0.65);
      this.particles.burst(burstOrigin, 0xff4b4b, 22, 8);
      soundEngine.playWrong();
      if (q) {
        soundEngine.speakEnglish(q.wordEntry.word);
      }

      const correctOpt = q?.options.find((o) => o.isCorrect);
      let answerNote = '오답! 하트 -1';
      if (this.activeGameId === 'spelling-hop' && q) {
        answerNote = `정답: ${q.wordEntry.chunks.join(' + ')} = ${q.wordEntry.word} (${q.wordEntry.meaning})`;
      } else if (this.activeGameId === 'synonym-defense' && q) {
        const relLabel = q.relationMode === 'SYNONYM' ? '동의어' : '반대어';
        const targetWord = q.relationMode === 'SYNONYM' ? q.wordEntry.synonym : q.wordEntry.antonym;
        const targetKo = q.relationMode === 'SYNONYM' ? q.wordEntry.synonymKo : q.wordEntry.antonymKo;
        answerNote = `${relLabel} 정답: ${targetWord} (${targetKo}) · ${q.wordEntry.word} (${q.wordEntry.meaning})`;
      } else if (correctOpt && q) {
        answerNote = `정답: ${correctOpt.label} · ${q.wordEntry.word} (${q.wordEntry.meaning})`;
      }

      if (this.activeGameId === 'rpg-street') {
        this.humanRigQueue.enqueueSequence(
          [{ text: '아쉽지만 다시 한 번 확인해 봐요.', emotion: '아쉬움', durationMs: 1150 }],
          { interrupt: true }
        );
      }

      this.setFeedback(
        'wrong',
        this.hearts > 0 ? '오답! 정답을 확인하고 다음으로 넘어가요' : '하트가 모두 소진되었습니다',
        answerNote,
        q ? getWordMemoryTip(q.wordEntry) : undefined,
        q?.wordEntry
      );
    }

    this.nextRoundDelay = this.hearts <= 0 ? 0.9 : isCorrect ? 1.25 : 1.95;
    this.emitHud(true);
  }

  private setFeedback(
    type: 'correct' | 'wrong' | 'info',
    text: string,
    subText?: string,
    memoryTip?: string,
    wordDetail?: CsatWord
  ): void {
    this.feedbackCounter += 1;
    this.lastFeedback = { type, text, subText, memoryTip, wordDetail, id: this.feedbackCounter };
  }

  private finishRun(): void {
    this.humanRigQueue.returnToIdleBreath();
    this.phase = 'gameover';
    this.callbacks.onPhaseChange('gameover');
    const summary = buildRunSummary({
      gameId: this.activeGameId,
      score: this.score,
      previousBestScore: this.previousBestScore,
      baseCoins: this.coinsEarnedRun,
      correctCount: this.correctCount,
      wrongCount: this.wrongCount,
      totalRounds:
        this.activeGameId === 'tower-crash'
          ? this.questions.length * 3
          : this.activeGameId === 'voca-tetris'
            ? this.tetrisState?.targetLines ?? TETRIS_TARGET_LINES
            : this.questions.length,
      maxCombo: this.maxCombo,
      heartsRemaining: this.hearts,
      missedWords: this.missedWords,
      durationSec: this.runElapsedSec,
    });
    soundEngine.playFanfare(summary.isVictory);
    if (summary.isVictory) {
      this.particles.burst(new THREE.Vector3(0, 3.0, 0), 0xffb800, 36, 11);
    }
    this.emitHud(true);
    this.callbacks.onRunFinish(summary, this.solvedWords);
  }

  private handleCanvasPointerDown = (event: PointerEvent): void => {
    if (this.phase !== 'playing' || this.roundLocked) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    _pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    _pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(_pointerNdc, this.camera);
    const roots = this.targets.map((t) => t.group);
    const hits = this.raycaster.intersectObjects(roots, true);

    if (hits.length > 0) {
      let node: THREE.Object3D | null = hits[0].object;
      while (node && node.userData.optionIndex === undefined && node.userData.pairId === undefined) {
        node = node.parent;
      }
      if (node && node.userData.pairId && node.userData.towerSide) {
        this.selectTowerCard(node.userData.towerSide, node.userData.pairId);
        return;
      }
      if (node && typeof node.userData.optionIndex === 'number') {
        this.selectOption(node.userData.optionIndex);
        return;
      }
    }

    if (this.activeGameId === 'sky-runner') {
      const relX = (event.clientX - rect.left) / rect.width;
      const lane = relX < 0.34 ? 0 : relX > 0.66 ? 2 : 1;
      this.setLane(lane);
    } else if (this.activeGameId === 'rpg-street' && this.rpgState === 'walking') {
      this.walkRpgForward();
    }
  };

  public speakCurrentPrompt(): void {
    const q = this.questions[this.roundIndex];
    if (!q) return;
    if (q.rpgDialogue) {
      this.triggerRpgNpcSpeech(q);
      return;
    }
    const text = q.speakText || q.wordEntry.word;
    this.humanRigQueue.enqueueSequence(text, { interrupt: true });
    soundEngine.speakEnglish(text, {
      onEnd: () => this.humanRigQueue.notifySpeechEnded(),
    });
  }

  private emitHud(force = false): void {
    const now = performance.now();
    if (!force && now - this.lastHudEmit < 100) return;
    this.lastHudEmit = now;

    const q = this.questions[this.roundIndex] ?? null;
    const meta = getGameMeta(this.activeGameId);
    const rpgTotalDist = Math.max(1, this.questions.length * 11.5);
    const rpgDistPct = Math.min(100, Math.max(0, Math.round(((6 - this.rpgPlayerZ) / rpgTotalDist) * 100)));

    const tetrisHud =
      this.activeGameId === 'voca-tetris' && this.tetrisState
        ? {
            ...this.tetrisState.getHudState(),
            currentWord: q?.wordEntry ?? null,
          }
        : undefined;

    this.callbacks.onHudUpdate({
      gameId: this.activeGameId,
      phase: this.phase,
      roundIndex: this.activeGameId === 'voca-tetris' && this.tetrisState ? this.tetrisState.lines : this.roundIndex,
      totalRounds:
        this.activeGameId === 'voca-tetris' && this.tetrisState
          ? this.tetrisState.targetLines
          : this.questions.length || meta.roundsPerRun,
      score: Math.round(this.score),
      combo: this.combo,
      maxCombo: this.maxCombo,
      isFever: this.combo >= 3,
      hearts: this.hearts,
      maxHearts: MAX_HEARTS,
      coinsEarnedRun: Math.round(this.coinsEarnedRun),
      timerRatio: this.roundDuration > 0 ? Math.max(0, Math.min(1, this.roundTimeLeft / this.roundDuration)) : 1,
      activeLane: this.activeLane,
      spellingStep: this.spellingStep,
      spellingBuilt: this.spellingBuilt,
      towerSelectedSide: this.towerSelectedSide,
      towerSelectedPairId: this.towerSelectedPairId,
      towerMatchedPairIds: this.towerMatchedPairIds,
      rpgState: this.rpgState,
      rpgDistancePct: rpgDistPct,
      tetris: tetrisHud,
      question: q,
      feedbackBanner: this.lastFeedback,
    });
  }

  private updateSimulation(dt: number): void {
    this.elapsedTotal += dt;

    for (let i = 0; i < this.clouds.length; i++) {
      const c = this.clouds[i];
      c.position.x += Math.sin(this.elapsedTotal * 0.12 + i) * 0.2 * dt;
      c.position.y += Math.cos(this.elapsedTotal * 0.3 + i) * 0.08 * dt;
    }

    this.trauma = Math.max(0, this.trauma - dt * 1.9);
    this.fovKick = THREE.MathUtils.damp(this.fovKick, 0, 7, dt);

    const simDt = this.hitstopTimer > 0 ? 0 : dt;
    if (this.hitstopTimer > 0) {
      this.hitstopTimer = Math.max(0, this.hitstopTimer - dt);
    }

    this.particles.update(dt);
    this.updateBeams(dt);

    if (this.phase === 'title') {
      this.updateHubDiorama(dt);
      return;
    }
    if (this.phase === 'paused') {
      return;
    }

    if (this.phase === 'playing') {
      this.runElapsedSec += simDt;

      if (this.roundLocked) {
        this.nextRoundDelay -= dt;
        if (this.nextRoundDelay <= 0) {
          if (this.hearts <= 0 || this.roundIndex + 1 >= this.questions.length) {
            this.finishRun();
          } else {
            this.roundIndex += 1;
            this.setupCurrentRound();
          }
        }
      } else if (this.activeGameId !== 'voca-tetris') {
        // Pause countdown while RPG character is walking to the next NPC
        if (!(this.activeGameId === 'rpg-street' && this.rpgState === 'walking')) {
          this.roundTimeLeft = Math.max(0, this.roundTimeLeft - simDt);
          if (this.roundTimeLeft <= 0) {
            this.resolveRoundOutcome(false);
          }
        }
      }
    }

    if (this.activeGameId === 'sky-runner') {
      this.updateSkyRunner(simDt);
    } else if (this.activeGameId === 'tower-crash') {
      this.updateTowerCrash(simDt);
    } else if (this.activeGameId === 'spelling-hop') {
      this.updateSpellingHop(simDt);
    } else if (this.activeGameId === 'synonym-defense') {
      this.updateSynonymDefense(simDt);
    } else if (this.activeGameId === 'rpg-street') {
      this.updateRpgStreet(simDt);
    } else if (this.activeGameId === 'voca-tetris') {
      this.updateTetris(simDt);
    } else if (this.activeGameId === 'vault-rush') {
      this.updateVaultRush(simDt);
    }

    for (const t of this.targets) {
      if (t.destroying) {
        t.destroyTimer += dt;
        const shrink = Math.max(0.01, 1 - t.destroyTimer * 3.8);
        t.group.scale.setScalar(shrink);
        t.group.rotation.y += dt * 10;
        t.group.position.y += dt * 3.5;
      }
    }

    this.updateComboShimmerEffects(dt);
    this.applyCameraRig(dt);
    this.emitHud(false);
  }

  private getActiveHeroRoot(): THREE.Object3D | null {
    if (this.activeGameId === 'sky-runner') return this.runnerGlider?.group ?? null;
    if (this.activeGameId === 'tower-crash') return this.turretRef?.group ?? null;
    if (this.activeGameId === 'spelling-hop') return this.owlRef?.group ?? null;
    if (this.activeGameId === 'synonym-defense') return this.domeRef?.group ?? null;
    if (this.activeGameId === 'rpg-street') return this.rpgPlayer?.group ?? null;
    return this.vaultRef?.group ?? null;
  }

  /**
   * Subtle traveling-wave PBR shimmer, orbiting 3D Fever Aura, rim-light warmth,
   * and rising ambient sparkle motes when player hits high-combo (>= 2) or Fever (>= 3).
   */
  private updateComboShimmerEffects(dt: number): void {
    this.shimmerHitBoost = THREE.MathUtils.damp(this.shimmerHitBoost, 0, 3.2, Math.max(dt, 0.008));

    const shimmer = computeShimmerState({
      combo: this.combo,
      isFever: this.combo >= 3,
      elapsed: this.elapsedTotal,
      hitBoost: this.shimmerHitBoost,
    });

    const heroRoot = this.getActiveHeroRoot();
    applyAssetShimmer(heroRoot, shimmer, 1.0);

    // Subtle secondary glow pulse across live 3D word targets to reinforce Fever intensity
    for (let i = 0; i < this.targets.length; i++) {
      const t = this.targets[i];
      if (!t.destroying) {
        applyAssetShimmer(t.group, shimmer, 0.65);
      }
    }

    // Active NPC in RPG street also receives warm shimmer celebration glow in Fever
    if (this.activeGameId === 'rpg-street') {
      const activeNpc = this.rpgNpcs[this.roundIndex];
      if (activeNpc) {
        applyAssetShimmer(activeNpc.rig.group, shimmer, 0.72);
      }
    }

    updateFeverAuraRig(this.activeHeroAura, shimmer, this.elapsedTotal, dt);

    // Subtly shift rim-light intensity & warmth during Fever Mode
    if (this.rimLightRef) {
      const targetIntensity = shimmer.isFever
        ? 1.15 + shimmer.pulseWave * 0.35
        : shimmer.active
          ? 0.96
          : 0.8;
      this.rimLightRef.intensity = THREE.MathUtils.damp(this.rimLightRef.intensity, targetIntensity, 6, dt);
      this.rimLightRef.color.setHex(shimmer.isFever ? 0xfde047 : 0x7dd3fc);
    }

    // Gentle rising golden-cyan shimmer motes around hero during Fever Mode
    if (shimmer.isFever && heroRoot && this.phase === 'playing') {
      this.feverSparkleAccum += dt;
      if (this.feverSparkleAccum >= 0.24) {
        this.feverSparkleAccum = 0;
        const a = this.elapsedTotal * 3.1;
        _v1.set(
          heroRoot.position.x + Math.cos(a) * 1.15,
          heroRoot.position.y + 0.9,
          heroRoot.position.z + Math.sin(a) * 1.15
        );
        this.particles.burst(_v1, shimmer.tintColorHex, 3, 4.2);
      }
    } else {
      this.feverSparkleAccum = 0;
    }
  }

  private updateHubDiorama(dt: number): void {
    if (this.hubDioramaGroup) {
      this.hubDioramaGroup.rotation.y = Math.sin(this.elapsedTotal * 0.25) * 0.18;
    }
    if (this.hubOwl) {
      this.hubOwl.group.position.y = 0.16 + Math.abs(Math.sin(this.elapsedTotal * 2.2)) * 0.12;
      animateScholarOwl(this.hubOwl, 'idle', this.elapsedTotal, dt, 0.2);
    }
    if (this.hubHero) {
      const rigClass = this.humanRigQueue.getState().activeClass;
      animateStylizedCharacter(
        this.hubHero,
        rigClass === 'idleBreath' ? 'wave' : 'talk',
        this.elapsedTotal,
        dt,
        0.15,
        rigClass
      );
    }
    if (this.hubGlider) {
      // FIXED AIRPLANE ORIENTATION: nose (-Z) strictly leads the orbital velocity vector!
      const a = this.elapsedTotal * 0.65;
      const radius = 5.6;
      this.hubGlider.group.position.set(
        Math.cos(a) * radius,
        3.4 + Math.sin(a * 2) * 0.32,
        Math.sin(a) * radius
      );
      this.hubGlider.group.rotation.y = Math.PI - a; // Mathematically exact forward heading!
      this.hubGlider.group.rotation.z = -0.24; // Natural inward bank angle
      this.hubGlider.propeller.rotation.z += dt * 26;
      const pulse = 0.85 + Math.sin(this.elapsedTotal * 22) * 0.2;
      this.hubGlider.flames.forEach((f) => f.scale.set(1, pulse, 1));
    }
    const isPortrait = this.camera.aspect < 0.85;
    if (isPortrait) {
      _camBasePos.set(Math.sin(this.elapsedTotal * 0.18) * 0.85, 6.3, 17.0);
      _camLookTarget.set(0, -1.5, -0.6);
    } else {
      _camBasePos.set(Math.sin(this.elapsedTotal * 0.18) * 1.4, 5.0, 14.0);
      _camLookTarget.set(0, 1.5, -0.8);
    }
    this.camera.position.lerp(_camBasePos, 1 - Math.exp(-3 * dt));
    this.camera.lookAt(_camLookTarget);
  }

  private updateSkyRunner(simDt: number): void {
    const safeDt = Math.max(simDt, 0.008);
    const speedMult = getSpeedMultiplier(this.settings.speed);
    if (this.runnerTrackTex) {
      const boostFactor = this.runnerBoostActive ? 3.4 : this.combo >= 3 ? 2.15 : 1.5;
      this.runnerTrackTex.offset.y -= simDt * boostFactor * speedMult;
    }

    // Second-order critically damped spring physics for buttery, weighty jet steering!
    const targetX = LANE_X[this.activeLane];
    const springK = 140;
    const springDamp = 19;
    const accelX = (targetX - this.gliderX) * springK - this.gliderVelX * springDamp;
    this.gliderVelX += accelX * safeDt;
    this.gliderX += this.gliderVelX * safeDt;

    const targetRoll = THREE.MathUtils.clamp(-this.gliderVelX * 0.055, -0.42, 0.42);
    this.gliderRoll = THREE.MathUtils.damp(this.gliderRoll, targetRoll, 11, safeDt);
    const targetPitch = this.runnerBoostActive ? -0.11 : Math.sin(this.elapsedTotal * 3.1) * 0.032;
    this.gliderPitch = THREE.MathUtils.damp(this.gliderPitch, targetPitch, 9, safeDt);

    if (this.runnerLaneBeam) {
      this.runnerLaneBeam.position.x = this.gliderX;
    }

    if (this.runnerGlider) {
      this.runnerGlider.group.position.x = this.gliderX;
      this.runnerGlider.group.position.y = 0.24 + Math.sin(this.elapsedTotal * 4.2) * 0.085;
      this.runnerGlider.group.rotation.y = 0; // Strictly forward (-Z) into the sky gates!
      this.runnerGlider.group.rotation.z = this.gliderRoll;
      this.runnerGlider.group.rotation.x = this.gliderPitch;
      this.runnerGlider.propeller.rotation.z += simDt * (this.runnerBoostActive ? 46 : 28);
      const flameLen = this.runnerBoostActive ? 1.85 : 0.95 + Math.sin(this.elapsedTotal * 24) * 0.18;
      this.runnerGlider.flames.forEach((f) => f.scale.set(1, flameLen, 1));
    }

    if (this.phase === 'playing' && !this.roundLocked) {
      const baseSpeed = 23.0 / Math.max(1, this.roundDuration);
      const effectiveSpeed = this.runnerBoostActive ? Math.max(baseSpeed * 4.4, 23) : baseSpeed;
      this.gatesZ += effectiveSpeed * simDt;
      for (const t of this.targets) {
        t.group.position.z = this.gatesZ;
        const isSelectedLane = t.optionIndex === this.activeLane;
        const targetScale = isSelectedLane ? 1.07 : 0.95;
        t.group.scale.x = THREE.MathUtils.damp(t.group.scale.x, targetScale, 10, safeDt);
        t.group.scale.y = THREE.MathUtils.damp(t.group.scale.y, targetScale, 10, safeDt);
      }
      if (this.gatesZ >= 0.7) {
        const hitGate = this.targets[this.activeLane];
        this.resolveRoundOutcome(Boolean(hitGate?.option.isCorrect), hitGate);
      }
    }
  }

  private updateTowerCrash(simDt: number): void {
    const safeDt = Math.max(simDt, 0.008);
    if (this.turretRef) {
      if (this.towerSelectedPairId && this.towerSelectedSide) {
        const sel = this.targets.find(
          (t) => t.towerSide === this.towerSelectedSide && t.pairId === this.towerSelectedPairId
        );
        if (sel) {
          const dx = sel.group.position.x - this.turretRef.group.position.x;
          const dz = sel.group.position.z - this.turretRef.group.position.z;
          this.turretTargetYaw = Math.atan2(-dx, -dz);
        }
      }
      this.turretRef.turretHead.rotation.y = THREE.MathUtils.damp(
        this.turretRef.turretHead.rotation.y,
        this.turretTargetYaw,
        12,
        safeDt
      );
      this.turretRecoil = THREE.MathUtils.damp(this.turretRecoil, 0, 10, safeDt);
      this.turretRef.turretHead.position.z = this.turretRecoil;
    }
    for (let i = 0; i < this.targets.length; i++) {
      const t = this.targets[i];
      if (!t.destroying) {
        const isSel = t.towerSide === this.towerSelectedSide && t.pairId === this.towerSelectedPairId;
        const targetY = t.basePos.y + (isSel ? 0.36 : 0) + Math.sin(this.elapsedTotal * 2.4 + i * 1.1) * 0.09;
        t.group.position.y = THREE.MathUtils.damp(t.group.position.y, targetY, 12, safeDt);
      }
    }
  }

  private updateSpellingHop(simDt: number): void {
    const safeDt = Math.max(simDt, 0.008);
    if (this.riverWaterTex) {
      this.riverWaterTex.offset.y += simDt * 0.28;
      this.riverWaterTex.offset.x += simDt * 0.08;
    }
    if (this.owlRef) {
      const shimmerEnergy = this.combo >= 3 ? 1 : this.combo >= 2 ? 0.5 : 0;
      if (this.owlJumpT < 1) {
        const prevT = this.owlJumpT;
        this.owlJumpT = Math.min(1, this.owlJumpT + simDt * 2.55);
        // True smooth ease-in-out horizontal travel + physical parabolic gravity arc 4t(1-t)
        const easeHoriz = this.owlJumpT * this.owlJumpT * (3 - 2 * this.owlJumpT);
        const arc = 4 * this.owlJumpT * (1 - this.owlJumpT) * 2.3;
        this.owlPos.lerpVectors(this.owlStartPos, this.owlTargetPos, easeHoriz);
        this.owlRef.group.position.set(this.owlPos.x, this.owlPos.y + arc, this.owlPos.z);
        this.owlRef.group.rotation.x = THREE.MathUtils.damp(
          this.owlRef.group.rotation.x,
          (0.5 - this.owlJumpT) * 0.35,
          14,
          safeDt
        );
        if (prevT === 0) {
          this.owlSquashY = 1.22; // Crisp takeoff stretch!
        }
        animateScholarOwl(this.owlRef, 'jump', this.elapsedTotal, simDt, shimmerEnergy);
        if (this.owlJumpT >= 1) {
          this.owlSquashY = 0.72; // Cushioned elastic landing squash!
        }
      } else {
        this.owlRef.group.position.set(
          this.owlPos.x,
          this.owlPos.y + Math.abs(Math.sin(this.elapsedTotal * 2.8)) * 0.085,
          this.owlPos.z
        );
        this.owlRef.group.rotation.x = THREE.MathUtils.damp(this.owlRef.group.rotation.x, 0, 10, safeDt);
        animateScholarOwl(
          this.owlRef,
          this.roundLocked && this.lastFeedback?.type === 'correct' ? 'celebrate' : 'idle',
          this.elapsedTotal,
          simDt,
          shimmerEnergy
        );
      }
      this.owlSquashY = THREE.MathUtils.damp(this.owlSquashY, 1, 10, safeDt);
      const baseScale = 0.8;
      const invSquash = baseScale / Math.sqrt(Math.max(0.5, this.owlSquashY));
      this.owlRef.group.scale.set(invSquash, baseScale * this.owlSquashY, invSquash);
    }
    for (let i = 0; i < this.targets.length; i++) {
      const t = this.targets[i];
      if (!t.destroying) {
        t.group.position.y = Math.sin(this.elapsedTotal * 2.2 + i) * 0.09;
      }
    }
  }

  private updateSynonymDefense(simDt: number): void {
    if (this.domeRef) {
      this.domeRef.ring.rotation.y += simDt * 1.1;
      this.domeRef.outerRing.rotation.y -= simDt * 0.75;
    }
    const rawProgress = 1 - this.roundTimeLeft / Math.max(0.1, this.roundDuration);
    // Natural gravity-accelerated descent curve instead of rigid linear crawl
    const easedProgress = rawProgress * 0.48 + rawProgress * rawProgress * 0.52;
    for (let i = 0; i < this.targets.length; i++) {
      const t = this.targets[i];
      if (!t.destroying) {
        const yDescend = THREE.MathUtils.lerp(t.basePos.y, 1.85, easedProgress);
        const zDescend = THREE.MathUtils.lerp(t.basePos.z, 1.2, easedProgress);
        t.group.position.set(
          t.basePos.x + Math.sin(this.elapsedTotal * 2 + i) * 0.22,
          yDescend,
          zDescend
        );
        t.group.children[0].rotation.y += simDt * (1.2 + rawProgress * 1.1);
        t.group.children[0].rotation.x += simDt * (0.7 + rawProgress * 0.6);
      }
    }
  }

  private updateRpgStreet(simDt: number): void {
    const safeDt = Math.max(simDt, 0.008);
    const maxWalkSpeed = 7.4 * getSpeedMultiplier(this.settings.speed);
    const energy = this.combo >= 3 ? 1 : this.combo >= 2 ? 0.5 : 0;

    this.rpgSprintBoost = THREE.MathUtils.damp(this.rpgSprintBoost, 0, 4.5, safeDt);

    if (this.rpgPlayer) {
      if (this.rpgState === 'walking') {
        const remaining = Math.max(0, this.rpgPlayerZ - this.rpgTargetZ);
        // Natural acceleration & soft braking curve as adventurer approaches NPC!
        const brakeFactor = Math.min(1, 0.28 + remaining / 2.6);
        const desiredSpeed = maxWalkSpeed * (1 + this.rpgSprintBoost * 1.1) * brakeFactor;
        this.rpgWalkVel = THREE.MathUtils.damp(this.rpgWalkVel, desiredSpeed, 8, safeDt);

        this.rpgPlayerZ = Math.max(this.rpgTargetZ, this.rpgPlayerZ - this.rpgWalkVel * simDt);
        this.rpgPlayer.group.position.set(0, 0.08, this.rpgPlayerZ);
        animateStylizedCharacter(this.rpgPlayer, 'walk', this.elapsedTotal, simDt, energy);

        if (this.rpgPlayerZ <= this.rpgTargetZ + 0.06) {
          this.rpgPlayerZ = this.rpgTargetZ;
          this.rpgWalkVel = 0;
          this.rpgState = 'talking';
          const q = this.questions[this.roundIndex];
          this.triggerRpgNpcSpeech(q);
          this.emitHud(true);
        }
      } else {
        this.rpgWalkVel = THREE.MathUtils.damp(this.rpgWalkVel, 0, 12, safeDt);
        this.rpgPlayer.group.position.set(0, 0.08, this.rpgPlayerZ);
        animateStylizedCharacter(
          this.rpgPlayer,
          this.rpgState === 'celebrating' ? 'celebrate' : 'idle',
          this.elapsedTotal,
          simDt,
          energy
        );
      }
    }

    const activeRigClass = this.humanRigQueue.getState().activeClass;

    // Animate Costumed Village NPCs (floating golden quest beacons, blinking & expressive gestures!)
    this.rpgNpcs.forEach((npc, idx) => {
      if (npc.rig.questMarker && !npc.cleared) {
        npc.rig.questMarker.position.y = 3.1 + Math.sin(this.elapsedTotal * 3.8 + idx) * 0.2;
        npc.rig.questMarker.rotation.y += simDt * 2.2;
      }
      const isActive = idx === this.roundIndex;
      const animState =
        isActive && this.rpgState === 'celebrating'
          ? 'celebrate'
          : isActive && this.rpgState === 'talking'
            ? 'talk'
            : 'idle';
      animateStylizedCharacter(
        npc.rig,
        animState,
        this.elapsedTotal,
        simDt,
        energy,
        isActive ? activeRigClass : undefined
      );
    });
  }

  private updateTetris(simDt: number): void {
    if (!this.tetrisState || !this.tetrisStage) return;

    if (this.tetrisFeedbackClearTimer > 0) {
      this.tetrisFeedbackClearTimer -= simDt;
      if (this.tetrisFeedbackClearTimer <= 0) {
        this.lastFeedback = null;
        this.emitHud(true);
      }
    }

    if (this.phase === 'playing') {
      const ev = this.tetrisState.tick(simDt);
      if (ev.locked || ev.linesCleared > 0 || ev.victory || ev.toppedOut || ev.pointsAwarded > 0) {
        this.handleTetrisStepEvent(ev);
      }
    }

    const shimmerEnergy = this.combo >= 3 ? 1 : this.combo >= 2 ? 0.55 : this.shimmerHitBoost;
    this.tetrisStage.syncFromState(this.tetrisState, simDt, this.elapsedTotal, shimmerEnergy);
  }

  private updateVaultRush(simDt: number): void {
    if (this.vaultRef) {
      this.vaultGearSpinBoost = THREE.MathUtils.damp(this.vaultGearSpinBoost, 0, 4, Math.max(simDt, 0.01));
      this.vaultRef.outerGear.rotation.z += simDt * (0.65 + this.vaultGearSpinBoost);
      this.vaultRef.midGear.rotation.z -= simDt * (0.95 + this.vaultGearSpinBoost * 0.8);
      this.vaultRef.innerDial.rotation.y -= simDt * (1.0 + this.vaultGearSpinBoost * 0.6);

      this.leftLeverTilt = THREE.MathUtils.damp(this.leftLeverTilt, 0, 8, Math.max(simDt, 0.01));
      this.rightLeverTilt = THREE.MathUtils.damp(this.rightLeverTilt, 0, 8, Math.max(simDt, 0.01));
      this.vaultRef.leftLever.rotation.x = this.leftLeverTilt;
      this.vaultRef.rightLever.rotation.x = this.rightLeverTilt;
    }
  }

  private updateBeams(dt: number): void {
    for (let i = this.beams.length - 1; i >= 0; i--) {
      const b = this.beams[i];
      b.life += dt;
      const t = Math.min(1, b.life / b.maxLife);
      if (b.isOrb) {
        b.mesh.position.lerpVectors(b.start, b.end, t);
        b.mesh.scale.setScalar(1 + t * 0.5);
      } else {
        const mat = b.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = 1 - t;
      }
      if (b.life >= b.maxLife) {
        this.fxRoot.remove(b.mesh);
        b.mesh.geometry.dispose();
        (b.mesh.material as THREE.Material).dispose();
        this.beams.splice(i, 1);
      }
    }
  }

  private computeStageCameraVectors(): void {
    const isPortrait = this.camera.aspect < 0.85;
    if (this.phase === 'title') {
      if (isPortrait) {
        _camBasePos.set(0, 6.2, 16.2);
        _camLookTarget.set(0, -1.5, -0.6);
      } else {
        _camBasePos.set(0, 5.0, 14.0);
        _camLookTarget.set(0, 1.5, -0.8);
      }
      return;
    }
    if (this.activeGameId === 'sky-runner') {
      _camBasePos.set(this.gliderX * 0.34, isPortrait ? 5.5 : 5.0, isPortrait ? 11.4 : 8.6);
      _camLookTarget.set(this.gliderX * 0.16, 1.2, -12);
    } else if (this.activeGameId === 'tower-crash') {
      _camBasePos.set(0, isPortrait ? 11.4 : 8.8, isPortrait ? 19.6 : 13.8);
      _camLookTarget.set(0, 0.8, -4.2);
    } else if (this.activeGameId === 'spelling-hop') {
      _camBasePos.set(this.owlPos.x * 0.35, isPortrait ? 9.4 : 8.2, this.owlPos.z + (isPortrait ? 10.6 : 8.4));
      _camLookTarget.set(0, 0.25, this.owlPos.z - 4.0);
    } else if (this.activeGameId === 'synonym-defense') {
      _camBasePos.set(0, isPortrait ? 8.6 : 7.6, isPortrait ? 19.8 : 13.8);
      _camLookTarget.set(0, 3.6, -1.8);
    } else if (this.activeGameId === 'rpg-street') {
      const activeNpc = this.rpgNpcs[this.roundIndex];
      if (this.rpgState === 'talking' && activeNpc) {
        // Cinematic over-the-shoulder RPG conversation framing
        const sideShift = activeNpc.xPos > 0 ? -1.9 : 1.9;
        _camBasePos.set(sideShift, 3.3, this.rpgPlayerZ + (isPortrait ? 5.6 : 4.8));
        _camLookTarget.set(activeNpc.xPos * 0.45, 1.65, activeNpc.zPos);
      } else {
        // 3rd-person RPG exploration camera down the European cobblestone avenue
        _camBasePos.set(0, 4.2, this.rpgPlayerZ + (isPortrait ? 7.2 : 6.8));
        _camLookTarget.set(0, 1.9, this.rpgPlayerZ - 9.0);
      }
    } else if (this.activeGameId === 'voca-tetris') {
      // Elevated balanced orthographic-feel portrait perspective showing all 20 rows cleanly between HUD & touch pad
      if (isPortrait) {
        _camBasePos.set(0, 9.8, 28.2);
        _camLookTarget.set(0, 8.7, 0);
      } else {
        _camBasePos.set(0, 9.6, 22.8);
        _camLookTarget.set(0, 8.8, 0);
      }
    } else {
      // vault-rush
      _camBasePos.set(0, isPortrait ? 4.8 : 3.6, isPortrait ? 13.6 : 8.4);
      _camLookTarget.set(0, 1.75, -1.5);
    }
  }

  private snapCameraToStage(): void {
    const isPortrait = this.camera.aspect < 0.85;
    const baseFov = isPortrait ? 60 : 50;
    if (Math.abs(this.camera.fov - baseFov) > 0.05) {
      this.camera.fov = baseFov;
      this.camera.updateProjectionMatrix();
    }
    this.computeStageCameraVectors();
    this.camera.position.copy(_camBasePos);
    this.camLookCurrent.copy(_camLookTarget);
    this.camera.lookAt(this.camLookCurrent);
  }

  private applyCameraRig(dt: number): void {
    this.computeStageCameraVectors();

    const safeDt = Math.max(dt, 0.01);
    const posDamp = 1 - Math.exp(-7.5 * safeDt);
    const lookDamp = 1 - Math.exp(-9.0 * safeDt);
    this.camera.position.lerp(_camBasePos, posDamp);
    this.camLookCurrent.lerp(_camLookTarget, lookDamp);

    if (this.trauma > 0.001) {
      const shake = this.trauma * this.trauma * 0.35;
      this.camera.position.x += (Math.random() * 2 - 1) * shake;
      this.camera.position.y += (Math.random() * 2 - 1) * shake;
    }

    const baseFov = this.camera.aspect < 0.85 ? 60 : 50;
    const desiredFov = baseFov + this.fovKick;
    if (Math.abs(this.camera.fov - desiredFov) > 0.05) {
      this.camera.fov = desiredFov;
      this.camera.updateProjectionMatrix();
    }

    this.camera.lookAt(this.camLookCurrent);
  }

  private afterDraw(cb: () => void): void {
    if (this.disposed) return;
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (!gl || typeof gl.fenceSync !== 'function') {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) {
        if (sync) gl.deleteSync(sync);
        return;
      }
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private tick = (): void => {
    if (this.disposed) return;
    const now = performance.now();
    const rawDt = (now - this.lastNow) / 1000;
    this.lastNow = now;
    const dt = Math.min(Math.max(rawDt, 0.001), 0.05);

    this.updateSimulation(dt);
    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  public dispose(): void {
    this.disposed = true;
    this.humanRigQueue.dispose();
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    this.resizeObserver.disconnect();
    this.renderer.domElement.removeEventListener('pointerdown', this.handleCanvasPointerDown);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.handleContextLost);
    this.clearStage();
    disposeObject3D(this.skyRoot, this.sharedTextures);
    this.stoneTex.dispose();
    this.cobbleTex.dispose();
    this.grassTex.dispose();
    this.roofTex.dispose();
    this.woodTex.dispose();
    this.clouds.forEach((c) => disposeObject3D(c, this.sharedTextures));
    this.particles.dispose();
    if (this.scene.environment) {
      this.scene.environment.dispose();
    }
    this.renderer.dispose();
  }
}
