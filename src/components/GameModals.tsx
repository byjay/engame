import React from 'react';
import { Home, Play, RotateCcw, Star, Trophy } from 'lucide-react';
import type { GameId, RunStats } from '../game/types';
import { GAME_CATALOG, getGameMeta } from '../game/vocabulary';
import { GameEmblemIcon, GiftBoxIcon, GoldCoinIcon } from './ArcadeIcons';

interface PauseModalProps {
  activeGameId: GameId;
  gameTitle: string;
  onResume: () => void;
  onRestart: () => void;
  onSwitchGame: (gameId: GameId) => void;
  onBackToHub: () => void;
}

export function PauseModal({
  activeGameId,
  gameTitle,
  onResume,
  onRestart,
  onSwitchGame,
  onBackToHub,
}: PauseModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="게임 일시정지"
      className="absolute inset-0 z-30 bg-slate-950/55 flex items-end justify-center p-0"
    >
      <div className="bg-white border-t-4 border-slate-200 rounded-t-[28px] px-4 pt-2.5 pb-6 w-full max-h-[88%] overflow-y-auto arcade-scroll shadow-2xl text-center">
        <div className="w-10 h-1.5 rounded-full bg-slate-300 mx-auto mb-3" aria-hidden="true" />
        <p className="text-xs font-extrabold text-slate-500">{gameTitle}</p>
        <h2 className="mt-1 text-2xl font-black text-slate-900">일시정지</h2>
        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600">
          계속 진행하거나 다른 3D 아케이드·RPG 모드로 바로 전환하세요.
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={onResume}
            className="arcade-btn-green min-h-[48px] w-full rounded-2xl font-black text-base flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>계속하기</span>
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onRestart}
              className="arcade-btn-blue min-h-[44px] w-full rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>다시하기</span>
            </button>
            <button
              type="button"
              onClick={onBackToHub}
              className="arcade-btn-surface min-h-[44px] w-full rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>메인 허브</span>
            </button>
          </div>
        </div>

        {/* Instant 6-mode switch grid */}
        <div className="mt-4 pt-3 border-t border-slate-200 text-left">
          <div className="text-xs font-extrabold text-slate-500 mb-2">다른 3D 게임으로 바로 이동</div>
          <div className="grid grid-cols-2 gap-1.5">
            {GAME_CATALOG.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => onSwitchGame(g.id)}
                className={`px-2.5 py-2 rounded-xl border text-left flex items-center gap-2 cursor-pointer ${
                  g.id === activeGameId
                    ? 'bg-sky-50 border-sky-400 text-sky-900 font-black'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800 font-bold'
                }`}
              >
                <GameEmblemIcon gameId={g.id} className="w-4 h-4 shrink-0" />
                <span className="text-xs truncate">{g.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ResultModalProps {
  summary: RunStats;
  totalWalletCoins: number;
  onPlayAgain: () => void;
  onBackToHub: () => void;
  onOpenGiftModal: () => void;
}

export function ResultModal({
  summary,
  totalWalletCoins,
  onPlayAgain,
  onBackToHub,
  onOpenGiftModal,
}: ResultModalProps) {
  const meta = getGameMeta(summary.gameId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={summary.isVictory ? '스테이지 클리어 결과' : '게임 오버 결과'}
      className="absolute inset-0 z-30 bg-slate-950/60 flex items-end justify-center p-0"
    >
      <div className="bg-white border-t-4 border-slate-200 rounded-t-[28px] px-4 pt-2.5 pb-6 w-full max-h-[90%] overflow-y-auto arcade-scroll shadow-2xl">
        <div className="w-10 h-1.5 rounded-full bg-slate-300 mx-auto mb-3" aria-hidden="true" />
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2" aria-label={`획득 별점 ${summary.starsEarned}개`}>
            {[1, 2, 3].map((n) => (
              <Star
                key={n}
                className={`w-8 h-8 ${
                  n <= summary.starsEarned
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-200 fill-slate-100'
                }`}
              />
            ))}
          </div>
          <p className="text-xs font-extrabold text-slate-500">
            {meta.title} · {meta.category}
            {summary.isNewRecord ? ' · 최고 기록 갱신!' : ''}
          </p>
          <h2 className="mt-0.5 text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span>{summary.isVictory ? '아케이드 클리어!' : '도전 종료! 다시 한 번!'}</span>
          </h2>
        </div>

        {/* 3 crisp tabular-nums mastery stat tiles */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
            <div className="text-[11px] font-bold text-slate-500">획득 점수</div>
            <div className="mt-0.5 font-mono-num text-lg font-black text-slate-900">
              {summary.score.toLocaleString()}
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
            <div className="text-[11px] font-bold text-amber-800">적립 코인</div>
            <div className="mt-0.5 font-mono-num text-lg font-black text-amber-700 flex items-center justify-center gap-1">
              <GoldCoinIcon className="w-4 h-4" />
              <span>+{summary.coinsEarned}</span>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
            <div className="text-[11px] font-bold text-emerald-800">정답률 · XP</div>
            <div className="mt-0.5 font-mono-num text-lg font-black text-emerald-700">
              {summary.accuracyPct}%
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-xs font-bold text-slate-600 px-1">
          <span>
            정답 {summary.correctCount}/{summary.totalRounds} · 최대 {summary.maxCombo} 콤보 ·{' '}
            <strong className="font-mono-num text-sky-700">+{summary.xpEarned} XP</strong>
          </span>
          <span className="font-mono-num text-slate-900">총 보유 {totalWalletCoins}C</span>
        </div>

        {/* Instant wrong-answer mini review */}
        {summary.missedWords.length > 0 && (
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-3">
            <div className="text-xs font-extrabold text-slate-700">
              이번 판 오답노트 ({summary.missedWords.length}단어 자동 저장됨)
            </div>
            <ul className="mt-2 space-y-1.5">
              {summary.missedWords.slice(0, 4).map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between text-xs border-b border-slate-200/70 pb-1 last:border-b-0 last:pb-0"
                >
                  <span className="font-black text-slate-900">{w.word}</span>
                  <span className="font-semibold text-slate-600 truncate max-w-[60%]">
                    {w.meaning}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            data-start="true"
            onClick={onPlayAgain}
            className="arcade-btn-green min-h-[48px] w-full rounded-2xl font-black text-base flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>다시 도전하기</span>
          </button>

          <button
            type="button"
            onClick={onOpenGiftModal}
            className="arcade-btn-gold min-h-[46px] w-full rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <GiftBoxIcon className="w-5 h-5" />
            <span>모은 코인으로 부모님께 선물 요청하기</span>
          </button>

          <button
            type="button"
            onClick={onBackToHub}
            className="arcade-btn-surface min-h-[46px] w-full rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>다른 3D 게임 선택</span>
          </button>
        </div>
      </div>
    </div>
  );
}
