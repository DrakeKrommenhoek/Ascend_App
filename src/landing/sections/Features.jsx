import { features } from '../content.js'

export default function Features() {
  return (
    <section id="features" className="lp-shell" style={{ padding: '84px 24px', borderTop: '1px solid var(--lp-line)' }}>
      <p className="lp-checkpoint" style={{ marginBottom: 14 }}>{features.checkpoint}</p>
      <h2 className="lp-h2" style={{ marginBottom: 48 }}>{features.heading}</h2>

      <div>
        {features.items.map((item, i) => (
          <div key={item.index}>
            <div
              className="lp-feature-row"
              style={{
                display: 'flex',
                gap: 24,
                padding: '30px 0',
                marginLeft: i % 2 === 1 ? '8%' : 0,
              }}
            >
              <span style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
                color: 'var(--lp-gold)', flexShrink: 0, paddingTop: 2,
              }}>
                {item.index}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 21, color: 'var(--lp-ink)', marginBottom: 8 }}>
                  {item.title}
                </h3>
                <p className="lp-body" style={{ maxWidth: '52ch' }}>{item.body}</p>
                {item.images && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                    {item.images.map((img) => (
                      <img
                        key={img.src}
                        src={img.src}
                        alt={img.alt}
                        width={44}
                        height={44}
                        style={{ borderRadius: 8, border: '1px solid var(--lp-line)', objectFit: 'cover' }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            {i < features.items.length - 1 && <hr className="lp-hairline" />}
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .lp-feature-row { margin-left: 0 !important; }
        }
      `}</style>
    </section>
  )
}
