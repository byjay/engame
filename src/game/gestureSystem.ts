import type { RpgDialogueInfo } from './types';

export const IDLE_BREATH_CLASS = 'idleBreath' as const;

export type GestureCode =
  | 'g-01'
  | 'g-02'
  | 'g-03'
  | 'g-04'
  | 'g-05'
  | 'g-06'
  | 'g-07'
  | 'g-08'
  | 'g-09'
  | 'g-10'
  | 'g-11'
  | 'g-12'
  | 'g-13'
  | 'g-14'
  | 'g-15'
  | 'g-16'
  | 'g-17'
  | 'g-18'
  | 'g-19'
  | 'g-20'
  | 'g-21'
  | 'g-22'
  | 'g-23'
  | 'g-24';

export type HumanRigMotionClass = GestureCode | typeof IDLE_BREATH_CLASS;

export type EmotionTag =
  | '기쁨'
  | '인사'
  | '축하'
  | '격려'
  | '감사'
  | '설렘'
  | '자신감'
  | '반가움'
  | '놀람'
  | '호기심'
  | '질문'
  | '생각'
  | '집중'
  | '기대'
  | '발견'
  | '의문'
  | '아쉬움'
  | '사과'
  | '위로'
  | '진지함'
  | '설명'
  | '차분함'
  | '공감'
  | '마무리';

export interface GestureRigPose {
  headTiltZ: number;
  headPitchX: number;
  headYawAmp: number;
  browOffsetY: number;
  torsoLeanX: number;
  torsoSwayAmp: number;
  leftShoulderZ: number;
  leftShoulderX: number;
  leftElbowX: number;
  rightShoulderZ: number;
  rightShoulderX: number;
  rightElbowX: number;
  armWaveSpeed: number;
  armWaveAmp: number;
  bounceAmp: number;
  dampLambda: number;
}

export interface GestureDefinition {
  code: GestureCode;
  label: string;
  primaryEmotion: EmotionTag;
  emotions: readonly string[];
  defaultDurationMs: number;
  pose: GestureRigPose;
}

export const GESTURES: readonly GestureDefinition[] = [
  {
    code: 'g-01',
    label: '밝은 기쁨 제스처',
    primaryEmotion: '기쁨',
    emotions: ['기쁨', '행복', '즐거움', '웃음', '미소', 'joy', 'happy', 'cheerful', 'glad'],
    defaultDurationMs: 1600,
    pose: {
      headTiltZ: 0.08,
      headPitchX: -0.04,
      headYawAmp: 0.12,
      browOffsetY: 0.022,
      torsoLeanX: -0.02,
      torsoSwayAmp: 0.09,
      leftShoulderZ: 0.52,
      leftShoulderX: -0.22,
      leftElbowX: -0.58,
      rightShoulderZ: -1.42,
      rightShoulderX: -0.32,
      rightElbowX: -0.72,
      armWaveSpeed: 6.2,
      armWaveAmp: 0.28,
      bounceAmp: 0.085,
      dampLambda: 11,
    },
  },
  {
    code: 'g-02',
    label: '환영 인사 손흔들기',
    primaryEmotion: '인사',
    emotions: ['인사', '환영', '안녕', 'greeting', 'hello', 'welcome', 'wave'],
    defaultDurationMs: 1500,
    pose: {
      headTiltZ: 0.06,
      headPitchX: 0.02,
      headYawAmp: 0.1,
      browOffsetY: 0.018,
      torsoLeanX: 0.04,
      torsoSwayAmp: 0.06,
      leftShoulderZ: 0.18,
      leftShoulderX: 0.04,
      leftElbowX: -0.24,
      rightShoulderZ: -2.18,
      rightShoulderX: -0.24,
      rightElbowX: -0.54,
      armWaveSpeed: 7.4,
      armWaveAmp: 0.34,
      bounceAmp: 0.055,
      dampLambda: 12,
    },
  },
  {
    code: 'g-03',
    label: '두 팔 축하 환호',
    primaryEmotion: '축하',
    emotions: ['축하', '환호', '성공', '승리', '정답', 'celebrate', 'victory', 'cheer'],
    defaultDurationMs: 1700,
    pose: {
      headTiltZ: 0.0,
      headPitchX: -0.08,
      headYawAmp: 0.14,
      browOffsetY: 0.03,
      torsoLeanX: -0.05,
      torsoSwayAmp: 0.14,
      leftShoulderZ: 2.35,
      leftShoulderX: -0.28,
      leftElbowX: -0.42,
      rightShoulderZ: -2.35,
      rightShoulderX: -0.28,
      rightElbowX: -0.42,
      armWaveSpeed: 10.5,
      armWaveAmp: 0.26,
      bounceAmp: 0.16,
      dampLambda: 14,
    },
  },
  {
    code: 'g-04',
    label: '힘찬 격려 응대',
    primaryEmotion: '격려',
    emotions: ['격려', '응원', '파이팅', '도전', 'encourage', 'support', 'motivate'],
    defaultDurationMs: 1550,
    pose: {
      headTiltZ: -0.04,
      headPitchX: 0.05,
      headYawAmp: 0.08,
      browOffsetY: 0.016,
      torsoLeanX: 0.08,
      torsoSwayAmp: 0.07,
      leftShoulderZ: 0.34,
      leftShoulderX: -0.35,
      leftElbowX: -0.82,
      rightShoulderZ: -0.78,
      rightShoulderX: -0.58,
      rightElbowX: -0.95,
      armWaveSpeed: 5.4,
      armWaveAmp: 0.18,
      bounceAmp: 0.06,
      dampLambda: 11,
    },
  },
  {
    code: 'g-05',
    label: '따뜻한 감사 인사',
    primaryEmotion: '감사',
    emotions: ['감사', '고마움', '덕분', 'thanks', 'gratitude', 'appreciate'],
    defaultDurationMs: 1500,
    pose: {
      headTiltZ: 0.03,
      headPitchX: 0.14,
      headYawAmp: 0.05,
      browOffsetY: 0.01,
      torsoLeanX: 0.11,
      torsoSwayAmp: 0.04,
      leftShoulderZ: 0.24,
      leftShoulderX: -0.42,
      leftElbowX: -0.98,
      rightShoulderZ: -0.26,
      rightShoulderX: -0.44,
      rightElbowX: -1.02,
      armWaveSpeed: 3.0,
      armWaveAmp: 0.08,
      bounceAmp: 0.025,
      dampLambda: 9,
    },
  },
  {
    code: 'g-06',
    label: '들뜬 설렘 리듬',
    primaryEmotion: '설렘',
    emotions: ['설렘', '신남', '흥분', 'excited', 'thrilled'],
    defaultDurationMs: 1500,
    pose: {
      headTiltZ: 0.1,
      headPitchX: -0.05,
      headYawAmp: 0.16,
      browOffsetY: 0.024,
      torsoLeanX: 0.04,
      torsoSwayAmp: 0.11,
      leftShoulderZ: 0.85,
      leftShoulderX: -0.36,
      leftElbowX: -0.75,
      rightShoulderZ: -0.95,
      rightShoulderX: -0.36,
      rightElbowX: -0.75,
      armWaveSpeed: 8.2,
      armWaveAmp: 0.22,
      bounceAmp: 0.095,
      dampLambda: 13,
    },
  },
  {
    code: 'g-07',
    label: '당당한 자신감 포즈',
    primaryEmotion: '자신감',
    emotions: ['자신감', '확신', '뿌듯함', 'confident', 'proud'],
    defaultDurationMs: 1600,
    pose: {
      headTiltZ: -0.05,
      headPitchX: -0.07,
      headYawAmp: 0.07,
      browOffsetY: 0.014,
      torsoLeanX: -0.05,
      torsoSwayAmp: 0.05,
      leftShoulderZ: 0.42,
      leftShoulderX: 0.08,
      leftElbowX: -0.88,
      rightShoulderZ: -0.48,
      rightShoulderX: -0.18,
      rightElbowX: -0.86,
      armWaveSpeed: 3.6,
      armWaveAmp: 0.1,
      bounceAmp: 0.04,
      dampLambda: 10,
    },
  },
  {
    code: 'g-08',
    label: '반가운 어깨 인사',
    primaryEmotion: '반가움',
    emotions: ['반가움', '친근함', '반가워', 'delight', 'friendly', 'warm'],
    defaultDurationMs: 1500,
    pose: {
      headTiltZ: 0.09,
      headPitchX: 0.02,
      headYawAmp: 0.12,
      browOffsetY: 0.02,
      torsoLeanX: 0.05,
      torsoSwayAmp: 0.08,
      leftShoulderZ: 0.46,
      leftShoulderX: -0.18,
      leftElbowX: -0.52,
      rightShoulderZ: -1.65,
      rightShoulderX: -0.26,
      rightElbowX: -0.64,
      armWaveSpeed: 6.4,
      armWaveAmp: 0.24,
      bounceAmp: 0.06,
      dampLambda: 11,
    },
  },
  {
    code: 'g-09',
    label: '눈썹 올린 놀람',
    primaryEmotion: '놀람',
    emotions: ['놀람', '깜짝', '의외', 'surprise', 'surprised', 'amazed', 'wow'],
    defaultDurationMs: 1400,
    pose: {
      headTiltZ: -0.07,
      headPitchX: -0.1,
      headYawAmp: 0.09,
      browOffsetY: 0.036,
      torsoLeanX: -0.09,
      torsoSwayAmp: 0.06,
      leftShoulderZ: 1.15,
      leftShoulderX: -0.48,
      leftElbowX: -0.95,
      rightShoulderZ: -1.15,
      rightShoulderX: -0.48,
      rightElbowX: -0.95,
      armWaveSpeed: 5.5,
      armWaveAmp: 0.15,
      bounceAmp: 0.075,
      dampLambda: 15,
    },
  },
  {
    code: 'g-10',
    label: '호기심 고개 갸웃',
    primaryEmotion: '호기심',
    emotions: ['호기심', '궁금함', '흥미', '관심', '탐구', 'curiosity', 'curious', 'interested', 'wonder'],
    defaultDurationMs: 1850,
    pose: {
      headTiltZ: 0.22,
      headPitchX: 0.05,
      headYawAmp: 0.14,
      browOffsetY: 0.025,
      torsoLeanX: 0.09,
      torsoSwayAmp: 0.07,
      leftShoulderZ: 0.24,
      leftShoulderX: -0.28,
      leftElbowX: -0.62,
      rightShoulderZ: -0.78,
      rightShoulderX: -0.62,
      rightElbowX: -1.04,
      armWaveSpeed: 4.1,
      armWaveAmp: 0.16,
      bounceAmp: 0.035,
      dampLambda: 9.5,
    },
  },
  {
    code: 'g-11',
    label: '질문 손짓',
    primaryEmotion: '질문',
    emotions: ['질문', '물음', '문의', 'question', 'ask', 'inquiry'],
    defaultDurationMs: 1700,
    pose: {
      headTiltZ: 0.15,
      headPitchX: 0.03,
      headYawAmp: 0.11,
      browOffsetY: 0.022,
      torsoLeanX: 0.06,
      torsoSwayAmp: 0.06,
      leftShoulderZ: 0.18,
      leftShoulderX: -0.14,
      leftElbowX: -0.36,
      rightShoulderZ: -1.12,
      rightShoulderX: -0.52,
      rightElbowX: -0.88,
      armWaveSpeed: 4.5,
      armWaveAmp: 0.18,
      bounceAmp: 0.03,
      dampLambda: 10,
    },
  },
  {
    code: 'g-12',
    label: '깊은 생각 턱 괴기',
    primaryEmotion: '생각',
    emotions: ['생각', '고민', '추론', '사색', 'thinking', 'thoughtful', 'ponder'],
    defaultDurationMs: 1750,
    pose: {
      headTiltZ: -0.16,
      headPitchX: 0.08,
      headYawAmp: 0.06,
      browOffsetY: 0.008,
      torsoLeanX: 0.04,
      torsoSwayAmp: 0.03,
      leftShoulderZ: 0.16,
      leftShoulderX: -0.22,
      leftElbowX: -0.68,
      rightShoulderZ: -0.32,
      rightShoulderX: -0.78,
      rightElbowX: -1.32,
      armWaveSpeed: 2.4,
      armWaveAmp: 0.06,
      bounceAmp: 0.018,
      dampLambda: 8.5,
    },
  },
  {
    code: 'g-13',
    label: '집중 경청 끄덕임',
    primaryEmotion: '집중',
    emotions: ['집중', '몰입', '주의', '경청', 'focus', 'focused', 'attentive'],
    defaultDurationMs: 1650,
    pose: {
      headTiltZ: 0.04,
      headPitchX: 0.08,
      headYawAmp: 0.05,
      browOffsetY: 0.005,
      torsoLeanX: 0.1,
      torsoSwayAmp: 0.03,
      leftShoulderZ: 0.16,
      leftShoulderX: -0.2,
      leftElbowX: -0.45,
      rightShoulderZ: -0.22,
      rightShoulderX: -0.24,
      rightElbowX: -0.52,
      armWaveSpeed: 3.1,
      armWaveAmp: 0.07,
      bounceAmp: 0.02,
      dampLambda: 9,
    },
  },
  {
    code: 'g-14',
    label: '기대감 앞쪽 기울임',
    primaryEmotion: '기대',
    emotions: ['기대', '바램', '희망', 'anticipation', 'hopeful', 'eager'],
    defaultDurationMs: 1600,
    pose: {
      headTiltZ: 0.07,
      headPitchX: -0.02,
      headYawAmp: 0.1,
      browOffsetY: 0.018,
      torsoLeanX: 0.09,
      torsoSwayAmp: 0.07,
      leftShoulderZ: 0.35,
      leftShoulderX: -0.38,
      leftElbowX: -0.82,
      rightShoulderZ: -0.38,
      rightShoulderX: -0.42,
      rightElbowX: -0.85,
      armWaveSpeed: 4.8,
      armWaveAmp: 0.12,
      bounceAmp: 0.045,
      dampLambda: 10,
    },
  },
  {
    code: 'g-15',
    label: '발견 유레카 포인팅',
    primaryEmotion: '발견',
    emotions: ['발견', '깨달음', '유레카', '힌트', 'discovery', 'eureka', 'aha'],
    defaultDurationMs: 1550,
    pose: {
      headTiltZ: -0.08,
      headPitchX: -0.06,
      headYawAmp: 0.1,
      browOffsetY: 0.028,
      torsoLeanX: 0.03,
      torsoSwayAmp: 0.06,
      leftShoulderZ: 0.22,
      leftShoulderX: -0.12,
      leftElbowX: -0.32,
      rightShoulderZ: -1.78,
      rightShoulderX: -0.45,
      rightElbowX: -0.46,
      armWaveSpeed: 5.2,
      armWaveAmp: 0.14,
      bounceAmp: 0.07,
      dampLambda: 13,
    },
  },
  {
    code: 'g-16',
    label: '의문 양손 펼침',
    primaryEmotion: '의문',
    emotions: ['의문', '혼란', '헷갈림', 'doubt', 'confused', 'unsure'],
    defaultDurationMs: 1650,
    pose: {
      headTiltZ: -0.18,
      headPitchX: 0.03,
      headYawAmp: 0.13,
      browOffsetY: 0.016,
      torsoLeanX: -0.02,
      torsoSwayAmp: 0.06,
      leftShoulderZ: 0.68,
      leftShoulderX: -0.34,
      leftElbowX: -0.78,
      rightShoulderZ: -0.68,
      rightShoulderX: -0.34,
      rightElbowX: -0.78,
      armWaveSpeed: 3.4,
      armWaveAmp: 0.12,
      bounceAmp: 0.02,
      dampLambda: 9,
    },
  },
  {
    code: 'g-17',
    label: '아쉬움 어깨 으쓱',
    primaryEmotion: '아쉬움',
    emotions: ['아쉬움', '걱정', '실수', '오답', '안타까움', 'concern', 'regret', 'sad', 'oops'],
    defaultDurationMs: 1600,
    pose: {
      headTiltZ: -0.12,
      headPitchX: 0.12,
      headYawAmp: 0.09,
      browOffsetY: -0.008,
      torsoLeanX: 0.06,
      torsoSwayAmp: 0.04,
      leftShoulderZ: 0.44,
      leftShoulderX: -0.18,
      leftElbowX: -0.64,
      rightShoulderZ: -0.44,
      rightShoulderX: -0.18,
      rightElbowX: -0.64,
      armWaveSpeed: 2.6,
      armWaveAmp: 0.08,
      bounceAmp: 0.015,
      dampLambda: 8.5,
    },
  },
  {
    code: 'g-18',
    label: '정중한 사과 숙임',
    primaryEmotion: '사과',
    emotions: ['사과', '미안함', '죄송', 'apology', 'sorry'],
    defaultDurationMs: 1600,
    pose: {
      headTiltZ: 0.0,
      headPitchX: 0.22,
      headYawAmp: 0.04,
      browOffsetY: -0.005,
      torsoLeanX: 0.18,
      torsoSwayAmp: 0.02,
      leftShoulderZ: 0.18,
      leftShoulderX: -0.26,
      leftElbowX: -0.72,
      rightShoulderZ: -0.18,
      rightShoulderX: -0.26,
      rightElbowX: -0.72,
      armWaveSpeed: 2.2,
      armWaveAmp: 0.05,
      bounceAmp: 0.01,
      dampLambda: 8,
    },
  },
  {
    code: 'g-19',
    label: '온화한 위로 끄덕임',
    primaryEmotion: '위로',
    emotions: ['위로', '괜찮아', '안심', 'comfort', 'reassure', 'gentle'],
    defaultDurationMs: 1650,
    pose: {
      headTiltZ: 0.1,
      headPitchX: 0.06,
      headYawAmp: 0.06,
      browOffsetY: 0.006,
      torsoLeanX: 0.05,
      torsoSwayAmp: 0.04,
      leftShoulderZ: 0.26,
      leftShoulderX: -0.3,
      leftElbowX: -0.68,
      rightShoulderZ: -0.34,
      rightShoulderX: -0.35,
      rightElbowX: -0.74,
      armWaveSpeed: 3.0,
      armWaveAmp: 0.09,
      bounceAmp: 0.02,
      dampLambda: 8.5,
    },
  },
  {
    code: 'g-20',
    label: '진지한 시선 고정',
    primaryEmotion: '진지함',
    emotions: ['진지함', '단호함', '중요', 'serious', 'determined', 'stern'],
    defaultDurationMs: 1650,
    pose: {
      headTiltZ: 0.0,
      headPitchX: 0.03,
      headYawAmp: 0.04,
      browOffsetY: -0.01,
      torsoLeanX: 0.04,
      torsoSwayAmp: 0.02,
      leftShoulderZ: 0.14,
      leftShoulderX: -0.1,
      leftElbowX: -0.38,
      rightShoulderZ: -0.28,
      rightShoulderX: -0.34,
      rightElbowX: -0.62,
      armWaveSpeed: 2.8,
      armWaveAmp: 0.06,
      bounceAmp: 0.015,
      dampLambda: 9,
    },
  },
  {
    code: 'g-21',
    label: '열린 손 설명 제스처',
    primaryEmotion: '설명',
    emotions: ['설명', '안내', '소개', '해설', 'explain', 'guide', 'present', 'teach'],
    defaultDurationMs: 1800,
    pose: {
      headTiltZ: 0.05,
      headPitchX: 0.02,
      headYawAmp: 0.09,
      browOffsetY: 0.012,
      torsoLeanX: 0.04,
      torsoSwayAmp: 0.06,
      leftShoulderZ: 0.42,
      leftShoulderX: -0.32,
      leftElbowX: -0.72,
      rightShoulderZ: -0.64,
      rightShoulderX: -0.44,
      rightElbowX: -0.78,
      armWaveSpeed: 4.2,
      armWaveAmp: 0.16,
      bounceAmp: 0.025,
      dampLambda: 9.5,
    },
  },
  {
    code: 'g-22',
    label: '차분한 안정 제스처',
    primaryEmotion: '차분함',
    emotions: ['차분함', '평온', '안정', '고요', '편안함', 'calm', 'serene', 'relaxed', 'composed', 'neutral'],
    defaultDurationMs: 1700,
    pose: {
      headTiltZ: 0.03,
      headPitchX: 0.02,
      headYawAmp: 0.06,
      browOffsetY: 0.004,
      torsoLeanX: 0.02,
      torsoSwayAmp: 0.035,
      leftShoulderZ: 0.2,
      leftShoulderX: -0.16,
      leftElbowX: -0.44,
      rightShoulderZ: -0.34,
      rightShoulderX: -0.24,
      rightElbowX: -0.56,
      armWaveSpeed: 2.6,
      armWaveAmp: 0.09,
      bounceAmp: 0.022,
      dampLambda: 7.5,
    },
  },
  {
    code: 'g-23',
    label: '부드러운 공감 끄덕임',
    primaryEmotion: '공감',
    emotions: ['공감', '이해', '동의', 'empathy', 'agree', 'understand'],
    defaultDurationMs: 1600,
    pose: {
      headTiltZ: 0.08,
      headPitchX: 0.09,
      headYawAmp: 0.07,
      browOffsetY: 0.01,
      torsoLeanX: 0.06,
      torsoSwayAmp: 0.04,
      leftShoulderZ: 0.22,
      leftShoulderX: -0.24,
      leftElbowX: -0.52,
      rightShoulderZ: -0.38,
      rightShoulderX: -0.28,
      rightElbowX: -0.64,
      armWaveSpeed: 3.2,
      armWaveAmp: 0.1,
      bounceAmp: 0.022,
      dampLambda: 8.5,
    },
  },
  {
    code: 'g-24',
    label: '자연스러운 발화 마무리',
    primaryEmotion: '마무리',
    emotions: ['마무리', '종료', '끝', 'closing', 'outro', 'settle'],
    defaultDurationMs: 1200,
    pose: {
      headTiltZ: 0.02,
      headPitchX: 0.03,
      headYawAmp: 0.04,
      browOffsetY: 0.0,
      torsoLeanX: 0.02,
      torsoSwayAmp: 0.02,
      leftShoulderZ: 0.14,
      leftShoulderX: -0.06,
      leftElbowX: -0.24,
      rightShoulderZ: -0.18,
      rightShoulderX: -0.08,
      rightElbowX: -0.28,
      armWaveSpeed: 2.0,
      armWaveAmp: 0.04,
      bounceAmp: 0.018,
      dampLambda: 7.0,
    },
  },
];

export const ALL_GESTURE_CLASSES: readonly GestureCode[] = GESTURES.map((g) => g.code);

const GESTURE_BY_CODE = new Map<GestureCode, GestureDefinition>(
  GESTURES.map((g) => [g.code, g])
);

const DEFAULT_FALLBACK_GESTURE: GestureDefinition = GESTURE_BY_CODE.get('g-22')!;

export function getGestureByCode(code: string | null | undefined): GestureDefinition | null {
  if (!code) return null;
  return GESTURE_BY_CODE.get(code as GestureCode) ?? null;
}

/**
 * Maps an emotion tag (Korean or English) to the best-fitting motion class
 * in the GESTURES dataset (e.g., 기쁨 -> g-01, 호기심 -> g-10, 차분함 -> g-22).
 */
export function mapEmotionToGesture(emotionTag: string | null | undefined): GestureDefinition {
  const normalized = (emotionTag ?? '').trim().toLowerCase();
  if (!normalized) return DEFAULT_FALLBACK_GESTURE;

  // Direct gesture code passthrough (e.g., 'g-10')
  const directCode = GESTURE_BY_CODE.get(normalized as GestureCode);
  if (directCode) return directCode;

  // 1. Exact primary emotion match
  for (const gesture of GESTURES) {
    if (gesture.primaryEmotion.toLowerCase() === normalized) {
      return gesture;
    }
  }

  // 2. Exact alias match
  for (const gesture of GESTURES) {
    if (gesture.emotions.some((e) => e.toLowerCase() === normalized)) {
      return gesture;
    }
  }

  // 3. Substring / partial tag match
  for (const gesture of GESTURES) {
    if (
      gesture.emotions.some((e) => {
        const key = e.toLowerCase();
        return normalized.includes(key) || key.includes(normalized);
      })
    ) {
      return gesture;
    }
  }

  return DEFAULT_FALLBACK_GESTURE;
}

export interface SpeechSegmentInput {
  text: string;
  emotion?: string;
  gestureCode?: GestureCode;
  durationMs?: number;
}

export interface GestureQueueItem {
  id: string;
  text: string;
  emotion: EmotionTag;
  gestureCode: GestureCode;
  gestureLabel: string;
  durationMs: number;
}

const MIN_SEGMENT_MS = 850;
const MAX_SEGMENT_MS = 4500;

function estimateDurationMs(text: string, fallbackMs: number, explicitMs?: number): number {
  if (typeof explicitMs === 'number' && Number.isFinite(explicitMs) && explicitMs > 0) {
    return Math.max(200, Math.min(MAX_SEGMENT_MS, Math.round(explicitMs)));
  }
  const cleanLen = text.replace(/\s+/g, '').length;
  if (cleanLen === 0) return fallbackMs;
  const computed = 950 + cleanLen * 38;
  return Math.max(MIN_SEGMENT_MS, Math.min(MAX_SEGMENT_MS, computed));
}

/**
 * Infers an emotion tag from sentence text when no explicit tag is supplied.
 */
export function inferEmotionFromSentence(sentence: string, index = 0, total = 1): EmotionTag {
  const s = sentence.trim();
  const lower = s.toLowerCase();

  if (/(축하|정답|완벽|대단|승리|bravo|congrat|awesome|perfect)/i.test(lower)) return '축하';
  if (/(아쉽|안타깝|실수|미안|죄송|sorry|oops|unfortunately)/i.test(lower)) return '아쉬움';
  if (/(깜짝|놀랐|세상에|와우|wow|surpris|amazing)/i.test(lower)) return '놀람';
  if (/[?？]|(궁금|무엇|어떤|어디|왜|할까|인가요|아시나요|what|which|could you|can you|do you know)/i.test(lower)) {
    return '호기심';
  }
  if (/(안녕|반가|환영|어서|hello|welcome|hi\b|nice to meet)/i.test(lower)) return '기쁨';
  if (/(화이팅|할 수 있|힘내|응원|잘했|great job|keep going)/i.test(lower)) return '격려';
  if (/(고마|감사|thank)/i.test(lower)) return '감사';
  if (/(설명|의미|뜻은|문맥|힌트|means|definition)/i.test(lower)) return '설명';
  if (/[!！]/.test(s)) return index === 0 ? '기쁨' : '설렘';
  if (total > 1 && index === total - 1) return '차분함';
  return '차분함';
}

let queueItemCounter = 0;

/**
 * Converts either an array of speech segments (with optional emotion tags) OR a raw
 * multi-sentence string (including optional `[기쁨] ... [호기심] ...` inline tags)
 * into a validated GestureQueueItem array.
 */
export function buildSpeechGestureSequence(
  input: readonly SpeechSegmentInput[] | string
): GestureQueueItem[] {
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return [];

    // Support explicit inline emotion tags: "[기쁨] 안녕! [호기심] 이건 뭘까요? [차분함] 골라 보세요."
    const taggedPattern = /\[([^\]]+)\]\s*([^[]+)/g;
    const taggedSegments: SpeechSegmentInput[] = [];
    let match: RegExpExecArray | null;
    while ((match = taggedPattern.exec(trimmed)) !== null) {
      const tag = match[1].trim();
      const body = match[2].trim();
      if (body) {
        taggedSegments.push({ text: body, emotion: tag });
      }
    }
    if (taggedSegments.length > 0) {
      return buildSpeechGestureSequence(taggedSegments);
    }

    // Split plain multi-sentence text on punctuation boundaries
    const rawParts = trimmed
      .split(/(?<=[.!?。！？])\s+|\n+/)
      .map((part) => part.trim())
      .filter(Boolean);
    const parts = rawParts.length > 0 ? rawParts : [trimmed];
    return buildSpeechGestureSequence(
      parts.map((text, idx) => ({
        text,
        emotion: inferEmotionFromSentence(text, idx, parts.length),
      }))
    );
  }

  const results: GestureQueueItem[] = [];
  const total = input.length;
  for (let i = 0; i < total; i++) {
    const seg = input[i];
    if (!seg) continue;
    const text = (seg.text ?? '').trim();
    const explicitGesture = seg.gestureCode ? getGestureByCode(seg.gestureCode) : null;
    const resolvedEmotionInput = seg.emotion?.trim() || inferEmotionFromSentence(text, i, total);
    const gesture = explicitGesture ?? mapEmotionToGesture(resolvedEmotionInput);
    queueItemCounter += 1;
    results.push({
      id: `gq-${queueItemCounter}`,
      text,
      emotion: gesture.primaryEmotion,
      gestureCode: gesture.code,
      gestureLabel: gesture.label,
      durationMs: estimateDurationMs(text, gesture.defaultDurationMs, seg.durationMs),
    });
  }

  return results;
}

/**
 * Builds a multi-emotion 3-segment speech sequence for an RPG Village NPC dialogue:
 * 1) Greeting (기쁨 -> g-01)
 * 2) English question line (호기심 -> g-10)
 * 3) Korean context hint (차분함 -> g-22)
 */
export function buildRpgDialogueGestureSequence(dialogue: RpgDialogueInfo): GestureQueueItem[] {
  const segments: SpeechSegmentInput[] = [];
  if (dialogue.greetingKo?.trim()) {
    segments.push({
      text: dialogue.greetingKo.trim(),
      emotion: '기쁨',
      durationMs: 1450,
    });
  }
  if (dialogue.npcLineEn?.trim()) {
    segments.push({
      text: dialogue.npcLineEn.replace(/_____/g, 'blank').trim(),
      emotion: '호기심',
      durationMs: 2100,
    });
  }
  if (dialogue.npcLineKo?.trim()) {
    segments.push({
      text: dialogue.npcLineKo.trim(),
      emotion: '차분함',
      durationMs: 1650,
    });
  }
  return buildSpeechGestureSequence(segments);
}

export interface HumanRigElementLike {
  classList: {
    add: (...tokens: string[]) => void;
    remove: (...tokens: string[]) => void;
    contains?: (token: string) => boolean;
  };
  dataset?: Record<string, string | undefined>;
}

export interface HumanRigQueueSnapshot {
  activeClass: HumanRigMotionClass;
  activeGesture: GestureDefinition | null;
  activeEmotion: EmotionTag | null;
  activeText: string;
  isSpeaking: boolean;
  segmentIndex: number;
  totalSegments: number;
  queueLength: number;
  queuedCodes: GestureCode[];
}

export type HumanRigListener = (snapshot: HumanRigQueueSnapshot) => void;

export interface TimerScheduler {
  setTimeout: (fn: () => void, ms: number) => ReturnType<typeof setTimeout>;
  clearTimeout: (id: ReturnType<typeof setTimeout>) => void;
}

const DEFAULT_SCHEDULER: TimerScheduler = {
  setTimeout: (fn, ms) => globalThis.setTimeout(fn, ms),
  clearTimeout: (id) => globalThis.clearTimeout(id),
};

/**
 * Array-based Gesture Sequence Queue controller for `#humanRig`.
 * Sequentially applies gesture classes per spoken sentence segment, maps emotion tags
 * from GESTURES, and smoothly returns `#humanRig` to `'idleBreath'` upon completion.
 */
export class HumanRigGestureQueue {
  private queue: GestureQueueItem[] = [];
  private currentItem: GestureQueueItem | null = null;
  private activeClass: HumanRigMotionClass = IDLE_BREATH_CLASS;
  private segmentIndex = -1;
  private totalSegments = 0;
  private element: HumanRigElementLike | null = null;
  private listeners = new Set<HumanRigListener>();
  private activeTimer: ReturnType<typeof setTimeout> | null = null;
  private runToken = 0;
  private disposed = false;
  private readonly scheduler: TimerScheduler;

  constructor(scheduler: TimerScheduler = DEFAULT_SCHEDULER) {
    this.scheduler = scheduler;
  }

  public attachElement(el: HumanRigElementLike | null): void {
    this.element = el;
    this.syncElementDom();
  }

  public subscribe(listener: HumanRigListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): HumanRigQueueSnapshot {
    const activeGesture =
      this.activeClass === IDLE_BREATH_CLASS ? null : getGestureByCode(this.activeClass);
    return {
      activeClass: this.activeClass,
      activeGesture,
      activeEmotion: this.currentItem?.emotion ?? null,
      activeText: this.currentItem?.text ?? '',
      isSpeaking: this.currentItem !== null,
      segmentIndex: this.segmentIndex,
      totalSegments: this.totalSegments,
      queueLength: this.queue.length,
      queuedCodes: this.queue.map((item) => item.gestureCode),
    };
  }

  /**
   * Enqueues an array of sentence segments (or inline-tagged text).
   * - `interrupt: true` (default) replaces any in-flight speech sequence safely.
   * - `interrupt: false` appends segments to the active array queue.
   */
  public enqueueSequence(
    input: readonly SpeechSegmentInput[] | readonly GestureQueueItem[] | string,
    options?: { interrupt?: boolean }
  ): GestureQueueItem[] {
    if (this.disposed) return [];
    const interrupt = options?.interrupt ?? true;

    const normalizedItems: GestureQueueItem[] =
      typeof input === 'string'
        ? buildSpeechGestureSequence(input)
        : buildSpeechGestureSequence(input as readonly SpeechSegmentInput[]);

    if (normalizedItems.length === 0) {
      if (interrupt) {
        this.returnToIdleBreath();
      }
      return [];
    }

    if (interrupt) {
      this.clearTimer();
      this.runToken += 1;
      this.queue = [...normalizedItems];
      this.currentItem = null;
      this.segmentIndex = -1;
      this.totalSegments = normalizedItems.length;
      this.advanceQueue(this.runToken);
    } else {
      this.queue.push(...normalizedItems);
      this.totalSegments += normalizedItems.length;
      if (!this.currentItem) {
        this.runToken += 1;
        this.advanceQueue(this.runToken);
      } else {
        this.syncElementDom();
        this.emit();
      }
    }

    return normalizedItems;
  }

  /** Appends a single speech segment onto the array queue without interrupting current speech */
  public enqueueSegment(segment: SpeechSegmentInput): GestureQueueItem | null {
    const added = this.enqueueSequence([segment], { interrupt: false });
    return added[0] ?? null;
  }

  /** Convenience helper for RPG village NPC dialogue */
  public playRpgDialogue(dialogue: RpgDialogueInfo): GestureQueueItem[] {
    const seq = buildRpgDialogueGestureSequence(dialogue);
    return this.enqueueSequence(seq, { interrupt: true });
  }

  /**
   * Called when external TTS reports utterance completion.
   * If no further segments remain queued, returns smoothly to `idleBreath`.
   */
  public notifySpeechEnded(): void {
    if (this.disposed) return;
    if (this.queue.length === 0) {
      this.returnToIdleBreath();
    }
  }

  /** Immediately clears the queue, cancels timers, and smoothly restores `idleBreath` */
  public returnToIdleBreath(): void {
    this.clearTimer();
    this.runToken += 1;
    this.queue = [];
    this.currentItem = null;
    this.segmentIndex = -1;
    this.totalSegments = 0;
    this.activeClass = IDLE_BREATH_CLASS;
    this.syncElementDom();
    this.emit();
  }

  public dispose(): void {
    this.disposed = true;
    this.clearTimer();
    this.runToken += 1;
    this.queue = [];
    this.currentItem = null;
    this.element = null;
    this.listeners.clear();
  }

  private clearTimer(): void {
    if (this.activeTimer !== null) {
      this.scheduler.clearTimeout(this.activeTimer);
      this.activeTimer = null;
    }
  }

  private advanceQueue(token: number): void {
    if (this.disposed || token !== this.runToken) return;

    const next = this.queue.shift();
    if (!next) {
      this.currentItem = null;
      this.segmentIndex = -1;
      this.totalSegments = 0;
      this.activeClass = IDLE_BREATH_CLASS;
      this.syncElementDom();
      this.emit();
      return;
    }

    this.currentItem = next;
    this.segmentIndex += 1;
    this.activeClass = next.gestureCode;
    this.syncElementDom();
    this.emit();

    this.clearTimer();
    this.activeTimer = this.scheduler.setTimeout(() => {
      this.activeTimer = null;
      this.advanceQueue(token);
    }, next.durationMs);
  }

  private syncElementDom(): void {
    const el = this.element;
    if (!el) return;

    el.classList.remove(...ALL_GESTURE_CLASSES, IDLE_BREATH_CLASS);
    el.classList.add(this.activeClass);

    if (el.dataset) {
      el.dataset.gestureClass = this.activeClass;
      el.dataset.emotion = this.currentItem?.emotion ?? 'idle';
      el.dataset.speaking = this.currentItem ? 'true' : 'false';
      el.dataset.queueRemaining = String(this.queue.length);
    }
  }

  private emit(): void {
    const snapshot = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch {
        // Never allow a single subscriber exception to break queue advancement
      }
    });
  }
}
