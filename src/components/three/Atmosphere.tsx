import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

const BG = "#141c17";

/** Shared lighting, fog, ground and drifting knowledge particles. */
export function Atmosphere({ groundRadius = 30, wet = false, particles = 160 }: { groundRadius?: number; wet?: boolean; particles?: number }) {
  const groundTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(256, 256, 20, 256, 256, 256);
    grad.addColorStop(0, wet ? "#2a3a33" : "#2e3a2a");
    grad.addColorStop(1, BG);
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 5000; i++) {
      g.fillStyle = `rgba(${150 + Math.random() * 60},${150 + Math.random() * 50},${110},${Math.random() * 0.05})`;
      g.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [wet]);

  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 14, 48]} />
      <ambientLight intensity={0.35} />
      <hemisphereLight args={["#e9e2cc", "#1b241d", 0.6]} />
      <directionalLight
        position={[6, 12, 5]}
        intensity={1.6}
        color="#f4ecd6"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
      />
      <Environment resolution={64}>
        <Lightformer intensity={1.4} position={[0, 6, 0]} scale={[10, 10, 1]} rotation-x={Math.PI / 2} color="#efe6cf" />
        <Lightformer intensity={0.6} color="#8fa38a" position={[-6, 2, -2]} rotation-y={Math.PI / 2} scale={[20, 2, 1]} />
      </Environment>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[groundRadius, 64]} />
        <meshStandardMaterial map={groundTex} roughness={1} metalness={wet ? 0.2 : 0} />
      </mesh>
      <Motes count={particles} />
    </>
  );
}

function Motes({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * 24;
      a[i * 3 + 1] = Math.random() * 9;
      a[i * 3 + 2] = (Math.random() - 0.5) * 24;
    }
    return a;
  }, [count]);
  useFrame((_, d) => {
    if (!ref.current) return;
    ref.current.rotation.y += Math.min(d, 0.05) * 0.015;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} color="#d9cf9e" transparent opacity={0.55} depthWrite={false} />
    </points>
  );
}
