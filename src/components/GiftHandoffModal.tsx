import React, { useState } from 'react';
import { Check, Code2, Copy, Send, X } from 'lucide-react';
import type { GiftRewardItem, WalletProfile } from '../game/types';
import { ANDROID_KOTLIN_HANDOFF_SNIPPET } from '../bridge/hostBridge';
import { calculateCsatPercentile } from '../game/rules';
import { GiftBoxIcon, GoldCoinIcon } from './ArcadeIcons';

interface GiftHandoffModalProps {
  wallet: WalletProfile;
  catalog: GiftRewardItem[];
  onClose: () => void;
  onSubmitGiftRequest: (params: {
    giftId: string;
    giftTitle: string;
    coinCost: number;
    studentMessage: string;
  }) => { ok: boolean; error?: string };
  onSimulateHostResolve: (requestId: string, approved: boolean) => void;
}

export function GiftHandoffModal({
  wallet,
  catalog,
  onClose,
  onSubmitGiftRequest,
  onSimulateHostResolve,
}: GiftHandoffModalProps) {
  const [activeTab, setActiveTab] = useState<'request' | 'history' | 'spec'>('request');
  const [selectedGiftId, setSelectedGiftId] = useState<string>(catalog[0]?.id ?? 'custom');
  const [customTitle, setCustomTitle] = useState('');
  const [customCost, setCustomCost] = useState('200');
  const [studentMessage, setStudentMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const selectedCatalogItem = catalog.find((item) => item.id === selectedGiftId) ?? null;
  const effectiveTitle = selectedGiftId === 'custom' ? customTitle : selectedCatalogItem?.title ?? '';
  const effectiveCost =
    selectedGiftId === 'custom'
      ? Math.max(0, Number.parseInt(customCost, 10) || 0)
      : selectedCatalogItem?.coinCost ?? 0;

  const percentileTop = calculateCsatPercentile(wallet);
  const accuracyPct =
    wallet.totalAttempted > 0
      ? Math.round((wallet.totalCorrect / wallet.totalAttempted) * 100)
      : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    const result = onSubmitGiftRequest({
      giftId: selectedGiftId,
      giftTitle: effectiveTitle,
      coinCost: effectiveCost,
      studentMessage,
    });
    if (!result.ok) {
      setErrorMsg(result.error || '요청을 전달할 수 없습니다.');
      return;
    }
    setSuccessMsg(`"${effectiveTitle}" 선물 요청이 원본 앱 핸드오프 채널로 전달되었습니다.`);
    setStudentMessage('');
    setActiveTab('history');
  };

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(ANDROID_KOTLIN_HANDOFF_SNIPPET);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 1800);
    } catch {
      // Clipboard fallback ignored
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="부모님께 선물 요청 및 앱 연동 핸드오프"
      className="absolute inset-0 z-40 bg-slate-950/60 flex items-end justify-center p-0"
    >
      <div className="bg-white border-t-4 border-slate-200 rounded-t-[28px] w-full max-h-[90%] flex flex-col shadow-2xl overflow-hidden">
        <div className="w-10 h-1.5 rounded-full bg-slate-300 mx-auto mt-2.5 shrink-0" aria-hidden="true" />
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <GiftBoxIcon className="w-7 h-7 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-lg font-black text-slate-900 truncate">
                {wallet.parentName}께 선물 요청하기
              </h2>
              <p className="text-xs font-bold text-slate-500 truncate">
                적립 코인 및 수능 학습 기록을 원본 안드로이드 앱으로 핸드오프합니다
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="선물 요청 창 닫기"
            className="w-11 h-11 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Tabs */}
        <div className="px-5 pt-3">
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'request'}
              onClick={() => setActiveTab('request')}
              className={`min-h-[40px] rounded-lg text-xs sm:text-sm font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'request'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              선물 요청
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
              className={`min-h-[40px] rounded-lg text-xs sm:text-sm font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              전달 내역 ({wallet.handoffHistory.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'spec'}
              onClick={() => setActiveTab('spec')}
              className={`min-h-[40px] rounded-lg text-xs sm:text-sm font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'spec'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              앱 연동 규격
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto arcade-scroll flex-1">
          {/* Live Balance & Learning Proof Strip */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <GoldCoinIcon className="w-6 h-6" />
              <div>
                <div className="text-[11px] font-bold text-amber-800">현재 사용 가능 코인</div>
                <div
                  data-testid="gift-modal-coin-balance"
                  className="font-mono-num text-xl font-black text-slate-900 leading-none"
                >
                  {wallet.coins}C
                </div>
              </div>
            </div>
            <div className="text-right text-xs font-bold text-slate-600">
              <div>
                마스터 단어 <span className="font-mono-num text-slate-900">{wallet.masteredWordIds.length}개</span> · 정답률{' '}
                <span className="font-mono-num text-emerald-700">{accuracyPct}%</span>
              </div>
              <div className="text-[11px] text-slate-500">
                연속 {wallet.streakDays}일 · 수능 어휘 상위 {percentileTop}%
              </div>
            </div>
          </div>

          {activeTab === 'request' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="text-xs font-extrabold text-slate-700 mb-2">
                  보상 선물 선택 (원본 앱 카탈로그 연동)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {catalog.map((item) => {
                    const isPicked = selectedGiftId === item.id;
                    const canAfford = wallet.coins >= item.coinCost;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedGiftId(item.id);
                          setErrorMsg(null);
                        }}
                        className={`text-left p-3 rounded-2xl border-2 transition-colors cursor-pointer ${
                          isPicked
                            ? 'bg-sky-50 border-sky-500'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-slate-500">{item.category}</span>
                          <span
                            className={`font-mono-num text-xs font-black ${
                              canAfford ? 'text-amber-700' : 'text-rose-600'
                            }`}
                          >
                            {item.coinCost}C
                          </span>
                        </div>
                        <div className="mt-0.5 text-sm font-black text-slate-900">{item.title}</div>
                        <div className="mt-0.5 text-[11px] text-slate-600 line-clamp-1">
                          {item.description}
                        </div>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGiftId('custom');
                      setErrorMsg(null);
                    }}
                    className={`sm:col-span-2 text-left p-3 rounded-2xl border-2 transition-colors cursor-pointer ${
                      selectedGiftId === 'custom'
                        ? 'bg-sky-50 border-sky-500'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-sm font-black text-slate-900">직접 원하는 선물 입력하기</div>
                    <div className="text-[11px] font-medium text-slate-600">
                      부모님과 약속한 선물 이름과 코인을 직접 지정해 요청합니다
                    </div>
                  </button>
                </div>
              </div>

              {selectedGiftId === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 border border-slate-200 rounded-2xl p-3">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="custom-gift-title"
                      className="block text-xs font-extrabold text-slate-700 mb-1"
                    >
                      선물 이름
                    </label>
                    <input
                      id="custom-gift-title"
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="예: 치킨 기프티콘 또는 주말 게임 1시간"
                      className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="custom-gift-cost"
                      className="block text-xs font-extrabold text-slate-700 mb-1"
                    >
                      사용 코인
                    </label>
                    <input
                      id="custom-gift-cost"
                      type="number"
                      min={10}
                      step={10}
                      value={customCost}
                      onChange={(e) => setCustomCost(e.target.value)}
                      className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white font-mono-num text-sm font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="gift-parent-msg"
                  className="block text-xs font-extrabold text-slate-700 mb-1"
                >
                  {wallet.parentName}께 전할 학습 한마디 (선택)
                </label>
                <input
                  id="gift-parent-msg"
                  type="text"
                  value={studentMessage}
                  onChange={(e) => setStudentMessage(e.target.value)}
                  placeholder="오늘 수능 영단어 3D 아케이드 클리어했어요!"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-extrabold text-rose-700"
                >
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="arcade-btn-green min-h-[50px] w-full rounded-2xl font-black text-base flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>
                  원본 앱으로 선물 요청 전달 ({effectiveCost}C)
                </span>
              </button>
            </form>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-extrabold text-emerald-800">
                  {successMsg}
                </div>
              )}
              {wallet.handoffHistory.length === 0 ? (
                <div className="py-10 text-center text-sm font-bold text-slate-500">
                  아직 원본 앱으로 전달된 선물 요청 내역이 없습니다.
                  <br />
                  3D 아케이드에서 코인을 모아 첫 선물 요청을 보내보세요!
                </div>
              ) : (
                wallet.handoffHistory.map((item) => {
                  const statusLabel =
                    item.status === 'PENDING_HOST'
                      ? '원본 앱 승인 대기중 (코인 보류)'
                      : item.status === 'APPROVED_BY_PARENT'
                        ? '부모님 승인 완료'
                        : '반려됨 (코인 자동 환불 완료)';
                  const statusClass =
                    item.status === 'PENDING_HOST'
                      ? 'text-amber-700'
                      : item.status === 'APPROVED_BY_PARENT'
                        ? 'text-emerald-700'
                        : 'text-rose-700';

                  return (
                    <div
                      key={item.payload.requestId}
                      className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/70"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-black text-slate-900">
                            {item.payload.giftTitle}
                          </div>
                          <div className="mt-0.5 text-xs font-bold text-slate-500">
                            요청번호 <span className="font-mono-num">{item.payload.requestId}</span> ·{' '}
                            <span className="font-mono-num text-amber-700">{item.payload.coinCost}C</span>
                          </div>
                        </div>
                        <span className={`text-xs font-extrabold ${statusClass}`}>{statusLabel}</span>
                      </div>

                      <p className="mt-1.5 text-xs font-medium text-slate-600">
                        메시지: &ldquo;{item.payload.studentMessage}&rdquo;
                      </p>

                      {item.parentReply && (
                        <p className="mt-1 text-xs font-extrabold text-slate-800">
                          {wallet.parentName} 답장: &ldquo;{item.parentReply}&rdquo;
                        </p>
                      )}

                      {item.status === 'PENDING_HOST' && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-slate-500">
                            원본 앱 응답 핸드오프 테스트:
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onSimulateHostResolve(item.payload.requestId, true)}
                              className="min-h-[36px] px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-extrabold hover:bg-emerald-700 cursor-pointer"
                            >
                              부모 승인 시뮬레이션
                            </button>
                            <button
                              type="button"
                              onClick={() => onSimulateHostResolve(item.payload.requestId, false)}
                              className="min-h-[36px] px-3 py-1 rounded-xl bg-slate-200 text-slate-800 text-xs font-extrabold hover:bg-slate-300 cursor-pointer"
                            >
                              반려(환불) 시뮬레이션
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'spec' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-600 leading-relaxed">
                이 3D 아케이드 모듈은 안드로이드 <code className="font-mono-num text-slate-900">WebView</code>,{' '}
                <code className="font-mono-num text-slate-900">iframe postMessage</code>, 및{' '}
                <code className="font-mono-num text-slate-900">CustomEvent</code>를 통해 원본 앱과 양방향 연동됩니다.
                URL 쿼리(<code className="font-mono-num text-slate-900">?embed=1&amp;userId=...&amp;initialCoins=300&amp;game=sky-runner</code>)로 바로 임베드할 수 있습니다.
              </div>

              <div className="relative rounded-2xl bg-slate-900 text-slate-100 p-3.5 font-mono-num text-[11px] leading-relaxed overflow-x-auto">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-700">
                  <span className="flex items-center gap-1.5 font-bold text-sky-300">
                    <Code2 className="w-4 h-4" />
                    Android Kotlin WebView Handoff Contract
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySnippet}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? '복사됨' : '코드 복사'}</span>
                  </button>
                </div>
                <pre className="whitespace-pre">{ANDROID_KOTLIN_HANDOFF_SNIPPET}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
