import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  CsatWord,
  GameId,
  GamePhase,
  GameSettings,
  HudSnapshot,
  RunStats,
  WalletProfile,
} from './game/types';
import { GAME_CATALOG, getGameMeta } from './game/vocabulary';
import { applyRunToWallet, claimDailyMissionReward, MAX_HEARTS } from './game/rules';
import { IDLE_BREATH_CLASS, type HumanRigQueueSnapshot } from './game/gestureSystem';
import {
  createGiftRequestHandoff,
  dispatchToHostApp,
  emitRunCompletedToHost,
  loadWalletFromStorage,
  parseHostBootConfig,
  resolveGiftHandoffFromHost,
  saveWalletToStorage,
  type HostInboundMessage,
} from './bridge/hostBridge';
import { soundEngine } from './audio/soundEngine';
import { ArcadeEngine } from './three/ArcadeEngine';
import { ArcadeHubOverlay } from './components/ArcadeHubOverlay';
import { PlayingHud } from './components/PlayingHud';
import { PauseModal, ResultModal } from './components/GameModals';
import { GiftHandoffModal } from './components/GiftHandoffModal';
import { ReviewNotebookModal } from './components/ReviewNotebookModal';
import { LeagueMissionModal } from './components/LeagueMissionModal';

function createInitialHud(gameId: GameId): HudSnapshot {
  const meta = getGameMeta(gameId);
  return {
    gameId,
    phase: 'title',
    roundIndex: 0,
    totalRounds: meta.roundsPerRun,
    score: 0,
    combo: 0,
    maxCombo: 0,
    isFever: false,
    hearts: MAX_HEARTS,
    maxHearts: MAX_HEARTS,
    coinsEarnedRun: 0,
    timerRatio: 1,
    activeLane: 1,
    spellingStep: 0,
    spellingBuilt: '',
    towerSelectedSide: null,
    towerSelectedPairId: null,
    towerMatchedPairIds: [],
    rpgState: 'walking',
    rpgDistancePct: 0,
    question: null,
    feedbackBanner: null,
  };
}

export default function App() {
  const bootConfig = useMemo(
    () => parseHostBootConfig(typeof window !== 'undefined' ? window.location.search : ''),
    []
  );

  const [selectedGameId, setSelectedGameId] = useState<GameId>(bootConfig.initialGameId);
  const [settings, setSettings] = useState<GameSettings>({ difficulty: 'ALL', speed: 'normal' });
  const [phase, setPhase] = useState<GamePhase>('title');
  const [hud, setHud] = useState<HudSnapshot>(() => createInitialHud(bootConfig.initialGameId));
  const [wallet, setWallet] = useState<WalletProfile>(() => loadWalletFromStorage(bootConfig));
  const [runSummary, setRunSummary] = useState<RunStats | null>(null);
  const [muted, setMuted] = useState(false);
  const [leftHanded, setLeftHanded] = useState(false);
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [leagueModalOpen, setLeagueModalOpen] = useState(false);
  const [rigState, setRigState] = useState<HumanRigQueueSnapshot>({
    activeClass: IDLE_BREATH_CLASS,
    activeGesture: null,
    activeEmotion: null,
    activeText: '',
    isSpeaking: false,
    segmentIndex: -1,
    totalSegments: 0,
    queueLength: 0,
    queuedCodes: [],
  });

  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const humanRigRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<ArcadeEngine | null>(null);
  const walletRef = useRef<WalletProfile>(wallet);
  const settingsRef = useRef<GameSettings>(settings);
  const phaseRef = useRef<GamePhase>(phase);
  const selectedGameRef = useRef<GameId>(selectedGameId);
  const modalOpenRef = useRef<boolean>(false);

  walletRef.current = wallet;
  settingsRef.current = settings;
  phaseRef.current = phase;
  selectedGameRef.current = selectedGameId;
  modalOpenRef.current = giftModalOpen || reviewModalOpen || leagueModalOpen;

  useEffect(() => {
    document.body.dataset.state = phase;
  }, [phase]);

  useEffect(() => {
    saveWalletToStorage(wallet);
  }, [wallet]);

  const handleRunFinish = useCallback((summary: RunStats, solvedWords: CsatWord[]) => {
    setRunSummary(summary);
    setWallet((prev) => {
      const next = applyRunToWallet(prev, summary, solvedWords);
      emitRunCompletedToHost(summary, next);
      return next;
    });
  }, []);

  const handleStartGame = useCallback((gameId: GameId) => {
    setSelectedGameId(gameId);
    setRunSummary(null);
    setGiftModalOpen(false);
    setReviewModalOpen(false);
    setLeagueModalOpen(false);
    document.body.dataset.state = 'playing';
    setPhase('playing');
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const prevBest = walletRef.current.bestScores[gameId] ?? 0;
    engineRef.current?.startGame(
      gameId,
      walletRef.current.wrongWordIds,
      prevBest,
      settingsRef.current
    );
  }, []);

  const handleClaimMission = useCallback((missionId: string) => {
    setWallet((prev) => {
      const res = claimDailyMissionReward(prev, missionId);
      if (res.ok) {
        soundEngine.playFanfare(true);
        dispatchToHostApp('COIN_UPDATED', {
          studentId: res.updatedWallet.studentId,
          coins: res.updatedWallet.coins,
          delta: res.rewardCoins,
          reason: `DAILY_MISSION:${missionId}`,
        });
      }
      return res.updatedWallet;
    });
  }, []);

  const handleBackToHub = useCallback(() => {
    setRunSummary(null);
    document.body.dataset.state = 'title';
    setPhase('title');
    engineRef.current?.showHub(selectedGameRef.current);
  }, []);

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      return next;
    });
  }, []);

  const handleSubmitGiftRequest = useCallback(
    (params: { giftId: string; giftTitle: string; coinCost: number; studentMessage: string }) => {
      const result = createGiftRequestHandoff({
        wallet: walletRef.current,
        giftId: params.giftId,
        giftTitle: params.giftTitle,
        coinCost: params.coinCost,
        studentMessage: params.studentMessage,
      });

      if (!result.ok || !result.record) {
        return { ok: false, error: result.error };
      }

      const channels = dispatchToHostApp('PARENT_GIFT_HANDOFF', result.record.payload);
      const recordWithChannels = {
        ...result.record,
        deliveryChannels: channels,
      };
      const updatedWallet: WalletProfile = {
        ...result.updatedWallet,
        handoffHistory: [
          recordWithChannels,
          ...result.updatedWallet.handoffHistory.slice(1),
        ],
      };

      setWallet(updatedWallet);
      soundEngine.playFanfare(true);
      return { ok: true };
    },
    []
  );

  const handleHostResolveGift = useCallback((requestId: string, approved: boolean, parentReply?: string) => {
    setWallet((prev) =>
      resolveGiftHandoffFromHost({
        wallet: prev,
        requestId,
        approved,
        parentReply,
      })
    );
    soundEngine.playCorrect(approved ? 4 : 0);
  }, []);

  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    const engine = new ArcadeEngine(
      mountEl,
      {
        onHudUpdate: (snapshot) => setHud(snapshot),
        onRunFinish: handleRunFinish,
        onPhaseChange: (nextPhase) => {
          document.body.dataset.state = nextPhase;
          setPhase(nextPhase);
        },
      },
      bootConfig.autostart
        ? {
            gameId: bootConfig.initialGameId,
            priorityWordIds: walletRef.current.wrongWordIds,
            settings: settingsRef.current,
          }
        : undefined
    );
    engineRef.current = engine;
    engine.attachHumanRigElement(humanRigRef.current);
    const unsubscribeRig = engine.humanRigQueue.subscribe((snapshot) => {
      setRigState(snapshot);
    });

    dispatchToHostApp('ARCADE_READY', {
      studentId: walletRef.current.studentId,
      coins: walletRef.current.coins,
      games: GAME_CATALOG.map((g) => g.id),
    });

    if (bootConfig.autostart) {
      document.body.dataset.state = 'playing';
      setPhase('playing');
    }

    return () => {
      unsubscribeRig();
      engine.attachHumanRigElement(null);
      engine.dispose();
      engineRef.current = null;
    };
  }, [bootConfig.autostart, bootConfig.initialGameId, handleRunFinish]);

  useEffect(() => {
    window.CsatArcadeBridge = {
      version: '1.0.0',
      getWallet: () => walletRef.current,
      emitGiftResponse: (requestId: string, approved: boolean, parentReply?: string) => {
        handleHostResolveGift(requestId, approved, parentReply);
      },
      addHostCoins: (delta: number) => {
        if (!Number.isFinite(delta)) return;
        setWallet((prev) => ({
          ...prev,
          coins: Math.max(0, prev.coins + Math.round(delta)),
          lifetimeCoins: prev.lifetimeCoins + Math.max(0, Math.round(delta)),
        }));
      },
      humanRig: {
        enqueueSequence: (input, options) =>
          engineRef.current?.humanRigQueue.enqueueSequence(input, options) ?? [],
        returnToIdleBreath: () => {
          engineRef.current?.humanRigQueue.returnToIdleBreath();
        },
        getState: () => {
          const s = engineRef.current?.humanRigQueue.getState();
          return {
            activeClass: s?.activeClass ?? IDLE_BREATH_CLASS,
            activeEmotion: s?.activeEmotion ?? null,
            isSpeaking: s?.isSpeaking ?? false,
            queueLength: s?.queueLength ?? 0,
          };
        },
      },
    };

    const onHostMessage = (event: MessageEvent<HostInboundMessage>) => {
      const msg = event.data;
      if (!msg || typeof msg !== 'object') return;
      if (msg.type === 'HOST_GIFT_RESPONSE' && msg.payload) {
        const reqId = String(msg.payload.requestId ?? '');
        const approved = Boolean(msg.payload.approved);
        const reply = msg.payload.parentReply ? String(msg.payload.parentReply) : undefined;
        if (reqId) handleHostResolveGift(reqId, approved, reply);
      } else if (msg.type === 'HOST_SYNC_WALLET' && msg.payload && typeof msg.payload.coins === 'number') {
        setWallet((prev) => ({ ...prev, coins: Math.max(0, Math.floor(msg.payload!.coins as number)) }));
      }
    };

    window.addEventListener('message', onHostMessage);
    return () => {
      window.removeEventListener('message', onHostMessage);
      delete window.CsatArcadeBridge;
    };
  }, [handleHostResolveGift]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        if (e.key === 'Escape') {
          setGiftModalOpen(false);
          setReviewModalOpen(false);
        }
        return;
      }

      if (modalOpenRef.current) {
        if (e.key === 'Escape') {
          setGiftModalOpen(false);
          setReviewModalOpen(false);
          setLeagueModalOpen(false);
        }
        return;
      }

      if (e.repeat) return;
      const currentPhase = phaseRef.current;

      if (currentPhase === 'title') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStartGame(selectedGameRef.current);
          return;
        }
        const num = Number.parseInt(e.key, 10);
        if (num >= 1 && num <= GAME_CATALOG.length) {
          const nextId = GAME_CATALOG[num - 1].id;
          setSelectedGameId(nextId);
          engineRef.current?.setHubPreviewGame(nextId);
          soundEngine.playAction(0.95 + num * 0.06);
        }
        return;
      }

      if (currentPhase === 'paused') {
        if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
          e.preventDefault();
          engineRef.current?.setPaused(false);
        }
        return;
      }

      if (currentPhase === 'gameover') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStartGame(selectedGameRef.current);
        }
        return;
      }

      const lower = e.key.toLowerCase();
      if (e.key === 'Escape' || lower === 'p') {
        e.preventDefault();
        engineRef.current?.setPaused(true);
        return;
      }
      if (lower === 'm') {
        handleToggleMute();
        return;
      }
      if (lower === 'l') {
        setLeftHanded((prev) => !prev);
        return;
      }
      if (lower === 'v') {
        engineRef.current?.speakCurrentPrompt();
        return;
      }

      const activeGame = engineRef.current?.getActiveGameId();
      if (activeGame === 'sky-runner') {
        if (e.key === 'ArrowLeft' || lower === 'a') {
          e.preventDefault();
          engineRef.current?.moveLane(-1);
        } else if (e.key === 'ArrowRight' || lower === 'd') {
          e.preventDefault();
          engineRef.current?.moveLane(1);
        } else if (e.key === ' ' || e.key === 'ArrowUp' || lower === 'w') {
          e.preventDefault();
          engineRef.current?.boostDash();
        } else if (e.key === '1' || e.key === '2' || e.key === '3') {
          engineRef.current?.selectOption(Number(e.key) - 1);
        }
      } else if (activeGame === 'vault-rush') {
        if (e.key === 'ArrowLeft' || lower === 'a' || e.key === '1' || lower === 'o') {
          e.preventDefault();
          engineRef.current?.selectOption(0);
        } else if (e.key === 'ArrowRight' || lower === 'd' || e.key === '2' || lower === 'x') {
          e.preventDefault();
          engineRef.current?.selectOption(1);
        }
      } else if (activeGame === 'rpg-street') {
        if (e.key === 'ArrowUp' || lower === 'w' || e.key === ' ') {
          e.preventDefault();
          engineRef.current?.walkRpgForward();
        } else if (e.key === '1' || e.key === '2' || e.key === '3') {
          engineRef.current?.selectOption(Number(e.key) - 1);
        }
      } else if (activeGame === 'voca-tetris') {
        if (e.key === 'ArrowLeft' || lower === 'a') {
          e.preventDefault();
          engineRef.current?.tetrisMove(-1);
        } else if (e.key === 'ArrowRight' || lower === 'd') {
          e.preventDefault();
          engineRef.current?.tetrisMove(1);
        } else if (e.key === 'ArrowUp' || lower === 'w' || lower === 'x') {
          e.preventDefault();
          engineRef.current?.tetrisRotate(1);
        } else if (lower === 'z') {
          e.preventDefault();
          engineRef.current?.tetrisRotate(-1);
        } else if (e.key === 'ArrowDown' || lower === 's') {
          e.preventDefault();
          engineRef.current?.tetrisSoftDropStep();
        } else if (e.key === ' ') {
          e.preventDefault();
          engineRef.current?.tetrisHardDrop();
        } else if (lower === 'c' || e.key === 'Shift') {
          e.preventDefault();
          engineRef.current?.tetrisHold();
        } else if (e.key === '1' || e.key === '2') {
          engineRef.current?.selectOption(Number(e.key) - 1);
        }
      } else if (activeGame !== 'tower-crash') {
        if (e.key === '1' || e.key === '2' || e.key === '3' || e.key === '4') {
          engineRef.current?.selectOption(Number(e.key) - 1);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [handleStartGame, handleToggleMute]);

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLElement>) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || phaseRef.current !== 'playing' || modalOpenRef.current) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    const dt = Date.now() - start.time;
    if (dt > 500) return;

    const activeGame = engineRef.current?.getActiveGameId();
    if (activeGame === 'sky-runner') {
      if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        engineRef.current?.moveLane(dx > 0 ? 1 : -1);
      } else if (dy < -48 && Math.abs(dy) > Math.abs(dx) * 1.3) {
        engineRef.current?.boostDash();
      }
    } else if (activeGame === 'rpg-street' && dy < -44 && Math.abs(dy) > Math.abs(dx) * 1.2) {
      engineRef.current?.walkRpgForward();
    } else if (activeGame === 'voca-tetris') {
      if (Math.abs(dx) > 32 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        engineRef.current?.tetrisMove(dx > 0 ? 1 : -1);
      } else if (dy > 48 && Math.abs(dy) > Math.abs(dx) * 1.3) {
        engineRef.current?.tetrisHardDrop();
      } else if (dy < -40 && Math.abs(dy) > Math.abs(dx) * 1.3) {
        engineRef.current?.tetrisRotate(1);
      }
    }
  }, []);

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#0B1220] sm:flex sm:items-center sm:justify-center sm:p-4 overflow-hidden">
      {/* Authentic Android Mobile App Viewport (edge-to-edge on phones, centered 412px portrait app frame on desktop) */}
      <main
        data-testid="mobile-app-shell"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-full sm:w-[412px] sm:h-[min(860px,95dvh)] sm:rounded-[34px] sm:ring-[7px] sm:ring-slate-900 sm:border sm:border-slate-700/70 sm:shadow-[0_28px_80px_rgba(0,0,0,0.65)] overflow-hidden bg-[#BFE4FF]"
      >
        {/* Subtle Android camera punch-hole indicator (visible only in desktop mobile frame) */}
        <div
          aria-hidden="true"
          className="hidden sm:block pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 z-50 w-20 h-1.5 rounded-full bg-slate-950/25"
        />

        <div ref={canvasMountRef} className="absolute inset-0 z-0 w-full h-full" />

        {/* Persistent #humanRig DOM synchronization node bound to Three.js character gesture queue */}
        <div
          id="humanRig"
          ref={humanRigRef}
          aria-hidden="true"
          className="idleBreath pointer-events-none absolute inset-0 z-10"
          data-gesture-class={IDLE_BREATH_CLASS}
          data-emotion="idle"
          data-speaking="false"
          data-queue-remaining="0"
        />

        {phase === 'title' && (
          <ArcadeHubOverlay
            selectedGameId={selectedGameId}
            wallet={wallet}
            settings={settings}
            isEmbedded={bootConfig.isEmbedded}
            muted={muted}
            onSelectGame={(id) => {
              setSelectedGameId(id);
              engineRef.current?.setHubPreviewGame(id);
              soundEngine.playAction(1.05);
            }}
            onStartGame={handleStartGame}
            onChangeSettings={(next) => {
              setSettings(next);
              soundEngine.playAction(1.1);
            }}
            onOpenGiftModal={() => setGiftModalOpen(true)}
            onOpenReviewModal={() => setReviewModalOpen(true)}
            onOpenLeagueModal={() => setLeagueModalOpen(true)}
            onToggleMute={handleToggleMute}
          />
        )}

        {(phase === 'playing' || phase === 'paused') && (
          <PlayingHud
            hud={hud}
            rigState={rigState}
            muted={muted}
            leftHanded={leftHanded}
            onSelectOption={(idx) => engineRef.current?.selectOption(idx)}
            onSelectTowerCard={(side, pairId) => engineRef.current?.selectTowerCard(side, pairId)}
            onMoveLane={(delta) => engineRef.current?.moveLane(delta)}
            onBoostDash={() => engineRef.current?.boostDash()}
            onWalkRpgForward={() => engineRef.current?.walkRpgForward()}
            onTetrisMove={(dx) => engineRef.current?.tetrisMove(dx)}
            onTetrisRotate={(dir) => engineRef.current?.tetrisRotate(dir)}
            onTetrisSoftDropStep={() => engineRef.current?.tetrisSoftDropStep()}
            onTetrisHardDrop={() => engineRef.current?.tetrisHardDrop()}
            onTetrisHold={() => engineRef.current?.tetrisHold()}
            onSpeakPrompt={() => engineRef.current?.speakCurrentPrompt()}
            onToggleMute={handleToggleMute}
            onToggleLeftHanded={() => setLeftHanded((prev) => !prev)}
            onPause={() => engineRef.current?.setPaused(true)}
          />
        )}

        {phase === 'paused' && (
          <PauseModal
            activeGameId={selectedGameId}
            gameTitle={getGameMeta(selectedGameId).title}
            onResume={() => engineRef.current?.setPaused(false)}
            onRestart={() => handleStartGame(selectedGameId)}
            onSwitchGame={(nextId) => handleStartGame(nextId)}
            onBackToHub={handleBackToHub}
          />
        )}

        {phase === 'gameover' && runSummary && (
          <ResultModal
            summary={runSummary}
            totalWalletCoins={wallet.coins}
            onPlayAgain={() => handleStartGame(runSummary.gameId)}
            onBackToHub={handleBackToHub}
            onOpenGiftModal={() => setGiftModalOpen(true)}
          />
        )}

        {giftModalOpen && (
          <GiftHandoffModal
            wallet={wallet}
            catalog={bootConfig.hostGiftCatalog}
            onClose={() => setGiftModalOpen(false)}
            onSubmitGiftRequest={handleSubmitGiftRequest}
            onSimulateHostResolve={(reqId, approved) => handleHostResolveGift(reqId, approved)}
          />
        )}

        {reviewModalOpen && (
          <ReviewNotebookModal
            wallet={wallet}
            onClose={() => setReviewModalOpen(false)}
            onStartReviewRun={() => {
              setReviewModalOpen(false);
              handleStartGame(selectedGameRef.current);
            }}
          />
        )}

        {leagueModalOpen && (
          <LeagueMissionModal
            wallet={wallet}
            onClose={() => setLeagueModalOpen(false)}
            onClaimMission={handleClaimMission}
          />
        )}
      </main>
    </div>
  );
}
