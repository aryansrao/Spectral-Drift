import RevealWrapper from './RevealWrapper';

const specRows = [
  { label: 'Format', value: 'CSS2D floating billboard + 3D glowing pillar' },
  { label: 'Fields', value: 'Title, description/tagline, URL, glow color (hex)' },
  { label: 'Trigger radius', value: '4.5 world units — auto-opens in new tab' },
  { label: 'Glow radius', value: '9 world units — billboard illuminates, CTA appears' },
  { label: 'Cooldown', value: '45 seconds per player per ad visit' },
  { label: 'Minimap', value: '★ marker in your brand color — visible across the world' },
  { label: 'Placement', value: 'Deterministic seeded position — same on all devices' },
  { label: 'Slots available', value: '5 total (hardcoded in current build)' },
  { label: 'Orb proximity', value: 'Orbs spawn 3–7 units from your billboard anchor' },
  { label: 'Devices', value: 'Desktop + mobile, all modern browsers' },
];

const metrics = [
  { val: '4.5u', label: 'Trigger radius' },
  { val: '9u', label: 'Glow radius' },
  { val: '★', label: 'Minimap marker' },
  { val: '45s', label: 'Cooldown' },
];

export default function Specs() {
  return (
    <section
      style={{
        position: 'relative',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '80px 0',
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 48,
            alignItems: 'start',
          }}
          className="specs-grid"
        >
          {/* Left: label + table */}
          <div>
            <RevealWrapper>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  color: 'rgba(255,180,0,0.7)',
                  marginBottom: 12,
                }}
              >
                Ad specifications
              </div>
            </RevealWrapper>

            <RevealWrapper delay={1}>
              <h2
                style={{
                  fontSize: 'clamp(26px, 3.5vw, 40px)',
                  fontWeight: 700,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.1,
                  marginBottom: 14,
                }}
              >
                Everything you
                <br />
                get in a slot.
              </h2>
            </RevealWrapper>

            <RevealWrapper delay={2}>
              <p
                style={{
                  fontSize: 15,
                  color: 'var(--color-muted)',
                  lineHeight: 1.65,
                  fontWeight: 300,
                }}
              >
                Each billboard is fully customisable with your brand name,
                tagline, URL, and a hex color that determines the glow, pillar,
                and minimap marker color.
              </p>

              <table
                style={{ width: '100%', borderCollapse: 'collapse', marginTop: 32 }}
                aria-label="Ad specifications"
              >
                <tbody>
                  {specRows.map((row) => (
                    <tr
                      key={row.label}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <td
                        style={{
                          padding: '14px 16px 14px 0',
                          fontSize: 11,
                          fontFamily: 'var(--font-mono)',
                          letterSpacing: '0.04em',
                          color: 'var(--color-muted)',
                          verticalAlign: 'top',
                          width: '44%',
                        }}
                      >
                        {row.label}
                      </td>
                      <td
                        style={{
                          padding: '14px 0',
                          fontSize: 13,
                          color: '#fff',
                          fontWeight: 500,
                          verticalAlign: 'top',
                        }}
                      >
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </RevealWrapper>
          </div>

          {/* Right: billboard preview */}
          <RevealWrapper delay={2}>
            <div
              style={{
                background: '#040212',
                border: '1px solid rgba(255,200,60,0.2)',
                borderRadius: 18,
                padding: 24,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Glow overlay */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(ellipse at 50% 0%, rgba(255,200,60,0.06), transparent 60%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Tag */}
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  color: 'rgba(255,180,0,0.5)',
                  marginBottom: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: '#ffb800',
                    animation: 'blink 1.4s infinite',
                  }}
                />
                Sponsored · Billboard preview
              </div>

              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  marginBottom: 6,
                }}
              >
                Your Brand
              </div>

              <p
                style={{
                  fontSize: 12,
                  color: 'var(--color-muted)',
                  marginBottom: 20,
                }}
              >
                Your tagline goes here — one line, concise.
              </p>

              {/* Metrics grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                  marginBottom: 18,
                }}
              >
                {metrics.map((m) => (
                  <div
                    key={m.label}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 10,
                      padding: '10px 14px',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 17,
                        fontWeight: 600,
                        color: 'rgba(255,200,80,0.9)',
                      }}
                    >
                      {m.val}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: 'var(--color-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginTop: 2,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA prompt */}
              <div
                style={{
                  marginTop: 6,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'rgba(255,180,0,0.6)',
                  textAlign: 'center',
                  padding: 8,
                  border: '1px solid rgba(255,180,0,0.15)',
                  borderRadius: 8,
                  background: 'rgba(255,180,0,0.05)',
                }}
              >
                ▶ Walk closer to visit
              </div>
            </div>

            <p
              style={{
                fontSize: 11,
                color: 'var(--color-muted)',
                fontFamily: 'var(--font-mono)',
                marginTop: 16,
                lineHeight: 1.6,
                textAlign: 'center',
              }}
            >
              Billboard appearance in the ghost world. Color, title, and tagline
              are fully custom.
            </p>
          </RevealWrapper>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .specs-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
}
