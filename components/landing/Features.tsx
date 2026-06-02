"use client";

import { Key, Link2, Globe, Sparkles, Mic, Map } from "lucide-react";

const features = [
  {
    icon: <Key size={18} />,
    name: "Seed phrase identity",
    desc: "Your 12-word phrase is the only thing that proves you're you. Same phrase on any device, any browser — same ghost, same orbs. Nothing is stored on a server.",
    glow: "rgba(255,69,0,.06)",
    iconBg: "rgba(255,69,0,.1)",
    iconBorder: "rgba(255,69,0,.2)",
  },
  {
    icon: <Link2 size={18} />,
    name: "Cryptographic ledger",
    desc: "Every orb claim and transfer is signed with ECDSA P-256. The distributed ledger is verified independently by every peer, with no central authority.",
    glow: "rgba(100,170,255,.05)",
    iconBg: "rgba(100,170,255,.1)",
    iconBorder: "rgba(100,170,255,.18)",
  },
  {
    icon: <Globe size={18} />,
    name: "True P2P via WebRTC",
    desc: "Powered by Trystero over WebTorrent trackers. Players connect directly — no relay servers handle your game data. The network is the players.",
    glow: "rgba(0,255,136,.04)",
    iconBg: "rgba(0,255,136,.1)",
    iconBorder: "rgba(0,255,136,.18)",
  },
  {
    icon: <Sparkles size={18} />,
    name: "Fixed supply orbs",
    desc: "500 total orbs — 400 common, 80 uncommon, 20 rare. The supply never inflates. Lost orbs are tracked transparently, just like Bitcoin's lost coins.",
    glow: "rgba(255,204,0,.04)",
    iconBg: "rgba(255,204,0,.1)",
    iconBorder: "rgba(255,204,0,.18)",
  },
  {
    icon: <Mic size={18} />,
    name: "Proximity voice chat",
    desc: "Spatial audio that fades with distance. Hear ghosts nearby, silence beyond range. No voice server — streams flow peer to peer via WebRTC.",
    glow: "rgba(160,100,255,.05)",
    iconBg: "rgba(160,100,255,.1)",
    iconBorder: "rgba(160,100,255,.18)",
  },
  {
    icon: <Map size={18} />,
    name: "Infinite open world",
    desc: "A 320×320 unit coordinate space with a live minimap. Orbs and ads are placed deterministically — the same map layout on every device without coordination.",
    glow: "rgba(255,69,0,.05)",
    iconBg: "rgba(255,120,0,.1)",
    iconBorder: "rgba(255,120,0,.18)",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      style={{
        padding: "100px 0",
        borderTop: "1px solid rgba(255,255,255,.07)",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div
          className="reveal"
          style={{ textAlign: "center", marginBottom: 64 }}
        >
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
            What makes it different
          </div>
          <h2
            id="features-title"
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              color: "#fff",
              marginBottom: 16,
            }}
          >
            Built different.
            <br />
            By design.
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
            Every design decision was made to eliminate trust requirements. No
            company controls your orbs. No server can go offline and erase your
            progress.
          </p>
        </div>

        {/* Grid */}
        <div
          className="reveal reveal-delay-1"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            background: "rgba(255,255,255,.07)",
            border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 24,
            overflow: "hidden",
          }}
        >
          {features.map((f) => (
            <article
              key={f.name}
              style={{
                background: "#080808",
                padding: "32px 28px",
                position: "relative",
                overflow: "hidden",
                transition: "background .2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#0d0d0d";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#080808";
              }}
            >
              {/* Glow overlay */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(ellipse at top left, ${f.glow} 0%, transparent 60%)`,
                  pointerEvents: "none",
                }}
              />
              {/* Icon */}
              <div
                aria-hidden="true"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: f.iconBg,
                  border: `1px solid ${f.iconBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                  color: "#ededed",
                }}
              >
                {f.icon}
              </div>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: "#fff",
                  marginBottom: 8,
                }}
              >
                {f.name}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,.38)",
                  lineHeight: 1.6,
                  fontWeight: 300,
                }}
              >
                {f.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
