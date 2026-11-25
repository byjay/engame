import test from 'node:test';
import assert from 'node:assert/strict';
import { computeShimmerState } from './shimmerSystem';

test('computeShimmerState stays inactive on low combo without hit boost', () => {
  const s0 = computeShimmerState({ combo: 0, isFever: false, elapsed: 1.5, hitBoost: 0 });
  assert.equal(s0.active, false);
  assert.equal(s0.intensity, 0);
  assert.equal(s0.emissiveStrength, 0);

  const s1 = computeShimmerState({ combo: 1, isFever: false, elapsed: 2.0, hitBoost: 0 });
  assert.equal(s1.active, false);
  assert.equal(s1.isFever, false);
});

test('computeShimmerState activates subtle shimmer at combo 2 and intensifies in Fever mode', () => {
  const combo2 = computeShimmerState({ combo: 2, isFever: false, elapsed: 1.0, hitBoost: 0 });
  assert.equal(combo2.active, true);
  assert.equal(combo2.isFever, false);
  assert.ok(combo2.intensity > 0.2 && combo2.intensity < 0.5, 'combo 2 should be subtle');
  assert.ok(combo2.emissiveStrength > 0.04 && combo2.emissiveStrength < 0.25);

  const fever = computeShimmerState({ combo: 4, isFever: true, elapsed: 1.0, hitBoost: 0.6 });
  assert.equal(fever.active, true);
  assert.equal(fever.isFever, true);
  assert.ok(fever.intensity > combo2.intensity, 'Fever intensity must exceed combo 2');
  assert.ok(fever.emissiveStrength > combo2.emissiveStrength, 'Fever glow must exceed combo 2');
  assert.ok(fever.intensity <= 1.0, 'Intensity stays clamped to <= 1');
  assert.ok(fever.auraScale >= 0.95, 'Fever aura ring expands visibly');
});

test('computeShimmerState oscillates smoothly over time for subtle shimmer animation', () => {
  const t1 = computeShimmerState({ combo: 3, isFever: true, elapsed: 0.0, hitBoost: 0 });
  const t2 = computeShimmerState({ combo: 3, isFever: true, elapsed: 0.23, hitBoost: 0 });
  assert.notEqual(t1.pulseWave, t2.pulseWave);
  assert.ok(t1.wavePhase < t2.wavePhase);
});
