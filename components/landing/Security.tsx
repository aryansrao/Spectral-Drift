import { Lock, Hash, ShieldCheck, Zap } from "lucide-react";

const secItems = [
  {
    icon: <Lock size={16} />,
    name: "ECDSA P-256 Signatures",
    desc: "Every claim and transfer is signed with your private key. Peers verify the signature before accepting any transaction into the ledger.",
    delay: "",
  },
  {
    icon: <Hash size={16} />,
    name: "SHA-256 Transaction Hashing",
    desc: "Each tx ID is SHA-256(payload + signature). Any tampering changes the hash, making the tx invalid. Replay attacks are blocked by nonce + dedup set.",
    delay: "reveal-delay-1",
  },
  {
    icon: <ShieldCheck size={16} />,
    name: "PBKDF2 Key Derivation",
    desc: "210,000 iterations of PBKDF2-SHA256 derive your private key from your seed phrase. Brute-force is computationally infeasible.",
    delay: "reveal-delay-2",
  },
  {
    icon: <Zap size={16} />,
    name: "Strike + Blacklist System",
    desc: "Peers that send cryptographically invalid transactions get strikes. At 3 strikes: blacklisted and all their ledger entries purged across the network.",
    delay: "reveal-delay-3",
  },
];

export default function Security() {
  return (
    <section
      id="security"
      aria-labelledby="security-title"
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
            gridTemplateColumns: "1fr 1.4fr",
            gap: 80,
            alignItems: "start",
          }}
        >
          {/* Left: text + items */}
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
              Security model
            </div>
            <h2
              id="security-title"
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
              Cryptographic
              <br />
              integrity.
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
              Every transaction is signed, hashed, and verified independently
              by every peer. The system is designed to make cheating
              mathematically impossible.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 0,
                marginTop: 40,
              }}
            >
              {secItems.map((item, i) => (
                <div
                  key={item.name}
                  className={`reveal ${item.delay}`}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    padding: "18px 0",
                    borderBottom:
                      i < secItems.length - 1
                        ? "1px solid rgba(255,255,255,.07)"
                        : "none",
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      fontSize: 16,
                      flexShrink: 0,
                      marginTop: 1,
                      width: 28,
                      display: "flex",
                      justifyContent: "center",
                      color: "#ededed",
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#fff",
                        letterSpacing: "-0.01em",
                        marginBottom: 4,
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,.38)",
                        lineHeight: 1.55,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: code block */}
          <div
            className="reveal reveal-delay-2"
            aria-label="Transaction signing code example"
            style={{
              background: "#0a0a0a",
              border: "1px solid rgba(255,255,255,.07)",
              borderRadius: 24,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom: "1px solid rgba(255,255,255,.07)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: ".14em",
                  color: "rgba(255,255,255,.38)",
                }}
              >
                transaction-signing.js
              </span>
              <div
                aria-hidden="true"
                style={{ display: "flex", gap: 6 }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#ff5f56",
                  }}
                />
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#ffbd2e",
                  }}
                />
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#27c93f",
                  }}
                />
              </div>
            </div>
            <div
              role="code"
              style={{
                padding: "24px 20px",
                fontFamily: "var(--font-mono)",
                fontSize: 11.5,
                lineHeight: 1.9,
                color: "rgba(255,255,255,.55)",
                overflowX: "auto",
              }}
            >
              <span style={{ color: "rgba(255,255,255,.22)", fontStyle: "italic" }}>
                {"// 1. Build transaction payload"}
              </span>
              <br />
              <span style={{ color: "#c792ea" }}>const</span>{" "}
              <span style={{ color: "#89ddff" }}>data</span> = {"{"}
              <br />
              &nbsp;&nbsp;<span style={{ color: "#c3e88d" }}>type</span>:{" "}
              <span style={{ color: "#c3e88d" }}>&apos;claim&apos;</span>,
              <br />
              &nbsp;&nbsp;<span style={{ color: "#c3e88d" }}>from</span>: myPublicKey,
              <br />
              &nbsp;&nbsp;<span style={{ color: "#c3e88d" }}>orbId</span>: orb.id,
              <br />
              &nbsp;&nbsp;<span style={{ color: "#c3e88d" }}>orbType</span>: orb.type,
              <br />
              &nbsp;&nbsp;<span style={{ color: "#c3e88d" }}>nonce</span>:{" "}
              <span style={{ color: "#82aaff" }}>rndHex</span>(),
              <br />
              &nbsp;&nbsp;<span style={{ color: "#c3e88d" }}>ts</span>:{" "}
              <span style={{ color: "#82aaff" }}>Date</span>.now()
              <br />
              {"}"};
              <br />
              <br />
              <span style={{ color: "rgba(255,255,255,.22)", fontStyle: "italic" }}>
                {"// 2. ECDSA-P256 sign the payload"}
              </span>
              <br />
              <span style={{ color: "#c792ea" }}>const</span>{" "}
              <span style={{ color: "#89ddff" }}>sig</span> ={" "}
              <span style={{ color: "#c792ea" }}>await</span>{" "}
              <span style={{ color: "#82aaff" }}>signObj</span>(data);
              <br />
              <br />
              <span style={{ color: "rgba(255,255,255,.22)", fontStyle: "italic" }}>
                {"// 3. SHA-256 hash of payload + sig"}
              </span>
              <br />
              <span style={{ color: "#c792ea" }}>const</span>{" "}
              <span style={{ color: "#89ddff" }}>id</span> ={" "}
              <span style={{ color: "#c792ea" }}>await</span>{" "}
              <span style={{ color: "#82aaff" }}>sha256hex</span>(
              <br />
              &nbsp;&nbsp;<span style={{ color: "#82aaff" }}>JSON</span>
              .stringify({"{ ...data, sig }"})<br />
              );
              <br />
              <br />
              <span style={{ color: "rgba(255,255,255,.22)", fontStyle: "italic" }}>
                {"// 4. Broadcast — peers verify"}
              </span>
              <br />
              <span style={{ color: "rgba(255,255,255,.22)", fontStyle: "italic" }}>
                {"// sig, hash, balance, ownership"}
              </span>
              <br />
              <span style={{ color: "#82aaff" }}>sendTx</span>(
              {"{ ...data, sig, id }"});
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
