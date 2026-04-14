import { getEvent } from "@/lib/store";
import { CalendarButtons } from "./CalendarButtons";

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
  const event = await getEvent(id);

  if (!event) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <p style={{ fontSize: 48, margin: "0 0 16px" }}>🕳️</p>
        <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>Event not found</h1>
        <p style={{ margin: 0, color: "#71717A", fontSize: 14 }}>This link may have expired or never existed.</p>
        <a href="/" style={{ marginTop: 24, fontSize: 14, color: "#A855F7", textDecoration: "none" }}>← Back to Pindate</a>
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
          {event.onlineLink && (
            <Meta
              icon="🔗"
              text={
                <a href={event.onlineLink} target="_blank" rel="noopener noreferrer" style={{ color: "#A855F7", textDecoration: "none" }}>
                  Watch / join online
                </a>
              }
            />
          )}
        </div>
      </div>

      <CalendarButtons
        icalHref={`/api/events/${id}/ical`}
        googleHref={googleCalendarUrl(event)}
      />

      <p style={{ marginTop: 40, textAlign: "center", fontSize: 12, color: "#3F3F46" }}>
        Shared via <a href="/" style={{ color: "#71717A", textDecoration: "none" }}>Pindate</a>
        {" · "}by Mindful Machine
      </p>
    </main>
  );
}

function Meta({ icon, text }: { icon: string; text: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#A1A1AA" }}>
      <span style={{ fontSize: 16, lineHeight: "20px", flexShrink: 0 }}>{icon}</span>
      <span style={{ lineHeight: "20px" }}>{text}</span>
    </div>
  );
}
