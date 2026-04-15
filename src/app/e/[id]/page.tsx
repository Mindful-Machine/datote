import { headers } from "next/headers";
import { getEvent } from "@/lib/store";
import { translations } from "@/lib/i18n";
import { CalendarButtons } from "./CalendarButtons";

async function serverLang(): Promise<"en" | "fr"> {
  const h = await headers();
  const al = h.get("accept-language") ?? "";
  return al.toLowerCase().startsWith("fr") ? "fr" : "en";
}

function parseLocalParts(dateStr: string) {
  const [datePart, timePart] = dateStr.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  return { year, month, day, hour, minute };
}

function toICalLocal(dateStr: string): string {
  const { year, month, day, hour, minute } = parseLocalParts(dateStr);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${year}${p(month)}${p(day)}T${p(hour)}${p(minute)}00`;
}

function addMinutes(dateStr: string, minutes: number): string {
  const { year, month, day, hour, minute } = parseLocalParts(dateStr);
  const total = hour * 60 + minute + minutes;
  const endHour = Math.floor(total / 60) % 24;
  const endMinute = total % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${year}${p(month)}${p(day)}T${p(endHour)}${p(endMinute)}00`;
}

function formatDisplay(dateStr: string, timezone: string): string {
  const { year, month, day, hour, minute } = parseLocalParts(dateStr);
  const p = (n: number) => String(n).padStart(2, "0");
  const monthName = new Date(year, month - 1, day).toLocaleString("en-US", { month: "long" });
  return `${monthName} ${day}, ${year} · ${p(hour)}:${p(minute)} · ${timezone}`;
}

function googleCalendarUrl(event: {
  title: string;
  date: string;
  timezone: string;
  durationMin: number;
  location?: string;
}) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toICalLocal(event.date)}/${addMinutes(event.date, event.durationMin)}`,
    ctz: event.timezone,
  });
  if (event.location) params.set("location", event.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default async function EventPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [event, lang] = await Promise.all([getEvent(id), serverLang()]);
  const s = translations[lang];

  if (!event) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <p style={{ fontSize: 48, margin: "0 0 16px" }}>🕳️</p>
        <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>{s.eventNotFound}</h1>
        <p style={{ margin: 0, color: "#71717A", fontSize: 14 }}>{s.eventNotFoundDesc}</p>
        <a href="/" style={{ marginTop: 24, fontSize: 14, color: "#A855F7", textDecoration: "none" }}>{s.backToHome}</a>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "60px 24px 80px" }}>
      <div style={{
        padding: "28px 24px",
        borderRadius: 18,
        border: "1px solid #27272A",
        background: "#111113",
        marginBottom: 24,
      }}>
        <h1 style={{ margin: "0 0 16px", fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
          {event.title}
        </h1>

        <div style={{ display: "grid", gap: 10 }}>
          <Meta icon="📅" text={formatDisplay(event.date, event.timezone)} />
          {event.location && <Meta icon="📍" text={event.location} />}
          {/* Links — handle both new `links[]` and legacy `onlineLink` */}
          {(event.links ?? (event.onlineLink ? [event.onlineLink] : [])).map((url, i) => (
            <Meta
              key={i}
              icon={linkIcon(url)}
              text={
                <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "#A855F7", textDecoration: "none" }}>
                  {linkLabel(url)}
                </a>
              }
            />
          ))}
        </div>
      </div>

      <CalendarButtons
        icalHref={`/api/events/${id}/ical`}
        googleHref={googleCalendarUrl(event)}
      />

      <footer style={{ marginTop: 40, textAlign: "center", fontSize: 12, color: "#3F3F46" }}>
        {s.by}
      </footer>
    </main>
  );
}

const LINK_MAP: Record<string, { label: string; icon: string }> = {
  "youtube.com":     { label: "Watch on YouTube",       icon: "▶️" },
  "youtu.be":        { label: "Watch on YouTube",       icon: "▶️" },
  "twitch.tv":       { label: "Watch on Twitch",        icon: "▶️" },
  "tiktok.com":      { label: "Watch on TikTok",        icon: "▶️" },
  "zoom.us":         { label: "Join on Zoom",           icon: "📹" },
  "meet.google.com": { label: "Join on Google Meet",    icon: "📹" },
  "instagram.com":   { label: "Follow on Instagram",    icon: "📱" },
  "twitter.com":     { label: "Follow on X",            icon: "📱" },
  "x.com":           { label: "Follow on X",            icon: "📱" },
  "eventbrite.com":  { label: "Get Tickets",            icon: "🎟️" },
  "eventbrite.fr":   { label: "Get Tickets",            icon: "🎟️" },
  "patreon.com":     { label: "Support on Patreon",     icon: "💜" },
  "ko-fi.com":       { label: "Support on Ko-fi",       icon: "💜" },
  "paypal.com":      { label: "Donate via PayPal",      icon: "💜" },
  "linktr.ee":       { label: "Linktree",               icon: "🔗" },
};

function resolveLinkMeta(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return LINK_MAP[host] ?? { label: host, icon: "🔗" };
  } catch {
    return { label: "Visit link", icon: "🔗" };
  }
}
function linkLabel(url: string) { return resolveLinkMeta(url).label; }
function linkIcon(url: string)  { return resolveLinkMeta(url).icon; }

function Meta({ icon, text }: { icon: string; text: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#A1A1AA" }}>
      <span style={{ fontSize: 16, lineHeight: "20px", flexShrink: 0 }}>{icon}</span>
      <span style={{ lineHeight: "20px" }}>{text}</span>
    </div>
  );
}
