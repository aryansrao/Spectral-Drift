"use client";

export default function Nav() {
  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        borderBottom: "1px solid rgba(255,255,255,.07)",
        backdropFilter: "blur(20px) saturate(150%)",
        WebkitBackdropFilter: "blur(20px) saturate(150%)",
        background: "rgba(0,0,0,.7)",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 24px",
          height: 58,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a
          href="/"
          aria-label="Spectral Drift home"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "#ededed",
          }}
        >
          <svg
            style={{
              width: 28,
              height: 28,
              filter: "drop-shadow(0 0 8px rgba(255,69,0,.6))",
            }}
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              fill="rgba(255,255,255,.85)"
              d="m508.374 432.802s-46.6-39.038-79.495-275.781c-8.833-87.68-82.856-156.139-172.879-156.139-90.015 0-164.046 68.458-172.879 156.138-32.895 236.743-79.495 275.782-79.495 275.782-15.107 25.181 20.733 28.178 38.699 27.94 35.254-.478 35.254 40.294 70.516 40.294 35.254 0 35.254-35.261 70.508-35.261s37.396 45.343 72.65 45.343 37.389-45.343 72.651-45.343c35.254 0 35.254 35.261 70.508 35.261s35.27-40.772 70.524-40.294c17.959.238 53.798-2.76 38.692-27.94z"
            />
            <circle fill="#ff4500" cx="192" cy="225" r="26" />
            <circle fill="#ff4500" cx="312" cy="225" r="26" />
          </svg>
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            Spectral Drift
          </span>
        </a>

        <ul
          role="list"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            listStyle: "none",
          }}
        >
          {[
            { label: "Features", href: "#features" },
            { label: "Security", href: "#security" },
            { label: "Orbs", href: "#economy" },
            { label: "Advertise", href: "/ads" },
          ].map((item) => (
            <li key={item.href} className="hidden sm:block">
              <a
                href={item.href}
                style={{
                  display: "block",
                  padding: "6px 12px",
                  fontSize: 13,
                  fontWeight: 400,
                  color: "rgba(255,255,255,.38)",
                  textDecoration: "none",
                  borderRadius: 6,
                  transition: "color .15s, background .15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "#ededed";
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "rgba(255,255,255,.05)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "rgba(255,255,255,.38)";
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "transparent";
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
          <li className="hidden sm:block">
            <a
              href="https://aryansrao.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                padding: "6px 12px",
                fontSize: 13,
                fontWeight: 400,
                color: "rgba(255,255,255,.38)",
                textDecoration: "none",
                borderRadius: 6,
                transition: "color .15s, background .15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#ededed";
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "rgba(255,255,255,.05)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "rgba(255,255,255,.38)";
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "transparent";
              }}
            >
              Creator
            </a>
          </li>
          <li className="hidden sm:block">
            <a
              href="https://github.com/aryansrao/spectral-drift"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                padding: "6px 12px",
                fontSize: 13,
                fontWeight: 400,
                color: "rgba(255,255,255,.38)",
                textDecoration: "none",
                borderRadius: 6,
                transition: "color .15s, background .15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#ededed";
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "rgba(255,255,255,.05)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "rgba(255,255,255,.38)";
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "transparent";
              }}
            >
              GitHub
            </a>
          </li>
          <li>
            <a
              href="/realm"
              style={{
                display: "block",
                padding: "7px 16px",
                fontSize: 13,
                fontWeight: 500,
                color: "#fff",
                textDecoration: "none",
                borderRadius: 6,
                background: "#ff4500",
                transition: "opacity .15s, transform .1s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.opacity = "0.88";
                (e.currentTarget as HTMLAnchorElement).style.transform =
                  "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
                (e.currentTarget as HTMLAnchorElement).style.transform =
                  "translateY(0)";
              }}
            >
              Enter Realm →
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
