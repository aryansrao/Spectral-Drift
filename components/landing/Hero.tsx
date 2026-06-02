"use client";

import { useEffect, useRef } from "react";

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W: number, H: number;
    let animId: number;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    class Ghost {
      x: number = 0;
      y: number = 0;
      size: number = 0;
      speed: number = 0;
      wobble: number = 0;
      wobbleSpeed: number = 0;
      opacity: number = 0;
      color: string = "";

      constructor() {
        this.reset(true);
      }

      reset(init: boolean) {
        this.x = Math.random() * W;
        this.y = init ? Math.random() * H : H + 60;
        this.size = 8 + Math.random() * 18;
        this.speed = 0.12 + Math.random() * 0.22;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.008 + Math.random() * 0.012;
        this.opacity = 0.018 + Math.random() * 0.04;
        this.color = ["255,69,0", "100,160,255", "0,255,136"][
          Math.floor(Math.random() * 3)
        ];
      }

      update() {
        this.y -= this.speed;
        this.x += Math.sin(this.wobble) * 0.3;
        this.wobble += this.wobbleSpeed;
        if (this.y < -80) this.reset(false);
      }

      draw() {
        const s = this.size;
        ctx!.save();
        ctx!.globalAlpha = this.opacity;
        ctx!.translate(this.x, this.y);
        ctx!.fillStyle = `rgba(${this.color},1)`;
        ctx!.beginPath();
        ctx!.arc(0, -s * 0.2, s * 0.55, Math.PI, 0, false);
        ctx!.lineTo(s * 0.55, s * 0.6);
        const w = (s * 0.55) / 2;
        ctx!.quadraticCurveTo(w * 0.7, s * 0.35, 0, s * 0.5);
        ctx!.quadraticCurveTo(-w * 0.7, s * 0.35, -s * 0.55, s * 0.6);
        ctx!.closePath();
        ctx!.fill();
        ctx!.restore();
      }
    }

    const ghosts: Ghost[] = [];
    for (let i = 0; i < 22; i++) ghosts.push(new Ghost());

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      ghosts.forEach((g) => {
        g.update();
        g.draw();
      });
      animId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <section
        aria-label="Hero"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "120px 24px 80px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1080,
            margin: "0 auto",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "5px 14px",
              border: "1px solid rgba(255,69,0,.25)",
              borderRadius: 99,
              background: "rgba(255,69,0,.07)",
              fontSize: 11,
              fontWeight: 500,
              color: "rgba(255,120,60,.85)",
              letterSpacing: ".06em",
              textTransform: "uppercase",
              marginBottom: 36,
              fontFamily: "var(--font-mono)",
              animation: "fadeUp .6s ease both",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#ff4500",
                animation: "blink 1.8s ease-in-out infinite",
                display: "inline-block",
              }}
            />
            Live · P2P · No servers
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "clamp(52px, 9vw, 96px)",
              fontWeight: 800,
              letterSpacing: "-0.045em",
              lineHeight: 1,
              marginBottom: 8,
              animation: "fadeUp .7s .1s ease both",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                color: "transparent",
                WebkitTextStroke: "1px rgba(255,255,255,.18)",
              }}
            >
              Spectral&nbsp;
            </span>
            <br />
            <span
              style={{
                background: "linear-gradient(160deg, #fff 0%, rgba(255,255,255,.5) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Drift
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "clamp(15px, 2.5vw, 19px)",
              color: "rgba(255,255,255,.38)",
              maxWidth: 540,
              margin: "24px auto 48px",
              fontWeight: 300,
              letterSpacing: "-0.01em",
              lineHeight: 1.65,
              animation: "fadeUp .7s .2s ease both",
            }}
          >
            An open world of ghost spirits, cryptographic orbs, and real-time
            peer-to-peer connections. No accounts. No servers. Just your 12-word
            seed phrase and the void.
          </p>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "center",
              animation: "fadeUp .7s .3s ease both",
            }}
          >
            <a
              href="/realm"
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
                transition: "opacity .2s, transform .15s, box-shadow .2s",
                boxShadow:
                  "0 0 0 1px rgba(255,69,0,.3), 0 8px 32px rgba(255,69,0,.25)",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M7 1L13 7L7 13"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M1 7H13"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Enter the Void
            </a>
            <a
              href="#features"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 28px",
                background: "transparent",
                color: "#ededed",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,.12)",
                letterSpacing: "-0.01em",
                transition: "background .2s, border-color .2s",
              }}
            >
              Learn more
            </a>
          </div>

          {/* Stats */}
          <div
            role="list"
            aria-label="Key statistics"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 32,
              marginTop: 72,
              paddingTop: 48,
              borderTop: "1px solid rgba(255,255,255,.07)",
              animation: "fadeUp .7s .45s ease both",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <div role="listitem">
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  color: "#fff",
                }}
              >
                500
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,.38)",
                  textTransform: "uppercase",
                  letterSpacing: ".1em",
                  marginTop: 2,
                  fontFamily: "var(--font-mono)",
                }}
              >
                Total orb supply
              </div>
            </div>
            <div
              aria-hidden="true"
              style={{
                width: 1,
                height: 36,
                background: "rgba(255,255,255,.07)",
              }}
            />
            <div role="listitem">
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  color: "#fff",
                }}
              >
                P2P
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,.38)",
                  textTransform: "uppercase",
                  letterSpacing: ".1em",
                  marginTop: 2,
                  fontFamily: "var(--font-mono)",
                }}
              >
                Zero servers
              </div>
            </div>
            <div
              aria-hidden="true"
              style={{
                width: 1,
                height: 36,
                background: "rgba(255,255,255,.07)",
              }}
            />
            <div role="listitem">
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  color: "#fff",
                }}
              >
                P-256
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,.38)",
                  textTransform: "uppercase",
                  letterSpacing: ".1em",
                  marginTop: 2,
                  fontFamily: "var(--font-mono)",
                }}
              >
                Cryptographic identity
              </div>
            </div>
            <div
              aria-hidden="true"
              style={{
                width: 1,
                height: 36,
                background: "rgba(255,255,255,.07)",
              }}
            />
            <div role="listitem">
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  color: "#fff",
                }}
              >
                Free
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,.38)",
                  textTransform: "uppercase",
                  letterSpacing: ".1em",
                  marginTop: 2,
                  fontFamily: "var(--font-mono)",
                }}
              >
                Forever
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
