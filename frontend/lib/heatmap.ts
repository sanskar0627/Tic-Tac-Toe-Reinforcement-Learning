export function qToHeat(q: number, min: number, max: number): {
  fill: string;
  ink: string;
} {
  if (!Number.isFinite(q) || max <= min) {
    return { fill: "#FFF4D6", ink: "#111111" };
  }
  const t = Math.min(1, Math.max(0, (q - min) / (max - min)));
  if (t < 0.5) {
    const u = t / 0.5;
    return {
      fill: mix("#FF4B6E", "#FFE500", u),
      ink: "#111111",
    };
  }
  const u = (t - 0.5) / 0.5;
  return {
    fill: mix("#FFE500", "#8CFF2E", u),
    ink: "#111111",
  };
}

function mix(a: string, b: string, t: number): string {
  const pa = hex(a);
  const pb = hex(b);
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * t);
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * t);
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

function hex(color: string): [number, number, number] {
  const raw = color.replace("#", "");
  return [
    parseInt(raw.slice(0, 2), 16),
    parseInt(raw.slice(2, 4), 16),
    parseInt(raw.slice(4, 6), 16),
  ];
}
