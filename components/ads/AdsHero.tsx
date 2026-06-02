import RevealWrapper from './RevealWrapper';

export default function AdsHero() {
  return (
    <section
      style={{
        padding: '130px 24px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Radial glow background */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          height: 300,
          background:
            'radial-gradient(ellipse, rgba(255,180,0,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px' }}>
        {/* Badge */}
        <RevealWrapper>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '5px 14px',
              border: '1px solid rgba(255,180,0,0.2)',
              borderRadius: 99,
              background: 'rgba(255,180,0,0.06)',
              fontSize: 10,
              fontWeight: 500,
              color: 'rgba(255,200,80,0.8)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 28,
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: 'var(--color-gold)',
                animation: 'blink 1.6s infinite',
                display: 'inline-block',
              }}
            />
            In-world advertising
          </div>
        </RevealWrapper>

        {/* H1 */}
        <RevealWrapper delay={1}>
          <h1
            style={{
              fontSize: 'clamp(40px, 7vw, 80px)',
              fontWeight: 800,
              letterSpacing: '-0.045em',
              lineHeight: 1.02,
              marginBottom: 20,
            }}
          >
            Reach spirits
            <br />
            in the{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              void.
            </span>
          </h1>
        </RevealWrapper>

        {/* Subtitle */}
        <RevealWrapper delay={2}>
          <p
            style={{
              fontSize: 17,
              color: 'var(--color-muted)',
              maxWidth: 500,
              margin: '0 auto 40px',
              fontWeight: 300,
              lineHeight: 1.65,
            }}
          >
            Your brand as a glowing 3D billboard inside Spectral Drift&apos;s
            open ghost world. Players approach. Orbs cluster nearby. Your site
            opens.
          </p>
        </RevealWrapper>

        {/* CTA */}
        <RevealWrapper delay={3}>
          <a
            href="mailto:aaryansrao5@gmail.com"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '13px 28px',
              background: 'var(--color-accent)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 10,
              transition: 'opacity 0.2s, transform 0.15s',
              boxShadow: '0 8px 32px rgba(255,69,0,0.25)',
            }}
            className="ads-hero-cta"
          >
            Get in touch →
          </a>
        </RevealWrapper>
      </div>
    </section>
  );
}
