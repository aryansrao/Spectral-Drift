import Link from 'next/link';

export default function AdsNav() {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        background: 'rgba(0,0,0,0.75)',
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          padding: '0 24px',
          height: 58,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: '-0.02em',
          }}
        >
          <svg
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            style={{ filter: 'drop-shadow(0 0 6px rgba(255,69,0,0.5))' }}
          >
            <path
              fill="rgba(255,255,255,0.85)"
              d="m508.374 432.802s-46.6-39.038-79.495-275.781c-8.833-87.68-82.856-156.139-172.879-156.139-90.015 0-164.046 68.458-172.879 156.138-32.895 236.743-79.495 275.782-79.495 275.782-15.107 25.181 20.733 28.178 38.699 27.94 35.254-.478 35.254 40.294 70.516 40.294 35.254 0 35.254-35.261 70.508-35.261s37.396 45.343 72.65 45.343 37.389-45.343 72.651-45.343c35.254 0 35.254 35.261 70.508 35.261s35.27-40.772 70.524-40.294c17.959.238 53.798-2.76 38.692-27.94z"
            />
            <circle fill="#ff4500" cx="192" cy="225" r="26" />
            <circle fill="#ff4500" cx="312" cy="225" r="26" />
          </svg>
          Spectral Drift
        </Link>

        <Link
          href="/"
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.38)',
            padding: '6px 12px',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 6,
            transition: 'color 0.15s, border-color 0.15s',
          }}
          className="ads-nav-back"
        >
          ← Back to home
        </Link>
      </div>
    </nav>
  );
}
