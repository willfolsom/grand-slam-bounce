import { CourtTheme } from './types';

interface StadiumProps {
  theme: CourtTheme;
}

export function Stadium({ theme }: StadiumProps) {
  const standColor = theme.name === 'Wimbledon' ? '#2a5a2a' : 
                     theme.name === 'Roland Garros' ? '#8b6914' : '#1a3a6a';
  const seatColor = theme.name === 'Wimbledon' ? '#1a4a1a' :
                    theme.name === 'Roland Garros' ? '#6b4914' : '#0a2a5a';

  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Stands - 4 sides */}
      {/* Left stand */}
      <Stand position={[-14, 0, 0]} rotation={[0, Math.PI / 2, 0]} width={30} color={standColor} seatColor={seatColor} />
      {/* Right stand */}
      <Stand position={[14, 0, 0]} rotation={[0, -Math.PI / 2, 0]} width={30} color={standColor} seatColor={seatColor} />
      {/* Back stand (far) */}
      <Stand position={[0, 0, -20]} rotation={[0, 0, 0]} width={24} color={standColor} seatColor={seatColor} />
      {/* Front stand (near) - smaller for TV camera view */}
      <Stand position={[0, 0, 20]} rotation={[0, Math.PI, 0]} width={24} color={standColor} seatColor={seatColor} />
    </group>
  );
}

function Stand({ position, rotation, width, color, seatColor }: {
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  color: string;
  seatColor: string;
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Main stand structure - tiered */}
      {[0, 1, 2, 3].map(tier => (
        <mesh key={tier} position={[0, 1 + tier * 1.5, -tier * 0.8]} castShadow>
          <boxGeometry args={[width, 1.2, 2]} />
          <meshStandardMaterial color={tier % 2 === 0 ? color : seatColor} />
        </mesh>
      ))}
    </group>
  );
}
