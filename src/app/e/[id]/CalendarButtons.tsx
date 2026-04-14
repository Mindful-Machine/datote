"use client";

function GoogleCalIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/google-calandar.png" alt="Google Calendar" width={22} height={22} style={{ borderRadius: 4 }} />
  );
}

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
  border: "1px solid rgba(168, 85, 247, 0.25)",
  background: "linear-gradient(135deg, #111113 0%, rgba(124, 58, 237, 0.08) 100%)",
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
  async function handleIcalClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    try {
      // Fetch .ics and trigger via data URI — skips the file download step on iOS
      // and works inside Instagram's in-app browser.
      const ics = await fetch(icalHref).then((r) => r.text());
      const dataUri = `data:text/calendar;charset=utf8,${encodeURIComponent(ics)}`;
      window.location.href = dataUri;
    } catch {
      // Fallback: direct download
      window.location.href = icalHref;
    }
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <a href={icalHref} onClick={handleIcalClick} style={btnBase}>
        <AppleCalIcon />
        <span>Add to Apple / Outlook Calendar</span>
      </a>

      <a href={googleHref} target="_blank" rel="noopener noreferrer" style={btnBase}>
        <GoogleCalIcon />
        <span>Add to Google Calendar</span>
      </a>
    </div>
  );
}
