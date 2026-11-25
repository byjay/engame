import type {
  GameId,
  GiftHandoffRecord,
  GiftRequestHandoffPayload,
  GiftRewardItem,
  HostBootConfig,
  RunStats,
  WalletProfile,
} from '../game/types';
import { calculateCsatPercentile } from '../game/rules';

export const BRIDGE_PROTOCOL_VERSION = '1.0.0' as const;
export const BRIDGE_SOURCE = 'CSAT_VOCA_ARCADE_3D' as const;
const STORAGE_KEY = 'csat_voca_arcade_3d_wallet_v1';

export const DEFAULT_GIFT_CATALOG: GiftRewardItem[] = [
  {
    id: 'gift-snack',
    title: '편의점 간식 쿠폰 3,000원',
    description: '수능 영단어 3판 클리어 분량으로 요청 가능한 데일리 간식 보상',
    coinCost: 150,
    category: '간식',
  },
  {
    id: 'gift-cafe',
    title: '음료 · 디저트 기프티콘',
    description: '꾸준한 연속 학습 달성 시 부모님께 보내는 카페 보상 요청',
    coinCost: 300,
    category: '음료',
  },
  {
    id: 'gift-voucher',
    title: '문화상품권 10,000원',
    description: '수능 어휘 마스터리 목표 달성 기념 선물 요청',
    coinCost: 600,
    category: '상품권',
  },
  {
    id: 'gift-weekend',
    title: '주말 자유시간 · 영화 티켓',
    description: '고난도 수능 1등급 단어 완주 후 요청하는 스페셜 보상',
    coinCost: 1000,
    category: '스페셜',
  },
];

export interface AndroidVocabBridgeInterface {
  onArcadeEvent?: (payloadJson: string) => void;
  requestParentGift?: (payloadJson: string) => void;
  syncWallet?: (payloadJson: string) => void;
}

export interface HostInboundMessage {
  source?: string;
  type: 'HOST_INIT' | 'HOST_SYNC_WALLET' | 'HOST_GIFT_RESPONSE';
  payload?: Record<string, unknown>;
}

declare global {
  interface Window {
    AndroidVocabBridge?: AndroidVocabBridgeInterface;
    CsatArcadeBridge?: {
      version: string;
      getWallet: () => WalletProfile;
      emitGiftResponse: (requestId: string, approved: boolean, parentReply?: string) => void;
      addHostCoins: (delta: number) => void;
      humanRig?: {
        enqueueSequence: (
          input: readonly { text: string; emotion?: string; durationMs?: number }[] | string,
          options?: { interrupt?: boolean }
        ) => unknown[];
        returnToIdleBreath: () => void;
        getState: () => {
          activeClass: string;
          activeEmotion: string | null;
          isSpeaking: boolean;
          queueLength: number;
        };
      };
    };
  }
}

const VALID_GAME_IDS: GameId[] = [
  'sky-runner',
  'tower-crash',
  'spelling-hop',
  'synonym-defense',
  'vault-rush',
  'rpg-street',
  'voca-tetris',
];

export function parseHostBootConfig(search: string): HostBootConfig {
  const params = new URLSearchParams(search);
  const rawGame = params.get('game') as GameId | null;
  const initialGameId: GameId =
    rawGame && VALID_GAME_IDS.includes(rawGame) ? rawGame : 'sky-runner';

  const rawCoins = params.get('initialCoins');
  const parsedCoins = rawCoins !== null && !Number.isNaN(Number(rawCoins)) ? Number(rawCoins) : null;

  return {
    isEmbedded: params.get('embed') === '1' || params.get('embed') === 'true',
    autostart: params.get('autostart') === '1' || params.get('autostart') === 'true',
    initialGameId,
    studentId: params.get('userId') || 'student-csat-01',
    studentName: params.get('studentName') || '수능도전자',
    parentName: params.get('parentName') || '부모님',
    initialCoinsOverride: parsedCoins !== null && parsedCoins >= 0 ? Math.floor(parsedCoins) : null,
    hostGiftCatalog: DEFAULT_GIFT_CATALOG,
  };
}

export function createInitialWallet(config: HostBootConfig): WalletProfile {
  return {
    studentId: config.studentId,
    studentName: config.studentName,
    parentName: config.parentName,
    coins: config.initialCoinsOverride ?? 220, // Deterministic seed balance so gift handoff is testable immediately
    lifetimeCoins: config.initialCoinsOverride ?? 220,
    xp: 480,
    streakDays: 5,
    totalCorrect: 18,
    totalAttempted: 22,
    totalGamesCleared: 3,
    bestComboToday: 3, // One mission ready to claim for immediate dopamine loop demonstration
    correctToday: 6,
    clearsToday: 0,
    claimedMissionIds: [],
    masteredWordIds: ['w01', 'w02', 'w04', 'w05', 'w06', 'w07'],
    wrongWordIds: ['w03', 'w11', 'w18'],
    bestScores: {
      'sky-runner': 920,
      'tower-crash': 1140,
    },
    starRatings: {
      'sky-runner': 2,
      'tower-crash': 3,
    },
    handoffHistory: [],
  };
}

export function loadWalletFromStorage(config: HostBootConfig): WalletProfile {
  if (typeof window === 'undefined' || !window.localStorage) {
    return createInitialWallet(config);
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialWallet(config);
    const parsed = JSON.parse(raw) as Partial<WalletProfile>;
    const base = createInitialWallet(config);
    return {
      ...base,
      ...parsed,
      studentId: config.studentId || parsed.studentId || base.studentId,
      parentName: config.parentName || parsed.parentName || base.parentName,
      coins:
        config.initialCoinsOverride !== null
          ? config.initialCoinsOverride
          : typeof parsed.coins === 'number'
            ? parsed.coins
            : base.coins,
      xp: typeof parsed.xp === 'number' ? parsed.xp : base.xp,
      bestComboToday:
        typeof parsed.bestComboToday === 'number' ? parsed.bestComboToday : base.bestComboToday,
      correctToday: typeof parsed.correctToday === 'number' ? parsed.correctToday : base.correctToday,
      clearsToday: typeof parsed.clearsToday === 'number' ? parsed.clearsToday : base.clearsToday,
      claimedMissionIds: Array.isArray(parsed.claimedMissionIds) ? parsed.claimedMissionIds : [],
      bestScores: parsed.bestScores ?? base.bestScores,
      starRatings: parsed.starRatings ?? base.starRatings,
      handoffHistory: Array.isArray(parsed.handoffHistory) ? parsed.handoffHistory : [],
      masteredWordIds: Array.isArray(parsed.masteredWordIds)
        ? parsed.masteredWordIds
        : base.masteredWordIds,
      wrongWordIds: Array.isArray(parsed.wrongWordIds) ? parsed.wrongWordIds : base.wrongWordIds,
    };
  } catch {
    return createInitialWallet(config);
  }
}

export function saveWalletToStorage(wallet: WalletProfile): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
  } catch {
    // Ignore storage quota errors inside restricted WebViews
  }
}

export interface GiftHandoffResult {
  ok: boolean;
  error?: string;
  updatedWallet: WalletProfile;
  record?: GiftHandoffRecord;
}

/**
 * Pure state transition for creating a Parent Gift Request Handoff.
 * Validates coin balance, deducts escrow coins, and packages the signed host payload.
 */
export function createGiftRequestHandoff(params: {
  wallet: WalletProfile;
  giftId: string;
  giftTitle: string;
  coinCost: number;
  studentMessage: string;
  nowIso?: string;
  requestId?: string;
}): GiftHandoffResult {
  const trimmedTitle = params.giftTitle.trim();
  if (!trimmedTitle) {
    return {
      ok: false,
      error: '요청할 선물 이름을 입력해 주세요.',
      updatedWallet: params.wallet,
    };
  }
  if (!Number.isFinite(params.coinCost) || params.coinCost <= 0) {
    return {
      ok: false,
      error: '유효한 코인 금액을 선택해 주세요.',
      updatedWallet: params.wallet,
    };
  }
  if (params.wallet.coins < params.coinCost) {
    return {
      ok: false,
      error: `보유 코인이 부족합니다. (${params.coinCost - params.wallet.coins} 코인 더 필요)`,
      updatedWallet: params.wallet,
    };
  }

  const remainingCoins = params.wallet.coins - params.coinCost;
  const recentAccuracyPct =
    params.wallet.totalAttempted > 0
      ? Math.round((params.wallet.totalCorrect / params.wallet.totalAttempted) * 100)
      : 0;

  const payload: GiftRequestHandoffPayload = {
    requestId: params.requestId ?? `GIFT-${Date.now().toString(36).toUpperCase()}`,
    protocolVersion: BRIDGE_PROTOCOL_VERSION,
    source: BRIDGE_SOURCE,
    studentId: params.wallet.studentId,
    parentName: params.wallet.parentName,
    giftId: params.giftId,
    giftTitle: trimmedTitle,
    coinCost: params.coinCost,
    remainingCoins,
    studentMessage: params.studentMessage.trim() || '오늘 수능 영단어 아케이드 목표 달성했어요! 선물 부탁드려요.',
    learningProof: {
      totalWordsMastered: params.wallet.masteredWordIds.length,
      streakDays: params.wallet.streakDays,
      csatPercentileTop: calculateCsatPercentile(params.wallet),
      totalGamesCleared: params.wallet.totalGamesCleared,
      recentAccuracyPct,
    },
    requestedAtIso: params.nowIso ?? new Date().toISOString(),
  };

  const record: GiftHandoffRecord = {
    payload,
    status: 'PENDING_HOST',
    deliveryChannels: [],
  };

  return {
    ok: true,
    record,
    updatedWallet: {
      ...params.wallet,
      coins: remainingCoins,
      handoffHistory: [record, ...params.wallet.handoffHistory].slice(0, 20),
    },
  };
}

/**
 * Pure state transition when the host Android app resolves a pending Parent Gift Request.
 * If declined by parent, escrowed coins are automatically refunded to the student wallet.
 */
export function resolveGiftHandoffFromHost(params: {
  wallet: WalletProfile;
  requestId: string;
  approved: boolean;
  parentReply?: string;
  resolvedAtIso?: string;
}): WalletProfile {
  let refundCoins = 0;
  const updatedHistory: GiftHandoffRecord[] = params.wallet.handoffHistory.map((item) => {
    if (item.payload.requestId !== params.requestId || item.status !== 'PENDING_HOST') {
      return item;
    }
    if (!params.approved) {
      refundCoins += item.payload.coinCost;
    }
    return {
      ...item,
      status: params.approved ? 'APPROVED_BY_PARENT' : 'DECLINED_BY_PARENT',
      parentReply:
        params.parentReply ||
        (params.approved ? '수능 단어 열심히 했네! 선물 승인 완료!' : '조금 더 모아서 다시 요청하자!'),
      resolvedAtIso: params.resolvedAtIso ?? new Date().toISOString(),
    };
  });

  return {
    ...params.wallet,
    coins: params.wallet.coins + refundCoins,
    handoffHistory: updatedHistory,
  };
}

/**
 * Dispatches an arcade event or parent-gift handoff across all active host integration channels:
 * 1) Android WebView JavascriptInterface (`window.AndroidVocabBridge`)
 * 2) Embedded WebView / iFrame `window.parent.postMessage`
 * 3) DOM `CustomEvent('csat-arcade:handoff')`
 */
export function dispatchToHostApp(
  eventType: 'ARCADE_READY' | 'RUN_COMPLETED' | 'COIN_UPDATED' | 'PARENT_GIFT_HANDOFF',
  payload: unknown
): string[] {
  const channels: string[] = [];
  if (typeof window === 'undefined') return channels;

  const envelope = {
    source: BRIDGE_SOURCE,
    protocolVersion: BRIDGE_PROTOCOL_VERSION,
    type: eventType,
    payload,
    timestamp: new Date().toISOString(),
  };
  const json = JSON.stringify(envelope);

  // 1. Android WebView JavascriptInterface
  if (window.AndroidVocabBridge) {
    try {
      if (eventType === 'PARENT_GIFT_HANDOFF' && window.AndroidVocabBridge.requestParentGift) {
        window.AndroidVocabBridge.requestParentGift(json);
        channels.push('AndroidVocabBridge.requestParentGift');
      } else if (window.AndroidVocabBridge.onArcadeEvent) {
        window.AndroidVocabBridge.onArcadeEvent(json);
        channels.push('AndroidVocabBridge.onArcadeEvent');
      }
    } catch {
      // Host bridge error isolated
    }
  }

  // 2. iFrame / Capacitor / React Native WebView postMessage
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(envelope, '*');
      channels.push('window.parent.postMessage');
    }
  } catch {
    // Ignore cross-origin frame errors
  }

  // 3. Browser CustomEvent for same-window native wrappers
  try {
    window.dispatchEvent(new CustomEvent('csat-arcade:handoff', { detail: envelope }));
    channels.push('CustomEvent(csat-arcade:handoff)');
  } catch {
    // Ignore
  }

  return channels;
}

export function emitRunCompletedToHost(summary: RunStats, wallet: WalletProfile): string[] {
  return dispatchToHostApp('RUN_COMPLETED', {
    studentId: wallet.studentId,
    gameId: summary.gameId,
    score: summary.score,
    coinsEarned: summary.coinsEarned,
    totalCoins: wallet.coins,
    accuracyPct: summary.accuracyPct,
    isVictory: summary.isVictory,
    missedWordIds: summary.missedWords.map((w) => w.id),
  });
}

export const ANDROID_KOTLIN_HANDOFF_SNIPPET = `// Android Host App (Kotlin WebView Integration)
webView.settings.javaScriptEnabled = true
webView.settings.domStorageEnabled = true
webView.addJavascriptInterface(object {
    @JavascriptInterface
    fun onArcadeEvent(payloadJson: String) {
        // RUN_COMPLETED / COIN_UPDATED -> 원앱 DB 포인트 동기화
        hostPointRepository.syncFromArcade(payloadJson)
    }

    @JavascriptInterface
    fun requestParentGift(payloadJson: String) {
        // PARENT_GIFT_HANDOFF -> 부모님 앱 푸시 및 선물 승인 화면으로 이동
        parentGiftRouter.openGiftRequestSheet(payloadJson)
    }
}, "AndroidVocabBridge")

// 부모님 승인 결과를 다시 게임 모듈로 전달:
// webView.evaluateJavascript("window.CsatArcadeBridge.emitGiftResponse('GIFT-ID', true, '잘했어!')", null)`;
