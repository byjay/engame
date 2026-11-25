import React from 'react';
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Footprints,
  MessageCircle,
  Pause,
  RotateCw,
  Target,
  Volume1,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import type { CsatWord, GoalTone, HudSnapshot } from '../game/types';
import type { HumanRigQueueSnapshot } from '../game/gestureSystem';
import {
  TETROMINO_SHAPES,
  TETROMINO_VISUALS,
  type TetrominoType,
} from '../game/tetrisEngine';
import { getGameMeta } from '../game/vocabulary';
import { GoldCoinIcon, HeartSocketIcon } from './ArcadeIcons';

interface PlayingHudProps {
  hud: HudSnapshot;
  rigState?: HumanRigQueueSnapshot;
  muted: boolean;
  leftHanded: boolean;
  onSelectOption: (optionIndex: number) => void;
  onSelectTowerCard: (side: 'left' | 'right', pairId: string) => void;
  onMoveLane: (delta: number) => void;
  onBoostDash: () => void;
  onWalkRpgForward: () => void;
  onTetrisMove: (dx: -1 | 1) => void;
  onTetrisRotate: (dir: 1 | -1) => void;
  onTetrisSoftDropStep: () => void;
  onTetrisHardDrop: () => void;
  onTetrisHold: () => void;
  onSpeakPrompt: () => void;
  onToggleMute: () => void;
  onToggleLeftHanded: () => void;
  onPause: () => void;
}

const GOAL_TONE_CLASSES: Record<GoalTone, string> = {
  sky: 'bg-sky-600 text-white',
  emerald: 'bg-emerald-600 text-white',
  amber: 'bg-amber-500 text-slate-950',
  violet: 'bg-violet-600 text-white',
  coral: 'bg-rose-600 text-white',
};

function renderBlankSentence(sentence: string, highlightClass = 'bg-sky-100 text-sky-800 border-sky-400') {
  if (!sentence.includes('_____')) return sentence;
  const [before, after] = sentence.split('_____');
  return (
    <>
      {before}
      <span
        className={`inline-block px-1.5 mx-0.5 rounded-md border-b-2 font-mono-num font-black ${highlightClass}`}
      >
        _____
      </span>
      {after}
    </>
  );
}

/** Clean unboxed vocabulary study metadata line (품사 · 동의어 · 반대어) */
function WordLexicalLine({
  word,
  showSynonyms = true,
  showKoreanOnRel = false,
}: {
  word: CsatWord;
  showSynonyms?: boolean;
  showKoreanOnRel?: boolean;
}) {
  return (
    <div
      data-testid="hud-word-lexical-line"
      className="mt-1 pt-1 border-t border-slate-200/80 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] leading-snug text-slate-700"
    >
      <span className="font-black text-slate-900">{word.pos}</span>
      {showSynonyms && (
        <>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span>
            <span className="font-extrabold text-sky-700">동의어</span>{' '}
            <strong className="font-black text-slate-900">{word.synonym}</strong>
            {showKoreanOnRel && (
              <span className="text-slate-500"> ({word.synonymKo})</span>
            )}
          </span>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span>
            <span className="font-extrabold text-rose-700">반대어</span>{' '}
            <strong className="font-black text-slate-900">{word.antonym}</strong>
            {showKoreanOnRel && (
              <span className="text-slate-500"> ({word.antonymKo})</span>
            )}
          </span>
        </>
      )}
    </div>
  );
}

function MiniTetrominoPreview({
  type,
  dimmed = false,
}: {
  type: TetrominoType | null;
  dimmed?: boolean;
}) {
  const cells = type ? TETROMINO_SHAPES[type][0] : [];
  const color = type ? TETROMINO_VISUALS[type].cssColor : 'transparent';

  return (
    <div
      className={`grid grid-cols-4 grid-rows-3 gap-[1.5px] w-8 h-6 items-center justify-items-center ${
        dimmed ? 'opacity-40' : ''
      }`}
      aria-hidden="true"
    >
      {Array.from({ length: 12 }).map((_, idx) => {
        const cx = idx % 4;
        const cy = Math.floor(idx / 4);
        const filled = cells.some((c) => c.x === cx && c.y === cy);
        return (
          <span
            key={idx}
            className="w-[6.5px] h-[6.5px] rounded-[1.5px]"
            style={{
              backgroundColor: filled ? color : 'transparent',
              boxShadow: filled ? 'inset 0 -1px 0 rgba(0,0,0,0.28)' : 'none',
            }}
          />
        );
      })}
    </div>
  );
}

export function PlayingHud({
  hud,
  rigState,
  muted,
  leftHanded,
  onSelectOption,
  onSelectTowerCard,
  onWalkRpgForward,
  onTetrisMove,
  onTetrisRotate,
  onTetrisSoftDropStep,
  onTetrisHardDrop,
  onTetrisHold,
  onSpeakPrompt,
  onToggleMute,
  onToggleLeftHanded,
  onPause,
}: PlayingHudProps) {
  const meta = getGameMeta(hud.gameId);
  const question = hud.question;
  const timerPct = Math.round(hud.timerRatio * 100);
  const timerColor =
    timerPct > 45 ? '#58CC02' : timerPct > 22 ? '#FF9600' : '#FF4B4B';

  const activeChoices =
    hud.gameId === 'spelling-hop' && question?.steps
      ? question.steps[hud.spellingStep]?.choices ?? []
      : question?.options ?? [];

  const isTetris = hud.gameId === 'voca-tetris';
  const tetris = hud.tetris;

  // Tower Crash live focused English word for rich contextual study (zero Korean-meaning spoiler!)
  const focusedTowerPair = React.useMemo(() => {
    if (hud.gameId !== 'tower-crash' || !question?.matchPairs) return null;
    if (hud.towerSelectedSide === 'left' && hud.towerSelectedPairId) {
      const sel = question.matchPairs.pairs.find((p) => p.pairId === hud.towerSelectedPairId);
      if (sel) return sel;
    }
    const firstUnmatchedId = question.matchPairs.leftOrder.find(
      (id) => !hud.towerMatchedPairIds.includes(id)
    );
    return question.matchPairs.pairs.find((p) => p.pairId === firstUnmatchedId) ?? null;
  }, [hud.gameId, hud.towerSelectedSide, hud.towerSelectedPairId, hud.towerMatchedPairIds, question]);

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between pt-4 px-2.5 pb-2.5">
      {/* TOP MOBILE HUD: Compact Single-Row Status Strip + Rich Vocabulary Card */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-1">
          {/* Compact Hearts + Round/Lines + Score + Coins */}
          <div className="pointer-events-auto flex items-center gap-1 bg-white/95 border-2 border-slate-200 border-b-4 rounded-2xl px-2 py-1 shadow-sm min-w-0">
            <div
              className="flex items-center gap-0.5 shrink-0"
              aria-label={`남은 하트 ${hud.hearts}개`}
            >
              {Array.from({ length: hud.maxHearts }).map((_, i) => (
                <HeartSocketIcon
                  key={i}
                  state={
                    i < hud.hearts
                      ? 'full'
                      : i === hud.hearts && hud.hearts < hud.maxHearts
                        ? 'cracked'
                        : 'empty'
                  }
                />
              ))}
            </div>

            <span className="text-slate-300 text-[10px]" aria-hidden="true">
              |
            </span>

            {isTetris && tetris ? (
              <div className="flex items-baseline gap-0.5 shrink-0">
                <span className="text-[10px] font-extrabold text-sky-600">줄</span>
                <span
                  data-testid="hud-tetris-lines"
                  className="font-mono-num text-[11.5px] font-black text-slate-900"
                >
                  {tetris.lines}/{tetris.targetLines}
                </span>
              </div>
            ) : (
              <div className="flex items-baseline gap-0.5 shrink-0">
                <span className="text-[10px] font-extrabold text-slate-500">
                  {hud.gameId === 'tower-crash' ? 'W' : hud.gameId === 'rpg-street' ? 'Q' : 'R'}
                </span>
                <span className="font-mono-num text-[11.5px] font-black text-slate-900">
                  {Math.min(hud.roundIndex + 1, hud.totalRounds)}/{hud.totalRounds}
                </span>
              </div>
            )}

            <span className="text-slate-300 text-[10px]" aria-hidden="true">
              |
            </span>

            <span
              data-testid="hud-score"
              className="font-mono-num text-[11.5px] font-black text-slate-900 shrink-0"
            >
              {hud.score.toLocaleString()}
            </span>

            <div className="flex items-center gap-0.5 shrink-0">
              <GoldCoinIcon className="w-3.5 h-3.5" />
              <span
                data-testid="hud-run-coins"
                className="font-mono-num text-[11.5px] font-black text-amber-700"
              >
                +{hud.coinsEarnedRun}
              </span>
            </div>
          </div>

          {/* Compact Android Action Icon Buttons */}
          <div className="pointer-events-auto flex items-center gap-1 shrink-0">
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onSpeakPrompt();
              }}
              aria-label="영어 발음 듣기"
              className="arcade-btn-surface w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center cursor-pointer"
            >
              <Volume1 className="w-4 h-4 text-sky-600" />
            </button>
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onToggleLeftHanded();
              }}
              aria-label={leftHanded ? '오른손 조작으로 변경' : '왼손 조작으로 변경'}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center cursor-pointer ${
                leftHanded ? 'arcade-btn-blue' : 'arcade-btn-surface'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onToggleMute();
              }}
              aria-label={muted ? '사운드 켜기' : '사운드 끄기'}
              className="arcade-btn-surface w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center cursor-pointer"
            >
              {muted ? (
                <VolumeX className="w-4 h-4 text-slate-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-slate-800" />
              )}
            </button>
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onPause();
              }}
              aria-label="일시정지"
              className="arcade-btn-surface w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center cursor-pointer"
            >
              <Pause className="w-4 h-4 text-slate-800" />
            </button>
          </div>
        </div>

        {/* Motivating Streak / Fever Charge Chip */}
        {hud.combo >= 1 && (
          <div
            data-testid="hud-combo-chip"
            className={`mx-auto px-3 py-0.5 rounded-full font-mono-num text-[11px] font-black shadow-sm ${
              hud.isFever
                ? 'bg-amber-400 text-slate-950'
                : hud.combo === 2
                  ? 'bg-sky-600 text-white'
                  : 'bg-white/95 text-slate-800 border border-slate-200'
            }`}
          >
            {hud.isFever
              ? `🔥 FEVER ${hud.combo}x (+25% 코인)`
              : hud.combo === 2
                ? '⚡ 2연속! 1문제 더 맞히면 FEVER 코인 부스트!'
                : '⚡ 1연속! 3연속 시 FEVER x1.25 코인'}
          </div>
        )}

        {/* GAME 7 TOP BAR: Compact 3D Voca Tetris Hold + Word Blast Quick Quiz (with SYN/ANT) + Next */}
        {isTetris && tetris && question && (
          <div className="pointer-events-auto bg-white/95 border-2 border-slate-200 border-b-4 rounded-2xl p-1.5 shadow-md w-full">
            <div className="flex items-stretch gap-1.5">
              {/* HOLD Piece Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onTetrisHold();
                }}
                aria-label="블록 보관"
                className={`shrink-0 w-[44px] rounded-xl border-2 px-1 py-1 flex flex-col items-center justify-between cursor-pointer ${
                  tetris.canHold
                    ? 'bg-slate-50 border-slate-200 active:bg-slate-100'
                    : 'bg-slate-100 border-slate-200 opacity-60'
                }`}
              >
                <span className="text-[9px] font-black text-slate-500 leading-none">보관</span>
                <MiniTetrominoPreview type={tetris.holdType} dimmed={!tetris.canHold} />
              </button>

              {/* WORD BLAST Quick Vocabulary Power-Up */}
              <div className="flex-1 min-w-0 flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-sky-700 truncate">
                    <Zap className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                    <span
                      data-testid="tetris-word-prompt"
                      className="text-slate-950 text-[13.5px] font-black truncate"
                    >
                      {question.promptMain}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 shrink-0">
                      {question.wordEntry.pos}
                    </span>
                  </span>
                  <span className="text-[9.5px] font-extrabold text-slate-500 shrink-0">
                    Lv.{tetris.level}
                  </span>
                </div>

                {/* Crisp inline Synonym / Antonym study clue */}
                <div
                  data-testid="tetris-syn-ant"
                  className="text-[10px] font-bold text-slate-600 truncate leading-none"
                >
                  <span className="text-sky-700 font-extrabold">유</span> {question.wordEntry.synonym}
                  <span className="mx-1 text-slate-300">·</span>
                  <span className="text-rose-700 font-extrabold">반</span> {question.wordEntry.antonym}
                </div>

                <div className="grid grid-cols-2 gap-1">
                  {activeChoices.slice(0, 2).map((opt, idx) => (
                    <button
                      key={opt.id}
                      type="button"
                      data-testid={`tetris-word-opt-${idx}`}
                      onClick={(e) => {
                        e.currentTarget.blur();
                        onSelectOption(idx);
                      }}
                      className="arcade-btn-surface min-h-[34px] px-1.5 py-1 rounded-xl text-[11px] font-black text-slate-900 leading-tight cursor-pointer"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* NEXT Piece Preview */}
              <div className="shrink-0 w-[44px] rounded-xl bg-slate-50 border-2 border-slate-200 px-1 py-1 flex flex-col items-center justify-between">
                <span className="text-[9px] font-black text-slate-500 leading-none">다음</span>
                <MiniTetrominoPreview type={tetris.nextTypes[0] ?? null} />
              </div>
            </div>
          </div>
        )}

        {/* STANDARD GAMES (1~6) GOAL NOTICE + RICH VOCABULARY QUESTION CARD */}
        {!isTetris && question && (
          <div
            className={`bg-white/95 border-2 border-b-4 rounded-2xl overflow-hidden shadow-md w-full ${
              question.isRevengeReview ? 'border-amber-400' : 'border-slate-200'
            }`}
          >
            <div
              data-testid="hud-goal-banner"
              className={`px-3 py-1.5 flex items-start justify-between gap-2 text-[11px] font-black ${
                GOAL_TONE_CLASSES[question.goalTone]
              }`}
            >
              <div className="flex items-start gap-1.5 min-w-0">
                <Target className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="leading-snug">{question.goalHeadline}</span>
              </div>
              {hud.gameId === 'tower-crash' && (
                <span className="font-mono-num text-[11px] shrink-0">
                  {hud.towerMatchedPairIds.length}/3
                </span>
              )}
              {hud.gameId === 'spelling-hop' && (
                <span className="font-mono-num text-[11px] shrink-0">
                  {hud.spellingStep + 1}/3단
                </span>
              )}
              {hud.gameId === 'rpg-street' && (
                <span className="font-mono-num text-[11px] shrink-0">
                  {hud.rpgDistancePct}%
                </span>
              )}
            </div>

            {hud.gameId !== 'rpg-street' && (
              <div className="px-3 py-2">
                <div className="flex items-center justify-between gap-2 text-[10px] font-extrabold text-slate-500">
                  <span className={question.isRevengeReview ? 'text-amber-700' : ''}>
                    {meta.title} · {question.promptBadge}
                  </span>
                  {hud.gameId === 'spelling-hop' && (
                    <span className="font-mono-num text-orange-600 font-black">
                      완성: {hud.spellingBuilt || '___'}
                    </span>
                  )}
                </div>

                {/* GAME 2: TOWER CRASH — Rich Focused Word Tactical Study Card (Word + POS + Sentence Blank + SYN/ANT!) */}
                {hud.gameId === 'tower-crash' && focusedTowerPair && (
                  <div data-testid="tower-focus-word-card" className="mt-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-1.5 min-w-0">
                        <span className="text-[16px] font-black text-slate-950 tracking-tight truncate">
                          {focusedTowerPair.wordEntry.word}
                        </span>
                        <span className="text-[11px] font-extrabold text-sky-700 shrink-0">
                          {focusedTowerPair.wordEntry.pos} · {focusedTowerPair.wordEntry.level}
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-700 shrink-0">
                        {hud.towerSelectedSide === 'left' ? '선택됨 · 뜻 성탑 탭!' : '집중 단어 힌트'}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[12px] font-bold text-slate-800 leading-snug">
                      {renderBlankSentence(focusedTowerPair.wordEntry.sentence)}
                    </div>
                    <WordLexicalLine word={focusedTowerPair.wordEntry} />
                  </div>
                )}

                {/* GAMES 1, 3, 4, 5: Detailed Prompt + Sentence Blank + SYN/ANT Context */}
                {hud.gameId !== 'tower-crash' && (
                  <>
                    <div className="mt-0.5 text-[14.5px] font-black text-slate-950 leading-snug">
                      {renderBlankSentence(question.promptMain)}
                    </div>
                    <div className="mt-0.5 text-[11.5px] font-bold text-slate-600 leading-snug">
                      {question.promptSub}
                    </div>

                    {/* Show sentence fill-in-the-blank context for Spelling Hop, Synonym Defense & Vault Rush */}
                    {(hud.gameId === 'spelling-hop' ||
                      hud.gameId === 'synonym-defense' ||
                      hud.gameId === 'vault-rush') && (
                      <div
                        data-testid="hud-sentence-blank"
                        className="mt-1 pt-1 border-t border-slate-200/80 text-[11.5px] leading-snug"
                      >
                        <div className="font-bold text-slate-800">
                          <span className="text-[10px] font-black text-sky-700 mr-1">예문</span>
                          {renderBlankSentence(question.wordEntry.sentence)}
                        </div>
                        {hud.gameId !== 'vault-rush' && (
                          <div className="text-[10.5px] font-semibold text-slate-500 mt-0.5">
                            {question.wordEntry.sentenceKo}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Show POS + Synonym + Antonym line (never spoil target in synonym-defense!) */}
                    {hud.gameId === 'sky-runner' || hud.gameId === 'spelling-hop' ? (
                      <WordLexicalLine word={question.wordEntry} showSynonyms />
                    ) : hud.gameId === 'synonym-defense' || hud.gameId === 'vault-rush' ? (
                      <WordLexicalLine word={question.wordEntry} showSynonyms={false} />
                    ) : null}
                  </>
                )}

                <div className="mt-1.5 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-transform duration-100 origin-left"
                    style={{
                      transform: `scaleX(${Math.max(0, Math.min(1, timerPct / 100))})`,
                      backgroundColor: timerColor,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instant Rich Vocabulary Mastery Feedback Banner */}
        {hud.feedbackBanner && (
          <div
            key={hud.feedbackBanner.id}
            data-testid="hud-feedback-banner"
            className={`mx-auto px-3 py-2 rounded-2xl border-2 text-left shadow-md w-full ${
              hud.feedbackBanner.type === 'correct'
                ? 'bg-emerald-700 border-emerald-900 text-white'
                : 'bg-rose-700 border-rose-900 text-white'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black">{hud.feedbackBanner.text}</span>
              {hud.feedbackBanner.wordDetail && (
                <span className="text-[10px] font-extrabold opacity-90 shrink-0">
                  {hud.feedbackBanner.wordDetail.pos} · {hud.feedbackBanner.wordDetail.level}
                </span>
              )}
            </div>
            {hud.feedbackBanner.subText && (
              <div className="text-[11.5px] font-extrabold opacity-95 mt-0.5">
                {hud.feedbackBanner.subText}
              </div>
            )}
            {hud.feedbackBanner.wordDetail && (
              <div className="mt-1 pt-1 border-t border-white/20 text-[10.5px] font-bold opacity-95 leading-snug">
                <span>
                  동의어 {hud.feedbackBanner.wordDetail.synonym}({hud.feedbackBanner.wordDetail.synonymKo})
                </span>
                <span className="mx-1.5 opacity-60">·</span>
                <span>
                  반대어 {hud.feedbackBanner.wordDetail.antonym}({hud.feedbackBanner.wordDetail.antonymKo})
                </span>
              </div>
            )}
            {hud.feedbackBanner.memoryTip && (
              <div className="mt-0.5 text-[10px] font-semibold opacity-90">
                {hud.feedbackBanner.memoryTip}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CENTER PLAYFIELD: 100% OPEN FOR 3D GAMEPLAY & TOUCH SWIPE / TAP */}
      <div className="flex-1" />

      {/* BOTTOM THUMB-ZONE MOBILE CONTROLS: 7 EFFORTLESS WORD-FIRST ARCADE MODES */}
      <div className="pointer-events-auto w-full pb-safe">
        {/* GAME 1: SKY RUNNER — Effortless 1-Tap Word Gate Launchers */}
        {hud.gameId === 'sky-runner' && (
          <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-3 gap-2">
              {activeChoices.map((opt, idx) => {
                const isSelectedLane = hud.activeLane === idx;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    data-testid={`sky-runner-opt-${idx}`}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onSelectOption(idx);
                    }}
                    className={`min-h-[60px] px-2 py-2 rounded-2xl font-black cursor-pointer flex flex-col items-center justify-center gap-0.5 min-w-0 ${
                      isSelectedLane ? 'arcade-btn-blue' : 'arcade-btn-surface'
                    }`}
                  >
                    <span className="text-[13.5px] leading-tight truncate max-w-full">
                      {opt.label}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold ${
                        isSelectedLane ? 'text-sky-100' : 'text-sky-700'
                      }`}
                    >
                      {opt.subLabel ? `${opt.subLabel} · ` : ''}
                      {idx + 1}번 ▶
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-center text-[10px] font-extrabold text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]">
              정답 영단어를 한 번만 탭하면 제트기가 자동 선회·돌파합니다
            </p>
          </div>
        )}

        {/* GAME 2: TOWER CRASH — Mobile 2-Column 3-Pair Castle Matching Touch Board */}
        {hud.gameId === 'tower-crash' && question?.matchPairs && (
          <div className="grid grid-cols-2 gap-2 bg-slate-900/95 border-2 border-slate-700 border-b-4 rounded-2xl p-2 shadow-lg">
            <div className="flex flex-col gap-1.5">
              <div className="text-[10.5px] font-black text-sky-300 px-1">
                1. 영단어 성탑 (왼쪽)
              </div>
              {question.matchPairs.leftOrder.map((pairId, idx) => {
                const pair = question.matchPairs!.pairs.find((p) => p.pairId === pairId)!;
                const isMatched = hud.towerMatchedPairIds.includes(pairId);
                const isSelected =
                  hud.towerSelectedSide === 'left' && hud.towerSelectedPairId === pairId;
                return (
                  <button
                    key={pairId}
                    type="button"
                    data-testid={`tower-left-${idx}`}
                    disabled={isMatched}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onSelectTowerCard('left', pairId);
                    }}
                    className={`min-h-[46px] px-2.5 py-1.5 rounded-xl font-black text-left flex items-center justify-between gap-1 cursor-pointer ${
                      isMatched
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-700/60 line-through opacity-55 cursor-default'
                        : isSelected
                          ? 'arcade-btn-blue'
                          : 'arcade-btn-surface'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-[13px] leading-tight truncate">{pair.leftLabel}</div>
                      <div
                        className={`text-[9.5px] font-bold leading-none mt-0.5 ${
                          isSelected ? 'text-sky-100' : 'text-slate-500'
                        }`}
                      >
                        {pair.wordEntry.pos}
                      </div>
                    </div>
                    <span className="font-mono-num text-[10px] opacity-80 shrink-0">E{idx + 1}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="text-[10.5px] font-black text-emerald-300 px-1">
                2. 한글 뜻 성탑 (오른쪽)
              </div>
              {question.matchPairs.rightOrder.map((pairId, idx) => {
                const pair = question.matchPairs!.pairs.find((p) => p.pairId === pairId)!;
                const isMatched = hud.towerMatchedPairIds.includes(pairId);
                const isSelected =
                  hud.towerSelectedSide === 'right' && hud.towerSelectedPairId === pairId;
                return (
                  <button
                    key={pairId}
                    type="button"
                    data-testid={`tower-right-${idx}`}
                    disabled={isMatched}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onSelectTowerCard('right', pairId);
                    }}
                    className={`min-h-[46px] px-2.5 py-1.5 rounded-xl font-black text-xs text-left flex items-center justify-between gap-1 cursor-pointer ${
                      isMatched
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-700/60 line-through opacity-55 cursor-default'
                        : isSelected
                          ? 'arcade-btn-green'
                          : 'arcade-btn-surface'
                    }`}
                  >
                    <span className="leading-tight">{pair.rightLabel}</span>
                    <span className="font-mono-num text-[10px] opacity-80 shrink-0">K{idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* GAME 3: SPELLING HOP — Mobile 3-Step River Stepping Stones */}
        {hud.gameId === 'spelling-hop' && question && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-1.5">
              {[0, 1, 2].map((stepIdx) => {
                const done = stepIdx < hud.spellingStep;
                const active = stepIdx === hud.spellingStep;
                return (
                  <div
                    key={stepIdx}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-black border-2 ${
                      done
                        ? 'bg-emerald-600 border-emerald-800 text-white'
                        : active
                          ? 'bg-amber-400 border-amber-600 text-slate-950'
                          : 'bg-white/90 border-slate-300 text-slate-500'
                    }`}
                  >
                    {done
                      ? question.wordEntry.chunks[stepIdx]
                      : `${stepIdx + 1}단계 ${active ? '점프!' : '대기'}`}
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {activeChoices.map((opt, idx) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onSelectOption(idx);
                  }}
                  className="arcade-btn-surface min-h-[56px] px-2 py-2 rounded-2xl cursor-pointer flex flex-col justify-center items-center"
                >
                  <span className="text-base font-black text-slate-900">{opt.label}</span>
                  <span className="text-[10px] font-bold text-amber-700">징검다리 {idx + 1}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAME 4: SYNONYM & ANTONYM DEFENSE — Mobile 2x2 Thumb Grid */}
        {hud.gameId === 'synonym-defense' && (
          <div className="grid grid-cols-2 gap-2">
            {activeChoices.map((opt, idx) => (
              <button
                key={opt.id}
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onSelectOption(idx);
                }}
                className="arcade-btn-surface min-h-[54px] px-3 py-2 rounded-2xl cursor-pointer flex flex-col justify-center items-center"
              >
                <span className="text-sm font-black text-slate-900 truncate max-w-full">
                  {opt.label}
                </span>
                <span className="text-[10px] font-bold text-violet-700">
                  터치해 레이저 요격
                </span>
              </button>
            ))}
          </div>
        )}

        {/* GAME 5: VAULT RUSH — Giant Mobile Emerald O / Crimson X Slam Levers */}
        {hud.gameId === 'vault-rush' && (
          <div className={`grid grid-cols-2 gap-2.5 ${leftHanded ? 'direction-rtl' : ''}`}>
            {activeChoices.map((opt, idx) => (
              <button
                key={opt.id}
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onSelectOption(idx);
                }}
                className={`min-h-[62px] rounded-2xl px-3 py-3 font-black text-base cursor-pointer flex flex-col items-center justify-center ${
                  idx === 0 ? 'arcade-btn-green' : 'arcade-btn-coral'
                }`}
              >
                <span>{opt.label}</span>
                <span className="text-[10px] opacity-90">
                  {idx === 0 ? '뜻이 일치함' : '뜻이 틀림'}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* GAME 6: RPG VILLAGE STREET — Authentic Mobile JRPG Dialogue Sheet */}
        {hud.gameId === 'rpg-street' && question?.rpgDialogue && (
          <div className="bg-white/95 border-2 border-violet-300 border-b-4 rounded-3xl p-3 shadow-lg">
            {hud.rpgState === 'walking' ? (
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                    <Footprints className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-extrabold text-violet-700 truncate">
                      {question.rpgDialogue.locationName}
                    </div>
                    <div className="text-xs font-black text-slate-900 truncate">
                      {question.rpgDialogue.npcName}에게 다가가는 중...
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onWalkRpgForward();
                  }}
                  className="arcade-btn-blue min-h-[44px] px-3.5 rounded-xl text-xs font-black shrink-0 cursor-pointer"
                >
                  빠르게 이동
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MessageCircle className="w-4 h-4 text-violet-600 shrink-0" />
                    <span className="text-xs font-black text-violet-800 truncate">
                      {question.rpgDialogue.npcName} · {question.rpgDialogue.npcRole}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {rigState && (
                      <span
                        data-testid="rpg-gesture-status"
                        className={`px-1.5 py-0.5 rounded-md font-mono-num text-[10px] font-extrabold leading-none ${
                          rigState.isSpeaking
                            ? 'bg-violet-100 text-violet-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {rigState.activeEmotion
                          ? `${rigState.activeEmotion} · ${rigState.activeClass}`
                          : rigState.activeClass}
                      </span>
                    )}
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden shrink-0">
                      <div
                        className="h-full rounded-full origin-left"
                        style={{
                          transform: `scaleX(${Math.max(0, Math.min(1, timerPct / 100))})`,
                          backgroundColor: timerColor,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <p className="mt-1 text-[11px] font-bold text-slate-500">
                  {question.rpgDialogue.greetingKo}
                </p>

                <div className="mt-1 text-sm font-black text-slate-900 leading-snug">
                  &ldquo;{renderBlankSentence(
                    question.rpgDialogue.npcLineEn,
                    'bg-violet-100 text-violet-800 border-violet-400'
                  )}&rdquo;
                </div>
                <div className="mt-0.5 text-[11px] font-bold text-slate-600">
                  ({question.rpgDialogue.npcLineKo})
                </div>

                <WordLexicalLine word={question.wordEntry} showSynonyms />

                <div className="mt-2 flex flex-col gap-1.5">
                  {activeChoices.map((opt, idx) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={(e) => {
                        e.currentTarget.blur();
                        onSelectOption(idx);
                      }}
                      className="arcade-btn-surface min-h-[44px] px-3.5 py-2 rounded-xl cursor-pointer flex items-center justify-between"
                    >
                      <span className="text-sm font-black text-slate-900">{opt.label}</span>
                      <span className="text-[11px] font-extrabold text-violet-700">
                        대답하기 ▶
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* GAME 7: 3D VOCA TETRIS — Tactile Mobile Arcade Pad */}
        {isTetris && (
          <div className="flex flex-col gap-1">
            <div
              className={`grid grid-cols-5 gap-1.5 ${
                leftHanded ? 'direction-rtl' : ''
              }`}
            >
              <button
                type="button"
                data-testid="tetris-btn-left"
                aria-label="왼쪽 이동"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onTetrisMove(-1);
                }}
                className="arcade-btn-surface min-h-[54px] rounded-2xl flex flex-col items-center justify-center gap-0.5 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 text-slate-900" />
                <span className="text-[10px] font-extrabold text-slate-600">왼쪽</span>
              </button>

              <button
                type="button"
                data-testid="tetris-btn-rotate"
                aria-label="블록 회전"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onTetrisRotate(1);
                }}
                className="arcade-btn-blue min-h-[54px] rounded-2xl flex flex-col items-center justify-center gap-0.5 cursor-pointer"
              >
                <RotateCw className="w-5 h-5" />
                <span className="text-[10px] font-black">회전</span>
              </button>

              <button
                type="button"
                data-testid="tetris-btn-right"
                aria-label="오른쪽 이동"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onTetrisMove(1);
                }}
                className="arcade-btn-surface min-h-[54px] rounded-2xl flex flex-col items-center justify-center gap-0.5 cursor-pointer"
              >
                <ArrowRight className="w-5 h-5 text-slate-900" />
                <span className="text-[10px] font-extrabold text-slate-600">오른쪽</span>
              </button>

              <button
                type="button"
                data-testid="tetris-btn-down"
                aria-label="한 칸 내리기"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onTetrisSoftDropStep();
                }}
                className="arcade-btn-surface min-h-[54px] rounded-2xl flex flex-col items-center justify-center gap-0.5 cursor-pointer"
              >
                <ArrowDown className="w-5 h-5 text-slate-900" />
                <span className="text-[10px] font-extrabold text-slate-600">내리기</span>
              </button>

              <button
                type="button"
                data-testid="tetris-btn-drop"
                aria-label="즉시 낙하"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onTetrisHardDrop();
                }}
                className="arcade-btn-green min-h-[54px] rounded-2xl flex flex-col items-center justify-center gap-0.5 cursor-pointer"
              >
                <ArrowDownToLine className="w-5 h-5" />
                <span className="text-[10px] font-black">낙하</span>
              </button>
            </div>
            <p className="text-center text-[10px] font-extrabold text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]">
              상단 영단어 뜻을 맞히면 맨 아래 1줄이 즉시 폭파됩니다!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
