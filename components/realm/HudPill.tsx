'use client';

import { Mic } from 'lucide-react';

const GhostIcon = () => (
  <svg width="14" height="14" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <path fill="rgba(255,255,255,0.7)" d="m508.374 432.802s-46.6-39.038-79.495-275.781c-8.833-87.68-82.856-156.139-172.879-156.139-90.015 0-164.046 68.458-172.879 156.138-32.895 236.743-79.495 275.782-79.495 275.782-15.107 25.181 20.733 28.178 38.699 27.94 35.254-.478 35.254 40.294 70.516 40.294 35.254 0 35.254-35.261 70.508-35.261s37.396 45.343 72.65 45.343 37.389-45.343 72.651-45.343c35.254 0 35.254 35.261 70.508 35.261s35.27-40.772 70.524-40.294c17.959.238 53.798-2.76 38.692-27.94z"/>
    <circle fill="#ff4500" cx="192" cy="225" r="26"/>
    <circle fill="#ff4500" cx="312" cy="225" r="26"/>
  </svg>
);

export default function HudPill() {
  return (
    <div id="hudpill">
      <div className="hp-seg" id="hp-count">
        <GhostIcon /> <span id="hp-n">1</span>
      </div>
      <div className="hp-div" id="hp-div-conn1"></div>
      <div className="hp-seg clickable" id="hp-conn-wrap">
        <span className="hp-dot bad pulse" id="hp-dot"></span>
        <span id="hp-connlabel">Searching…</span>
      </div>
      <div className="hp-div" id="hp-div-conn2"></div>
      <div className="hp-seg clickable" id="hp-coord" title="Teleport">
        ⟡ <span id="hp-xyz">X 0 Y 0</span>
      </div>
      <div className="hp-div"></div>
      <div className="hp-seg clickable" id="hp-mic">
        <span className="hp-micico"><Mic size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /></span>
        <span id="hp-miclabel">Voice</span>
      </div>
      <div className="hp-div"></div>
      <div className="hp-seg clickable" id="hp-wallet" title="Open wallet">
        <span className="wdot-c">●</span><span className="wnum" id="w-c">0</span>
        <span className="wdot-u">●</span><span className="wnum" id="w-u">0</span>
        <span className="wdot-r">●</span><span className="wnum" id="w-r">0</span>
      </div>
      <div className="hp-div"></div>
      <div className="hp-seg clickable" id="hp-cust">✦ Me</div>
    </div>
  );
}
