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
  const end = new Date(year, month - 1, day, hour, minute);
  end.setMinutes(end.getMinutes() + minutes);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${end.getFullYear()}${p(end.getMonth() + 1)}${p(end.getDate())}T${p(end.getHours())}${p(end.getMinutes())}00`;
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

  const now = new Date();
  const p2 = (n: number) => String(n).padStart(2, "0");
  const dtstamp = `${now.getUTCFullYear()}${p2(now.getUTCMonth() + 1)}${p2(now.getUTCDate())}T${p2(now.getUTCHours())}${p2(now.getUTCMinutes())}${p2(now.getUTCSeconds())}Z`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pindate//Pindate//EN",
    "BEGIN:VEVENT",
    `UID:${id}@pindate.app`,
    `DTSTAMP:${dtstamp}`,
    `SUMMARY:${event.title}`,
    `DTSTART;TZID=${event.timezone}:${start}`,
    `DTEND;TZID=${event.timezone}:${end}`,
  ];
  if (event.location) lines.push(`LOCATION:${event.location}`);
  const links = event.links ?? (event.onlineLink ? [event.onlineLink] : []);
  if (links.length > 0) lines.push(`URL:${links[0]}`);
  lines.push("END:VEVENT", "END:VCALENDAR");

  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="event.ics"',
    },
  });
}
