// Generalized procedural morphology engine.
// A VisualProfile (from research) deterministically becomes geometry descriptors.
// No species names are referenced here — only morphological parameters.
import type { VisualProfile } from "@/lib/api/types";

export type V3 = [number, number, number];
export interface Seg { a: V3; b: V3; r: number; t: number }
export interface Leaf { p: V3; s: number; rot: V3; t: number; c: number }
export interface Fruit { p: V3; r: number; t: number }
export interface Morph {
  wood: Seg[];
  fronds: Seg[];
  leaves: Leaf[];
  fruits: Fruit[];
  height: number;
  width: number;
}

export type Detail = "high" | "medium" | "low";

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const norm = (a: V3): V3 => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

const DENSITY = { sparse: 5, medium: 9, dense: 14 };
const LEAF_SCALE = { small: 0.7, medium: 1, large: 1.45 };

export function generateMorph(profile: VisualProfile, seedKey: string, detail: Detail = "high"): Morph {
  const rand = rng(hash(seedKey + JSON.stringify(profile)));
  const H = 6 * clamp(profile.height_ratio, 0.3, 1.6);
  const W = 4 * clamp(profile.width_ratio, 0.3, 1.8);
  const m: Morph = { wood: [], fronds: [], leaves: [], fruits: [], height: H, width: W };
  const detailK = detail === "high" ? 1 : detail === "medium" ? 0.55 : 0.3;
  const density = Math.max(2, Math.round(DENSITY[profile.canopy_density] * detailK));
  const ls = LEAF_SCALE[profile.leaf_scale] * (detail === "high" ? 1 : 1.5);

  const leafCluster = (p: V3, radius: number, t: number, n = density) => {
    for (let i = 0; i < n; i++) {
      const th = rand() * Math.PI * 2, ph = Math.acos(rand() * 1.6 - 0.6);
      const rr = radius * Math.cbrt(rand());
      const q: V3 = [p[0] + Math.sin(ph) * Math.cos(th) * rr, p[1] + Math.cos(ph) * rr * 0.7, p[2] + Math.sin(ph) * Math.sin(th) * rr];
      m.leaves.push({ p: q, s: ls * (0.75 + rand() * 0.5), rot: [rand() * 6.28, rand() * 6.28, rand() * 6.28], t: Math.min(1, t + 0.1 + rand() * 0.1), c: rand() });
    }
  };

  switch (profile.growth_form) {
    case "palm": palm(); break;
    case "conifer": conifer(); break;
    case "mangrove": mangrove(); break;
    default: broadleaf([0, 0, 0], 1, 0.15);
  }
  if (profile.root_style === "buttress") buttress();
  return m;

  // ---------- forms ----------
  function broadleaf(base: V3, scale: number, t0: number) {
    const bp = profile.branching_pattern;
    const trunkFrac = bp === "wide_spreading" ? 0.36 : bp === "upright" ? 0.5 : 0.42;
    const thick = profile.trunk_style === "thick_branching" ? 1.35 : profile.trunk_style === "slender" ? 0.7 : 1;
    const r0 = 0.12 * H * 0.18 * thick * scale + 0.05;
    let p = base;
    const steps = 3;
    for (let i = 0; i < steps; i++) {
      const q: V3 = [p[0] + (rand() - 0.5) * 0.15, p[1] + (H * trunkFrac * scale) / steps, p[2] + (rand() - 0.5) * 0.15];
      m.wood.push({ a: p, b: q, r: r0 * (1 - i * 0.12), t: t0 + i * 0.06 });
      p = q;
    }
    const maxD = detail === "low" ? 2 : detail === "medium" ? 3 : 4;
    const spread = bp === "wide_spreading" ? 1.05 : bp === "upright" ? 0.45 : bp === "open" ? 0.8 : 0.7;
    const lift = bp === "wide_spreading" ? 0.1 : bp === "upright" ? 0.55 : 0.3;
    const crownH = H * (1 - trunkFrac) * scale;
    const firstLen = crownH * (profile.canopy_shape === "spreading" ? 0.42 : 0.38);
    const kids0 = bp === "wide_spreading" ? 5 : 4;
    const wScale = W / 4;

    const branch = (from: V3, dir: V3, len: number, r: number, depth: number, t: number) => {
      const to = add(from, mul(dir, len));
      m.wood.push({ a: from, b: to, r, t });
      if (profile.root_style === "aerial" && depth >= 1 && depth <= 2 && Math.hypot(to[0] - base[0], to[2] - base[2]) > 1.2 && rand() < (detail === "high" ? 0.65 : 0.35)) {
        const thickRoot = rand() < 0.3;
        m.wood.push({ a: to, b: [to[0], 0, to[2]], r: thickRoot ? r * 0.8 : 0.025, t: t + 0.25 });
      }
      if (depth >= maxD) {
        leafCluster(to, 0.55 * ls * (profile.canopy_shape === "spreading" ? 1.2 : 1), t);
        return;
      }
      if (depth >= maxD - 1 && profile.canopy_density !== "sparse") leafCluster(to, 0.45 * ls, t, Math.ceil(density / 3));
      const n = depth === 0 ? kids0 : rand() < 0.4 ? 3 : 2;
      const az0 = rand() * Math.PI * 2;
      for (let i = 0; i < n; i++) {
        const az = az0 + (i / n) * Math.PI * 2 + (rand() - 0.5) * 0.6;
        const side: V3 = [Math.cos(az), 0, Math.sin(az)];
        let d = norm(add(mul(dir, Math.cos(spread)), mul(side, Math.sin(spread) * 1.1)));
        d = norm([d[0] * wScale, d[1] + lift, d[2] * wScale]);
        branch(to, d, len * (0.7 + rand() * 0.1), r * 0.62, depth + 1, t + 0.12);
      }
    };
    branch(p, [0, 1, 0], firstLen, r0 * 0.75, 0, t0 + 0.18);
    if (profile.fruit) for (let i = 0; i < 10 * detailK; i++) {
      const L = m.leaves[Math.floor(rand() * m.leaves.length)];
      if (L) m.fruits.push({ p: [L.p[0], L.p[1] - 0.15, L.p[2]], r: 0.09, t: 0.95 });
    }
  }

  function conifer() {
    const r0 = 0.16 + H * 0.012;
    const steps = 6;
    for (let i = 0; i < steps; i++) {
      m.wood.push({ a: [0, (H * i) / steps, 0], b: [0, (H * (i + 1)) / steps, 0], r: r0 * (1 - i / steps) + 0.02, t: 0.1 + i * 0.05 });
    }
    const tiers = detail === "low" ? 6 : 11;
    for (let k = 0; k < tiers; k++) {
      const f = k / tiers;
      const y = H * (0.18 + f * 0.8);
      const len = (1 - f) * W * 0.55 + 0.25;
      const arms = detail === "low" ? 4 : 7;
      const az0 = rand() * 6.28;
      for (let a = 0; a < arms; a++) {
        const az = az0 + (a / arms) * 6.28;
        const end: V3 = [Math.cos(az) * len, y - len * 0.28, Math.sin(az) * len];
        const t = 0.3 + f * 0.5;
        m.wood.push({ a: [0, y, 0], b: end, r: 0.035 * (1 - f) + 0.012, t });
        const nN = Math.max(3, Math.round(density * 0.8));
        for (let j = 0; j < nN; j++) {
          const u = 0.25 + rand() * 0.8;
          const p: V3 = [end[0] * u, y + (end[1] - y) * u + (rand() - 0.3) * 0.25, end[2] * u];
          m.leaves.push({ p, s: ls * (0.8 + rand() * 0.6), rot: [rand() * 6.28, rand() * 6.28, rand() * 6.28], t: t + 0.12, c: rand() });
        }
      }
    }
    leafCluster([0, H, 0], 0.3, 0.9, density);
  }

  function palm() {
    const segs = 9;
    const bend = 0.9 * (profile.trunk_style === "curved" ? 1 : 0.2);
    const az = rand() * 6.28;
    let p: V3 = [0, 0, 0];
    for (let i = 0; i < segs; i++) {
      const f = (i + 1) / segs;
      const q: V3 = [Math.cos(az) * bend * f * f * 2, H * f, Math.sin(az) * bend * f * f * 2];
      m.wood.push({ a: p, b: q, r: 0.2 - f * 0.07, t: 0.08 + f * 0.35 });
      p = q;
    }
    const crown = p;
    const nF = detail === "low" ? 9 : 16;
    const fl = W * 0.6 + 1.2;
    for (let i = 0; i < nF; i++) {
      const a = (i / nF) * 6.28 + rand() * 0.3;
      const elev = 0.9 - rand() * 0.5;
      let fp = crown;
      const fsegs = 6;
      for (let s = 0; s < fsegs; s++) {
        const g = s / fsegs;
        const dy = Math.sin(elev - g * 2.1) * (fl / fsegs);
        const dh = Math.cos(elev - g * 2.1) * (fl / fsegs);
        const q: V3 = [fp[0] + Math.cos(a) * dh, fp[1] + dy, fp[2] + Math.sin(a) * dh];
        const t = 0.55 + g * 0.3;
        m.fronds.push({ a: fp, b: q, r: 0.03 * (1 - g) + 0.008, t });
        if (detail !== "low") for (const side of [-1, 1]) {
          const perp: V3 = [-Math.sin(a) * side, 0, Math.cos(a) * side];
          const lp = add(add(fp, mul(add(q, mul(fp, -1)), 0.5)), mul(perp, 0.32 * (1 - g * 0.6)));
          m.leaves.push({ p: lp, s: ls * 0.7 * (1 - g * 0.5), rot: [0.4 * side, -a + (side * Math.PI) / 2, -0.6], t: t + 0.1, c: rand() });
        }
        fp = q;
      }
    }
    if (profile.fruit) for (let i = 0; i < 6; i++) {
      const a = (i / 6) * 6.28;
      m.fruits.push({ p: [crown[0] + Math.cos(a) * 0.28, crown[1] - 0.3 - rand() * 0.15, crown[2] + Math.sin(a) * 0.28], r: 0.17, t: 0.95 });
    }
  }

  function mangrove() {
    const stems = detail === "low" ? 2 : 4;
    const lift = 0.7;
    for (let s = 0; s < stems; s++) {
      const a = (s / stems) * 6.28 + rand();
      const off: V3 = [Math.cos(a) * 0.6 * (s ? 1 : 0.2), lift, Math.sin(a) * 0.6 * (s ? 1 : 0.2)];
      // prop roots arching from stem base down to mud
      const nRoots = detail === "low" ? 3 : 7;
      for (let r = 0; r < nRoots; r++) {
        const ra = (r / nRoots) * 6.28 + rand() * 0.5;
        const reach = 0.8 + rand() * 0.9;
        const mid: V3 = [off[0] + Math.cos(ra) * reach * 0.5, lift + 0.25, off[2] + Math.sin(ra) * reach * 0.5];
        const end: V3 = [off[0] + Math.cos(ra) * reach, -0.05, off[2] + Math.sin(ra) * reach];
        m.wood.push({ a: off, b: mid, r: 0.035, t: 0.02 });
        m.wood.push({ a: mid, b: end, r: 0.03, t: 0.08 });
      }
      const sub = { ...profile, branching_pattern: "open" as const };
      void sub;
      const save = profile.height_ratio;
      void save;
      broadleafStem(off, 0.75 + rand() * 0.25);
    }
  }

  function broadleafStem(base: V3, scale: number) {
    const top: V3 = [base[0] * 1.6, base[1] + H * 0.38 * scale, base[2] * 1.6];
    m.wood.push({ a: base, b: top, r: 0.08, t: 0.15 });
    const kids = 3;
    for (let i = 0; i < kids; i++) {
      const az = (i / kids) * 6.28 + rand();
      const d = norm([Math.cos(az), 0.7, Math.sin(az)]);
      const e = add(top, mul(d, H * 0.25 * scale));
      m.wood.push({ a: top, b: e, r: 0.045, t: 0.35 });
      for (let j = 0; j < 2; j++) {
        const az2 = az + (j - 0.5) * 1.2;
        const d2 = norm([Math.cos(az2), 0.5, Math.sin(az2)]);
        const e2 = add(e, mul(d2, H * 0.16 * scale));
        m.wood.push({ a: e, b: e2, r: 0.025, t: 0.5 });
        leafCluster(e2, 0.55 * ls, 0.55);
      }
    }
  }

  function buttress() {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * 6.28;
      m.wood.push({ a: [0, 0.8, 0], b: [Math.cos(a) * 0.7, 0, Math.sin(a) * 0.7], r: 0.07, t: 0.05 });
    }
  }
}

function clamp(v: number, a: number, b: number) {
  return Number.isFinite(v) ? Math.min(b, Math.max(a, v)) : (a + b) / 2;
}

export const LEAF_PALETTES: Record<string, string[]> = {
  seasonal_green: ["#4f6b3a", "#5d7a43", "#3f5a30", "#6c8a4c"],
  autumn_red: ["#a3402a", "#c2632f", "#8a2f22", "#b8892f"],
  tropical_green: ["#4d7a36", "#6a9440", "#3b6a2c", "#7ea24a"],
  deep_green: ["#2f4d2c", "#3b5c33", "#264126", "#46683a"],
  olive: ["#5f6b3a", "#6f7a45", "#4d5a32", "#7d8650"],
  neutral: ["#6f7569", "#80867a", "#5e6459"],
};
export const WOOD_COLOR: Record<string, string> = {
  palm: "#8a7a62",
  conifer: "#5a4334",
  mangrove: "#6b5644",
  broadleaf_tree: "#5e4a39",
  shrub: "#5e4a39",
};

/** Plain-language description used for canvas text fallbacks. */
export function describeProfile(name: string, p: VisualProfile) {
  const h = (s: string) => s.replace(/_/g, " ");
  return `Interactive procedural visualization of ${name}, showing a ${h(p.canopy_density)} ${h(p.canopy_shape)} canopy, ${h(p.branching_pattern)} branching, ${h(p.leaf_style)} foliage and ${h(p.root_style)} roots.`;
}
