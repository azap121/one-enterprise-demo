// apps/docs/app/prototypes/enhanced-index-v2/state/track.ts
export function track(event: string, payload?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  // eslint-disable-next-line no-console
  console.log(`[telemetry] ${event}`, payload ?? {});
}
