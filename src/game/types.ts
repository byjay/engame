export type GameId =
  | 'sky-runner'
  | 'tower-crash'
  | 'spelling-hop'
  | 'synonym-defense'
  | 'vault-rush'
  | 'rpg-street'
  | 'voca-tetris';

export type GamePhase = 'title' | 'playing' | 'paused' | 'gameover';

export type GameCategoryTag =
  | '문장 완성하기'
  | '짝짓기 포탑 격파'
  | '징검다리 건너기'
  | '동의어·반대어 요격'
  | '맞는것·틀린것 O/X'
  | 'RPG 길거리 대화'
  | '3D 블록 퍼즐';

export type GoalTone = 'sky' | 'emerald' | 'amber' | 'violet' | 'coral';

export type DifficultySetting = 'ALL' | '수능필수' | '수능1등급' | '고난도빈출';
export type SpeedSetting = 'slow' | 'normal' | 'fast' | 'extreme';

export interface GameSettings {
  difficulty: DifficultySetting;
  speed: SpeedSetting;
}

export interface GameMeta {
  id: GameId;
  order: number;
  title: string;
  englishTitle: string;
  category: GameCategoryTag;
  shortDesc: string;
  goalSummary: string;
  controlsHint: string;
  coinRateLabel: string;
  roundsPerRun: number;
  accentHex: string;
  accentDarkHex: string;
}

export interface CsatWord {
  id: string;
  word: string;
  meaning: string;
  pos: string; // e.g. '동사', '형용사', '명사'
  pronunciation: string; // Korean phonetic guide
  level: '수능필수' | '수능1등급' | '고난도빈출';
  sentence: string; // Contains '_____'
  sentenceKo: string;
  synonym: string;
  synonymKo: string;
  antonym: string;
  antonymKo: string;
  englishDef: string;
  chunks: [string, string, string]; // 3-part morphological/syllable breakdown
  memoryTip?: string; // Concise etymology / mnemonic hook for effortless retention
}

export interface ArcadeOption {
  id: string;
  label: string;
  subLabel?: string;
  isCorrect: boolean;
}

export interface TowerMatchPair {
  pairId: string;
  wordEntry: CsatWord;
  leftLabel: string; // English word
  rightLabel: string; // Korean meaning
}

export interface RpgDialogueInfo {
  npcId: string;
  npcName: string;
  npcRole: string;
  locationName: string;
  shirtColor: number;
  accentColor: number;
  greetingKo: string;
  npcLineEn: string; // Contains '_____'
  npcLineKo: string;
  replySuccessKo: string;
}

export interface ArcadeQuestion {
  id: string;
  gameId: GameId;
  wordEntry: CsatWord;
  /** Loud, unmistakable goal callout shown at the top of the HUD */
  goalHeadline: string;
  goalTone: GoalTone;
  promptBadge: string;
  promptMain: string;
  promptSub: string;
  speakText?: string;
  options: ArcadeOption[];
  /** Used by tower-crash for 3-pair simultaneous matching */
  matchPairs?: {
    pairs: TowerMatchPair[];
    leftOrder: string[]; // shuffled pairIds for left English towers
    rightOrder: string[]; // shuffled pairIds for right Korean towers
  };
  /** Used by spelling-hop to track 3 sequential stepping-stone rows */
  steps?: {
    promptHint: string;
    choices: ArcadeOption[];
  }[];
  /** Used by vault-rush O/X */
  isStatementTrue?: boolean;
  /** Used by synonym-defense */
  relationMode?: 'SYNONYM' | 'ANTONYM';
  /** Used by rpg-street NPC dialogue quests */
  rpgDialogue?: RpgDialogueInfo;
  /** True when re-queued automatically in-run after a miss for instant memory lock-in */
  isRevengeReview?: boolean;
}

export interface RunStats {
  gameId: GameId;
  score: number;
  coinsEarned: number;
  xpEarned: number;
  starsEarned: 0 | 1 | 2 | 3;
  isNewRecord: boolean;
  correctCount: number;
  wrongCount: number;
  totalRounds: number;
  maxCombo: number;
  accuracyPct: number;
  heartsRemaining: number;
  isVictory: boolean;
  missedWords: CsatWord[];
  durationSec: number;
}

export interface HudSnapshot {
  gameId: GameId;
  phase: GamePhase;
  roundIndex: number;
  totalRounds: number;
  score: number;
  combo: number;
  maxCombo: number;
  isFever: boolean;
  hearts: number;
  maxHearts: number;
  coinsEarnedRun: number;
  timerRatio: number; // 1 -> 0
  activeLane: number; // 0, 1, 2 for sky-runner
  spellingStep: number; // 0, 1, 2 for spelling-hop
  spellingBuilt: string;
  /** Tower Crash pair-matching state */
  towerSelectedSide: 'left' | 'right' | null;
  towerSelectedPairId: string | null;
  towerMatchedPairIds: string[];
  /** RPG Street walk & dialogue state */
  rpgState: 'walking' | 'talking' | 'celebrating';
  rpgDistancePct: number;
  /** 3D Voca Tetris live board HUD snapshot */
  tetris?: {
    lines: number;
    targetLines: number;
    level: number;
    holdType: 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L' | null;
    canHold: boolean;
    nextTypes: ('I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L')[];
    lastClearLabel: string | null;
    currentWord: CsatWord | null;
  };
  question: ArcadeQuestion | null;
  feedbackBanner: {
    type: 'correct' | 'wrong' | 'info';
    text: string;
    subText?: string;
    memoryTip?: string;
    wordDetail?: CsatWord;
    id: number;
  } | null;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  coinReward: number;
  completed: boolean;
  claimed: boolean;
}

export interface LeagueRival {
  id: string;
  name: string;
  xp: number;
  isUser: boolean;
}

export interface LeagueStanding {
  tierName: '브론즈' | '실버' | '골드' | '다이아몬드' | '챌린저';
  tierAccent: string;
  userXp: number;
  rank: number;
  nextTierName: string | null;
  xpToNextTier: number;
  rivals: LeagueRival[];
}

export interface GiftRewardItem {
  id: string;
  title: string;
  description: string;
  coinCost: number;
  category: string;
}

export type GiftHandoffStatus = 'PENDING_HOST' | 'APPROVED_BY_PARENT' | 'DECLINED_BY_PARENT';

export interface GiftRequestHandoffPayload {
  requestId: string;
  protocolVersion: '1.0.0';
  source: 'CSAT_VOCA_ARCADE_3D';
  studentId: string;
  parentName: string;
  giftId: string;
  giftTitle: string;
  coinCost: number;
  remainingCoins: number;
  studentMessage: string;
  learningProof: {
    totalWordsMastered: number;
    streakDays: number;
    csatPercentileTop: number;
    totalGamesCleared: number;
    recentAccuracyPct: number;
  };
  requestedAtIso: string;
}

export interface GiftHandoffRecord {
  payload: GiftRequestHandoffPayload;
  status: GiftHandoffStatus;
  deliveryChannels: string[];
  parentReply?: string;
  resolvedAtIso?: string;
}

export interface WalletProfile {
  studentId: string;
  studentName: string;
  parentName: string;
  coins: number;
  lifetimeCoins: number;
  xp: number;
  streakDays: number;
  totalCorrect: number;
  totalAttempted: number;
  totalGamesCleared: number;
  bestComboToday: number;
  correctToday: number;
  clearsToday: number;
  claimedMissionIds: string[];
  masteredWordIds: string[];
  wrongWordIds: string[];
  bestScores: Partial<Record<GameId, number>>;
  starRatings: Partial<Record<GameId, 1 | 2 | 3>>;
  handoffHistory: GiftHandoffRecord[];
}

export interface HostBootConfig {
  isEmbedded: boolean;
  autostart: boolean;
  initialGameId: GameId;
  studentId: string;
  studentName: string;
  parentName: string;
  initialCoinsOverride: number | null;
  hostGiftCatalog: GiftRewardItem[];
}
