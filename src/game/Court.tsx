import { CourtTheme } from './types';

interface CourtProps {
  theme: CourtTheme;
}

// Tennis court dimensions (scaled): ~23.77m x 10.97m (doubles) / 8.23m singles
// We'll use a simplified scale: length=24, width=10

export function Court({ theme }: CourtProps) {
  const length = 24;
  const width = 10;
  const halfL = length / 2;
  const halfW = width / 2;
  const serviceBoxDepth = 6.4; // ~6.4m from net
  const netHeight = 0.9;

  return (
    <group>
      {/* Court surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color={theme.courtColor} />
      </mesh>

      {/* Surround area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[width + 8, length + 10]} />
        <meshStandardMaterial color={theme.surroundColor} />
      </mesh>

      {/* Lines - baselines */}
      <Line from={[-halfW, 0.01, -halfL]} to={[halfW, 0.01, -halfL]} color={theme.lineColor} />
      <Line from={[-halfW, 0.01, halfL]} to={[halfW, 0.01, halfL]} color={theme.lineColor} />

      {/* Sidelines */}
      <Line from={[-halfW, 0.01, -halfL]} to={[-halfW, 0.01, halfL]} color={theme.lineColor} />
      <Line from={[halfW, 0.01, -halfL]} to={[halfW, 0.01, halfL]} color={theme.lineColor} />

      {/* Singles sidelines */}
      <Line from={[-halfW + 1.37, 0.01, -halfL]} to={[-halfW + 1.37, 0.01, halfL]} color={theme.lineColor} />
      <Line from={[halfW - 1.37, 0.01, -halfL]} to={[halfW - 1.37, 0.01, halfL]} color={theme.lineColor} />

      {/* Service line near side */}
      <Line from={[-halfW + 1.37, 0.01, halfL - serviceBoxDepth]} to={[halfW - 1.37, 0.01, halfL - serviceBoxDepth]} color={theme.lineColor} />
      {/* Service line far side */}
      <Line from={[-halfW + 1.37, 0.01, -halfL + serviceBoxDepth]} to={[halfW - 1.37, 0.01, -halfL + serviceBoxDepth]} color={theme.lineColor} />

      {/* Center service lines (net to service line) */}
      <Line from={[0, 0.01, 0]} to={[0, 0.01, halfL - serviceBoxDepth]} color={theme.lineColor} />
      <Line from={[0, 0.01, 0]} to={[0, 0.01, -halfL + serviceBoxDepth]} color={theme.lineColor} />

      {/* Center marks on baselines */}
      <Line from={[0, 0.01, halfL]} to={[0, 0.01, halfL - 0.3]} color={theme.lineColor} />
      <Line from={[0, 0.01, -halfL]} to={[0, 0.01, -halfL + 0.3]} color={theme.lineColor} />

      {/* Net */}
      <mesh position={[0, netHeight / 2, 0]}>
        <boxGeometry args={[width + 2, netHeight, 0.05]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.7} />
      </mesh>
      {/* Net posts */}
      <mesh position={[-(width / 2 + 1), netHeight / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, netHeight]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
      <mesh position={[(width / 2 + 1), netHeight / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, netHeight]} />
        <meshStandardMaterial color="#888888" />
      </mesh>

      {/* Net cord (top of net) */}
      <mesh position={[0, netHeight, 0]}>
        <boxGeometry args={[width + 2, 0.03, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function Line({ from, to, color }: { from: [number, number, number]; to: [number, number, number]; color: string }) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const midX = (from[0] + to[0]) / 2;
  const midY = (from[1] + to[1]) / 2;
  const midZ = (from[2] + to[2]) / 2;

  const isHorizontal = Math.abs(dx) > Math.abs(dz);

  return (
    <mesh position={[midX, midY, midZ]} rotation={[0, isHorizontal ? 0 : Math.PI / 2, 0]}>
      <boxGeometry args={[isHorizontal ? Math.abs(dx) : Math.abs(dz), 0.01, 0.05]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
