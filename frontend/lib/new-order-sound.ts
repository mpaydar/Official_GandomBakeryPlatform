let sharedContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedContext) {
    sharedContext = new AudioContext();
  }
  return sharedContext;
}

/** Browsers block audio until a user gesture — call once from any admin click. */
export function unlockNewOrderSound(): void {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
}

function tone(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  volume = 0.12
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

/** Short two-tone chime for a new bakery order. */
export function playNewOrderChime(): void {
  try {
    const ctx = getContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      void ctx.resume().then(() => playNewOrderChime());
      return;
    }
    const t = ctx.currentTime;
    tone(ctx, 880, t, 0.18);
    tone(ctx, 1174.66, t + 0.14, 0.22, 0.1);
    tone(ctx, 1318.51, t + 0.28, 0.28, 0.08);
  } catch {
    // Audio not available
  }
}
