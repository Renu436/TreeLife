import { useEffect, useState } from "react";

export function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setR(m.matches);
    const f = () => setR(m.matches);
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);
  return r;
}

let gl: boolean | null = null;
export function webglAvailable() {
  if (gl !== null) return gl;
  try {
    const c = document.createElement("canvas");
    gl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    gl = false;
  }
  return gl;
}

export function formatDate(iso?: string) {
  if (!iso) return "Not established";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "Not established" : d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export function hostOf(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}
