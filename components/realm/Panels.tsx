'use client';

import { Key, AlertTriangle, Globe, Skull, Package, Copy, X, RefreshCw } from 'lucide-react';

const OrbDot = ({ color, size = 12 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <circle cx="6" cy="6" r="5" fill={color} />
  </svg>
);

const GhostIconSmall = () => (
  <svg width="12" height="12" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <path fill="rgba(255,255,255,0.6)" d="m508.374 432.802s-46.6-39.038-79.495-275.781c-8.833-87.68-82.856-156.139-172.879-156.139-90.015 0-164.046 68.458-172.879 156.138-32.895 236.743-79.495 275.782-79.495 275.782-15.107 25.181 20.733 28.178 38.699 27.94 35.254-.478 35.254 40.294 70.516 40.294 35.254 0 35.254-35.261 70.508-35.261s37.396 45.343 72.65 45.343 37.389-45.343 72.651-45.343c35.254 0 35.254 35.261 70.508 35.261s35.27-40.772 70.524-40.294c17.959.238 53.798-2.76 38.692-27.94z"/>
    <circle fill="#ff4500" cx="192" cy="225" r="26"/>
    <circle fill="#ff4500" cx="312" cy="225" r="26"/>
  </svg>
);

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
          <button className="tp-btn cancel" id="tpcancel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <X size={11} /> Cancel
          </button>
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
            <button className="cust-rnd" id="cp-rnd" title="Random name">
              <RefreshCw size={11} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </button>
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
            <div className="wp-bal-icon"><OrbDot color="#00ff88" size={18} /></div>
            <div className="wp-bal-count" id="wp-c">0</div>
            <div className="wp-bal-label">Common</div>
            <div className="wp-bal-supply" id="wp-cs">— / 400</div>
          </div>
          <div className="wp-bal-card u">
            <div className="wp-bal-icon"><OrbDot color="#66aaff" size={18} /></div>
            <div className="wp-bal-count" id="wp-u">0</div>
            <div className="wp-bal-label">Uncommon</div>
            <div className="wp-bal-supply" id="wp-us">— / 80</div>
          </div>
          <div className="wp-bal-card r">
            <div className="wp-bal-icon"><OrbDot color="#ffcc00" size={18} /></div>
            <div className="wp-bal-count" id="wp-r">0</div>
            <div className="wp-bal-label">Rare</div>
            <div className="wp-bal-supply" id="wp-rs">— / 20</div>
          </div>
        </div>

        <div className="wp-divider"></div>
        <div className="wp-sec-label">Global Supply · Network State</div>
        <div className="wp-supply-grid" id="wp-supply-grid">
          <div className="wp-stat">
            <div className="wp-stat-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Globe size={10} color="rgba(100,255,180,0.6)" /> In World (Unclaimed)
            </div>
            <div className="wp-stat-row" id="wp-inworld-row"></div>
            <div className="wp-stat-bar">
              <div className="wp-stat-bar-fill" id="wp-inworld-bar" style={{ background: 'rgba(100,255,180,.5)' }}></div>
            </div>
          </div>
          <div className="wp-stat">
            <div className="wp-stat-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <GhostIconSmall /> Held by Spirits
            </div>
            <div className="wp-stat-row" id="wp-held-row"></div>
            <div className="wp-stat-bar">
              <div className="wp-stat-bar-fill" id="wp-held-bar" style={{ background: 'rgba(100,150,255,.5)' }}></div>
            </div>
          </div>
          <div className="wp-stat">
            <div className="wp-stat-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Skull size={10} color="rgba(255,100,100,0.6)" /> Lost (Offline Wallets)
            </div>
            <div className="wp-stat-row" id="wp-lost-row"></div>
            <div className="wp-stat-bar">
              <div className="wp-stat-bar-fill" id="wp-lost-bar" style={{ background: 'rgba(255,100,100,.5)' }}></div>
            </div>
          </div>
          <div className="wp-stat">
            <div className="wp-stat-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Package size={10} color="rgba(255,255,255,0.4)" /> Total Supply
            </div>
            <div className="wp-stat-row">
              <span className="wp-stat-chip c"><OrbDot color="#00ff88" size={8} /> 400</span>
              <span className="wp-stat-chip u"><OrbDot color="#66aaff" size={8} /> 80</span>
              <span className="wp-stat-chip r"><OrbDot color="#ffcc00" size={8} /> 20</span>
              <span className="wp-stat-chip total">= 500</span>
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
            <span className="wp-phrase-toggle-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Key size={10} color="rgba(255,200,0,0.5)" /> Recovery Phrase
            </span>
            <span className="wp-phrase-toggle-icon" id="wp-phrase-icon">▶ Reveal</span>
          </div>
          <div className="wp-phrase-words" id="wp-phrase-words"></div>
          <button className="wp-phrase-copy" id="wp-phrase-copy" style={{ display: 'none', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <Copy size={9} /> Copy 12 words
          </button>
          <div className="wp-phrase-warn" id="wp-phrase-warn" style={{ display: 'none' }}>
            <AlertTriangle size={10} color="rgba(255,140,0,0.6)" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            Never share your recovery phrase. Anyone with these words can claim your orbs.
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
            <div className="wp-xfer-label c" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <OrbDot color="#00ff88" size={8} /> Common
            </div>
            <input className="wp-xfer-input c" id="xfer-c" type="number" min={0} defaultValue={0} autoComplete="off" />
          </div>
          <div className="wp-xfer-field">
            <div className="wp-xfer-label u" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <OrbDot color="#66aaff" size={8} /> Uncommon
            </div>
            <input className="wp-xfer-input u" id="xfer-u" type="number" min={0} defaultValue={0} autoComplete="off" />
          </div>
          <div className="wp-xfer-field">
            <div className="wp-xfer-label r" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <OrbDot color="#ffcc00" size={8} /> Rare
            </div>
            <input className="wp-xfer-input r" id="xfer-r" type="number" min={0} defaultValue={0} autoComplete="off" />
          </div>
        </div>
        <div className="wp-btnrow">
          <button className="wp-btn close" id="wp-close" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <X size={11} /> Close
          </button>
          <button className="wp-btn send" id="wp-send">⟡ Send Transfer</button>
        </div>
        <div className="wp-status" id="wp-status"></div>
      </div>
    </>
  );
}
