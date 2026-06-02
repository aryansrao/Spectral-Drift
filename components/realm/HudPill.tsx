'use client';

export default function HudPill() {
  return (
    <div id="hudpill">
      <div className="hp-seg" id="hp-count">
        👻 <span id="hp-n">1</span>
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
        <span className="hp-micico">🎙</span>
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
