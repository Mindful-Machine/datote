import { getEvent } from "@/lib/store";

function toICalLocal(dateStr: string): string {
  const [datePart, timePart] = dateStr.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${year}${p(month)}${p(day)}T${p(hour)}${p(minute)}00`;
}

function addMinutes(dateStr: string, minutes: number): string {
  const [datePart, timePart] = dateStr.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const total = hour * 60 + minute + minutes;
  const endHour = Math.floor(total / 60) % 24;
  const endMinute = total % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${year}${p(month)}${p(day)}T${p(endHour)}${p(endMinute)}00`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    return new Response("Event not found", { status: 404 });
  }

  const start = toICalLocal(event.date);
  const end = addMinutes(event.date, event.durationMin);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pindate//Pindate//EN",
    "BEGIN:VEVENT",
    `UID:${id}@pindate.app`,
    `SUMMARY:${event.title}`,
    `DTSTART;TZID=${event.timezone}:${start}`,
    `DTEND;TZID=${event.timezone}:${end}`,
  ];
  if (event.location) lines.push(`LOCATION:${event.location}`);
  if (event.onlineLink) lines.push(`URL:${event.onlineLink}`);
  lines.push("END:VEVENT", "END:VCALENDAR");

  return new Response(lines.join("\r\n"), {
    headers: { "Content-Type": "text/calendar; charset=utf-8" },
  });
}
