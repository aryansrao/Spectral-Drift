"use client";

import { Circle, Sparkles } from "lucide-react";

const orbs = [
  {
    icon: <Circle size={28} className="text-[#00ff88]" />,
    name: "Common",
    supply: "Supply: 400 · 80% of total",
    desc: "The most abundant orb. Found throughout the world near all major landmarks. A great starting point for new spirits entering the realm.",
    barWidth: "80%",
    color: "#00ff88",
    border: "rgba(0,255,136,.3)",
    glow: "rgba(0,255,136,.08)",
    aria: "Common orbs",
  },
  {
    icon: <Circle size={28} className="text-[#66aaff]" />,
    name: "Uncommon",
    supply: "Supply: 80 · 16% of total",
    desc: "Harder to find and more valuable. Scattered in quieter corners of the world. Worth 5× the weight of a common orb on the leaderboard.",
    barWidth: "16%",
    color: "#66aaff",
    border: "rgba(102,170,255,.3)",
    glow: "rgba(102,170,255,.08)",
    aria: "Uncommon orbs",
  },
  {
    icon: <Sparkles size={28} className="text-[#ffcc00]" />,
    name: "Rare",
    supply: "Supply: 20 · 4% of total",
    desc: "Extremely scarce. Only 20 exist in the entire world. Once found, they can be transferred but never recreated. The most coveted asset in the realm.",
    barWidth: "4%",
    color: "#ffcc00",
    border: "rgba(255,204,0,.35)",
    glow: "rgba(255,204,0,.1)",
    aria: "Rare orbs",
  },
];

export default function Economy() {
  return (
    <section
      id="economy"
      aria-labelledby="economy-title"
      style={{
        padding: "100px 0",
        borderTop: "1px solid rgba(255,255,255,.07)",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div className="reveal" style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: ".18em",
              color: "#ff4500",
              marginBottom: 14,
            }}
          >
            Fixed supply economy
          </div>
          <h2
            id="economy-title"
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              color: "#fff",
              marginBottom: 16,
            }}
          >
            500 orbs.
            <br />
            No inflation. Ever.
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,.38)",
              maxWidth: 520,
              lineHeight: 1.65,
              fontWeight: 300,
              margin: "0 auto",
            }}
          >
            Like Bitcoin&apos;s 21 million — Spectral Drift has a hard cap of 500
            orbs across three tiers. Once all are claimed, scarcity is absolute.
            Lost orbs stay lost.
          </p>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginTop: 56,
          }}
        >
          {orbs.map((orb) => (
            <article
              key={orb.name}
              aria-label={orb.aria}
              style={{
                background: "#0a0a0a",
                border: `1px solid rgba(255,255,255,.07)`,
                borderRadius: 24,
                padding: "28px 24px",
                position: "relative",
                overflow: "hidden",
                transition: "transform .2s, border-color .2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-3px)";
                (e.currentTarget as HTMLElement).style.borderColor = orb.border;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255,255,255,.07)";
              }}
            >
              {/* Glow blob */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: orb.glow,
                  filter: "blur(40px)",
                  pointerEvents: "none",
                }}
              />

              <span
                aria-hidden="true"
                style={{ display: "block", marginBottom: 16 }}
              >
                {orb.icon}
              </span>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                  marginBottom: 4,
                }}
              >
                {orb.name}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: orb.color,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                {orb.supply}
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,.38)",
                  lineHeight: 1.6,
                }}
              >
                {orb.desc}
              </p>
              <div
                style={{
                  marginTop: 16,
                  height: 2,
                  background: "rgba(255,255,255,.06)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 2,
                    background: orb.color,
                    opacity: 0.6,
                    width: orb.barWidth,
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
