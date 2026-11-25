import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyRunToWallet,
  buildRunSummary,
  calculateCsatPercentile,
  calculateLeagueStanding,
  calculateRunClearBonus,
  calculateStarsEarned,
  claimDailyMissionReward,
  evaluateAnswer,
  evaluateDailyMissions,
} from './rules';
import {
  createGiftRequestHandoff,
  createInitialWallet,
  parseHostBootConfig,
  resolveGiftHandoffFromHost,
} from '../bridge/hostBridge';
import { CSAT_VOCABULARY, getWordMemoryTip } from './vocabulary';

test('evaluateAnswer scales score and coins with combo and speed, and deducts hearts on miss', () => {
  const firstHit = evaluateAnswer({
    isCorrect: true,
    currentCombo: 0,
    currentHearts: 3,
    timerRatio: 0.8,
    gameId: 'sky-runner',
  });
  assert.equal(firstHit.nextCombo, 1);
  assert.equal(firstHit.nextHearts, 3);
  assert.ok(firstHit.pointsAwarded >= 130);
  assert.ok(firstHit.coinsAwarded >= 5);

  const feverHit = evaluateAnswer({
    isCorrect: true,
    currentCombo: 3,
    currentHearts: 3,
    timerRatio: 0.8,
    gameId: 'sky-runner',
  });
  assert.equal(feverHit.nextCombo, 4);
  assert.equal(feverHit.isFever, true);
  assert.ok(feverHit.pointsAwarded > firstHit.pointsAwarded);
  assert.ok(feverHit.coinsAwarded > firstHit.coinsAwarded);

  const miss = evaluateAnswer({
    isCorrect: false,
    currentCombo: 4,
    currentHearts: 3,
    timerRatio: 0.5,
    gameId: 'sky-runner',
  });
  assert.equal(miss.nextCombo, 0);
  assert.equal(miss.nextHearts, 2);
  assert.equal(miss.coinsAwarded, 0);
});

test('run summary awards clear/star/XP bonuses and updates wallet SRS state', () => {
  assert.equal(calculateRunClearBonus({ isVictory: false, wrongCount: 3, maxCombo: 2 }), 0);
  assert.equal(calculateRunClearBonus({ isVictory: true, wrongCount: 1, maxCombo: 3 }), 25);
  assert.equal(calculateRunClearBonus({ isVictory: true, wrongCount: 0, maxCombo: 6 }), 65);
  assert.equal(calculateStarsEarned({ isVictory: true, accuracyPct: 100, wrongCount: 0 }), 3);
  assert.equal(calculateStarsEarned({ isVictory: true, accuracyPct: 80, wrongCount: 1 }), 2);
  assert.equal(calculateStarsEarned({ isVictory: false, accuracyPct: 50, wrongCount: 3 }), 0);

  const config = parseHostBootConfig('?userId=u1&initialCoins=100&parentName=엄마');
  const wallet = createInitialWallet(config);
  const summary = buildRunSummary({
    gameId: 'tower-crash',
    score: 1250,
    previousBestScore: 1140,
    baseCoins: 55,
    correctCount: 7,
    wrongCount: 1,
    totalRounds: 8,
    maxCombo: 5,
    heartsRemaining: 2,
    missedWords: [CSAT_VOCABULARY[2]],
    durationSec: 42,
  });

  assert.equal(summary.isVictory, true);
  assert.equal(summary.isNewRecord, true);
  assert.equal(summary.starsEarned, 2);
  assert.ok(summary.xpEarned > 100);
  assert.equal(summary.coinsEarned, 55 + 35); // +25 clear +10 combo>=5
  assert.equal(summary.accuracyPct, 88);

  const updated = applyRunToWallet(wallet, summary, [CSAT_VOCABULARY[0], CSAT_VOCABULARY[1]]);
  assert.equal(updated.coins, 100 + summary.coinsEarned);
  assert.ok(updated.wrongWordIds.includes(CSAT_VOCABULARY[2].id));
  assert.equal(updated.bestScores['tower-crash'], 1250);
  assert.ok(calculateCsatPercentile(updated) >= 1.2);
  assert.ok(getWordMemoryTip(CSAT_VOCABULARY[0]).length > 5);
});

test('weekly student league and daily challenge missions award claimable coins cleanly', () => {
  const league = calculateLeagueStanding(480, '테스트학생');
  assert.equal(league.tierName, '실버');
  assert.equal(league.nextTierName, '골드');
  assert.equal(league.xpToNextTier, 320);
  assert.equal(league.rivals.length, 6);

  const config = parseHostBootConfig('?initialCoins=100');
  const wallet = createInitialWallet(config);
  const missions = evaluateDailyMissions(wallet);
  assert.equal(missions.length, 3);
  assert.equal(missions[0].completed, true); // bestComboToday seeded at 3

  const claim1 = claimDailyMissionReward(wallet, 'mission-combo-3');
  assert.equal(claim1.ok, true);
  assert.equal(claim1.rewardCoins, 35);
  assert.equal(claim1.updatedWallet.coins, 135);

  // Double-claim must be prevented
  const claim2 = claimDailyMissionReward(claim1.updatedWallet, 'mission-combo-3');
  assert.equal(claim2.ok, false);
  assert.equal(claim2.updatedWallet.coins, 135);
});

test('parent gift handoff validates balance, escrows coins, and refunds on host decline', () => {
  const config = parseHostBootConfig('?embed=1&autostart=1&game=vault-rush&initialCoins=200');
  assert.equal(config.isEmbedded, true);
  assert.equal(config.autostart, true);
  assert.equal(config.initialGameId, 'vault-rush');

  const wallet = createInitialWallet(config);

  const tooExpensive = createGiftRequestHandoff({
    wallet,
    giftId: 'gift-voucher',
    giftTitle: '문화상품권 10,000원',
    coinCost: 600,
    studentMessage: '열심히 했어요!',
  });
  assert.equal(tooExpensive.ok, false);
  assert.equal(tooExpensive.updatedWallet.coins, 200);

  const created = createGiftRequestHandoff({
    wallet,
    giftId: 'gift-snack',
    giftTitle: '편의점 간식 쿠폰 3,000원',
    coinCost: 150,
    studentMessage: '오늘 수능 영단어 100% 달성!',
    requestId: 'GIFT-TEST-1',
  });
  assert.equal(created.ok, true);
  assert.equal(created.updatedWallet.coins, 50);
  assert.equal(created.updatedWallet.handoffHistory[0].status, 'PENDING_HOST');
  assert.equal(created.record?.payload.requestId, 'GIFT-TEST-1');

  const declined = resolveGiftHandoffFromHost({
    wallet: created.updatedWallet,
    requestId: 'GIFT-TEST-1',
    approved: false,
    parentReply: '다음 주에 사줄게!',
  });
  assert.equal(declined.coins, 200, 'Declining a pending handoff must refund escrowed coins');
  assert.equal(declined.handoffHistory[0].status, 'DECLINED_BY_PARENT');

  // Re-request and approve -> coins remain spent
  const created2 = createGiftRequestHandoff({
    wallet: declined,
    giftId: 'gift-snack',
    giftTitle: '편의점 간식 쿠폰 3,000원',
    coinCost: 150,
    studentMessage: '다시 요청드려요!',
    requestId: 'GIFT-TEST-2',
  });
  const approved = resolveGiftHandoffFromHost({
    wallet: created2.updatedWallet,
    requestId: 'GIFT-TEST-2',
    approved: true,
    parentReply: '승인 완료!',
  });
  assert.equal(approved.coins, 50);
  assert.equal(approved.handoffHistory[0].status, 'APPROVED_BY_PARENT');
});
