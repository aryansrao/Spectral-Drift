'use client';

export default function Chat() {
  return (
    <>
      <div id="chatbar">
        <input
          id="chatinput"
          type="text"
          placeholder="Enter to whisper  ·  /tp x y"
          maxLength={80}
        />
        <button id="chatsend">Send</button>
      </div>
      <div id="hint">WASD / Arrows to drift &nbsp;·&nbsp; Enter to whisper &nbsp;·&nbsp; /tp x y</div>
    </>
  );
}
