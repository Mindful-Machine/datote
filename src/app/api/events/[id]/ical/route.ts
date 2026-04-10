import { NextResponse } from "next/server";
import { EVENTS } from "@/lib/store";

// "2026-03-10T19:30:00" → "20260310T193000"
function toICalLocal(dateStr: string): string {
  const [datePart, timePart] = dateStr.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${year}${p(month)}${p(day)}T${p(hour)}${p(minute)}00`;
}

// Add minutes to a local datetime string, return iCal local format.
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
  const event = EVENTS[id];

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const start = toICalLocal(event.date);
  const end = addMinutes(event.date, event.durationMin);

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Datote//Datote//EN",
    "BEGIN:VEVENT",
    `UID:${id}@datote.app`,
    `SUMMARY:${event.title}`,
    `DTSTART;TZID=${event.timezone}:${start}`,
    `DTEND;TZID=${event.timezone}:${end}`,
    `LOCATION:${event.location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
    },
  });
}
