import { Mail, Globe, ArrowRight, ArrowUpRight } from 'lucide-react';
import RevealWrapper from './RevealWrapper';

const faqs = [
  {
    q: 'How much does a slot cost?',
    a: 'Pricing is flexible — reach out and we\'ll work something out based on your goals. Early adopters get preferential rates.',
    delay: 0 as const,
  },
  {
    q: 'Can I track clicks?',
    a: 'The ad opens your URL directly in a new tab, so any analytics (UTM params, etc.) on your end will capture the visit. We don\'t proxy or intercept anything.',
    delay: 1 as const,
  },
  {
    q: 'How long does setup take?',
    a: 'Once we confirm the details, your ad can be live within 24 hours — it\'s a config change in the game file that deploys instantly to Vercel.',
    delay: 2 as const,
  },
  {
    q: 'Is there a minimum commitment?',
    a: 'No minimum. You can start with a trial period and extend if you\'re happy with the results.',
    delay: 3 as const,
  },
  {
    q: 'What kind of traffic does the game get?',
    a: 'Spectral Drift is growing. It\'s a browser-native multiplayer experience shared link-to-link — the audience tends to be tech-curious, creative, and engaged.',
    delay: 0 as const,
  },
];

export default function Contact() {
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
            gap: 60,
            alignItems: 'center',
          }}
          className="contact-inner"
        >
          {/* Left: contact */}
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
                Get a slot
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
                One email
                <br />
                to get started.
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
                No self-serve dashboard yet — just reach out directly. Include
                your brand name, tagline, URL, and preferred glow color.
                Turnaround is usually within 24h.
              </p>
            </RevealWrapper>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                marginTop: 32,
              }}
            >
              <RevealWrapper delay={1}>
                <a
                  href="mailto:aaryansrao5@gmail.com"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '16px 20px',
                    background: 'var(--color-surface)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 12,
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  className="contact-link"
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      background: 'rgba(255,69,0,0.1)',
                      border: '1px solid rgba(255,69,0,0.2)',
                    }}
                  >
                    <Mail size={16} color="#ff4500" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--color-muted)',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        marginBottom: 3,
                      }}
                    >
                      Email
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#fff',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      aaryansrao5@gmail.com
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    style={{ color: 'var(--color-muted)', flexShrink: 0 }}
                    className="contact-link-arr"
                  />
                </a>
              </RevealWrapper>

              <RevealWrapper delay={2}>
                <a
                  href="https://aryansrao.leapcell.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '16px 20px',
                    background: 'var(--color-surface)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 12,
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  className="contact-link"
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      background: 'rgba(100,170,255,0.1)',
                      border: '1px solid rgba(100,170,255,0.2)',
                    }}
                  >
                    <Globe size={16} color="#64aaff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--color-muted)',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        marginBottom: 3,
                      }}
                    >
                      Creator portfolio
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#fff',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      aryansrao.leapcell.app
                    </div>
                  </div>
                  <ArrowUpRight
                    size={16}
                    style={{ color: 'var(--color-muted)', flexShrink: 0 }}
                    className="contact-link-arr"
                  />
                </a>
              </RevealWrapper>
            </div>
          </div>

          {/* Right: FAQ */}
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
                FAQ
              </div>
            </RevealWrapper>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 32 }}>
              {faqs.map((faq) => (
                <RevealWrapper key={faq.q} delay={faq.delay}>
                  <div
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.07)',
                      padding: '20px 0',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#fff',
                        letterSpacing: '-0.02em',
                        marginBottom: 8,
                      }}
                    >
                      {faq.q}
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: 'var(--color-muted)',
                        lineHeight: 1.6,
                      }}
                    >
                      {faq.a}
                    </p>
                  </div>
                </RevealWrapper>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-inner { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
        .contact-link:hover {
          border-color: rgba(255,255,255,0.12) !important;
          background: #0d0d0d !important;
        }
        .contact-link:hover .contact-link-arr {
          transform: translateX(3px);
          color: var(--color-text);
        }
      `}</style>
    </section>
  );
}
