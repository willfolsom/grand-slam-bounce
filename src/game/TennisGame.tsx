import { Canvas, useFrame } from '@react-three/fiber';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Court } from './Court';
import { Stadium } from './Stadium';
import { Player } from './Player';
import { Ball } from './Ball';
import { CourtType, COURT_THEMES, BallState, GameState } from './types';

const COURT_LENGTH = 24;
const COURT_WIDTH = 10;
const HALF_L = COURT_LENGTH / 2;
const HALF_W = COURT_WIDTH / 2;
const GRAVITY = -15;
const BALL_SPEED = 12;
const PLAYER_Z = HALF_L - 1;
const AI_Z = -HALF_L + 1;
const HIT_RANGE_X = 1.5;
const HIT_RANGE_Z = 2.5;
const NET_HEIGHT = 0.9;

function GameScene({
  courtType, gameState, setGameState, ballState, setBallState,
}: {
  courtType: CourtType;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  ballState: BallState;
  setBallState: React.Dispatch<React.SetStateAction<BallState>>;
}) {
  const theme = COURT_THEMES[courtType];
  const aiX = useRef(0);
  const aiSwinging = useRef(false);

  useFrame((_, delta) => {
    if (!gameState.gameStarted || gameState.pointOver) return;

    const dt = Math.min(delta, 0.05);
    const pos = [...ballState.position] as [number, number, number];
    const vel = [...ballState.velocity] as [number, number, number];
    let hasBounced = ballState.hasBounced;
    let lastHitBy = ballState.lastHitBy;

    vel[1] += GRAVITY * dt;
    pos[0] += vel[0] * dt;
    pos[1] += vel[1] * dt;
    pos[2] += vel[2] * dt;

    // Ground bounce
    if (pos[1] <= 0.12) {
      pos[1] = 0.12;
      if (vel[1] < -1) {
        const inCourt = Math.abs(pos[0]) <= HALF_W && Math.abs(pos[2]) <= HALF_L;
        if (!inCourt) {
          endPoint(lastHitBy === 'player' ? 'ai' : 'player', 'Out!');
          return;
        }
        hasBounced = true;
        vel[1] = Math.abs(vel[1]) * 0.6;
      } else if (hasBounced && Math.abs(vel[1]) < 2 && Math.abs(vel[0]) < 1 && Math.abs(vel[2]) < 1) {
        if (pos[2] > 0) endPoint('ai', 'Double bounce!');
        else endPoint('player', 'Double bounce!');
        return;
      }
    }

    // Out of bounds
    if (Math.abs(pos[0]) > HALF_W + 5) {
      endPoint(lastHitBy === 'player' ? 'ai' : 'player', 'Wide!');
      return;
    }
    if (pos[2] > HALF_L + 3) { endPoint('ai', 'Long!'); return; }
    if (pos[2] < -HALF_L - 3) { endPoint('player', 'Long!'); return; }

    // Net
    if (Math.abs(pos[2]) < 0.15 && pos[1] < NET_HEIGHT) {
      endPoint(vel[2] < 0 ? 'ai' : 'player', 'Net!');
      return;
    }

    // AI movement & swing
    const targetX = pos[0];
    const aiSpeed = 5.5;
    if (Math.abs(aiX.current - targetX) > 0.2) {
      aiX.current += Math.sign(targetX - aiX.current) * aiSpeed * dt;
    }
    aiX.current = Math.max(-HALF_W + 1, Math.min(HALF_W - 1, aiX.current));

    const aiDistX = Math.abs(pos[0] - aiX.current);
    const aiDistZ = Math.abs(pos[2] - AI_Z);
    if (aiDistX < HIT_RANGE_X && aiDistZ < HIT_RANGE_Z && hasBounced && pos[1] < 1.8 && lastHitBy !== 'ai') {
      aiSwinging.current = true;
      const tx = (Math.random() - 0.5) * (COURT_WIDTH - 2);
      vel[0] = (tx - pos[0]) * 0.5;
      vel[1] = 5 + Math.random() * 3;
      vel[2] = BALL_SPEED * (0.7 + Math.random() * 0.3);
      lastHitBy = 'ai';
      hasBounced = false;
      setTimeout(() => { aiSwinging.current = false; }, 250);
    }

    // Player swing
    if (gameState.isSwinging && lastHitBy !== 'player') {
      const pDistX = Math.abs(pos[0] - gameState.playerX);
      const pDistZ = Math.abs(pos[2] - PLAYER_Z);
      if (pDistX < HIT_RANGE_X && pDistZ < HIT_RANGE_Z && hasBounced && pos[1] < 2) {
        const tx = (Math.random() - 0.5) * (COURT_WIDTH - 2);
        vel[0] = (tx - pos[0]) * 0.5;
        vel[1] = 5 + Math.random() * 3;
        vel[2] = -BALL_SPEED * (0.7 + Math.random() * 0.3);
        lastHitBy = 'player';
        hasBounced = false;
      }
    }

    setBallState({ position: pos, velocity: vel, hasBounced, isServing: false, lastHitBy });
  });

  function endPoint(scorer: 'player' | 'ai', reason: string) {
    setGameState(prev => ({
      ...prev,
      playerScore: scorer === 'player' ? prev.playerScore + 1 : prev.playerScore,
      aiScore: scorer === 'ai' ? prev.aiScore + 1 : prev.aiScore,
      pointOver: true,
      message: `${reason} Point to ${scorer === 'player' ? 'You' : 'Opponent'}!`,
    }));
  }

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
      <directionalLight position={[-5, 15, -5]} intensity={0.3} />
      <Court theme={theme} />
      <Stadium theme={theme} />
      <Player positionX={gameState.playerX} positionZ={PLAYER_Z} isSwinging={gameState.isSwinging} color="#1a5276" />
      <Player positionX={aiX.current} positionZ={AI_Z} isSwinging={aiSwinging.current} color="#922b21" isAI />
      <Ball position={ballState.position} />
    </>
  );
}

export default function TennisGame() {
  const [courtType, setCourtType] = useState<CourtType>('clay');
  const [gameState, setGameState] = useState<GameState>({
    playerScore: 0, aiScore: 0, playerX: 0, isSwinging: false,
    gameStarted: false, pointOver: false, message: 'Press SERVE to start!',
  });
  const [ballState, setBallState] = useState<BallState>({
    position: [0, 3, -HALF_L + 2], velocity: [0, 0, 0],
    hasBounced: false, isServing: false, lastHitBy: null,
  });

  const keysRef = useRef<Set<string>>(new Set());
  const swingTimeout = useRef<number | null>(null);

  const serve = useCallback(() => {
    const tx = (Math.random() - 0.5) * 4;
    setBallState({
      position: [0, 3, -HALF_L + 2],
      velocity: [tx * 0.5, 4, BALL_SPEED],
      hasBounced: false, isServing: true, lastHitBy: 'ai',
    });
    setGameState(prev => ({ ...prev, gameStarted: true, pointOver: false, message: '' }));
  }, []);

  const swing = useCallback(() => {
    if (swingTimeout.current) clearTimeout(swingTimeout.current);
    setGameState(prev => ({ ...prev, isSwinging: true }));
    swingTimeout.current = window.setTimeout(() => {
      setGameState(prev => ({ ...prev, isSwinging: false }));
    }, 300);
  }, []);

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (gameState.pointOver || !gameState.gameStarted) serve();
        else swing();
      }
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [gameState.pointOver, gameState.gameStarted, serve, swing]);

  // Movement
  useEffect(() => {
    let raf: number;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      let dx = 0;
      const speed = 8;
      if (keysRef.current.has('a') || keysRef.current.has('arrowleft')) dx -= speed * dt;
      if (keysRef.current.has('d') || keysRef.current.has('arrowright')) dx += speed * dt;
      if (dx !== 0) {
        setGameState(prev => ({
          ...prev,
          playerX: Math.max(-HALF_W + 1, Math.min(HALF_W - 1, prev.playerX + dx)),
        }));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Touch movement
  const [touchDir, setTouchDir] = useState<'left' | 'right' | null>(null);
  useEffect(() => {
    if (!touchDir) return;
    let raf: number;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const dx = (touchDir === 'left' ? -8 : 8) * dt;
      setGameState(prev => ({
        ...prev,
        playerX: Math.max(-HALF_W + 1, Math.min(HALF_W - 1, prev.playerX + dx)),
      }));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [touchDir]);

  const theme = COURT_THEMES[courtType];

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden select-none">
      <Canvas
        shadows
        camera={{ position: [0, 14, 22], fov: 45, near: 0.1, far: 100 }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <GameScene
          courtType={courtType}
          gameState={gameState}
          setGameState={setGameState}
          ballState={ballState}
          setBallState={setBallState}
        />
      </Canvas>

      {/* Scoreboard */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none">
        <div className="flex justify-center pt-4">
          <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg px-6 py-3 flex items-center gap-6">
            <div className="text-center">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">You</div>
              <div className="text-2xl font-bold text-foreground">{gameState.playerScore}</div>
            </div>
            <div className="text-muted-foreground text-lg">—</div>
            <div className="text-center">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">CPU</div>
              <div className="text-2xl font-bold text-foreground">{gameState.aiScore}</div>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-2">
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-1">
            <span className="text-xs font-semibold tracking-wider text-accent uppercase">{theme.name}</span>
          </div>
        </div>
        {gameState.message && (
          <div className="flex justify-center mt-4">
            <div className="bg-accent/90 text-accent-foreground px-6 py-2 rounded-lg font-bold text-lg animate-pulse">
              {gameState.message}
            </div>
          </div>
        )}
      </div>

      {/* Court selector */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        {(['clay', 'hard', 'grass'] as CourtType[]).map(ct => (
          <button
            key={ct}
            onClick={() => setCourtType(ct)}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider border transition-all ${
              courtType === ct
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card/80 text-foreground border-border hover:bg-secondary'
            }`}
          >
            {COURT_THEMES[ct].label}
          </button>
        ))}
      </div>

      {/* Keyboard hints */}
      <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur-sm border border-border rounded-lg px-4 py-2 pointer-events-none hidden md:block">
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">A/D</span> or <span className="font-bold text-foreground">←/→</span> Move
          <span className="mx-2">•</span>
          <span className="font-bold text-foreground">Space</span> Swing / Serve
        </div>
      </div>

      {/* Touch controls */}
      <div className="absolute bottom-6 right-4 flex gap-3 z-10 md:hidden">
        <button
          onTouchStart={() => setTouchDir('left')}
          onTouchEnd={() => setTouchDir(null)}
          className="w-14 h-14 rounded-full bg-secondary/90 border border-border flex items-center justify-center text-foreground text-xl font-bold active:bg-primary active:text-primary-foreground"
        >←</button>
        <button
          onTouchStart={() => { if (gameState.pointOver || !gameState.gameStarted) serve(); else swing(); }}
          className="w-14 h-14 rounded-full bg-accent/90 border border-border flex items-center justify-center text-accent-foreground text-xs font-bold uppercase active:scale-95"
        >{gameState.pointOver || !gameState.gameStarted ? 'Serve' : 'Swing'}</button>
        <button
          onTouchStart={() => setTouchDir('right')}
          onTouchEnd={() => setTouchDir(null)}
          className="w-14 h-14 rounded-full bg-secondary/90 border border-border flex items-center justify-center text-foreground text-xl font-bold active:bg-primary active:text-primary-foreground"
        >→</button>
      </div>

      {/* Desktop swing button */}
      <div className="absolute bottom-4 right-4 z-10 hidden md:block">
        <button
          onClick={() => { if (gameState.pointOver || !gameState.gameStarted) serve(); else swing(); }}
          className="px-6 py-3 rounded-lg bg-accent text-accent-foreground font-bold uppercase tracking-wider border border-border hover:scale-105 transition-transform"
        >
          {gameState.pointOver || !gameState.gameStarted ? '🎾 Serve' : '🏸 Swing'}
        </button>
      </div>
    </div>
  );
}
