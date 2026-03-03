import { useRef } from 'react';
import * as THREE from 'three';

interface BallProps {
  position: [number, number, number];
}

export function Ball({ position }: BallProps) {
  const ref = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={ref} position={position} castShadow>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial color="#ccff00" emissive="#667700" emissiveIntensity={0.2} />
    </mesh>
  );
}
