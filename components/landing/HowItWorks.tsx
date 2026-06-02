const steps = [
  {
    num: "01",
    title: "Generate your 12 words",
    desc: (
      <>
        On first visit, 12 random words are generated in your browser using{" "}
        <code>crypto.getRandomValues</code>. Write them down — they&apos;re your
        permanent identity.
      </>
    ),
    delay: "reveal-delay-1",
  },
  {
    num: "02",
    title: "Derive your keypair",
    desc: "PBKDF2 at 210,000 iterations derives a P-256 private key from your phrase. Same phrase → same key → same identity, always, on any device.",
    delay: "reveal-delay-2",
  },
  {
    num: "03",
    title: "Explore and collect",
    desc: "Roam the world. Every orb you collect is signed with your private key and broadcast to peers. The ledger is validated by everyone — no cheating possible.",
    delay: "reveal-delay-3",
  },
  {
    num: "04",
    title: "Recover anywhere",
    desc: "On any device, enter your 12 words to restore your identity. Connect to peers and your full ledger syncs automatically — orbs included.",
    delay: "",
  },
];

const phraseWords = [
  "wandering",
  "hollow",
  "drift",
  "pale",
  "ember",
  "void",
  "ashen",
  "shade",
  "mist",
  "lost",
  "revenant",
  "flux",
];

export default function HowItWorks() {
  return (
    <section
      id="how"
      aria-labelledby="how-title"
      style={{ padding: "100px 0", position: "relative", zIndex: 1 }}
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
          {/* Left: steps */}
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
              How it works
            </div>
            <h2
              id="how-title"
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
              Your seed phrase
              <br />
              is your passport.
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  className={`reveal ${step.delay}`}
                  style={{
                    display: "flex",
                    gap: 20,
                    padding: "24px 0",
                    borderBottom:
                      i < steps.length - 1
                        ? "1px solid rgba(255,255,255,.07)"
                        : "none",
                    paddingTop: i === 0 ? 0 : undefined,
                    cursor: "default",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "#ff4500",
                      letterSpacing: ".06em",
                      paddingTop: 3,
                      flexShrink: 0,
                      width: 28,
                    }}
                  >
                    {step.num}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#fff",
                        letterSpacing: "-0.02em",
                        marginBottom: 6,
                      }}
                    >
                      {step.title}
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,.38)",
                        lineHeight: 1.6,
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: phrase demo */}
          <div
            className="reveal reveal-delay-2"
            aria-label="Seed phrase example"
            style={{
              background: "#0a0a0a",
              border: "1px solid rgba(255,255,255,.07)",
              borderRadius: 24,
              padding: 32,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top glow */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(255,69,0,.08) 0%, transparent 65%)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: ".14em",
                color: "rgba(255,255,255,.38)",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
                position: "relative",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#ff4500",
                }}
              />
              Your recovery phrase
            </div>

            <div
              role="list"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
                position: "relative",
              }}
            >
              {phraseWords.map((word, i) => (
                <div
                  key={word}
                  role="listitem"
                  style={{
                    background: "rgba(255,255,255,.03)",
                    border: "1px solid rgba(255,255,255,.07)",
                    borderRadius: 6,
                    padding: "8px 10px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: 8,
                      color: "rgba(255,204,0,.4)",
                      marginBottom: 3,
                      letterSpacing: ".06em",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    style={{ color: "rgba(255,210,100,.85)", fontWeight: 500 }}
                  >
                    {word}
                  </span>
                </div>
              ))}
            </div>

            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "rgba(255,255,255,.38)",
                marginTop: 20,
                lineHeight: 1.6,
              }}
            >
              ⚠ This is an example. Never share your real phrase with anyone.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
