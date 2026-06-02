export default function AdsFooter() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '36px 0',
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: 'var(--color-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Spectral Drift · Built by{' '}
          <a
            href="https://aryansrao.leapcell.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-muted)' }}
          >
            Aryan S Rao
          </a>
        </span>

        <ul
          style={{
            display: 'flex',
            gap: 20,
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}
        >
          {[
            { label: 'Home', href: '/' },
            { label: 'Play', href: '/realm' },
            {
              label: 'GitHub',
              href: 'https://github.com/aryansrao/spectral-drift',
              external: true,
            },
            {
              label: 'Portfolio',
              href: 'https://aryansrao.leapcell.app',
              external: true,
            },
            { label: 'Email', href: 'mailto:aaryansrao5@gmail.com' },
          ].map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                {...(link.external
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
                style={{
                  fontSize: 12,
                  color: 'var(--color-muted)',
                  transition: 'color 0.15s',
                }}
                className="footer-link"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        .footer-link:hover { color: var(--color-text) !important; }
      `}</style>
    </footer>
  );
}
