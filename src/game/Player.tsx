import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlayerProps {
  positionX: number;
  positionZ: number;
  isSwinging: boolean;
  color: string;
  isAI?: boolean;
}

export function Player({ positionX, positionZ, isSwinging, color, isAI }: PlayerProps) {
  const racketRef = useRef<THREE.Group>(null);
  const swingProgress = useRef(0);

  useFrame((_, delta) => {
    if (!racketRef.current) return;
    if (isSwinging) {
      swingProgress.current = Math.min(swingProgress.current + delta * 8, 1);
    } else {
      swingProgress.current = Math.max(swingProgress.current - delta * 4, 0);
    }
    // Swing animation: rotate racket forward
    const angle = swingProgress.current * Math.PI * 0.6;
    racketRef.current.rotation.x = -angle;
  });

  return (
    <group position={[positionX, 0, positionZ]}>
      {/* Body */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.6, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color="#f0c8a0" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.12, 0.25, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.3, 4, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.12, 0.25, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.3, 4, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Racket arm + racket */}
      <group ref={racketRef} position={[0.3, 1.1, 0]}>
        {/* Arm */}
        <mesh position={[0, 0, -0.3]} rotation={[Math.PI / 4, 0, 0]}>
          <capsuleGeometry args={[0.05, 0.3, 4, 4]} />
          <meshStandardMaterial color="#f0c8a0" />
        </mesh>
        {/* Racket handle */}
        <mesh position={[0, 0, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        {/* Racket head */}
        <mesh position={[0, 0, -0.85]}>
          <ringGeometry args={[0.05, 0.2, 16]} />
          <meshStandardMaterial color="#333333" side={THREE.DoubleSide} />
        </mesh>
        {/* Racket strings */}
        <mesh position={[0, 0, -0.85]}>
          <circleGeometry args={[0.18, 16]} />
          <meshStandardMaterial color="#dddddd" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}
