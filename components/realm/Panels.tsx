'use client';

export default function Panels() {
  return (
    <>
      {/* Teleport panel */}
      <div id="tppanel">
        <div className="tp-title">Teleport</div>
        <div className="tp-grid">
          <div className="tp-field">
            <label>X coordinate</label>
            <input id="tpx" type="number" placeholder="0" autoComplete="off" />
          </div>
          <div className="tp-field">
            <label>Y coordinate</label>
            <input id="tpy" type="number" placeholder="0" autoComplete="off" />
          </div>
        </div>
        <div className="tp-dist" id="tpdist">—</div>
        <div className="tp-btnrow">
          <button className="tp-btn cancel" id="tpcancel">✕ Cancel</button>
          <button className="tp-btn go" id="tpgo">⟡ Teleport</button>
        </div>
      </div>

      {/* Customize panel */}
      <div id="custpanel">
        <div className="cust-title">Customize Spirit</div>
        <div className="cust-section">
          <label className="cust-label">Spirit name</label>
          <div className="cust-namewrap">
            <input className="cust-input" id="cp-name" type="text" maxLength={18} autoComplete="off" />
            <button className="cust-rnd" id="cp-rnd">⟳</button>
          </div>
        </div>
        <div className="cust-section">
          <label className="cust-label">Ghost glow</label>
          <div className="cust-swgrid" id="cp-glowsw"></div>
        </div>
        <div className="cust-section">
          <label className="cust-label">Eye glow</label>
          <div className="cust-swgrid" id="cp-eyesw"></div>
        </div>
        <button className="cust-save" id="cp-save">Save changes</button>
      </div>

      {/* Wallet panel */}
      <div id="walletpanel">
        <div className="wp-title">Spectral Wallet</div>
        <div className="wp-id">Identity: <code id="wp-idval">—</code></div>

        <div className="wp-bals">
          <div className="wp-bal-card c">
            <div className="wp-bal-icon">🟢</div>
            <div className="wp-bal-count" id="wp-c">0</div>
            <div className="wp-bal-label">Common</div>
            <div className="wp-bal-supply" id="wp-cs">— / 400</div>
          </div>
          <div className="wp-bal-card u">
            <div className="wp-bal-icon">🔵</div>
            <div className="wp-bal-count" id="wp-u">0</div>
            <div className="wp-bal-label">Uncommon</div>
            <div className="wp-bal-supply" id="wp-us">— / 80</div>
          </div>
          <div className="wp-bal-card r">
            <div className="wp-bal-icon">🌟</div>
            <div className="wp-bal-count" id="wp-r">0</div>
            <div className="wp-bal-label">Rare</div>
            <div className="wp-bal-supply" id="wp-rs">— / 20</div>
          </div>
        </div>

        <div className="wp-divider"></div>
        <div className="wp-sec-label">Global Supply · Network State</div>
        <div className="wp-supply-grid" id="wp-supply-grid">
          <div className="wp-stat">
            <div className="wp-stat-label">🌍 In World (Unclaimed)</div>
            <div className="wp-stat-row" id="wp-inworld-row"></div>
            <div className="wp-stat-bar">
              <div className="wp-stat-bar-fill" id="wp-inworld-bar" style={{ background: 'rgba(100,255,180,.5)' }}></div>
            </div>
          </div>
          <div className="wp-stat">
            <div className="wp-stat-label">👻 Held by Spirits</div>
            <div className="wp-stat-row" id="wp-held-row"></div>
            <div className="wp-stat-bar">
              <div className="wp-stat-bar-fill" id="wp-held-bar" style={{ background: 'rgba(100,150,255,.5)' }}></div>
            </div>
          </div>
          <div className="wp-stat">
            <div className="wp-stat-label">💀 Lost (Offline Wallets)</div>
            <div className="wp-stat-row" id="wp-lost-row"></div>
            <div className="wp-stat-bar">
              <div className="wp-stat-bar-fill" id="wp-lost-bar" style={{ background: 'rgba(255,100,100,.5)' }}></div>
            </div>
          </div>
          <div className="wp-stat">
            <div className="wp-stat-label">📦 Total Supply</div>
            <div className="wp-stat-row">
              <span className="wp-stat-chip c">🟢 400</span>
              <span className="wp-stat-chip u">🔵 80</span>
              <span className="wp-stat-chip r">🌟 20</span>
              <span className="wp-stat-chip total">=500</span>
            </div>
            <div className="wp-stat-bar">
              <div className="wp-stat-bar-fill" style={{ width: '100%', background: 'rgba(255,255,255,.18)' }}></div>
            </div>
          </div>
        </div>

        {/* Seed phrase reveal */}
        <div className="wp-divider"></div>
        <div className="wp-phrase-box">
          <div className="wp-phrase-toggle" id="wp-phrase-toggle">
            <span className="wp-phrase-toggle-label">🔑 Recovery Phrase</span>
            <span className="wp-phrase-toggle-icon" id="wp-phrase-icon">▶ Reveal</span>
          </div>
          <div className="wp-phrase-words" id="wp-phrase-words"></div>
          <button className="wp-phrase-copy" id="wp-phrase-copy">⬡ Copy 12 words</button>
          <div className="wp-phrase-warn" id="wp-phrase-warn">
            ⚠ Never share your recovery phrase. Anyone with these words can claim your orbs.
          </div>
        </div>

        <div className="wp-divider"></div>
        <div className="wp-sec-label">Leaderboard · All Spirits</div>
        <div id="wp-lb"></div>

        <div className="wp-divider"></div>
        <div className="wp-sec-label">Transfer Orbs</div>
        <div className="wp-to-label">Recipient</div>
        <select className="wp-select" id="xfer-to">
          <option value="">— select a spirit —</option>
        </select>
        <div className="wp-xfer-row">
          <div className="wp-xfer-field">
            <div className="wp-xfer-label c">🟢 Common</div>
            <input className="wp-xfer-input c" id="xfer-c" type="number" min={0} defaultValue={0} autoComplete="off" />
          </div>
          <div className="wp-xfer-field">
            <div className="wp-xfer-label u">🔵 Uncommon</div>
            <input className="wp-xfer-input u" id="xfer-u" type="number" min={0} defaultValue={0} autoComplete="off" />
          </div>
          <div className="wp-xfer-field">
            <div className="wp-xfer-label r">🌟 Rare</div>
            <input className="wp-xfer-input r" id="xfer-r" type="number" min={0} defaultValue={0} autoComplete="off" />
          </div>
        </div>
        <div className="wp-btnrow">
          <button className="wp-btn close" id="wp-close">✕ Close</button>
          <button className="wp-btn send" id="wp-send">⟡ Send Transfer</button>
        </div>
        <div className="wp-status" id="wp-status"></div>
      </div>
    </>
  );
}
