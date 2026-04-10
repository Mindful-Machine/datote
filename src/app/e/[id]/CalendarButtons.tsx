"use client";

import { useState } from "react";

const btnBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  width: "100%",
  padding: "14px 20px",
  borderRadius: 12,
  border: "1px solid #27272A",
  background: "#111113",
  color: "#FAFAFA",
  textDecoration: "none",
  fontSize: 15,
  fontWeight: 500,
  cursor: "pointer",
  letterSpacing: "-0.01em",
  transition: "border-color 0.15s, background 0.15s",
};

export function CalendarButtons({
  icalHref,
  googleHref,
}: {
  icalHref: string;
  googleHref: string;
}) {
  const [showHint, setShowHint] = useState(false);

  function handleIcalClick() {
    const ua = navigator.userAgent;
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    if (!isSafari) setShowHint(true);
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div>
        <a href={icalHref} onClick={handleIcalClick} style={btnBase}>
          <span style={{ fontSize: 18 }}>🍎</span>
          Add to Apple / Outlook Calendar
        </a>
        {showHint && (
          <p style={{ margin: "8px 0 0", fontSize: 12, textAlign: "center", color: "#71717A" }}>
            File downloaded — double-click it to add to your calendar.
          </p>
        )}
      </div>

      <a
        href={googleHref}
        target="_blank"
        rel="noopener noreferrer"
        style={btnBase}
      >
        <span style={{ fontSize: 18 }}>📅</span>
        Add to Google Calendar
      </a>
    </div>
  );
}
