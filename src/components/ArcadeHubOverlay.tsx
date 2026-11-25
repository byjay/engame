import React from 'react';
import {
  BookOpen,
  Gamepad2,
  Gauge,
  GraduationCap,
  Play,
  Star,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type {
  DifficultySetting,
  GameId,
  GameSettings,
  SpeedSetting,
  WalletProfile,
} from '../game/types';
import { GAME_CATALOG, getGameMeta } from '../game/vocabulary';
import { calculateCsatPercentile, calculateLeagueStanding, evaluateDailyMissions } from '../game/rules';
import {
  GameEmblemIcon,
  GiftBoxIcon,
  GoldCoinIcon,
} from './ArcadeIcons';
import { DailyStreakBadge } from './DailyStreakBadge';

interface ArcadeHubOverlayProps {
  selectedGameId: GameId;
  wallet: WalletProfile;
  settings: GameSettings;
  isEmbedded: boolean;
  muted: boolean;
  onSelectGame: (gameId: GameId) => void;
  onStartGame: (gameId: GameId) => void;
  onChangeSettings: (next: GameSettings) => void;
  onOpenGiftModal: () => void;
  onOpenReviewModal: () => void;
  onOpenLeagueModal: () => void;
  onToggleMute: () => void;
}

const DIFFICULTY_OPTIONS: { id: DifficultySetting; label: string }[] = [
  { id: 'ALL', label: '전체' },
  { id: '수능필수', label: '수능필수' },
  { id: '수능1등급', label: '1등급' },
  { id: '고난도빈출', label: 'SAT고난도' },
];

const SPEED_OPTIONS: { id: SpeedSetting; label: string }[] = [
  { id: 'slow', label: '여유' },
  { id: 'normal', label: '보통' },
  { id: 'fast', label: '빠름' },
  { id: 'extreme', label: '극한' },
];

export function ArcadeHubOverlay({
  selectedGameId,
  wallet,
  settings,
  muted,
  onSelectGame,
  onStartGame,
  onChangeSettings,
  onOpenGiftModal,
  onOpenReviewModal,
  onOpenLeagueModal,
  onToggleMute,
}: ArcadeHubOverlayProps) {
  const selectedMeta = getGameMeta(selectedGameId);
  const percentileTop = calculateCsatPercentile(wallet);
  const league = calculateLeagueStanding(wallet.xp, wallet.studentName);
  const missions = evaluateDailyMissions(wallet);
  const claimableMissions = missions.filter((m) => m.completed && !m.claimed).length;
  const pendingGifts = wallet.handoffHistory.filter((h) => h.status === 'PENDING_HOST').length;
  const selectedBest = wallet.bestScores[selectedGameId] ?? 0;
  const selectedStars = wallet.starRatings[selectedGameId] ?? 0;
  const leagueProgressPct = league.nextTierName
    ? Math.max(8, Math.min(96, Math.round((wallet.xp / Math.max(1, wallet.xp + league.xpToNextTier)) * 100)))
    : 100;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between pt-4 px-3 pb-2.5">
      {/* ANDROID MOBILE TOP APP BAR (Single crisp row, zero wrapping) */}
      <header className="pointer-events-auto flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-[#58CC02] border-b-4 border-[#46A302] flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white font-black text-base leading-none">V</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 whitespace-nowrap">
              <span className="text-[13.5px] font-black text-slate-900 tracking-tight leading-none drop-shadow-[0_1px_0_rgba(255,255,255,0.9)]">
                VOCA ARCADE
              </span>
              <span className="px-1 py-0.5 rounded-md bg-amber-400 text-slate-950 font-mono-num text-[9.5px] font-black leading-none border-b-2 border-amber-600">
                3D
              </span>
            </div>
            <div className="mt-0.5 text-[10.5px] font-extrabold text-slate-800 whitespace-nowrap drop-shadow-[0_1px_0_rgba(255,255,255,0.85)]">
              SAT·수능 상위 <span className="font-mono-num text-emerald-700">{percentileTop}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <div className="flex items-center gap-1.5 bg-white/95 border-2 border-slate-200 border-b-4 rounded-2xl px-1.5 py-1 shadow-sm">
            <DailyStreakBadge wallet={wallet} />
            <div className="flex items-center gap-0.5 pr-0.5" title="보유 코인">
              <GoldCoinIcon className="w-4 h-4" />
              <span
                data-testid="hub-coin-balance"
                className="font-mono-num text-xs font-extrabold text-slate-900"
              >
                {wallet.coins}C
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            aria-label={muted ? '사운드 켜기' : '사운드 끄기'}
            className="arcade-btn-surface w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer shrink-0"
          >
            {muted ? (
              <VolumeX className="w-4 h-4 text-slate-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-slate-800" />
            )}
          </button>
        </div>
      </header>

      {/* CENTER OPEN 3D SHOWCASE: Scholar Owl, Floating Island & Forward-Circling Prop-Jet */}
      <div className="flex-1 min-h-[140px]" />

      {/* ANDROID MOBILE BOTTOM SHEET STACK: Launch Card + Swipeable 6-Game Carousel + Material 3 Tab Bar */}
      <div className="pointer-events-auto w-full flex flex-col gap-2 pb-safe">
        {/* Selected Game Spotlight & Settings Card */}
        <div className="bg-white/95 border-2 border-slate-200 border-b-4 rounded-3xl px-3.5 py-3 shadow-lg flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border-2 border-slate-900/10"
              style={{ backgroundColor: `${selectedMeta.accentHex}20` }}
            >
              <GameEmblemIcon gameId={selectedMeta.id} className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-slate-500">
                <span className="truncate">
                  0{selectedMeta.order}. {selectedMeta.category}
                </span>
                <span className="text-amber-700 font-mono-num shrink-0">
                  {selectedMeta.coinRateLabel}
                </span>
              </div>
              <h1 className="text-base font-black text-slate-900 tracking-tight truncate">
                {selectedMeta.title}
              </h1>
              <p className="text-[11px] font-bold text-sky-800 truncate">
                목표: {selectedMeta.goalSummary}
              </p>
            </div>
          </div>

          {/* Motivating Challenge Goal & Next League Rank-Up Bar */}
          <button
            type="button"
            data-testid="hub-challenge-bar"
            onClick={onOpenLeagueModal}
            className="w-full text-left bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 flex flex-col gap-1 cursor-pointer active:bg-slate-100"
          >
            <div className="flex items-center justify-between gap-2 text-[10.5px] font-extrabold">
              <span className="text-slate-800 truncate">
                {selectedBest > 0
                  ? `🏆 최고 ${selectedBest.toLocaleString()}점 돌파 도전 · ★${selectedStars}/3`
                  : `🎯 첫 클리어 보너스 +55C 도전`}
              </span>
              <span className="font-mono-num text-amber-700 shrink-0">
                {league.nextTierName
                  ? `${league.nextTierName}까지 ${league.xpToNextTier} XP`
                  : '최고 티어 달성'}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-400 transition-all duration-300"
                style={{ width: `${leagueProgressPct}%` }}
              />
            </div>
          </button>

          <button
            type="button"
            data-start="true"
            onClick={(e) => {
              e.currentTarget.blur();
              onStartGame(selectedMeta.id);
            }}
            className="arcade-btn-green w-full min-h-[48px] px-5 py-2.5 rounded-2xl text-[15px] font-black flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{selectedMeta.title} 시작</span>
          </button>

          {/* Compact Mobile Difficulty & Speed Pills */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-200/80 text-[11px]">
            <div className="flex items-center justify-between gap-1">
              <span className="inline-flex items-center gap-1 font-extrabold text-slate-600 shrink-0 w-12">
                <GraduationCap className="w-3.5 h-3.5 text-sky-600" />
                난이도
              </span>
              <div className="grid grid-cols-4 gap-1 flex-1">
                {DIFFICULTY_OPTIONS.map((opt) => {
                  const active = settings.difficulty === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChangeSettings({ ...settings, difficulty: opt.id })}
                      className={`py-1 rounded-lg font-extrabold cursor-pointer transition-colors text-center ${
                        active
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 text-slate-700 active:bg-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-1">
              <span className="inline-flex items-center gap-1 font-extrabold text-slate-600 shrink-0 w-12">
                <Gauge className="w-3.5 h-3.5 text-amber-600" />
                속도
              </span>
              <div className="grid grid-cols-4 gap-1 flex-1">
                {SPEED_OPTIONS.map((opt) => {
                  const active = settings.speed === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChangeSettings({ ...settings, speed: opt.id })}
                      className={`py-1 rounded-lg font-extrabold cursor-pointer transition-colors text-center ${
                        active
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-100 text-slate-700 active:bg-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Swipeable 7-Mode Mobile Carousel */}
        <div
          role="listbox"
          aria-label="수능·SAT 영단어 3D 아케이드·RPG·테트리스 7종 선택"
          className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-2 pb-0.5 arcade-scroll"
        >
          {GAME_CATALOG.map((game) => {
            const isSelected = game.id === selectedGameId;
            const best = wallet.bestScores[game.id] ?? 0;
            const stars = wallet.starRatings[game.id] ?? 0;
            return (
              <button
                key={game.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  if (isSelected) {
                    onStartGame(game.id);
                  } else {
                    onSelectGame(game.id);
                  }
                }}
                className={`snap-start shrink-0 w-[148px] text-left rounded-2xl p-2.5 min-h-[74px] transition-transform cursor-pointer flex flex-col justify-between border-2 ${
                  isSelected
                    ? 'bg-white border-sky-500 border-b-4 shadow-md'
                    : 'bg-white/90 border-slate-200 border-b-4 active:bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <GameEmblemIcon gameId={game.id} className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] font-extrabold text-slate-500 truncate">
                      0{game.order} · {game.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0" aria-label={`별점 ${stars}개`}>
                    {[1, 2, 3].map((n) => (
                      <Star
                        key={n}
                        className={`w-2.5 h-2.5 ${
                          n <= stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 fill-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-1">
                  <div className="text-xs font-black text-slate-900 leading-tight truncate">
                    {game.title}
                  </div>
                  <div className="mt-0.5 flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span className="text-amber-700 font-mono-num">{game.coinRateLabel}</span>
                    {best > 0 ? (
                      <span className="font-mono-num text-slate-600">{best}점</span>
                    ) : (
                      isSelected && <span className="text-sky-600 font-black">탭 시작 ▶</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Authentic Material 3 Android Bottom Navigation Bar (4 Tabs, Always Visible!) */}
        <nav
          aria-label="모바일 하단 내비게이션"
          className="grid grid-cols-4 gap-1 bg-white/95 border-2 border-slate-200 border-b-4 rounded-2xl p-1 shadow-md"
        >
          <button
            type="button"
            aria-current="page"
            className="min-h-[50px] rounded-xl bg-sky-100 text-sky-800 flex flex-col items-center justify-center gap-0.5 cursor-pointer"
          >
            <Gamepad2 className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-black leading-none">게임 홈</span>
          </button>

          <button
            type="button"
            onClick={onOpenLeagueModal}
            aria-label={`주간 ${league.tierName} 리그 및 도전 미션 보기`}
            className="relative min-h-[50px] rounded-xl text-slate-700 active:bg-slate-100 flex flex-col items-center justify-center gap-0.5 cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-[11px] font-extrabold leading-none">{league.tierName} 리그</span>
            {claimableMissions > 0 && (
              <span className="absolute top-1 right-2 px-1 rounded-full bg-emerald-600 text-white font-mono-num text-[9px] font-black leading-tight">
                +{claimableMissions}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenReviewModal}
            aria-label={`오답노트 ${wallet.wrongWordIds.length}개 보기`}
            className="relative min-h-[50px] rounded-xl text-slate-700 active:bg-slate-100 flex flex-col items-center justify-center gap-0.5 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="text-[11px] font-extrabold leading-none">
              오답노트
            </span>
            {wallet.wrongWordIds.length > 0 && (
              <span className="absolute top-1 right-2 px-1 rounded-full bg-sky-600 text-white font-mono-num text-[9px] font-black leading-tight">
                {wallet.wrongWordIds.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenGiftModal}
            aria-label="부모님께 선물 요청하기"
            className="relative min-h-[50px] rounded-xl bg-amber-400 text-slate-950 active:bg-amber-500 flex flex-col items-center justify-center gap-0.5 cursor-pointer"
          >
            <GiftBoxIcon className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-black leading-none">선물 요청</span>
            {pendingGifts > 0 && (
              <span className="absolute top-1 right-2 px-1 rounded-full bg-rose-600 text-white font-mono-num text-[9px] font-black leading-tight">
                {pendingGifts}
              </span>
            )}
          </button>
        </nav>
      </div>
    </div>
  );
}
