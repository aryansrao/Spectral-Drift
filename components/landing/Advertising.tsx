import { MapPin, Sparkles, Star } from "lucide-react";

const adFeatures = [
  {
    icon: <MapPin size={14} />,
    name: "Proximity-triggered",
    desc: "When a spirit walks within range, your URL opens automatically. No banner blindness — it's part of the game world.",
    delay: "",
  },
  {
    icon: <Sparkles size={14} />,
    name: "Orbs cluster near ads",
    desc: "Orbs spawn near billboard locations, creating a natural incentive to approach your ad. Players come for orbs, discover your brand.",
    delay: "reveal-delay-1",
  },
  {
    icon: <Star size={14} />,
    name: "On every device, deterministically",
    desc: "Ad placement is seeded — same position on every player's device with no coordination. Consistent worldwide presence.",
    delay: "reveal-delay-2",
  },
  {
    icon: <Star size={14} />,
    name: "Minimap visibility",
    desc: "Your ad appears as a ★ on the minimap. Spirits see it from across the world and navigate toward it.",
    delay: "reveal-delay-3",
  },
];

export default function Advertising() {
  return (
    <section
      id="advertising"
      aria-labelledby="advertising-title"
      style={{
        padding: "100px 0",
        borderTop: "1px solid rgba(255,255,255,.07)",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 80,
            alignItems: "center",
          }}
        >
          {/* Left: text */}
          <div>
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
              In-world advertising
            </div>
            <h2
              id="advertising-title"
              className="reveal reveal-delay-1"
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                lineHeight: 1.1,
                color: "#fff",
                marginBottom: 16,
              }}
            >
              Reach spirits
              <br />
              where they explore.
            </h2>
            <p
              className="reveal reveal-delay-2"
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,.38)",
                maxWidth: 520,
                lineHeight: 1.65,
                fontWeight: 300,
              }}
            >
              Ads are 3D glowing billboards placed directly in the game world —
              near orb clusters, where players naturally travel. Spirits approach
              and your site opens.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
                marginTop: 36,
              }}
            >
              {adFeatures.map((feat) => (
                <div
                  key={feat.name}
                  className={`reveal ${feat.delay}`}
                  style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      background: "rgba(255,180,0,.08)",
                      border: "1px solid rgba(255,180,0,.16)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: "#ffcc00",
                    }}
                  >
                    {feat.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#fff",
                        letterSpacing: "-0.02em",
                        marginBottom: 3,
                      }}
                    >
                      {feat.name}
                    </div>
                    <p
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,.38)",
                        lineHeight: 1.55,
                      }}
                    >
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 32 }} className="reveal">
              <a
                href="/ads"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 28px",
                  background: "#ff4500",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                  borderRadius: 10,
                  letterSpacing: "-0.01em",
                  transition:
                    "opacity .2s, transform .15s, box-shadow .2s",
                  boxShadow:
                    "0 0 0 1px rgba(255,69,0,.3), 0 8px 32px rgba(255,69,0,.25)",
                }}
              >
                View Ad Packages →
              </a>
              <p
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,.38)",
                  marginTop: 14,
                  fontFamily: "var(--font-mono)",
                }}
              >
                Or email directly —{" "}
                <a
                  href="mailto:aaryansrao5@gmail.com"
                  style={{ color: "#ff4500", textDecoration: "none" }}
                >
                  aaryansrao5@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* Right: ad mock */}
          <div
            className="reveal reveal-delay-2"
            role="img"
            aria-label="Ad billboard preview"
            style={{
              background: "rgba(4,2,18,.95)",
              border: "1px solid rgba(255,200,60,.25)",
              borderRadius: 24,
              padding: 20,
              boxShadow: "0 0 40px rgba(255,180,0,.07)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 8,
                textTransform: "uppercase",
                letterSpacing: ".18em",
                color: "rgba(255,180,0,.45)",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#ffb800",
                  animation: "blink 1.4s infinite",
                }}
              />
              Sponsored · In-world billboard
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "-0.03em",
                marginBottom: 6,
              }}
            >
              Your Brand Here
            </div>
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,.38)",
                marginBottom: 20,
              }}
            >
              Your tagline — reaching ghost explorers across the void.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 20,
              }}
            >
              {[
                { val: "4.5u", label: "Trigger radius" },
                { val: "45s", label: "Cooldown" },
                { val: "★", label: "Minimap marker" },
                { val: "∞", label: "Devices reached" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: "rgba(255,255,255,.03)",
                    border: "1px solid rgba(255,255,255,.07)",
                    borderRadius: 10,
                    padding: "10px 14px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 16,
                      fontWeight: 600,
                      color: "rgba(255,200,80,.9)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {stat.val}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,.38)",
                      letterSpacing: ".06em",
                      textTransform: "uppercase",
                      marginTop: 2,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            <a
              href="/ads"
              style={{
                display: "block",
                width: "100%",
                padding: 11,
                background: "rgba(255,180,0,.1)",
                border: "1px solid rgba(255,180,0,.25)",
                borderRadius: 10,
                color: "rgba(255,200,80,.9)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: ".12em",
                textDecoration: "none",
                transition: "background .2s",
              }}
            >
              Get your slot →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
