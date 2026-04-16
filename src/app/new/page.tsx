"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLang, LANG_LABELS } from "@/lib/useLang";

const TIMEZONES = [
  "Europe/Paris",
  "UTC",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Tokyo",
];


function getDefaultDateTime() {
  const now = new Date();
  now.setTime(now.getTime() + 60 * 60 * 1000);
  const ms = 15 * 60 * 1000;
  const rounded = new Date(Math.round(now.getTime() / ms) * ms);
  const year = rounded.getFullYear();
  const month = String(rounded.getMonth() + 1).padStart(2, "0");
  const day = String(rounded.getDate()).padStart(2, "0");
  const hours = String(rounded.getHours()).padStart(2, "0");
  const mins = String(rounded.getMinutes()).padStart(2, "0");
  return { dateISO: `${year}-${month}-${day}`, time: `${hours}:${mins}` };
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);  // 0–23
const MIN_OPTIONS  = Array.from({ length: 60 }, (_, i) => i);  // 0–59

// ─── Click-to-open duration picker ───────────────────────────────────────────
function DurationList({ options, value, onChange }: {
  options: number[];
  value: number;
  onChange: (v: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const idx = options.indexOf(value);
    if (idx >= 0) ref.current.scrollTop = Math.max(0, (idx - 2) * 36);
  }, [options, value]);

  return (
    <div ref={ref} className="wheel-scroll" style={{ maxHeight: 180, overflowY: "auto" }}>
      {options.map((opt) => (
        <div
          key={opt}
          onMouseDown={(e) => { e.preventDefault(); onChange(opt); }}
          style={{
            padding: "9px 20px", fontSize: 14, cursor: "pointer", textAlign: "center",
            fontWeight: opt === value ? 600 : 400,
            color: opt === value ? "#A855F7" : "#FAFAFA",
            background: opt === value ? "rgba(168,85,247,0.08)" : "transparent",
          }}
        >{String(opt).padStart(2, "0")}</div>
      ))}
    </div>
  );
}

function DurationPicker({ value, onChange }: { value: number; onChange: (min: number) => void }) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  const [open, setOpen] = useState<"h" | "m" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(null);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div className="d-input" style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 12px", userSelect: "none" }}>
        <span
          onClick={() => setOpen(open === "h" ? null : "h")}
          style={{ cursor: "pointer", fontWeight: 600, fontSize: 14, minWidth: 22, textAlign: "center", color: open === "h" ? "#A855F7" : "#FAFAFA" }}
        >{String(hours).padStart(2, "0")}</span>
        <span style={{ color: "#52525B", fontSize: 13 }}>h</span>
        <span
          onClick={() => setOpen(open === "m" ? null : "m")}
          style={{ cursor: "pointer", fontWeight: 600, fontSize: 14, minWidth: 22, textAlign: "center", color: open === "m" ? "#A855F7" : "#FAFAFA" }}
        >{String(minutes).padStart(2, "0")}</span>
        <span style={{ color: "#52525B", fontSize: 13 }}>m</span>
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)",
          left: open === "h" ? 0 : "auto", right: open === "m" ? 0 : "auto",
          zIndex: 20, background: "#111113", border: "1px solid #27272A", borderRadius: 10,
          overflow: "hidden", minWidth: 72,
        }}>
          <DurationList
            options={open === "h" ? HOUR_OPTIONS : MIN_OPTIONS}
            value={open === "h" ? hours : minutes}
            onChange={(v) => {
              onChange(open === "h" ? v * 60 + minutes : hours * 60 + v);
              setOpen(null);
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function NewEventPage() {
  const { t, lang, setLang } = useLang();
  const [title, setTitle]       = useState("");
  const [dateISO, setDateISO]   = useState("");
  const [time, setTime]         = useState("");
  const [timezone, setTimezone] = useState("Europe/Paris");
  const [durationMin, setDurationMin] = useState(120);
  const [location, setLocation] = useState("");
  const [links, setLinks]       = useState<string[]>([]);

  const [suggestions, setSuggestions]       = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<{ id: string; link: string } | null>(null);
  const [error, setError]     = useState<string | null>(null);

  const hasLocationOrLink = useMemo(
    () => location.trim().length > 0 || links.some((l) => l.trim().length > 0),
    [location, links]
  );
  const canSubmit = useMemo(
    () => title.trim().length >= 2 && !!dateISO && !!time && !!timezone && hasLocationOrLink,
    [title, dateISO, time, timezone, hasLocationOrLink]
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

  function addLink() {
    if (links.length < 10) setLinks((prev) => [...prev, ""]);
  }
  function updateLink(i: number, val: string) {
    setLinks((prev) => prev.map((l, idx) => (idx === i ? val : l)));
  }
  function removeLink(i: number) {
    setLinks((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!canSubmit) return;
    setLoading(true);
    const cleanLinks = links.map((l) => l.trim()).filter(Boolean);
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
          links: cleanLinks.length > 0 ? cleanLinks : undefined,
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
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "48px 20px 80px" }}>

      {/* Language toggle */}
      <div style={{ position: "absolute", top: 20, right: 20, display: "flex", gap: 4 }}>
        {(["en", "fr"] as const).map((l) => (
          <button key={l} onClick={() => setLang(l)} style={{
            padding: "5px 10px", borderRadius: 6, border: "1px solid",
            borderColor: lang === l ? "#A855F7" : "#27272A",
            background: lang === l ? "rgba(168,85,247,0.1)" : "transparent",
            color: lang === l ? "#A855F7" : "#52525B",
            fontSize: 12, fontWeight: 500, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span style={{ fontSize: 14 }}>{LANG_LABELS[l].flag}</span>
            {LANG_LABELS[l].name}
          </button>
        ))}
      </div>

      {/* Form header */}
      <div style={{
        borderTop: "2px solid transparent",
        borderImage: "linear-gradient(90deg, #A855F7, #7C3AED) 1",
        paddingTop: 28, marginBottom: 8, marginTop: 48,
      }}>
        <h1 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em" }}>{t("newEvent")}</h1>
      </div>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 20 }}>

        {/* Title */}
        <Field label={t("eventName")} emoji="🎉">
          <input
            className="d-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("eventNamePlaceholder")}
          />
        </Field>

        {/* Date + Time */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label={t("date")} emoji="📅">
            <input className="d-input" type="date" value={dateISO} onChange={(e) => setDateISO(e.target.value)} />
          </Field>
          <Field label={t("time")} emoji="🕐">
            <input className="d-input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
        </div>

        {/* Duration + Timezone — same row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label={t("duration")} emoji="⏱️">
            <DurationPicker value={durationMin} onChange={setDurationMin} />
          </Field>
          <Field label={t("timezone")} emoji="🌍">
            <select className="d-input" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </Field>
        </div>

        {/* Location */}
        <Field label={t("location")} emoji="📍" optional>
          <div style={{ position: "relative" }}>
            <input
              className="d-input"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder={t("locationPlaceholder")}
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
                  >{s}</div>
                ))}
                <div style={{ padding: "6px 14px", fontSize: 10, color: "#52525B" }}>
                  © OpenStreetMap contributors
                </div>
              </div>
            )}
          </div>
        </Field>

        {/* Links */}
        <Field label={t("links")} emoji="🔗" optional>
          <div style={{ display: "grid", gap: 8 }}>
            {links.map((link, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  className="d-input"
                  type="url"
                  value={link}
                  onChange={(e) => updateLink(i, e.target.value)}
                  placeholder="https://…"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => removeLink(i)}
                  style={{
                    width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                    border: "1px solid #27272A", background: "transparent",
                    color: "#52525B", cursor: "pointer", fontSize: 16,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >×</button>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {links.length < 10 ? (
                <button
                  type="button"
                  onClick={addLink}
                  style={{
                    background: "none", border: "1px dashed #3F3F46",
                    borderRadius: 8, color: "#A855F7", fontSize: 13,
                    cursor: "pointer", padding: "7px 14px", fontWeight: 500,
                    width: "100%", textAlign: "center",
                  }}
                >+ Add Link</button>
              ) : (
                <span style={{ fontSize: 11, color: "#52525B" }}>Maximum of 10 links reached</span>
              )}
              {links.length > 0 && links.length < 10 && (
                <span style={{ fontSize: 11, color: "#3F3F46", marginLeft: 10, whiteSpace: "nowrap" }}>
                  {links.length} / 10
                </span>
              )}
            </div>
          </div>
        </Field>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #27272A", margin: "0 0 4px" }} />

        {/* Hint: location or link required */}
        {title.trim().length >= 2 && !!dateISO && !hasLocationOrLink && (
          <p style={{ margin: 0, fontSize: 12, color: "#71717A", textAlign: "center" }}>
            {t("needLocationOrLink")}
          </p>
        )}

        {/* Submit */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span style={{ fontSize: 12, color: "#3F3F46", fontStyle: "italic" }}>{t("saveTheDate")}</span>
          <button
            type="submit"
            disabled={!canSubmit || loading}
            style={{
              padding: "12px 22px", borderRadius: 10, border: "none",
              background: !canSubmit || loading ? "#27272A" : "#A855F7",
              color: !canSubmit || loading ? "#52525B" : "#fff",
              fontWeight: 600, fontSize: 14,
              cursor: !canSubmit || loading ? "not-allowed" : "pointer",
              letterSpacing: "-0.01em", transition: "background 0.15s", whiteSpace: "nowrap",
            }}
          >{loading ? t("creating") : t("createLink")}</button>
        </div>
      </form>

      {error && (
        <p style={{ marginTop: 16, padding: "12px 14px", borderRadius: 10, background: "#1C0A0A", border: "1px solid #7F1D1D", color: "#FCA5A5", fontSize: 14 }}>
          {error}
        </p>
      )}

      {result && (
        <div style={{ marginTop: 24, padding: 20, borderRadius: 14, background: "#052E16", border: "1px solid #14532D" }}>
          <p style={{ margin: "0 0 6px", fontSize: 12, color: "#86EFAC", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {t("linkReady")}
          </p>
          <p style={{ margin: "0 0 16px", fontSize: 14, wordBreak: "break-all", color: "#FAFAFA", fontWeight: 500 }}>
            {fullLink}
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <a
              href={`${result.link}?edit=1`}
              style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "1px solid #166534", background: "transparent", color: "#86EFAC", textDecoration: "none", textAlign: "center", fontSize: 13, fontWeight: 600 }}
            >{t("open")}</a>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(fullLink)}
              style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "1px solid #166534", background: "#166534", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
            >{t("copyLink")}</button>
          </div>
        </div>
      )}

      <footer style={{ marginTop: 48, fontSize: 12, color: "#3F3F46", textAlign: "center" }}>
        {t("by")}
      </footer>
    </main>
  );
}

function Field({
  label, emoji, optional, children,
}: {
  label: string;
  emoji?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: 7 }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: "#A1A1AA", display: "flex", alignItems: "center", gap: 6 }}>
        {emoji && <span style={{ fontSize: 15 }}>{emoji}</span>}
        {label}
        {optional && <span style={{ marginLeft: 2, fontSize: 11, color: "#52525B" }}>optional</span>}
      </span>
      {children}
    </label>
  );
}
