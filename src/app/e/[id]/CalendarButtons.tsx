"use client";

import { useState } from "react";

// Matches the real Google Calendar icon: white base, blue header, 4 colored quadrants, date number
function GoogleCalIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      {/* White base */}
      <rect x="6" y="6" width="36" height="36" rx="4" fill="white" />
      {/* Blue top header */}
      <rect x="6" y="6" width="36" height="10" rx="4" fill="#4285F4" />
      <rect x="6" y="12" width="36" height="4" fill="#4285F4" />
      {/* Four colored quadrants below header */}
      {/* Top-left: red */}
      <rect x="6" y="16" width="18" height="13" fill="#EA4335" />
      {/* Top-right: blue */}
      <rect x="24" y="16" width="18" height="13" fill="#4285F4" />
      {/* Bottom-left: yellow */}
      <rect x="6" y="29" width="18" height="13" rx="0" fill="#FBBC05" />
      <rect x="6" y="35" width="18" height="7" rx="4" fill="#FBBC05" />
      {/* Bottom-right: green */}
      <rect x="24" y="29" width="18" height="13" fill="#34A853" />
      <rect x="24" y="35" width="18" height="7" rx="4" fill="#34A853" />
      {/* White grid lines */}
      <rect x="23" y="6" width="2" height="36" fill="white" />
      <rect x="6" y="28" width="36" height="2" fill="white" />
      {/* Date number */}
      <text x="24" y="27" textAnchor="middle" fontSize="11" fontWeight="800" fill="white" fontFamily="Arial, sans-serif">14</text>
    </svg>
  );
}

// Clean calendar icon for Apple/Outlook
function AppleCalIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="17" rx="2.5" fill="#F1F1F1" />
      <rect x="3" y="4" width="18" height="6" rx="2.5" fill="#FF3B30" />
      <rect x="3" y="7" width="18" height="3" fill="#FF3B30" />
      <rect x="7" y="2" width="2" height="4" rx="1" fill="#555" />
      <rect x="15" y="2" width="2" height="4" rx="1" fill="#555" />
      <text x="12" y="19" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#1C1C1E">31</text>
    </svg>
  );
}

const btnBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  width: "100%",
  padding: "14px 18px",
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
  textAlign: "left",
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
          <AppleCalIcon />
          <span>Add to Apple / Outlook Calendar</span>
        </a>
        {showHint && (
          <p style={{ margin: "8px 0 0", fontSize: 12, textAlign: "center", color: "#71717A" }}>
            File downloaded — double-click it to add to your calendar.
          </p>
        )}
      </div>

      <a href={googleHref} target="_blank" rel="noopener noreferrer" style={btnBase}>
        <GoogleCalIcon />
        <span>Add to Google Calendar</span>
      </a>
    </div>
  );
}
