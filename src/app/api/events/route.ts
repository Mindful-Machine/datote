import { NextResponse } from "next/server";
import { EVENTS } from "@/lib/store";

export async function POST(req: Request) {
  const body = await req.json();

  const id = Math.random().toString(36).substring(2, 8);

  EVENTS[id] = {
    title: body.title,
    date: body.date,
    timezone: body.timezone ?? "UTC",
    durationMin: body.durationMin ?? 60,
    location: body.location || undefined,
    onlineLink: body.onlineLink || undefined,
  };

  return NextResponse.json({ id, link: `/e/${id}` });
}
