import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { VisualProfile } from "@/lib/api/types";
import { PlantRenderer } from "./PlantRenderer";
import { Atmosphere } from "./Atmosphere";
import { generateMorph } from "@/lib/morphology/engine";
import { useReducedMotion, webglAvailable } from "@/lib/browser";

/** Single-entity 3D stage used on the research page. Framed to the entity's size. */
export default function TreeStage({ profile, seedKey, grow, label }: { profile: VisualProfile; seedKey: string; grow?: boolean; label: string }) {
  const reduced = useReducedMotion();
  const { height, width } = useMemo(() => generateMorph(profile, seedKey, "low"), [profile, seedKey]);
  const size = Math.max(height, width * 1.1);
  const target: [number, number, number] = [0, height * 0.48, 0];
  const cam: [number, number, number] = [size * 0.95, height * 0.62, size * 1.25];

  if (!webglAvailable()) {
    return <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">Interactive 3D visualization is unavailable in this browser.</div>;
  }
  return (
    <div className="relative h-full w-full" role="img" aria-label={label}>
      <Canvas shadows dpr={[1, 1.75]} camera={{ position: cam, fov: 42 }}>
        <Suspense fallback={null}>
          <Atmosphere wet={profile.growth_form === "mangrove"} />
          <PlantRenderer profile={profile} seedKey={seedKey} grow={!!grow && !reduced} />
        </Suspense>
        <OrbitControls target={target} enableDamping minDistance={size * 0.4} maxDistance={size * 3} maxPolarAngle={Math.PI * 0.49} autoRotate={!reduced} autoRotateSpeed={0.35} />
      </Canvas>
      <p className="sr-only">{label}</p>
    </div>
  );
}
