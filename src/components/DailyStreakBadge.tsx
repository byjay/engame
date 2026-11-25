import React from 'react';
import type { WalletProfile } from '../game/types';
import { StreakFlameIcon } from './ArcadeIcons';

interface DailyStreakBadgeProps {
  wallet: WalletProfile;
  compact?: boolean;
  className?: string;
}

interface StreakTierVisual {
  containerClass: string;
  countClass: string;
  label: string;
}

function getStreakTierVisual(days: number): StreakTierVisual {
  if (days >= 7) {
    return {
      containerClass: 'bg-gradient-to-b from-amber-50 to-orange-100 border-orange-300',
      countClass: 'text-orange-700',
      label: '슈퍼 연속 학습',
    };
  }
  if (days >= 3) {
    return {
      containerClass: 'bg-orange-50/95 border-orange-200',
      countClass: 'text-orange-600',
      label: '불꽃 연속 학습',
    };
  }
  if (days >= 1) {
    return {
      containerClass: 'bg-amber-50/95 border-amber-200',
      countClass: 'text-amber-700',
      label: '연속 학습 진행 중',
    };
  }
  return {
    containerClass: 'bg-slate-50 border-slate-200',
    countClass: 'text-slate-600',
    label: '오늘 첫 학습 도전',
  };
}

/**
 * Daily Streak badge reading consecutive play days from WalletProfile.
 * Designed for crisp single-row fit in the mobile Android top app bar.
 */
export function DailyStreakBadge({
  wallet,
  compact = true,
  className = '',
}: DailyStreakBadgeProps) {
  const rawDays = wallet?.streakDays;
  const streakDays =
    typeof rawDays === 'number' && Number.isFinite(rawDays)
      ? Math.max(0, Math.floor(rawDays))
      : 0;
  const tier = getStreakTierVisual(streakDays);
  const ariaText = `연속 학습 ${streakDays}일 (${tier.label})`;

  return (
    <div
      data-testid="daily-streak-badge"
      data-streak-days={streakDays}
      role="status"
      aria-label={ariaText}
      title={ariaText}
      className={`inline-flex items-center gap-1 rounded-xl border px-2 py-0.5 shrink-0 ${tier.containerClass} ${className}`}
    >
      <StreakFlameIcon className="w-3.5 h-3.5 shrink-0" />
      <span className={`font-mono-num text-xs font-extrabold leading-none ${tier.countClass}`}>
        {streakDays}일
      </span>
      {!compact && (
        <span className="text-[10px] font-extrabold text-orange-700/80 leading-none">
          연속
        </span>
      )}
    </div>
  );
}
