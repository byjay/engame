import React, { useState } from 'react';
import { Volume2, X } from 'lucide-react';
import type { WalletProfile } from '../game/types';
import { CSAT_VOCABULARY } from '../game/vocabulary';
import { soundEngine } from '../audio/soundEngine';

interface ReviewNotebookModalProps {
  wallet: WalletProfile;
  onClose: () => void;
  onStartReviewRun: () => void;
}

export function ReviewNotebookModal({
  wallet,
  onClose,
  onStartReviewRun,
}: ReviewNotebookModalProps) {
  const [filter, setFilter] = useState<'wrong' | 'mastered'>('wrong');

  const wrongSet = new Set(wallet.wrongWordIds);
  const masteredSet = new Set(wallet.masteredWordIds);

  const visibleWords =
    filter === 'wrong'
      ? CSAT_VOCABULARY.filter((w) => wrongSet.has(w.id))
      : CSAT_VOCABULARY.filter((w) => masteredSet.has(w.id));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="수능 영단어 스마트 오답노트"
      className="absolute inset-0 z-40 bg-slate-950/60 flex items-end justify-center p-0"
    >
      <div className="bg-white border-t-4 border-slate-200 rounded-t-[28px] w-full max-h-[88%] flex flex-col shadow-2xl overflow-hidden">
        <div className="w-10 h-1.5 rounded-full bg-slate-300 mx-auto mt-2.5 shrink-0" aria-hidden="true" />
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2.5">
          <div>
            <h2 className="text-lg font-black text-slate-900">스마트 오답노트 (SRS)</h2>
            <p className="text-xs font-bold text-slate-500">
              틀린 수능 영단어는 다음 아케이드 게임에 우선 출제됩니다
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="오답노트 닫기"
            className="w-11 h-11 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pt-3">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'wrong'}
              onClick={() => setFilter('wrong')}
              className={`min-h-[40px] rounded-lg text-xs sm:text-sm font-extrabold cursor-pointer ${
                filter === 'wrong' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              복습 필요 ({wallet.wrongWordIds.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'mastered'}
              onClick={() => setFilter('mastered')}
              className={`min-h-[40px] rounded-lg text-xs sm:text-sm font-extrabold cursor-pointer ${
                filter === 'mastered' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              마스터 단어 ({wallet.masteredWordIds.length})
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto arcade-scroll flex-1 space-y-2.5">
          {visibleWords.length === 0 ? (
            <div className="py-10 text-center text-sm font-bold text-slate-500">
              {filter === 'wrong'
                ? '현재 오답 단어가 없습니다! 완벽해요.'
                : '게임을 클리어하면 마스터한 수능 단어가 이곳에 쌓입니다.'}
            </div>
          ) : (
            visibleWords.map((entry) => (
              <div
                key={entry.id}
                className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/70"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-black text-slate-900">{entry.word}</span>
                      <span className="text-xs font-bold text-slate-500">
                        [{entry.pronunciation}] · {entry.pos} · {entry.level}
                      </span>
                    </div>
                    <div className="mt-0.5 text-sm font-extrabold text-sky-700">{entry.meaning}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => soundEngine.speakEnglish(entry.word)}
                    aria-label={`${entry.word} 발음 듣기`}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sky-600 hover:bg-sky-50 shrink-0 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-700 leading-relaxed">
                  {entry.sentence.replace('_____', entry.word)}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-500">{entry.sentenceKo}</p>
                <div className="mt-1.5 text-[11px] font-bold text-slate-500">
                  유의어 <span className="text-slate-800">{entry.synonym}</span> · 반의어{' '}
                  <span className="text-slate-800">{entry.antonym}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 pb-safe">
          <button
            type="button"
            onClick={onStartReviewRun}
            className="arcade-btn-blue min-h-[48px] w-full rounded-2xl font-black text-sm cursor-pointer"
          >
            오답 단어 우선 복습 아케이드 시작
          </button>
        </div>
      </div>
    </div>
  );
}
