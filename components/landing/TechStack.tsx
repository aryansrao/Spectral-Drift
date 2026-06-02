"use client";

const techItems = [
  { label: "Three.js r160", dot: "#ff4500" },
  { label: "WebRTC · Trystero", dot: "#00ccff" },
  { label: "ECDSA P-256", dot: "#a855f7" },
  { label: "Web Crypto API", dot: "#22c55e" },
  { label: "PBKDF2 · SHA-256", dot: "#f59e0b" },
  { label: "CSS2D Renderer", dot: "#3b82f6" },
  { label: "UnrealBloom Pass", dot: "#ec4899" },
  { label: "WebTorrent Trackers", dot: "#fff" },
  { label: "localStorage Ledger", dot: "#ff4500" },
  { label: "Web Audio API", dot: "#06b6d4" },
  { label: "Zero dependencies (client)", dot: "#84cc16" },
  { label: "Netlify Edge CDN", dot: "#6366f1" },
];

export default function TechStack() {
  return (
    <section
      id="tech"
      aria-labelledby="tech-title"
      style={{
        padding: "80px 0",
        borderTop: "1px solid rgba(255,255,255,.07)",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
        <div
          className="reveal"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: ".18em",
            color: "#ff4500",
            marginBottom: 14,
          }}
        >
          Under the hood
        </div>
        <h2
          id="tech-title"
          className="reveal reveal-delay-1"
          style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            color: "#fff",
            marginBottom: 0,
          }}
        >
          Open web standards only.
        </h2>
        <div
          className="reveal reveal-delay-2"
          role="list"
          aria-label="Technologies used"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 40,
          }}
        >
          {techItems.map((item) => (
            <div
              key={item.label}
              role="listitem"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                background: "#0a0a0a",
                border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 99,
                fontSize: 12,
                color: "rgba(255,255,255,.38)",
                fontFamily: "var(--font-mono)",
                letterSpacing: ".04em",
                transition: "border-color .2s, color .2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255,255,255,.12)";
                (e.currentTarget as HTMLElement).style.color = "#ededed";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255,255,255,.07)";
                (e.currentTarget as HTMLElement).style.color =
                  "rgba(255,255,255,.38)";
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: item.dot,
                  flexShrink: 0,
                }}
              />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
