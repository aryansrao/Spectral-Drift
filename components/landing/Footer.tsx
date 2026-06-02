"use client";

export default function Footer() {
  return (
    <footer
      role="contentinfo"
      style={{
        borderTop: "1px solid rgba(255,255,255,.07)",
        padding: "40px 0",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a
            href="/"
            aria-label="Spectral Drift"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              color: "rgba(255,255,255,.38)",
              fontSize: 13,
            }}
          >
            <svg
              style={{ width: 20, height: 20 }}
              viewBox="0 0 512 512"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                fill="rgba(255,255,255,.4)"
                d="m508.374 432.802s-46.6-39.038-79.495-275.781c-8.833-87.68-82.856-156.139-172.879-156.139-90.015 0-164.046 68.458-172.879 156.138-32.895 236.743-79.495 275.782-79.495 275.782-15.107 25.181 20.733 28.178 38.699 27.94 35.254-.478 35.254 40.294 70.516 40.294 35.254 0 35.254-35.261 70.508-35.261s37.396 45.343 72.65 45.343 37.389-45.343 72.651-45.343c35.254 0 35.254 35.261 70.508 35.261s35.27-40.772 70.524-40.294c17.959.238 53.798-2.76 38.692-27.94z"
              />
              <circle fill="#ff4500" opacity={0.6} cx="192" cy="225" r="26" />
              <circle fill="#ff4500" opacity={0.6} cx="312" cy="225" r="26" />
            </svg>
            Spectral Drift
          </a>
          <div
            aria-hidden="true"
            style={{
              width: 1,
              height: 16,
              background: "rgba(255,255,255,.07)",
            }}
          />
          <span
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,.12)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Built by{" "}
            <a
              href="https://aryansrao.leapcell.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "rgba(255,255,255,.38)",
                textDecoration: "none",
                transition: "color .15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "rgba(255,255,255,.38)";
              }}
            >
              Aryan S Rao
            </a>
          </span>
        </div>

        {/* Links */}
        <ul
          role="list"
          style={{
            display: "flex",
            gap: 20,
            listStyle: "none",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Play", href: "/realm", external: false },
            { label: "Advertise", href: "/ads", external: false },
            {
              label: "GitHub",
              href: "https://github.com/aryansrao/spectral-drift",
              external: true,
            },
            {
              label: "Portfolio",
              href: "https://aryansrao.leapcell.app",
              external: true,
            },
            {
              label: "Contact",
              href: "mailto:aaryansrao5@gmail.com",
              external: false,
            },
          ].map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,.38)",
                  textDecoration: "none",
                  transition: "color .15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "#ededed";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "rgba(255,255,255,.38)";
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
