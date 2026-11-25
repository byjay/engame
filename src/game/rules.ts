import type {
  CsatWord,
  DailyMission,
  GameId,
  LeagueRival,
  LeagueStanding,
  RunStats,
  WalletProfile,
} from './types';

export const MAX_HEARTS = 3;

export interface AnswerScoreResult {
  pointsAwarded: number;
  coinsAwarded: number;
  nextCombo: number;
  nextHearts: number;
  isFever: boolean;
}

/**
 * Pure arcade scoring rule:
 * - Correct answer earns base 100 pts + speed bonus (0..50) scaled by combo multiplier (up to 2.5x).
 * - Fever Mode (3+ combo) adds a +25% coin surge so maintaining streaks feels thrilling!
 * - Wrong answer resets combo and deducts 1 heart (min 0).
 */
export function getSpeedMultiplier(speed?: 'slow' | 'normal' | 'fast' | 'extreme'): number {
  switch (speed) {
    case 'slow':
      return 0.75;
    case 'fast':
      return 1.35;
    case 'extreme':
      return 1.7;
    default:
      return 1.0;
  }
}

export function getDifficultyMultiplier(
  difficulty?: 'ALL' | '수능필수' | '수능1등급' | '고난도빈출'
): number {
  switch (difficulty) {
    case '수능1등급':
      return 1.15;
    case '고난도빈출':
      return 1.35;
    default:
      return 1.0;
  }
}

export function evaluateAnswer(params: {
  isCorrect: boolean;
  currentCombo: number;
  currentHearts: number;
  timerRatio: number; // 0..1 remaining time
  gameId: GameId;
  difficulty?: 'ALL' | '수능필수' | '수능1등급' | '고난도빈출';
  speed?: 'slow' | 'normal' | 'fast' | 'extreme';
}): AnswerScoreResult {
  const clampedTimer = Math.max(0, Math.min(1, params.timerRatio));

  if (!params.isCorrect) {
    return {
      pointsAwarded: 0,
      coinsAwarded: 0,
      nextCombo: 0,
      nextHearts: Math.max(0, params.currentHearts - 1),
      isFever: false,
    };
  }

  const nextCombo = params.currentCombo + 1;
  const isFever = nextCombo >= 3;
  const comboMultiplier = Math.min(2.5, 1 + (nextCombo - 1) * 0.25);
  const gameDifficultyBonus =
    params.gameId === 'synonym-defense' ||
    params.gameId === 'spelling-hop' ||
    params.gameId === 'rpg-street'
      ? 20
      : 0;
  const speedBonus = Math.round(clampedTimer * 50);
  const settingMult =
    getDifficultyMultiplier(params.difficulty) *
    (params.speed === 'extreme' ? 1.25 : params.speed === 'fast' ? 1.1 : 1.0);
  const pointsAwarded = Math.round(
    (100 + speedBonus + gameDifficultyBonus) * comboMultiplier * settingMult
  );
  const baseCoins = Math.max(5, Math.round(pointsAwarded / 18));
  const coinsAwarded = isFever ? Math.round(baseCoins * 1.25) : baseCoins;

  return {
    pointsAwarded,
    coinsAwarded,
    nextCombo,
    nextHearts: params.currentHearts,
    isFever,
  };
}

/**
 * End-of-run bonus coins: rewards stage clear (+25C), perfect no-miss clear (+30C), and 5+ combo (+10C).
 */
export function calculateRunClearBonus(params: {
  isVictory: boolean;
  wrongCount: number;
  maxCombo: number;
}): number {
  if (!params.isVictory) {
    return 0;
  }
  let bonus = 25;
  if (params.wrongCount === 0) {
    bonus += 30;
  }
  if (params.maxCombo >= 5) {
    bonus += 10;
  }
  return bonus;
}

/**
 * 1★ to 3★ Mastery Star rating for arcade replay challenge.
 */
export function calculateStarsEarned(params: {
  isVictory: boolean;
  accuracyPct: number;
  wrongCount: number;
}): 0 | 1 | 2 | 3 {
  if (!params.isVictory) return 0;
  if (params.wrongCount === 0 && params.accuracyPct >= 95) return 3;
  if (params.accuracyPct >= 75) return 2;
  return 1;
}

/**
 * Malhaevoca-inspired CSAT/SAT vocabulary percentile rank (lower % = better, e.g., Top 4.2%).
 */
export function calculateCsatPercentile(
  profile: Pick<WalletProfile, 'masteredWordIds' | 'totalCorrect' | 'totalAttempted'>
): number {
  const accuracy =
    profile.totalAttempted > 0 ? profile.totalCorrect / profile.totalAttempted : 0.72;
  const masteredRatio = Math.min(1, profile.masteredWordIds.length / 60);
  const rawTop = 38 - masteredRatio * 24 - (accuracy - 0.5) * 22;
  const clamped = Math.max(1.2, Math.min(49.5, rawTop));
  return Math.round(clamped * 10) / 10;
}

const LEAGUE_TIERS: {
  name: LeagueStanding['tierName'];
  minXp: number;
  accent: string;
}[] = [
  { name: '브론즈', minXp: 0, accent: '#CD7F32' },
  { name: '실버', minXp: 300, accent: '#64748B' },
  { name: '골드', minXp: 800, accent: '#D97706' },
  { name: '다이아몬드', minXp: 1600, accent: '#0284C7' },
  { name: '챌린저', minXp: 2800, accent: '#7C3AED' },
];

const LEAGUE_RIVAL_NAMES = ['서연 (고3)', '민준 (SAT준비)', '하은 (수능1등급)', '도윤 (영어부)', '지우 (목표100점)'];

/**
 * Duolingo-style Weekly Student League Ladder calculation driven by live XP.
 */
export function calculateLeagueStanding(
  userXp: number,
  studentName = '나 (도전자)'
): LeagueStanding {
  let tierIdx = 0;
  for (let i = LEAGUE_TIERS.length - 1; i >= 0; i--) {
    if (userXp >= LEAGUE_TIERS[i].minXp) {
      tierIdx = i;
      break;
    }
  }

  const currentTier = LEAGUE_TIERS[tierIdx];
  const nextTier = LEAGUE_TIERS[tierIdx + 1] ?? null;
  const baseFloor = currentTier.minXp;
  const span = nextTier ? nextTier.minXp - baseFloor : 1200;

  const rivals: LeagueRival[] = LEAGUE_RIVAL_NAMES.map((name, idx) => ({
    id: `rival-${idx}`,
    name,
    xp: Math.round(baseFloor + span * (0.22 + idx * 0.17)),
    isUser: false,
  }));

  rivals.push({
    id: 'user-self',
    name: studentName,
    xp: userXp,
    isUser: true,
  });

  rivals.sort((a, b) => b.xp - a.xp);
  const rank = rivals.findIndex((r) => r.isUser) + 1;

  return {
    tierName: currentTier.name,
    tierAccent: currentTier.accent,
    userXp,
    rank,
    nextTierName: nextTier ? nextTier.name : null,
    xpToNextTier: nextTier ? Math.max(0, nextTier.minXp - userXp) : 0,
    rivals,
  };
}

/**
 * Evaluates 3 live Daily Challenge Missions tied to actual gameplay progress.
 */
export function evaluateDailyMissions(wallet: WalletProfile): DailyMission[] {
  const claimed = new Set(wallet.claimedMissionIds);
  const defs = [
    {
      id: 'mission-combo-3',
      title: '피버 타임 돌입 (3연속 콤보)',
      description: '아무 3D 아케이드에서 3콤보 이상 연속 정답 달성',
      current: Math.min(3, wallet.bestComboToday),
      target: 3,
      coinReward: 35,
    },
    {
      id: 'mission-clear-1',
      title: '오늘의 아케이드 1회 완주',
      description: '5종 3D 아케이드 중 1개 스테이지 클리어',
      current: Math.min(1, wallet.clearsToday),
      target: 1,
      coinReward: 45,
    },
    {
      id: 'mission-words-10',
      title: 'SAT·수능 영단어 10개 격파',
      description: '오늘 누적 10개 이상 영단어 정답 맞히기',
      current: Math.min(10, wallet.correctToday),
      target: 10,
      coinReward: 60,
    },
  ];

  return defs.map((m) => ({
    ...m,
    completed: m.current >= m.target,
    claimed: claimed.has(m.id),
  }));
}

export function claimDailyMissionReward(
  wallet: WalletProfile,
  missionId: string
): { ok: boolean; updatedWallet: WalletProfile; rewardCoins: number } {
  const missions = evaluateDailyMissions(wallet);
  const target = missions.find((m) => m.id === missionId);
  if (!target || !target.completed || target.claimed) {
    return { ok: false, updatedWallet: wallet, rewardCoins: 0 };
  }

  return {
    ok: true,
    rewardCoins: target.coinReward,
    updatedWallet: {
      ...wallet,
      coins: wallet.coins + target.coinReward,
      lifetimeCoins: wallet.lifetimeCoins + target.coinReward,
      xp: wallet.xp + 50,
      claimedMissionIds: [...wallet.claimedMissionIds, missionId],
    },
  };
}

/**
 * Pure immutable wallet updater when a game run completes.
 */
export function applyRunToWallet(
  profile: WalletProfile,
  summary: RunStats,
  solvedWords: CsatWord[]
): WalletProfile {
  const masteredSet = new Set(profile.masteredWordIds);
  const wrongSet = new Set(profile.wrongWordIds);

  for (const w of solvedWords) {
    masteredSet.add(w.id);
    wrongSet.delete(w.id);
  }
  for (const mw of summary.missedWords) {
    wrongSet.add(mw.id);
  }

  const prevBest = profile.bestScores[summary.gameId] ?? 0;
  const prevStars = profile.starRatings[summary.gameId] ?? 0;
  const nextStars = Math.max(prevStars, summary.starsEarned) as 0 | 1 | 2 | 3;

  return {
    ...profile,
    coins: profile.coins + summary.coinsEarned,
    lifetimeCoins: profile.lifetimeCoins + summary.coinsEarned,
    xp: profile.xp + summary.xpEarned,
    totalCorrect: profile.totalCorrect + summary.correctCount,
    totalAttempted: profile.totalAttempted + summary.correctCount + summary.wrongCount,
    totalGamesCleared: profile.totalGamesCleared + (summary.isVictory ? 1 : 0),
    bestComboToday: Math.max(profile.bestComboToday, summary.maxCombo),
    correctToday: profile.correctToday + summary.correctCount,
    clearsToday: profile.clearsToday + (summary.isVictory ? 1 : 0),
    masteredWordIds: Array.from(masteredSet),
    wrongWordIds: Array.from(wrongSet),
    bestScores: {
      ...profile.bestScores,
      [summary.gameId]: Math.max(prevBest, summary.score),
    },
    starRatings:
      nextStars > 0
        ? { ...profile.starRatings, [summary.gameId]: nextStars }
        : profile.starRatings,
  };
}

export function buildRunSummary(params: {
  gameId: GameId;
  score: number;
  previousBestScore?: number;
  baseCoins: number;
  correctCount: number;
  wrongCount: number;
  totalRounds: number;
  maxCombo: number;
  heartsRemaining: number;
  missedWords: CsatWord[];
  durationSec: number;
}): RunStats {
  const isVictory = params.heartsRemaining > 0 && params.correctCount > 0;
  const bonusCoins = calculateRunClearBonus({
    isVictory,
    wrongCount: params.wrongCount,
    maxCombo: params.maxCombo,
  });
  const totalAttempts = params.correctCount + params.wrongCount;
  const accuracyPct = totalAttempts > 0 ? Math.round((params.correctCount / totalAttempts) * 100) : 0;
  const starsEarned = calculateStarsEarned({
    isVictory,
    accuracyPct,
    wrongCount: params.wrongCount,
  });
  const xpEarned = Math.max(15, Math.round(params.score / 8) + (isVictory ? 40 : 0));
  const prevBest = params.previousBestScore ?? 0;

  return {
    gameId: params.gameId,
    score: params.score,
    coinsEarned: params.baseCoins + bonusCoins,
    xpEarned,
    starsEarned,
    isNewRecord: params.score > prevBest && params.score > 0,
    correctCount: params.correctCount,
    wrongCount: params.wrongCount,
    totalRounds: params.totalRounds,
    maxCombo: params.maxCombo,
    accuracyPct,
    heartsRemaining: params.heartsRemaining,
    isVictory,
    missedWords: params.missedWords,
    durationSec: Math.max(1, Math.round(params.durationSec)),
  };
}
