import React from 'react';
import type { GameId } from '../game/types';

export function VocaArcadeTitleLockup({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      viewBox="0 0 430 72"
      className={compact ? 'h-10 sm:h-11 w-auto max-w-full' : 'h-11 sm:h-15 w-auto max-w-full'}
      role="img"
      aria-label="VOCA ARCADE 3D 수능 영단어"
    >
      {/* Tactile emblem crest */}
      <g transform="translate(4, 6)">
        <rect x="0" y="6" width="56" height="54" rx="16" fill="#46A302" />
        <rect x="0" y="0" width="56" height="52" rx="16" fill="#58CC02" />
        <rect x="6" y="6" width="44" height="14" rx="7" fill="#7CE024" opacity="0.55" />
        {/* Stylized 3D V-wing scholar emblem */}
        <path
          d="M15 17 L28 39 L41 17"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="28" cy="14" r="4.5" fill="#FFB800" stroke="#0F172A" strokeWidth="1.8" />
      </g>

      {/* Main title wordmark with crisp outline */}
      <text
        x="74"
        y="36"
        fontFamily="Plus Jakarta Sans, Noto Sans KR, sans-serif"
        fontWeight="900"
        fontSize="27"
        letterSpacing="-0.5"
        fill="#0F172A"
        stroke="#FFFFFF"
        strokeWidth="5"
        paintOrder="stroke fill"
      >
        VOCA ARCADE
      </text>
      {/* 3D gold stamp */}
      <g transform="translate(275, 11)">
        <rect x="0" y="3" width="46" height="29" rx="9" fill="#D49000" />
        <rect x="0" y="0" width="46" height="28" rx="9" fill="#FFB800" />
        <text
          x="23"
          y="19"
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontWeight="800"
          fontSize="16"
          fill="#0F172A"
        >
          3D
        </text>
      </g>

      {/* Subtitle line */}
      <text
        x="75"
        y="58"
        fontFamily="Noto Sans KR, Plus Jakarta Sans, sans-serif"
        fontWeight="700"
        fontSize="13.5"
        fill="#1E3A5F"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        paintOrder="stroke fill"
      >
        수능·SAT 영단어 7종 3D 아케이드·RPG·테트리스
      </text>
    </svg>
  );
}

export function HeartSocketIcon({ state }: { state: 'full' | 'cracked' | 'empty' }) {
  const fill = state === 'full' ? '#FF4B4B' : state === 'cracked' ? '#FCA5A5' : '#E2E8F0';
  const stroke = state === 'empty' ? '#94A3B8' : '#7F1D1D';

  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0" aria-hidden="true">
      <path
        d="M12 21.2C11.6 21.2 4 15.8 2.6 10.6C1.7 7.2 4.1 3.8 7.5 3.8C9.5 3.8 11.1 4.9 12 6.4C12.9 4.9 14.5 3.8 16.5 3.8C19.9 3.8 22.3 7.2 21.4 10.6C20 15.8 12.4 21.2 12 21.2Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {state === 'full' && (
        <path
          d="M7.2 7.2C6.1 7.6 5.4 8.7 5.5 9.9"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.8"
        />
      )}
      {state === 'cracked' && (
        <path
          d="M12 6.8 L10.2 11.4 L13.4 13.8 L11.5 18.2"
          fill="none"
          stroke="#7F1D1D"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function GoldCoinIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#FFB800" stroke="#92400E" strokeWidth="2" />
      <circle cx="12" cy="12" r="6.8" fill="#FDE047" stroke="#D97706" strokeWidth="1.4" />
      <path
        d="M13.8 9.2 C12.8 8.3 10.4 8.5 10.4 10.2 C10.4 12.2 14 11.7 14 13.8 C14 15.5 11.4 15.8 10.1 14.7 M12 7.5 V16.5"
        fill="none"
        stroke="#92400E"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StreakFlameIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12.6 2.5C12.6 2.5 18.8 7.2 18.8 13.4C18.8 17.5 15.8 21 12 21C8.2 21 5.2 17.5 5.2 13.4C5.2 10.6 6.8 8.1 8.4 6.5C8.2 8.2 9.1 9.4 10.2 9.7C9.6 6.8 10.8 4.1 12.6 2.5Z"
        fill="#FF9600"
        stroke="#9A3412"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 11.8C13.7 13.4 14.7 15.1 14.7 16.9C14.7 18.5 13.5 19.6 12 19.6C10.5 19.6 9.3 18.5 9.3 16.9C9.3 15.1 10.3 13.4 12 11.8Z"
        fill="#FDE047"
      />
    </svg>
  );
}

export function GiftBoxIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="3" y="9" width="18" height="4" rx="1.5" fill="#FF4B4B" stroke="#7F1D1D" strokeWidth="1.6" />
      <rect x="4.5" y="13" width="15" height="8" rx="2" fill="#FFF1F2" stroke="#7F1D1D" strokeWidth="1.6" />
      <rect x="10.5" y="9" width="3" height="12" fill="#FFB800" stroke="#7F1D1D" strokeWidth="1.2" />
      <path
        d="M12 9 C9.5 9 6.5 7.4 7.5 5.4 C8.4 3.6 11 5.4 12 9 Z M12 9 C14.5 9 17.5 7.4 16.5 5.4 C15.6 3.6 13 5.4 12 9 Z"
        fill="#FFB800"
        stroke="#7F1D1D"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GameEmblemIcon({ gameId, className = 'w-6 h-6' }: { gameId: GameId; className?: string }) {
  if (gameId === 'sky-runner') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d="M12 3 L21 15 L14 14 L12 20 L10 14 L3 15 Z" fill="#1CB0F6" stroke="#0F172A" strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="12" cy="11" r="2.2" fill="#FFFFFF" />
      </svg>
    );
  }
  if (gameId === 'tower-crash') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <rect x="4" y="13" width="16" height="7" rx="2" fill="#58CC02" stroke="#0F172A" strokeWidth="1.8" />
        <rect x="9" y="4" width="6" height="10" rx="2" fill="#FFB800" stroke="#0F172A" strokeWidth="1.8" />
        <circle cx="12" cy="16.5" r="2" fill="#FFFFFF" />
      </svg>
    );
  }
  if (gameId === 'spelling-hop') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <polygon points="12,3 20,7.5 20,16.5 12,21 4,16.5 4,7.5" fill="#FF9600" stroke="#0F172A" strokeWidth="1.8" strokeLinejoin="round" />
        <text x="12" y="15.2" textAnchor="middle" fontSize="10" fontWeight="900" fill="#FFFFFF">
          A
        </text>
      </svg>
    );
  }
  if (gameId === 'synonym-defense') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d="M12 3 L19.5 6.5 V12.5 C19.5 16.8 16.2 19.8 12 21.2 C7.8 19.8 4.5 16.8 4.5 12.5 V6.5 Z" fill="#8549BA" stroke="#0F172A" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M8.5 12 H15.5 M12 8.5 V15.5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }
  if (gameId === 'rpg-street') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
          d="M4 6.5 C4 5.1 5.1 4 6.5 4 H17.5 C18.9 4 20 5.1 20 6.5 V14.5 C20 15.9 18.9 17 17.5 17 H10 L5.5 20.5 V17 H6.5 C5.1 17 4 15.9 4 14.5 Z"
          fill="#EC4899"
          stroke="#0F172A"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="9.2" cy="10.5" r="1.4" fill="#FFFFFF" />
        <circle cx="12.2" cy="10.5" r="1.4" fill="#FFFFFF" />
        <circle cx="15.2" cy="10.5" r="1.4" fill="#FFFFFF" />
      </svg>
    );
  }
  if (gameId === 'voca-tetris') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <rect x="4" y="13" width="5.5" height="5.5" rx="1.2" fill="#06B6D4" stroke="#0F172A" strokeWidth="1.6" />
        <rect x="9.5" y="13" width="5.5" height="5.5" rx="1.2" fill="#A855F7" stroke="#0F172A" strokeWidth="1.6" />
        <rect x="15" y="13" width="5.5" height="5.5" rx="1.2" fill="#FACC15" stroke="#0F172A" strokeWidth="1.6" />
        <rect x="9.5" y="7.5" width="5.5" height="5.5" rx="1.2" fill="#A855F7" stroke="#0F172A" strokeWidth="1.6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" fill="#FFB800" stroke="#0F172A" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.6" />
      <path d="M12 3.5 V6 M12 18 V20.5 M3.5 12 H6 M18 12 H20.5" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
