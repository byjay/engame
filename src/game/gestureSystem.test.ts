import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GESTURES,
  HumanRigGestureQueue,
  IDLE_BREATH_CLASS,
  buildRpgDialogueGestureSequence,
  buildSpeechGestureSequence,
  mapEmotionToGesture,
  type HumanRigElementLike,
  type TimerScheduler,
} from './gestureSystem';

function createMockHumanRigElement(): {
  el: HumanRigElementLike;
  classes: Set<string>;
  dataset: Record<string, string | undefined>;
} {
  const classes = new Set<string>();
  const dataset: Record<string, string | undefined> = {};
  const el: HumanRigElementLike = {
    classList: {
      add: (...tokens: string[]) => {
        tokens.forEach((t) => classes.add(t));
      },
      remove: (...tokens: string[]) => {
        tokens.forEach((t) => classes.delete(t));
      },
      contains: (token: string) => classes.has(token),
    },
    dataset,
  };
  return { el, classes, dataset };
}

function createFakeScheduler() {
  let nextId = 1;
  const tasks = new Map<number, { fn: () => void; ms: number }>();
  const scheduler: TimerScheduler = {
    setTimeout: (fn, ms) => {
      const id = nextId++;
      tasks.set(id, { fn, ms });
      return id as unknown as ReturnType<typeof setTimeout>;
    },
    clearTimeout: (id) => {
      tasks.delete(id as unknown as number);
    },
  };
  return {
    scheduler,
    pendingCount: () => tasks.size,
    flushNext: () => {
      const first = tasks.entries().next();
      if (first.done) return false;
      const [id, task] = first.value;
      tasks.delete(id);
      task.fn();
      return true;
    },
  };
}

test('mapEmotionToGesture maps core Korean and English emotion tags to canonical GESTURES codes', () => {
  assert.equal(GESTURES.length >= 22, true);
  assert.equal(mapEmotionToGesture('기쁨').code, 'g-01');
  assert.equal(mapEmotionToGesture('호기심').code, 'g-10');
  assert.equal(mapEmotionToGesture('차분함').code, 'g-22');
  assert.equal(mapEmotionToGesture('joy').code, 'g-01');
  assert.equal(mapEmotionToGesture('curiosity').code, 'g-10');
  assert.equal(mapEmotionToGesture('calm').code, 'g-22');
  // Unknown or empty emotion falls back safely to g-22 (차분함)
  assert.equal(mapEmotionToGesture('').code, 'g-22');
  assert.equal(mapEmotionToGesture('알수없는감정').code, 'g-22');
});

test('buildSpeechGestureSequence parses inline emotion tags and multi-segment arrays', () => {
  const fromTags = buildSpeechGestureSequence(
    '[기쁨] 안녕하세요! [호기심] 이 단어를 아시나요? [차분함] 천천히 생각해 보세요.'
  );
  assert.deepEqual(
    fromTags.map((i) => i.gestureCode),
    ['g-01', 'g-10', 'g-22']
  );

  const fromRpg = buildRpgDialogueGestureSequence({
    npcId: 'npc-barista-01',
    npcName: '소피아',
    npcRole: '바리스타',
    locationName: '선라이즈 카페',
    greetingKo: '안녕하세요! 오늘 커피 향이 정말 좋아요.',
    npcLineEn: 'Could you recommend a _____ blend?',
    npcLineKo: '빈칸에 들어갈 단어를 골라 주세요.',
    replySuccessKo: '정말 멋져요!',
    shirtColor: 0x0284c7,
    accentColor: 0xf59e0b,
  });
  assert.deepEqual(
    fromRpg.map((i) => i.gestureCode),
    ['g-01', 'g-10', 'g-22']
  );
});

test('HumanRigGestureQueue plays gesture classes sequentially on #humanRig and returns to idleBreath', () => {
  const fake = createFakeScheduler();
  const mockRig = createMockHumanRigElement();
  const queue = new HumanRigGestureQueue(fake.scheduler);
  queue.attachElement(mockRig.el);

  // Initial state is idleBreath
  assert.equal(mockRig.classes.has(IDLE_BREATH_CLASS), true);
  assert.equal(queue.getState().activeClass, IDLE_BREATH_CLASS);

  const observed: string[] = [];
  queue.subscribe((snap) => observed.push(snap.activeClass));

  queue.enqueueSequence([
    { text: '정말 반가워요!', emotion: '기쁨', durationMs: 1000 },
    { text: '이 문장의 빈칸은 뭘까요?', emotion: '호기심', durationMs: 1200 },
    { text: '천천히 선택해 보세요.', emotion: '차분함', durationMs: 1100 },
  ]);

  // Segment 1: 기쁨 -> g-01
  assert.equal(mockRig.classes.has('g-01'), true);
  assert.equal(mockRig.classes.has(IDLE_BREATH_CLASS), false);
  assert.equal(mockRig.dataset.emotion, '기쁨');
  assert.equal(mockRig.dataset.queueRemaining, '2');

  // Segment 2: 호기심 -> g-10
  assert.equal(fake.flushNext(), true);
  assert.equal(mockRig.classes.has('g-10'), true);
  assert.equal(mockRig.classes.has('g-01'), false);
  assert.equal(mockRig.dataset.emotion, '호기심');
  assert.equal(mockRig.dataset.queueRemaining, '1');

  // Segment 3: 차분함 -> g-22
  assert.equal(fake.flushNext(), true);
  assert.equal(mockRig.classes.has('g-22'), true);
  assert.equal(mockRig.classes.has('g-10'), false);
  assert.equal(mockRig.dataset.emotion, '차분함');
  assert.equal(mockRig.dataset.queueRemaining, '0');

  // End of sequence: smoothly returns to idleBreath
  assert.equal(fake.flushNext(), true);
  assert.equal(mockRig.classes.has(IDLE_BREATH_CLASS), true);
  assert.equal(mockRig.classes.has('g-22'), false);
  assert.equal(mockRig.dataset.speaking, 'false');
  assert.equal(fake.pendingCount(), 0);
  assert.deepEqual(observed, ['idleBreath', 'g-01', 'g-10', 'g-22', 'idleBreath']);
});

test('HumanRigGestureQueue supports appending segments and safe interruption without stale timers', () => {
  const fake = createFakeScheduler();
  const mockRig = createMockHumanRigElement();
  const queue = new HumanRigGestureQueue(fake.scheduler);
  queue.attachElement(mockRig.el);

  queue.enqueueSequence([{ text: '반가워요', emotion: '기쁨', durationMs: 1000 }]);
  queue.enqueueSegment({ text: '궁금해요?', emotion: '호기심', durationMs: 1000 });
  assert.equal(queue.getState().activeClass, 'g-01');
  assert.equal(queue.getState().queueLength, 1);

  // Interrupt mid-speech with a calm segment: previous timer must be cancelled
  queue.enqueueSequence([{ text: '차분히 마무리해요', emotion: '차분함', durationMs: 900 }], {
    interrupt: true,
  });
  assert.equal(fake.pendingCount(), 1);
  assert.equal(queue.getState().activeClass, 'g-22');
  assert.equal(mockRig.classes.has('g-22'), true);
  assert.equal(mockRig.classes.has('g-01'), false);

  // Complete -> returns to idleBreath
  fake.flushNext();
  assert.equal(queue.getState().activeClass, IDLE_BREATH_CLASS);
  assert.equal(mockRig.classes.has(IDLE_BREATH_CLASS), true);
});
