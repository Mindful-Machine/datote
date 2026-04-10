"use client";

import { useMemo, useRef, useState } from "react";

const TIMEZONES = [
  "Europe/Paris",
  "UTC",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Tokyo",
];

function makeTimeOptions(stepMinutes = 15) {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return out;
}
const TIME_OPTIONS = makeTimeOptions(15);

const DURATIONS = [
  { label: "30 min", minutes: 30 },
  { label: "1 hour", minutes: 60 },
  { label: "1h 30", minutes: 90 },
  { label: "2 hours", minutes: 120 },
  { label: "3 hours", minutes: 180 },
  { label: "4 hours", minutes: 240 },
];

export default function NewEventPage() {
  const [title, setTitle] = useState("");
  const [dateISO, setDateISO] = useState("");
  const [time, setTime] = useState("19:30");
  const [timezone, setTimezone] = useState("Europe/Paris");
  const [durationMin, setDurationMin] = useState(120);
  const [location, setLocation] = useState("");
  const [onlineLink, setOnlineLink] = useState("");

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id: string; link: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => title.trim().length >= 2 && !!dateISO && !!time && !!timezone,
    [title, dateISO, time, timezone]
  );

  function onLocationChange(val: string) {
    setLocation(val);
    setShowSuggestions(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 3) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=5`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        const names: string[] = data.map((p: { display_name: string }) => p.display_name);
        setSuggestions(names);
        setShowSuggestions(names.length > 0);
      } catch { /* ignore */ }
    }, 500);
  }

  function pickSuggestion(name: string) {
    setLocation(name);
    setSuggestions([]);
    setShowSuggestions(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!canSubmit) return;
    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          date: `${dateISO}T${time}:00`,
          timezone,
          durationMin,
          location: location.trim() || undefined,
          onlineLink: onlineLink.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
      setResult(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const fullLink = result ? `${window.location.origin}${result.link}` : "";

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "40px 20px 80px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <a
          href="/"
          style={{ fontSize: 13, color: "#71717A", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 24 }}
        >
          ← Datote
        </a>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em" }}>
          New event
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "#71717A" }}>
          Generate a shareable link for your audience.
        </p>
      </div>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 20 }}>
        {/* Title */}
        <Field label="Event name">
          <input
            className="d-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Live Q&A, Album drop, Fan meetup…"
          />
        </Field>

        {/* Date + Time */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Date">
            <input
              className="d-input"
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
            />
          </Field>
          <Field label="Time">
            <select className="d-input" value={time} onChange={(e) => setTime(e.target.value)}>
              {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
        </div>

        {/* Duration + Timezone */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Duration">
            <select className="d-input" value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))}>
              {DURATIONS.map((d) => <option key={d.minutes} value={d.minutes}>{d.label}</option>)}
            </select>
          </Field>
          <Field label="Timezone">
            <select className="d-input" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </Field>
        </div>

        {/* Location with autocomplete */}
        <Field label="Location" optional>
          <div style={{ position: "relative" }}>
            <input
              className="d-input"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Paris, Madison Square Garden…"
            />
            {showSuggestions && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                background: "#111113", border: "1px solid #27272A", borderRadius: 10, zIndex: 10, overflow: "hidden",
              }}>
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="d-suggestion"
                    onMouseDown={() => pickSuggestion(s)}
                    style={{
                      padding: "10px 14px", fontSize: 13, cursor: "pointer", color: "#FAFAFA",
                      borderBottom: i < suggestions.length - 1 ? "1px solid #27272A" : "none",
                    }}
                  >
                    {s}
                  </div>
                ))}
                <div style={{ padding: "6px 14px", fontSize: 10, color: "#52525B" }}>
                  © OpenStreetMap contributors
                </div>
              </div>
            )}
          </div>
        </Field>

        {/* Online link */}
        <Field label="Online link" optional>
          <input
            className="d-input"
            type="url"
            value={onlineLink}
            onChange={(e) => setOnlineLink(e.target.value)}
            placeholder="YouTube Live, TikTok, Zoom, Twitch…"
          />
        </Field>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #27272A", margin: "0 0 4px" }} />

        {/* Submit */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span style={{ fontSize: 12, color: "#52525B" }}>
            {dateISO && time ? `${dateISO} · ${time} · ${timezone}` : ""}
          </span>
          <button
            type="submit"
            disabled={!canSubmit || loading}
            style={{
              padding: "12px 22px",
              borderRadius: 10,
              border: "none",
              background: !canSubmit || loading ? "#27272A" : "#A855F7",
              color: !canSubmit || loading ? "#52525B" : "#fff",
              fontWeight: 600,
              fontSize: 14,
              cursor: !canSubmit || loading ? "not-allowed" : "pointer",
              letterSpacing: "-0.01em",
              transition: "background 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {loading ? "Creating…" : "Create link →"}
          </button>
        </div>
      </form>

      {error && (
        <p style={{ marginTop: 16, padding: "12px 14px", borderRadius: 10, background: "#1C0A0A", border: "1px solid #7F1D1D", color: "#FCA5A5", fontSize: 14 }}>
          {error}
        </p>
      )}

      {result && (
        <div style={{
          marginTop: 24, padding: 20, borderRadius: 14,
          background: "#052E16", border: "1px solid #14532D",
        }}>
          <p style={{ margin: "0 0 6px", fontSize: 12, color: "#86EFAC", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Link ready
          </p>
          <p style={{ margin: "0 0 16px", fontSize: 14, wordBreak: "break-all", color: "#FAFAFA", fontWeight: 500 }}>
            {fullLink}
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <a
              href={result.link}
              style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "1px solid #166534", background: "transparent", color: "#86EFAC", textDecoration: "none", textAlign: "center", fontSize: 13, fontWeight: 600 }}
            >
              Open
            </a>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(fullLink)}
              style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "1px solid #166534", background: "#166534", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
            >
              Copy link
            </button>
          </div>
        </div>
      )}

      <footer style={{ marginTop: 48, fontSize: 12, color: "#3F3F46", textAlign: "center" }}>
        by Mindful Machine
      </footer>
    </main>
  );
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 7 }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: "#A1A1AA" }}>
        {label}{optional && <span style={{ marginLeft: 6, fontSize: 11, color: "#52525B" }}>optional</span>}
      </span>
      {children}
    </label>
  );
}
