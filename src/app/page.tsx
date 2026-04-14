export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        textAlign: "center",
        gap: 0,
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: "linear-gradient(135deg, #A855F7, #7C3AED)",
          marginBottom: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
        }}
      >
        📅
      </div>

      <h1
        style={{
          fontSize: "clamp(36px, 8vw, 64px)",
          fontWeight: 800,
          margin: 0,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          background: "linear-gradient(135deg, #FAFAFA 40%, #A855F7 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Pindate
      </h1>

      <p
        style={{
          marginTop: 14,
          marginBottom: 36,
          fontSize: "clamp(15px, 2.5vw, 18px)",
          color: "#71717A",
          maxWidth: 340,
          lineHeight: 1.6,
        }}
      >
        Pin your event. Share a link.
        <br />
        Your audience adds it in one click.
      </p>

      <a
        href="/new"
        style={{
          padding: "13px 28px",
          borderRadius: 12,
          background: "#A855F7",
          color: "#fff",
          textDecoration: "none",
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: "-0.01em",
          transition: "opacity 0.15s",
        }}
      >
        Create event →
      </a>

      <p
        style={{
          position: "absolute",
          bottom: 24,
          fontSize: 12,
          color: "#3F3F46",
          margin: 0,
        }}
      >
        by Mindful Machine
      </p>
    </main>
  );
}
