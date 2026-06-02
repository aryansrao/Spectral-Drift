'use client';

export default function Loader() {
  return (
    <div id="loader">
      <svg className="ld-ghost" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <path
          fill="rgba(255,255,255,.9)"
          d="m508.374 432.802s-46.6-39.038-79.495-275.781c-8.833-87.68-82.856-156.139-172.879-156.139-90.015 0-164.046 68.458-172.879 156.138-32.895 236.743-79.495 275.782-79.495 275.782-15.107 25.181 20.733 28.178 38.699 27.94 35.254-.478 35.254 40.294 70.516 40.294 35.254 0 35.254-35.261 70.508-35.261s37.396 45.343 72.65 45.343 37.389-45.343 72.651-45.343c35.254 0 35.254 35.261 70.508 35.261s35.27-40.772 70.524-40.294c17.959.238 53.798-2.76 38.692-27.94z"
        />
        <circle fill="#ff4500" cx="192" cy="225" r="26" />
        <circle fill="#ff4500" cx="312" cy="225" r="26" />
      </svg>
      <div className="ld-title">Spectral Drift</div>
      <div className="ld-sub">Open world · P2P · Cryptographic orbs</div>
      <div className="ld-status" id="ldstatus">Summoning the void…</div>

      <div id="setup">
        {/* Seed phrase display (new users) */}
        <div id="sf-phrase-section" style={{ width: '100%', marginBottom: '14px', display: 'none' }}>
          <div className="sf-phrase-box">
            <div className="sf-phrase-hdr">
              <span className="sf-phrase-hdr-icon">🔑</span>
              <div>
                <div className="sf-phrase-title">Your Recovery Phrase</div>
                <div className="sf-phrase-warn">
                  ⚠ Write these 12 words down. They are the only way to recover your orbs on another device.
                </div>
              </div>
            </div>
            <div className="sf-words" id="sf-words-grid"></div>
            <button className="sf-copy-phrase" id="sf-copy-phrase">⬡ Copy all 12 words</button>
            <label className="sf-confirm" id="sf-confirm-label">
              <input
                type="checkbox"
                id="sf-written"
                onChange={e => {
                  const btn = document.getElementById('sf-enter') as HTMLButtonElement | null;
                  if (btn) btn.disabled = !(e.target as HTMLInputElement).checked;
                }}
              />
              <span className="sf-confirm-text">
                I have <strong>written down</strong> or safely stored my 12-word recovery phrase.
                I understand that losing it means losing my orbs permanently.
              </span>
            </label>
          </div>
        </div>

        {/* Recovery form */}
        <div className="sf-recover-link" id="sf-recover-toggle">
          Already have a recovery phrase? Restore identity →
        </div>
        <div id="sf-recover-box">
          <div className="sf-recover-title">🔑 Restore from Seed Phrase</div>
          <textarea
            id="sf-recover-input"
            placeholder="Enter your 12 words separated by spaces…"
            autoComplete="off"
            spellCheck={false}
          />
          <div className="sf-recover-hint">Words must match exactly. Order matters.</div>
          <button id="sf-recover-btn">Restore Identity</button>
          <div id="sf-recover-err"></div>
        </div>

        {/* Profile found after recovery */}
        <div id="sf-profile-found">
          <div className="sf-profile-found-title">✓ Identity Found — Profile Restored</div>
          <div className="sf-profile-found-row" id="sf-profile-found-row"></div>
        </div>

        {/* Name & colors */}
        <div className="sf-row">
          <label className="sf-label">Name your spirit</label>
          <div className="sf-name">
            <input
              className="sf-input"
              id="sf-name"
              type="text"
              maxLength={18}
              placeholder="Leave blank for random…"
              autoComplete="off"
            />
            <button className="sf-rnd" id="sf-rnd">⟳</button>
          </div>
        </div>
        <div className="sf-cols">
          <div>
            <div className="sf-swlabel">Ghost glow</div>
            <div className="swgrid" id="sf-glowsw"></div>
          </div>
          <div>
            <div className="sf-swlabel">Eye glow</div>
            <div className="swgrid" id="sf-eyesw"></div>
          </div>
        </div>
        <button className="sf-enter" id="sf-enter">✦ Enter the Void</button>
      </div>
    </div>
  );
}
