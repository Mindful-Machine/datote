import { redis } from "./redis";

export type EventData = {
  title: string;
  date: string;         // "2026-03-10T19:30:00" — local time in the given timezone
  timezone: string;     // e.g. "Europe/Paris"
  durationMin: number;  // e.g. 120
  location?: string;    // physical address (optional)
  onlineLink?: string;  // YouTube Live, TikTok, Zoom, etc. (optional)
};

export async function getEvent(id: string): Promise<EventData | null> {
  return redis.get<EventData>(`event:${id}`);
}

export async function saveEvent(id: string, data: EventData): Promise<void> {
  // Keep events for 1 year (in seconds)
  await redis.set(`event:${id}`, data, { ex: 60 * 60 * 24 * 365 });
}
