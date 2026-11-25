import test from 'node:test';
import assert from 'node:assert/strict';
import { CSAT_VOCABULARY, GAME_CATALOG, generateGameQuestions } from './vocabulary';
import type { GameId } from './types';

test('CSAT vocabulary bank has 60 unique, well-formed entries', () => {
  assert.equal(CSAT_VOCABULARY.length, 60);
  const ids = new Set<string>();
  const words = new Set<string>();
  for (const entry of CSAT_VOCABULARY) {
    assert.ok(entry.id && !ids.has(entry.id), `Duplicate id ${entry.id}`);
    assert.ok(entry.word && !words.has(entry.word), `Duplicate word ${entry.word}`);
    ids.add(entry.id);
    words.add(entry.word);
    assert.ok(entry.meaning.length > 0);
    assert.ok(entry.sentence.includes('_____'), `Sentence missing blank for ${entry.word}`);
    assert.ok(entry.synonym.length > 0 && entry.antonym.length > 0);
    assert.equal(entry.chunks.join('').toLowerCase(), entry.word.toLowerCase(), `Chunks mismatch for ${entry.word}`);
  }
});

test('GAME_CATALOG defines 7 distinct 3D arcade, RPG & Tetris modes', () => {
  assert.equal(GAME_CATALOG.length, 7);
  const ids = new Set(GAME_CATALOG.map((g) => g.id));
  assert.equal(ids.size, 7);
  assert.equal(GAME_CATALOG[0].category, '문장 완성하기');
  assert.equal(GAME_CATALOG[1].category, '짝짓기 포탑 격파');
  assert.equal(GAME_CATALOG[2].category, '징검다리 건너기');
  assert.equal(GAME_CATALOG[3].category, '동의어·반대어 요격');
  assert.equal(GAME_CATALOG[4].category, '맞는것·틀린것 O/X');
  assert.equal(GAME_CATALOG[5].category, 'RPG 길거리 대화');
  assert.equal(GAME_CATALOG[6].category, '3D 블록 퍼즐');
});

test('generateGameQuestions produces valid, spoiler-free, deterministic questions for all 7 games', () => {
  const gameIds: GameId[] = [
    'sky-runner',
    'tower-crash',
    'spelling-hop',
    'synonym-defense',
    'vault-rush',
    'rpg-street',
    'voca-tetris',
  ];

  for (const gameId of gameIds) {
    const qA = generateGameQuestions(gameId, { seed: 42 });
    const qB = generateGameQuestions(gameId, { seed: 42 });
    assert.ok(qA.length >= 5, `${gameId} should generate at least 5 rounds`);
    assert.deepEqual(
      qA.map((q) => q.wordEntry.id),
      qB.map((q) => q.wordEntry.id),
      `${gameId} seeded generation should be deterministic`
    );

    for (const q of qA) {
      assert.ok(q.goalHeadline.includes('목표'), `${gameId} must announce a clear goalHeadline`);
      const correctCount = q.options.filter((o) => o.isCorrect).length;
      assert.equal(correctCount, 1, `${gameId} question ${q.id} must have exactly 1 correct option`);

      if (gameId === 'sky-runner' || gameId === 'rpg-street') {
        assert.equal(q.options.length, 3);
      } else if (gameId === 'tower-crash') {
        assert.equal(q.matchPairs?.pairs.length, 3, 'Tower Crash must generate 3 simultaneous matching pairs');
        assert.equal(q.matchPairs?.leftOrder.length, 3);
        assert.equal(q.matchPairs?.rightOrder.length, 3);
      } else if (gameId === 'synonym-defense') {
        assert.equal(q.options.length, 4);
        // Zero spoilers & zero duplicate meteor words!
        const uniqueLabels = new Set(q.options.map((o) => o.label.toLowerCase()));
        assert.equal(uniqueLabels.size, 4, 'Synonym Defense must have 4 unique English labels');
        for (const o of q.options) {
          assert.equal(o.subLabel, undefined, 'Synonym Defense options must never leak Korean meanings or antonym spoilers');
        }
      } else if (gameId === 'spelling-hop') {
        assert.equal(q.steps?.length, 3);
        q.steps?.forEach((step) => {
          assert.equal(step.choices.length, 3);
          assert.equal(step.choices.filter((c) => c.isCorrect).length, 1);
        });
      } else if (gameId === 'vault-rush') {
        assert.equal(q.options.length, 2);
      }
      if (gameId === 'rpg-street') {
        assert.ok(q.rpgDialogue && q.rpgDialogue.npcName.length > 0);
      }
    }
  }
});

test('Difficulty filtering selects matching SAT/CSAT level words cleanly', () => {
  const hardDeck = generateGameQuestions('synonym-defense', {
    count: 6,
    difficulty: '고난도빈출',
    seed: 123,
  });
  assert.equal(hardDeck.length, 6);
  for (const q of hardDeck) {
    assert.equal(q.wordEntry.level, '고난도빈출');
  }
});

test('SRS wrong-word priority places missed words into generated question deck', () => {
  const questions = generateGameQuestions('tower-crash', {
    count: 5,
    priorityWordIds: ['w03', 'w11'],
    seed: 99,
  });
  const ids = questions.map((q) => q.wordEntry.id);
  assert.ok(ids.includes('w03'), 'Priority wrong word w03 should be included');
  assert.ok(ids.includes('w11'), 'Priority wrong word w11 should be included');
});
