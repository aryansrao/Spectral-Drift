'use client';

export default function Minimap() {
  return (
    <div id="mmwrap">
      <canvas id="mm" width={120} height={120}></canvas>
      <div id="mmlabel"></div>
    </div>
  );
}
