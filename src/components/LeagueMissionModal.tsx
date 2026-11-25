import React, { useState } from 'react';
import { Award, CheckCircle2, Flame, Trophy, X } from 'lucide-react';
import type { WalletProfile } from '../game/types';
import { calculateLeagueStanding, evaluateDailyMissions } from '../game/rules';
import { GoldCoinIcon } from './ArcadeIcons';

interface LeagueMissionModalProps {
  wallet: WalletProfile;
  onClose: () => void;
  onClaimMission: (missionId: string) => void;
}

export function LeagueMissionModal({
  wallet,
  onClose,
  onClaimMission,
}: LeagueMissionModalProps) {
  const [tab, setTab] = useState<'missions' | 'league'>('missions');
  const missions = evaluateDailyMissions(wallet);
  const league = calculateLeagueStanding(wallet.xp, `${wallet.studentName} (나)`);
  const claimableCount = missions.filter((m) => m.completed && !m.claimed).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="주간 학생 리그 및 오늘의 도전 미션"
      className="absolute inset-0 z-40 bg-slate-950/60 flex items-end justify-center p-0"
    >
      <div className="bg-white border-t-4 border-slate-200 rounded-t-[28px] w-full max-h-[88%] flex flex-col shadow-2xl overflow-hidden">
        <div className="w-10 h-1.5 rounded-full bg-slate-300 mx-auto mt-2.5 shrink-0" aria-hidden="true" />
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-black text-slate-900 truncate">
                도전 미션 · {league.tierName} 리그
              </h2>
              <p className="text-xs font-bold text-slate-500 truncate">
                현재 {league.rank}위 ·{' '}
                {league.nextTierName
                  ? `${league.nextTierName} 승급까지 ${league.xpToNextTier} XP`
                  : '최고 티어 달성!'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="리그 및 미션 창 닫기"
            className="w-11 h-11 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pt-3">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'missions'}
              onClick={() => setTab('missions')}
              className={`min-h-[40px] rounded-lg text-xs sm:text-sm font-extrabold cursor-pointer ${
                tab === 'missions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              오늘의 미션 {claimableCount > 0 ? `(${claimableCount}개 받기)` : ''}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'league'}
              onClick={() => setTab('league')}
              className={`min-h-[40px] rounded-lg text-xs sm:text-sm font-extrabold cursor-pointer ${
                tab === 'league' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              주간 학생 리그 ({league.rank}위)
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto arcade-scroll flex-1">
          {tab === 'missions' ? (
            <div className="space-y-3">
              {missions.map((mission) => {
                const pct = Math.min(100, Math.round((mission.current / mission.target) * 100));
                return (
                  <div
                    key={mission.id}
                    className="border-2 border-slate-200 rounded-2xl p-3.5 bg-slate-50/70"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-black text-slate-900">{mission.title}</div>
                        <div className="mt-0.5 text-xs font-medium text-slate-600">
                          {mission.description}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 font-mono-num text-sm font-black text-amber-700 shrink-0">
                        <GoldCoinIcon className="w-4 h-4" />
                        <span>+{mission.coinReward}C</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1">
                        <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: mission.completed ? '#58CC02' : '#1CB0F6',
                            }}
                          />
                        </div>
                        <div className="mt-1 font-mono-num text-[11px] font-bold text-slate-500">
                          진행도 {mission.current} / {mission.target}
                        </div>
                      </div>

                      {mission.claimed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                          수령 완료
                        </span>
                      ) : mission.completed ? (
                        <button
                          type="button"
                          onClick={() => onClaimMission(mission.id)}
                          className="arcade-btn-green min-h-[40px] px-4 rounded-xl text-xs font-black whitespace-nowrap cursor-pointer shrink-0"
                        >
                          +{mission.coinReward}C 받기
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 shrink-0">도전 중</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Award className="w-6 h-6" style={{ color: league.tierAccent }} />
                  <div>
                    <div className="text-sm font-black text-slate-900">
                      {league.tierName} 리그 · 상위 3위 승급전
                    </div>
                    <div className="text-xs font-bold text-slate-600">
                      게임 클리어와 콤보로 XP를 쌓아 라이벌을 추월하세요!
                    </div>
                  </div>
                </div>
                <span className="font-mono-num text-base font-black text-sky-700 shrink-0">
                  {league.userXp} XP
                </span>
              </div>

              <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
                {league.rivals.map((rival, idx) => {
                  const rankNum = idx + 1;
                  const isPromoZone = rankNum <= 3;
                  return (
                    <div
                      key={rival.id}
                      className={`px-4 py-3 flex items-center justify-between gap-3 ${
                        rival.isUser ? 'bg-amber-50' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-xl font-mono-num text-xs font-black flex items-center justify-center shrink-0 ${
                            rankNum === 1
                              ? 'bg-amber-400 text-slate-900'
                              : rankNum === 2
                                ? 'bg-slate-300 text-slate-900'
                                : rankNum === 3
                                  ? 'bg-orange-300 text-slate-900'
                                  : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {rankNum}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-black text-slate-900 truncate flex items-center gap-1.5">
                            <span>{rival.name}</span>
                            {isPromoZone && (
                              <span className="text-[10px] font-extrabold text-emerald-700">
                                승급권
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 font-mono-num text-sm font-extrabold text-slate-800 shrink-0">
                        {rival.isUser && <Flame className="w-4 h-4 text-orange-500" />}
                        <span>{rival.xp} XP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
