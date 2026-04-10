export type EventData = {
  title: string;
  date: string;         // "2026-03-10T19:30:00" — local time in the given timezone
  timezone: string;     // e.g. "Europe/Paris"
  durationMin: number;  // e.g. 120
  location?: string;    // physical address (optional)
  onlineLink?: string;  // YouTube Live, TikTok, Zoom, etc. (optional)
};

// Make a truly shared store during dev (global variable)
const g = globalThis as unknown as { __DATOTE_EVENTS__?: Record<string, EventData> };

export const EVENTS: Record<string, EventData> = g.__DATOTE_EVENTS__ ?? (g.__DATOTE_EVENTS__ = {});
