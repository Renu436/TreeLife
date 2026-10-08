import { memo, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { VisualProfile } from "@/lib/api/types";
import { generateMorph, LEAF_PALETTES, WOOD_COLOR, type Detail, type Seg, type Leaf } from "@/lib/morphology/engine";

const UP = new THREE.Vector3(0, 1, 0);
const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpV = new THREE.Vector3();
const tmpS = new THREE.Vector3();
const tmpP = new THREE.Vector3();
const tmpE = new THREE.Euler();

function leafGeometry(style: VisualProfile["leaf_style"]) {
  switch (style) {
    case "needle": return new THREE.CylinderGeometry(0.004, 0.012, 0.32, 3).rotateZ(Math.PI / 2);
    case "lobed": {
      const s = new THREE.Shape();
      for (let i = 0; i <= 10; i++) {
        const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
        const r = i % 2 === 0 ? 0.2 : 0.09;
        const x = Math.cos(a) * r, y = Math.sin(a) * r;
        if (i === 0) s.moveTo(x, y); else s.lineTo(x, y);
      }
      return new THREE.ShapeGeometry(s);
    }
    case "frond": return new THREE.PlaneGeometry(0.75, 0.09);
    case "broad": return new THREE.CircleGeometry(0.17, 7).scale(1, 0.6, 1);
    case "compound": return new THREE.CircleGeometry(0.09, 6).scale(1.5, 0.45, 1);
    default: return new THREE.CircleGeometry(0.13, 6).scale(1, 0.55, 1);
  }
}

const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const local = (p: number, t: number) => ease(Math.min(1, Math.max(0, (p - t * 0.72) / 0.28)));

function writeSegs(mesh: THREE.InstancedMesh, segs: Seg[], p: number) {
  segs.forEach((s, i) => {
    const k = local(p, s.t);
    tmpP.set(...s.a);
    tmpV.set(s.b[0] - s.a[0], s.b[1] - s.a[1], s.b[2] - s.a[2]);
    const len = tmpV.length() * k;
    tmpQ.setFromUnitVectors(UP, tmpV.normalize());
    tmpS.set(s.r * Math.max(k, 0.001), Math.max(len, 0.0001), s.r * Math.max(k, 0.001));
    tmpM.compose(tmpP, tmpQ, tmpS);
    mesh.setMatrixAt(i, tmpM);
  });
  mesh.instanceMatrix.needsUpdate = true;
}
function writeLeaves(mesh: THREE.InstancedMesh, leaves: Leaf[], p: number) {
  leaves.forEach((l, i) => {
    const k = local(p, l.t);
    tmpP.set(...l.p);
    tmpQ.setFromEuler(tmpE.set(...l.rot));
    const s = l.s * k + 0.0001;
    tmpS.set(s, s, s);
    tmpM.compose(tmpP, tmpQ, tmpS);
    mesh.setMatrixAt(i, tmpM);
  });
  mesh.instanceMatrix.needsUpdate = true;
}

interface Props {
  profile: VisualProfile;
  seedKey: string;
  detail?: Detail;
  grow?: boolean;
  growSeconds?: number;
  highlight?: boolean;
}

export const PlantRenderer = memo(function PlantRenderer({ profile, seedKey, detail = "high", grow = false, growSeconds = 4.5, highlight }: Props) {
  const morph = useMemo(() => generateMorph(profile, seedKey, detail), [profile, seedKey, detail]);
  const woodRef = useRef<THREE.InstancedMesh>(null);
  const frondRef = useRef<THREE.InstancedMesh>(null);
  const leafRef = useRef<THREE.InstancedMesh>(null);
  const fruitRef = useRef<THREE.InstancedMesh>(null);
  const progress = useRef(grow ? 0 : 1);

  const leafGeo = useMemo(() => leafGeometry(profile.leaf_style), [profile.leaf_style]);
  const cylGeo = useMemo(() => new THREE.CylinderGeometry(0.72, 1, 1, detail === "low" ? 5 : 7, 1).translate(0, 0.5, 0), [detail]);
  const palette = LEAF_PALETTES[profile.color_profile] ?? LEAF_PALETTES.seasonal_green;
  const woodColor = WOOD_COLOR[profile.growth_form] ?? WOOD_COLOR.broadleaf_tree;

  const apply = (p: number) => {
    if (woodRef.current) writeSegs(woodRef.current, morph.wood, p);
    if (frondRef.current) writeSegs(frondRef.current, morph.fronds, p);
    if (leafRef.current) writeLeaves(leafRef.current, morph.leaves, p);
    if (fruitRef.current) {
      morph.fruits.forEach((f, i) => {
        const k = local(p, f.t);
        tmpM.compose(tmpP.set(...f.p), tmpQ.identity(), tmpS.setScalar(f.r * k + 0.0001));
        fruitRef.current!.setMatrixAt(i, tmpM);
      });
      fruitRef.current.instanceMatrix.needsUpdate = true;
    }
  };

  useLayoutEffect(() => {
    progress.current = grow ? 0 : 1;
    if (leafRef.current) {
      const c = new THREE.Color();
      morph.leaves.forEach((l, i) => {
        c.set(palette[Math.floor(l.c * palette.length) % palette.length]);
        leafRef.current!.setColorAt(i, c);
      });
      if (leafRef.current.instanceColor) leafRef.current.instanceColor.needsUpdate = true;
    }
    apply(progress.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [morph, grow]);

  useFrame((_, d) => {
    if (progress.current >= 1) return;
    progress.current = Math.min(1, progress.current + Math.min(d, 0.05) / growSeconds);
    apply(progress.current);
  });

  return (
    <group>
      <instancedMesh ref={woodRef} args={[cylGeo, undefined, morph.wood.length]} castShadow receiveShadow frustumCulled={false}>
        <meshStandardMaterial color={woodColor} roughness={0.95} emissive={highlight ? "#3a3220" : "#000000"} />
      </instancedMesh>
      {morph.fronds.length > 0 && (
        <instancedMesh ref={frondRef} args={[cylGeo, undefined, morph.fronds.length]} castShadow frustumCulled={false}>
          <meshStandardMaterial color={palette[0]} roughness={0.8} />
        </instancedMesh>
      )}
      {morph.leaves.length > 0 && (
        <instancedMesh ref={leafRef} args={[leafGeo, undefined, morph.leaves.length]} castShadow frustumCulled={false}>
          <meshStandardMaterial side={THREE.DoubleSide} roughness={0.75} emissive={highlight ? "#2a2a14" : "#000000"} />
        </instancedMesh>
      )}
      {morph.fruits.length > 0 && (
        <instancedMesh ref={fruitRef} args={[undefined, undefined, morph.fruits.length]} castShadow frustumCulled={false}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={profile.growth_form === "palm" ? "#6b5a2e" : "#c9a23a"} roughness={0.6} />
        </instancedMesh>
      )}
    </group>
  );
});
