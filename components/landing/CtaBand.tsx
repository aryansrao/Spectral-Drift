export default function CtaBand() {
  return (
    <section
      aria-label="Call to action"
      style={{
        padding: "100px 0",
        borderTop: "1px solid rgba(255,255,255,.07)",
        textAlign: "center",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Background glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 600,
          height: 300,
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          background:
            "radial-gradient(ellipse, rgba(255,69,0,.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "0 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="reveal"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: ".18em",
            color: "#ff4500",
            marginBottom: 14,
            display: "flex",
            justifyContent: "center",
          }}
        >
          Start playing
        </div>
        <h2
          className="reveal reveal-delay-1"
          style={{
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            color: "#fff",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          Ready to drift?
        </h2>
        <p
          className="reveal reveal-delay-2"
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,.38)",
            maxWidth: 440,
            lineHeight: 1.65,
            fontWeight: 300,
            textAlign: "center",
            margin: "0 auto 40px",
          }}
        >
          No download. No signup. Open your browser and enter the void. Your
          12-word phrase will be waiting.
        </p>
        <div
          className="reveal reveal-delay-3"
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href="/realm"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "15px 32px",
              background: "#ff4500",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
              borderRadius: 10,
              letterSpacing: "-0.01em",
              transition: "opacity .2s, transform .15s, box-shadow .2s",
              boxShadow:
                "0 0 0 1px rgba(255,69,0,.3), 0 8px 32px rgba(255,69,0,.25)",
            }}
          >
            Enter the Void →
          </a>
          <a
            href="https://aryansrao.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "15px 32px",
              background: "transparent",
              color: "#ededed",
              fontSize: 15,
              fontWeight: 500,
              textDecoration: "none",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,.12)",
              letterSpacing: "-0.01em",
              transition: "background .2s, border-color .2s",
            }}
          >
            Creator&apos;s Portfolio ↗
          </a>
        </div>
      </div>
    </section>
  );
}
