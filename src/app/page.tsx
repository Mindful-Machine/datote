"use client";

import { useLang, LANG_LABELS } from "@/lib/useLang";

export default function Home() {
  const { t, lang, setLang } = useLang();

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px 0",
        textAlign: "center",
        gap: 0,
      }}
    >
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

      {/* Logo mark */}
      <div
        style={{
          width: 48, height: 48, borderRadius: 14,
          background: "linear-gradient(135deg, #A855F7, #7C3AED)",
          marginBottom: 28,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
        }}
      >📅</div>

      <h1
        style={{
          fontSize: "clamp(36px, 8vw, 64px)",
          fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: "-0.03em",
          background: "linear-gradient(135deg, #FAFAFA 40%, #A855F7 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}
      >Pindate</h1>

      <p
        style={{
          marginTop: 14, marginBottom: 36,
          fontSize: "clamp(15px, 2.5vw, 18px)",
          color: "#71717A", maxWidth: 340, lineHeight: 1.6,
        }}
      >{t("tagline")}</p>

      <a
        href="/new"
        style={{
          padding: "13px 28px", borderRadius: 12,
          background: "#A855F7", color: "#fff",
          textDecoration: "none", fontWeight: 600, fontSize: 15,
          letterSpacing: "-0.01em", transition: "opacity 0.15s",
        }}
      >{t("cta")}</a>

      <p style={{ position: "absolute", bottom: 24, fontSize: 12, color: "#3F3F46", margin: 0 }}>
        {t("by")}
      </p>
    </main>
  );
}
