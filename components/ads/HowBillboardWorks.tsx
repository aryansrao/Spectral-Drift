import RevealWrapper from './RevealWrapper';

const steps = [
  {
    num: '01',
    title: 'Your ad enters the world',
    desc: 'A glowing pillar with your brand name, tagline, and a floating billboard spawns at a fixed position in the 3D world — same spot for every player, on every device.',
  },
  {
    num: '02',
    title: 'Orbs cluster nearby',
    desc: 'Collectible orbs spawn close to your billboard location, creating a natural incentive for spirits to explore that area. Players come for orbs, find your brand.',
  },
  {
    num: '03',
    title: 'Billboard glows on approach',
    desc: 'Within 9 units, the sign pulses and lights up with a "Walk closer to visit" prompt. The spirit can also click the billboard directly at any time.',
  },
  {
    num: '04',
    title: 'Your site opens',
    desc: 'Within 4.5 units, your URL opens in a new tab automatically. A 45-second cooldown prevents re-triggering. The spirit stays in the ghost world — you get the visit.',
  },
];

export default function HowBillboardWorks() {
  return (
    <section
      style={{
        position: 'relative',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '80px 0',
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>
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
            How it works
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
            Part of the world,
            <br />
            not a banner.
          </h2>
        </RevealWrapper>

        <RevealWrapper delay={2}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 1,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 18,
              overflow: 'hidden',
              marginTop: 48,
            }}
            className="how-grid"
          >
            {steps.map((step) => (
              <div
                key={step.num}
                style={{
                  background: 'var(--color-surface)',
                  padding: '28px 22px',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'rgba(255,180,0,0.5)',
                    letterSpacing: '0.1em',
                    marginBottom: 14,
                  }}
                >
                  {step.num}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#fff',
                    letterSpacing: '-0.02em',
                    marginBottom: 7,
                  }}
                >
                  {step.title}
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--color-muted)',
                    lineHeight: 1.6,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </RevealWrapper>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .how-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .how-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
