'use client';

import GameEngine from '../../components/realm/GameEngine';
import Loader from '../../components/realm/Loader';
import HudPill from '../../components/realm/HudPill';
import Panels from '../../components/realm/Panels';
import Minimap from '../../components/realm/Minimap';
import Chat from '../../components/realm/Chat';

export default function RealmPage() {
  return (
    <>
      {/* ── Realm-specific styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Boldonse&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box }
        html, body { width: 100%; height: 100%; overflow: hidden; background: #000 }

        /* ── Loader ── */
        #loader {
          position: fixed; inset: 0; z-index: 9999; background: #000;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 0; transition: opacity .7s ease; overflow-y: auto; padding: 20px 0
        }
        #loader.fade { opacity: 0; pointer-events: none }
        .ld-ghost { width: 72px; filter: drop-shadow(0 0 24px rgba(255,69,0,.5)); animation: ldFloat 2.8s ease-in-out infinite }
        @keyframes ldFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        .ld-title { font-family: "Boldonse", system-ui; font-size: 26px; color: #fff; margin-top: 20px; letter-spacing: .02em }
        .ld-sub { font-family: "Geist Mono", monospace; font-size: 9px; color: rgba(255,255,255,.25); text-transform: uppercase; letter-spacing: .18em; margin-top: 8px }
        .ld-status { font-family: "Geist Mono", monospace; font-size: 8px; color: rgba(255,69,0,.6); text-transform: uppercase; letter-spacing: .14em; margin-top: 26px; animation: ldBlink 1.6s ease-in-out infinite }
        @keyframes ldBlink { 0%,100% { opacity: .4 } 50% { opacity: 1 } }

        /* ── Setup form ── */
        #setup { display: none; flex-direction: column; align-items: center; width: min(380px,90vw); margin-top: 20px }
        #setup.show { display: flex; animation: sfIn .35s ease-out }
        @keyframes sfIn { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        .sf-row { width: 100%; margin-bottom: 14px }
        .sf-label { display: block; font-family: "Geist Mono", monospace; font-size: 8px; text-transform: uppercase; letter-spacing: .12em; color: rgba(255,255,255,.28); margin-bottom: 6px }
        .sf-name { display: flex; gap: 6px }
        .sf-input { flex: 1; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1); border-radius: 10px; padding: 10px 14px; color: #fff; font-family: "Geist Mono", monospace; font-size: 12px; outline: none; transition: border-color .18s }
        .sf-input:focus { border-color: rgba(255,69,0,.4) }
        .sf-input::placeholder { color: rgba(255,255,255,.18) }
        .sf-rnd { background: rgba(255,69,0,.1); border: 1px solid rgba(255,69,0,.22); border-radius: 10px; padding: 0 13px; color: #ff7040; font-family: "Geist Mono", monospace; font-size: 12px; cursor: pointer; transition: background .15s }
        .sf-rnd:hover { background: rgba(255,69,0,.2) }
        .sf-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; margin-bottom: 14px }
        .sf-swlabel { font-family: "Geist Mono", monospace; font-size: 8px; text-transform: uppercase; letter-spacing: .1em; color: rgba(255,255,255,.22); margin-bottom: 7px }
        .swgrid { display: flex; flex-wrap: wrap; gap: 5px }
        .sw { width: 22px; height: 22px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: transform .13s, border-color .13s }
        .sw:hover { transform: scale(1.18) }
        .sw.on { border-color: #fff; transform: scale(1.12) }

        /* ── Seed Phrase display ── */
        .sf-phrase-box { width: 100%; background: rgba(255,204,0,.04); border: 1px solid rgba(255,204,0,.18); border-radius: 14px; padding: 16px; margin-bottom: 12px }
        .sf-phrase-hdr { display: flex; align-items: center; gap: 8px; margin-bottom: 12px }
        .sf-phrase-hdr-icon { font-size: 16px }
        .sf-phrase-title { font-family: "Geist Mono", monospace; font-size: 9px; text-transform: uppercase; letter-spacing: .14em; color: rgba(255,204,0,.75) }
        .sf-phrase-warn { font-family: "Geist Mono", monospace; font-size: 7px; color: rgba(255,160,0,.55); margin-top: 2px; letter-spacing: .06em }
        .sf-words { display: grid; grid-template-columns: repeat(4,1fr); gap: 5px; margin-bottom: 12px }
        .sf-word { background: rgba(0,0,0,.5); border: 1px solid rgba(255,204,0,.14); border-radius: 7px; padding: 6px 4px; text-align: center }
        .sf-word-num { font-family: "Geist Mono", monospace; font-size: 6px; color: rgba(255,204,0,.35); display: block; margin-bottom: 2px }
        .sf-word-val { font-family: "Geist Mono", monospace; font-size: 10px; color: rgba(255,220,80,.9); font-weight: 600; letter-spacing: .04em }
        .sf-copy-phrase { width: 100%; background: rgba(255,204,0,.07); border: 1px solid rgba(255,204,0,.18); border-radius: 8px; padding: 8px; color: rgba(255,204,0,.7); font-family: "Geist Mono", monospace; font-size: 8px; text-transform: uppercase; letter-spacing: .1em; cursor: pointer; transition: background .15s; margin-bottom: 10px }
        .sf-copy-phrase:hover { background: rgba(255,204,0,.14) }
        .sf-confirm { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; user-select: none }
        .sf-confirm input { margin-top: 2px; accent-color: #ffcc00; width: 14px; height: 14px; flex-shrink: 0; cursor: pointer }
        .sf-confirm-text { font-family: "Geist Mono", monospace; font-size: 8px; color: rgba(255,255,255,.38); line-height: 1.5; letter-spacing: .04em }
        .sf-confirm-text strong { color: rgba(255,200,0,.7) }

        /* ── Recovery form ── */
        .sf-recover-link { font-family: "Geist Mono", monospace; font-size: 8px; color: rgba(120,100,255,.55); text-transform: uppercase; letter-spacing: .1em; cursor: pointer; text-decoration: underline; text-align: center; margin-bottom: 8px; transition: color .15s }
        .sf-recover-link:hover { color: rgba(160,130,255,.85) }
        #sf-recover-box { width: 100%; background: rgba(80,50,200,.05); border: 1px solid rgba(100,70,255,.18); border-radius: 14px; padding: 16px; margin-bottom: 14px; display: none }
        #sf-recover-box.show { display: block }
        .sf-recover-title { font-family: "Geist Mono", monospace; font-size: 9px; text-transform: uppercase; letter-spacing: .12em; color: rgba(140,110,255,.7); margin-bottom: 10px }
        #sf-recover-input { width: 100%; background: rgba(255,255,255,.03); border: 1px solid rgba(100,70,255,.2); border-radius: 9px; padding: 10px 13px; color: rgba(200,180,255,.9); font-family: "Geist Mono", monospace; font-size: 11px; outline: none; resize: none; height: 72px; line-height: 1.6; letter-spacing: .05em }
        #sf-recover-input:focus { border-color: rgba(140,100,255,.4) }
        #sf-recover-input::placeholder { color: rgba(255,255,255,.12) }
        .sf-recover-hint { font-family: "Geist Mono", monospace; font-size: 7px; color: rgba(255,255,255,.18); margin-top: 6px; letter-spacing: .06em }
        #sf-recover-btn { width: 100%; margin-top: 10px; padding: 10px; background: rgba(100,70,200,.7); border: none; border-radius: 9px; color: #fff; font-family: "Geist Mono", monospace; font-size: 9px; text-transform: uppercase; letter-spacing: .1em; cursor: pointer; transition: background .15s }
        #sf-recover-btn:hover { background: rgba(130,90,240,.85) }
        #sf-recover-err { font-family: "Geist Mono", monospace; font-size: 8px; color: rgba(255,80,80,.75); margin-top: 6px; min-height: 12px }
        .sf-enter { width: 100%; padding: 12px; background: linear-gradient(135deg,rgba(255,69,0,.9),rgba(255,20,147,.8)); border: none; border-radius: 10px; color: #fff; font-family: "Geist Mono", monospace; font-size: 10px; text-transform: uppercase; letter-spacing: .12em; cursor: pointer; transition: opacity .18s, transform .1s }
        .sf-enter:hover { opacity: .88; transform: translateY(-1px) }
        .sf-enter:disabled { opacity: .3; cursor: not-allowed; transform: none }

        /* ── Recovery profile preview ── */
        #sf-profile-found { display: none; width: 100%; background: rgba(0,200,100,.06); border: 1px solid rgba(0,200,100,.2); border-radius: 12px; padding: 14px 16px; margin-bottom: 12px }
        #sf-profile-found.show { display: block; animation: sfIn .3s ease-out }
        .sf-profile-found-title { font-family: "Geist Mono", monospace; font-size: 8px; text-transform: uppercase; letter-spacing: .12em; color: rgba(0,220,120,.7); margin-bottom: 8px }
        .sf-profile-found-row { font-family: "Geist Mono", monospace; font-size: 10px; color: rgba(255,255,255,.65); letter-spacing: .04em }

        /* ── HUD Pill ── */
        #hudpill { position: fixed; top: 12px; left: 50%; transform: translateX(-50%); z-index: 300; display: flex; align-items: stretch; background: rgba(6,5,14,.88); border: 1px solid rgba(255,255,255,.1); border-radius: 99px; backdrop-filter: blur(18px); overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.5); font-family: "Geist Mono", monospace; font-size: 9px; text-transform: uppercase; letter-spacing: .08em; user-select: none; max-width: calc(100vw - 24px); overflow-x: auto; scrollbar-width: none }
        #hudpill::-webkit-scrollbar { display: none }
        .hp-seg { display: flex; align-items: center; gap: 5px; padding: 0 13px; height: 34px; color: rgba(255,255,255,.42); cursor: default; transition: background .15s, color .15s; white-space: nowrap; flex-shrink: 0 }
        .hp-seg.clickable { cursor: pointer }
        .hp-seg.clickable:hover { background: rgba(255,255,255,.06); color: rgba(255,255,255,.85) }
        .hp-div { width: 1px; background: rgba(255,255,255,.08); flex-shrink: 0; margin: 8px 0 }
        @media(max-width:420px) { #hp-conn-wrap,#hp-div-conn1,#hp-div-conn2 { display: none } }
        @media(max-width:340px) { .hp-seg { padding: 0 9px } }
        .hp-dot { width: 6px; height: 6px; border-radius: 50%; background: #333; flex-shrink: 0; transition: background .4s, box-shadow .4s }
        .hp-dot.ok { background: #00cc66; box-shadow: 0 0 5px #00cc6688 }
        .hp-dot.bad { background: #ff5522; box-shadow: 0 0 5px #ff552255 }
        .hp-dot.pulse { animation: dotPulse 1.4s ease-in-out infinite }
        @keyframes dotPulse { 0%,100% { opacity: .4 } 50% { opacity: 1 } }
        #hp-coord { color: rgba(160,120,255,.75) }
        #hp-coord:hover { color: #c0a0ff !important }
        #hp-mic.live { color: #00cc66 }
        #hp-mic.live .hp-micico { animation: livePulse .9s ease-in-out infinite alternate }
        @keyframes livePulse { from { opacity: .6 } to { opacity: 1 } }
        #hp-mic.muted { color: rgba(255,80,80,.7) }
        #hp-mic.waiting { color: rgba(255,200,0,.7); animation: micWait 1s ease-in-out infinite }
        @keyframes micWait { 0%,100% { opacity: .4 } 50% { opacity: 1 } }
        .wdot-c { color: #00ff88; font-size: 8px }
        .wdot-u { color: #66aaff; font-size: 8px }
        .wdot-r { color: #ffcc00; font-size: 8px }
        #hp-wallet { gap: 4px }
        #hp-wallet span.wnum { font-size: 10px; margin-right: 5px }

        /* ── Toasts ── */
        #orb-toast { position: fixed; top: 54px; right: 16px; z-index: 400; font-family: "Geist Mono", monospace; font-size: 9px; text-transform: uppercase; letter-spacing: .1em; color: rgba(255,255,255,.85); background: rgba(0,0,0,.8); border: 1px solid transparent; border-radius: 14px; padding: 6px 16px; pointer-events: none; opacity: 0; transform: translateY(6px); transition: opacity .25s, transform .25s }
        #orb-toast.show { opacity: 1; transform: translateY(0) }
        #copytip { position: fixed; top: 54px; left: 50%; transform: translateX(-50%); z-index: 400; font-family: "Geist Mono", monospace; font-size: 8px; text-transform: uppercase; letter-spacing: .1em; color: rgba(255,255,255,.7); background: rgba(0,200,80,.15); border: 1px solid rgba(0,200,80,.25); border-radius: 20px; padding: 5px 14px; pointer-events: none; opacity: 0; transition: opacity .2s }
        #copytip.show { opacity: 1 }

        /* ── Panels base ── */
        #scrim { position: fixed; inset: 0; z-index: 7900; background: rgba(0,0,0,.4); opacity: 0; pointer-events: none; transition: opacity .22s }
        #scrim.show { opacity: 1; pointer-events: all }
        #tpflash { position: fixed; inset: 0; z-index: 7000; pointer-events: none; background: radial-gradient(ellipse at center,rgba(100,50,255,.3) 0%,transparent 70%); opacity: 0; transition: opacity .08s }
        #tpflash.pop { opacity: 1 }

        /* ── Teleport panel ── */
        #tppanel { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); z-index: 8000; width: min(360px,90vw); background: rgba(5,3,16,.98); border: 1px solid rgba(120,80,255,.28); border-radius: 16px; padding: 26px 24px 22px; box-shadow: 0 0 60px rgba(80,40,200,.12); backdrop-filter: blur(20px); display: none }
        #tppanel.open { display: block; animation: tpIn .2s ease-out }
        @keyframes tpIn { from { opacity: 0; transform: translate(-50%,-47%) } to { opacity: 1; transform: translate(-50%,-50%) } }
        .tp-title { font-family: "Geist Mono", monospace; font-size: 10px; text-transform: uppercase; letter-spacing: .14em; color: rgba(160,120,255,.65); margin-bottom: 18px; display: flex; align-items: center; gap: 8px }
        .tp-title::before { content: '⟡'; color: #8060ff }
        .tp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px }
        .tp-field label { display: block; font-family: "Geist Mono", monospace; font-size: 8px; text-transform: uppercase; letter-spacing: .1em; color: rgba(255,255,255,.28); margin-bottom: 5px }
        .tp-field input { width: 100%; background: rgba(255,255,255,.04); border: 1px solid rgba(120,80,255,.18); border-radius: 8px; padding: 9px 12px; color: #c8a0ff; font-family: "Geist Mono", monospace; font-size: 13px; outline: none; transition: border-color .18s }
        .tp-field input:focus { border-color: rgba(160,100,255,.5) }
        .tp-field input::placeholder { color: rgba(255,255,255,.14) }
        .tp-dist { font-family: "Geist Mono", monospace; font-size: 8px; color: rgba(255,255,255,.2); text-align: center; margin-bottom: 16px; letter-spacing: .04em; line-height: 1.8 }
        .tp-btnrow { display: flex; gap: 8px }
        .tp-btn { flex: 1; padding: 11px; border: none; border-radius: 9px; font-family: "Geist Mono", monospace; font-size: 10px; text-transform: uppercase; letter-spacing: .08em; cursor: pointer; transition: opacity .18s, transform .1s }
        .tp-btn:hover { opacity: .86; transform: translateY(-1px) }
        .tp-btn.go { background: linear-gradient(135deg,#5020bb,#8030ee); color: #fff }
        .tp-btn.cancel { background: rgba(255,255,255,.05); color: rgba(255,255,255,.38); border: 1px solid rgba(255,255,255,.08) }

        /* ── Customize panel ── */
        #custpanel { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); z-index: 8000; width: min(340px,90vw); background: rgba(5,3,16,.98); border: 1px solid rgba(255,69,0,.18); border-radius: 16px; padding: 26px 24px 22px; box-shadow: 0 0 60px rgba(255,69,0,.06); backdrop-filter: blur(20px); display: none }
        #custpanel.open { display: block; animation: tpIn .2s ease-out }
        .cust-title { font-family: "Geist Mono", monospace; font-size: 10px; text-transform: uppercase; letter-spacing: .14em; color: rgba(255,120,80,.6); margin-bottom: 18px; display: flex; align-items: center; gap: 8px }
        .cust-title::before { content: '✦'; color: #ff4500 }
        .cust-section { margin-bottom: 16px }
        .cust-label { display: block; font-family: "Geist Mono", monospace; font-size: 8px; text-transform: uppercase; letter-spacing: .1em; color: rgba(255,255,255,.28); margin-bottom: 7px }
        .cust-namewrap { display: flex; gap: 6px }
        .cust-input { flex: 1; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09); border-radius: 8px; padding: 9px 12px; color: #fff; font-family: "Geist Mono", monospace; font-size: 11px; outline: none; transition: border-color .18s }
        .cust-input:focus { border-color: rgba(255,69,0,.4) }
        .cust-rnd { background: rgba(255,69,0,.08); border: 1px solid rgba(255,69,0,.18); border-radius: 8px; padding: 0 11px; color: #ff7040; font-family: "Geist Mono", monospace; font-size: 11px; cursor: pointer; transition: background .15s }
        .cust-rnd:hover { background: rgba(255,69,0,.18) }
        .cust-swgrid { display: flex; flex-wrap: wrap; gap: 6px }
        .cust-save { width: 100%; padding: 11px; margin-top: 4px; background: linear-gradient(135deg,rgba(255,69,0,.85),rgba(255,20,147,.7)); border: none; border-radius: 8px; color: #fff; font-family: "Geist Mono", monospace; font-size: 9px; text-transform: uppercase; letter-spacing: .1em; cursor: pointer; transition: opacity .18s }
        .cust-save:hover { opacity: .85 }

        /* ── Wallet panel ── */
        #walletpanel { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); z-index: 8000; width: min(440px,94vw); max-height: 90vh; overflow-y: auto; background: rgba(4,3,14,.99); border: 1px solid rgba(255,204,0,.2); border-radius: 18px; padding: 24px 22px 20px; box-shadow: 0 0 80px rgba(255,180,0,.08); backdrop-filter: blur(24px); display: none; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.08) transparent }
        #walletpanel.open { display: block; animation: tpIn .2s ease-out }
        .wp-title { font-family: "Geist Mono", monospace; font-size: 11px; text-transform: uppercase; letter-spacing: .16em; color: rgba(255,204,0,.7); margin-bottom: 4px; display: flex; align-items: center; gap: 9px }
        .wp-title::before { content: '💎'; font-size: 14px }
        .wp-id { font-family: "Geist Mono", monospace; font-size: 8px; color: rgba(255,255,255,.2); letter-spacing: .05em; margin-bottom: 14px }
        .wp-id code { color: rgba(255,204,0,.5); background: rgba(255,204,0,.06); border-radius: 4px; padding: 2px 7px; font-family: "Geist Mono", monospace; font-size: 8px; letter-spacing: .08em }
        .wp-bals { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 14px }
        .wp-bal-card { background: rgba(255,255,255,.03); border-radius: 12px; padding: 12px 10px; text-align: center; border: 1px solid rgba(255,255,255,.06) }
        .wp-bal-card.c { border-color: rgba(0,255,136,.15) }
        .wp-bal-card.u { border-color: rgba(102,170,255,.15) }
        .wp-bal-card.r { border-color: rgba(255,204,0,.18) }
        .wp-bal-icon { font-size: 18px; margin-bottom: 6px }
        .wp-bal-count { font-family: "Geist Mono", monospace; font-size: 22px; font-weight: 700; color: #fff; line-height: 1; margin-bottom: 4px }
        .wp-bal-label { font-family: "Geist Mono", monospace; font-size: 7px; text-transform: uppercase; letter-spacing: .1em; color: rgba(255,255,255,.25) }
        .wp-bal-supply { font-family: "Geist Mono", monospace; font-size: 7px; color: rgba(255,255,255,.12); margin-top: 3px }
        .wp-divider { height: 1px; background: rgba(255,255,255,.06); margin: 14px 0 }
        .wp-sec-label { font-family: "Geist Mono", monospace; font-size: 8px; text-transform: uppercase; letter-spacing: .14em; color: rgba(255,255,255,.18); margin-bottom: 10px }
        .wp-supply-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 4px }
        .wp-stat { background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.05); border-radius: 10px; padding: 10px 12px }
        .wp-stat-label { font-family: "Geist Mono", monospace; font-size: 7px; text-transform: uppercase; letter-spacing: .1em; color: rgba(255,255,255,.22); margin-bottom: 5px }
        .wp-stat-row { display: flex; gap: 8px; flex-wrap: wrap }
        .wp-stat-chip { font-family: "Geist Mono", monospace; font-size: 9px; letter-spacing: .04em }
        .wp-stat-chip.c { color: rgba(0,255,136,.65) }
        .wp-stat-chip.u { color: rgba(102,170,255,.65) }
        .wp-stat-chip.r { color: rgba(255,204,0,.75) }
        .wp-stat-chip.total { color: rgba(255,255,255,.45) }
        .wp-stat-bar { height: 3px; background: rgba(255,255,255,.06); border-radius: 2px; margin-top: 6px; overflow: hidden }
        .wp-stat-bar-fill { height: 100%; border-radius: 2px; transition: width .5s ease }
        .wp-phrase-box { background: rgba(255,200,0,.03); border: 1px solid rgba(255,200,0,.12); border-radius: 12px; padding: 14px; margin-bottom: 4px }
        .wp-phrase-toggle { display: flex; align-items: center; justify-content: space-between; cursor: pointer; margin-bottom: 0 }
        .wp-phrase-toggle-label { font-family: "Geist Mono", monospace; font-size: 8px; text-transform: uppercase; letter-spacing: .1em; color: rgba(255,200,0,.45) }
        .wp-phrase-toggle-icon { font-size: 10px; color: rgba(255,200,0,.4) }
        .wp-phrase-words { display: none; grid-template-columns: repeat(4,1fr); gap: 4px; margin-top: 10px }
        .wp-phrase-words.show { display: grid }
        .wp-pw { background: rgba(0,0,0,.5); border: 1px solid rgba(255,200,0,.1); border-radius: 6px; padding: 5px 3px; text-align: center }
        .wp-pw-n { font-family: "Geist Mono", monospace; font-size: 6px; color: rgba(255,200,0,.3); display: block }
        .wp-pw-w { font-family: "Geist Mono", monospace; font-size: 9px; color: rgba(255,200,80,.8); letter-spacing: .03em }
        .wp-phrase-copy { width: 100%; margin-top: 8px; background: rgba(255,200,0,.06); border: 1px solid rgba(255,200,0,.15); border-radius: 7px; padding: 7px; color: rgba(255,200,0,.6); font-family: "Geist Mono", monospace; font-size: 7px; text-transform: uppercase; letter-spacing: .1em; cursor: pointer; transition: background .15s; display: none }
        .wp-phrase-copy.show { display: block }
        .wp-phrase-warn { font-family: "Geist Mono", monospace; font-size: 7px; color: rgba(255,140,0,.45); margin-top: 6px; line-height: 1.5; letter-spacing: .04em; display: none }
        .wp-phrase-warn.show { display: block }
        #wp-lb { max-height: 88px; overflow-y: auto; margin-bottom: 4px; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.08) transparent }
        .wp-lrow { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-family: "Geist Mono", monospace; font-size: 8px; padding: 4px 6px; border-radius: 6px; transition: background .15s }
        .wp-lrow.me { background: rgba(255,204,0,.05) }
        .wp-lname { color: rgba(255,255,255,.4); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
        .wp-lname.me { color: rgba(255,204,0,.7) }
        .wp-lbals { display: flex; gap: 8px }
        .lbc { color: rgba(0,255,136,.5) }
        .lbu { color: rgba(102,170,255,.5) }
        .lbr { color: rgba(255,204,0,.6) }
        .wp-to-label { font-family: "Geist Mono", monospace; font-size: 8px; text-transform: uppercase; letter-spacing: .1em; color: rgba(255,255,255,.22); margin-bottom: 5px }
        .wp-select { width: 100%; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09); border-radius: 9px; padding: 9px 12px; color: rgba(255,255,255,.65); font-family: "Geist Mono", monospace; font-size: 10px; outline: none; margin-bottom: 12px; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,.25)'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center }
        .wp-select:focus { border-color: rgba(255,204,0,.3) }
        .wp-xfer-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px }
        .wp-xfer-label { font-family: "Geist Mono", monospace; font-size: 7px; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 5px; display: flex; align-items: center; gap: 4px }
        .wp-xfer-label.c { color: rgba(0,255,136,.55) }
        .wp-xfer-label.u { color: rgba(102,170,255,.55) }
        .wp-xfer-label.r { color: rgba(255,204,0,.6) }
        .wp-xfer-input { width: 100%; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 8px; padding: 9px 8px; color: #fff; font-family: "Geist Mono", monospace; font-size: 14px; outline: none; text-align: center; transition: border-color .18s }
        .wp-xfer-input.c:focus { border-color: rgba(0,255,136,.3) }
        .wp-xfer-input.u:focus { border-color: rgba(102,170,255,.3) }
        .wp-xfer-input.r:focus { border-color: rgba(255,204,0,.3) }
        .wp-btnrow { display: flex; gap: 8px; margin-top: 4px }
        .wp-btn { flex: 1; padding: 11px; border: none; border-radius: 10px; font-family: "Geist Mono", monospace; font-size: 9px; text-transform: uppercase; letter-spacing: .08em; cursor: pointer; transition: opacity .18s, transform .1s }
        .wp-btn:hover { opacity: .83; transform: translateY(-1px) }
        .wp-btn.send { background: linear-gradient(135deg,rgba(255,180,0,.88),rgba(255,80,0,.8)); color: #fff }
        .wp-btn.close { background: rgba(255,255,255,.05); color: rgba(255,255,255,.35); border: 1px solid rgba(255,255,255,.08) }
        .wp-status { font-family: "Geist Mono", monospace; font-size: 8px; text-align: center; color: rgba(255,255,255,.25); margin-top: 9px; min-height: 14px; letter-spacing: .06em }
        .wp-status.ok { color: rgba(0,255,136,.75) }
        .wp-status.err { color: rgba(255,80,80,.75) }
        .wp-status.warn { color: rgba(255,200,0,.75) }

        /* ── Minimap ── */
        #mmwrap { position: fixed; bottom: 78px; right: 16px; z-index: 200; cursor: default }
        #mm { display: block; border-radius: 50%; box-shadow: 0 0 0 1.5px rgba(255,255,255,.12), 0 0 22px rgba(0,0,0,.8) }
        #mm { position: static }
        #mmlabel { font-family: "Geist Mono", monospace; font-size: 7px; text-transform: uppercase; letter-spacing: .1em; color: rgba(255,255,255,.18); text-align: center; padding: 3px 0 0 }

        /* ── Chat ── */
        #chatbar { position: fixed; bottom: 18px; left: 50%; transform: translateX(-50%); z-index: 200; display: flex; gap: 6px; width: min(430px,88vw) }
        #chatinput { flex: 1; background: rgba(0,0,0,.88); border: 1px solid rgba(255,255,255,.09); border-radius: 22px; padding: 10px 17px; color: #fff; font-family: "Geist Mono", monospace; font-size: 11px; outline: none; backdrop-filter: blur(12px); transition: border-color .18s, background .18s }
        #chatinput:focus { border-color: rgba(255,69,0,.4); background: rgba(0,0,0,.95) }
        #chatinput::placeholder { color: rgba(255,255,255,.18) }
        #chatsend { background: rgba(255,69,0,.75); border: none; border-radius: 22px; padding: 10px 15px; color: #fff; font-family: "Geist Mono", monospace; font-size: 10px; cursor: pointer; transition: background .18s }
        #chatsend:hover { background: #ff4500 }
        #hint { position: fixed; bottom: 57px; left: 50%; transform: translateX(-50%); font-family: "Geist Mono", monospace; font-size: 8px; text-transform: uppercase; letter-spacing: .1em; color: rgba(255,255,255,.13); pointer-events: none; white-space: nowrap; z-index: 100 }

        /* ── Ghost labels ── */
        .glabel { text-align: center; pointer-events: none }
        .gname { font-family: "Geist Mono", monospace; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: rgba(255,255,255,.7); white-space: nowrap; text-shadow: 0 1px 8px rgba(0,0,0,1) }
        .gmsg { font-family: "Geist Mono", monospace; font-size: 11px; color: #fff; background: rgba(0,0,0,.84); border: 1px solid rgba(255,255,255,.14); border-radius: 8px; padding: 4px 10px; margin-bottom: 4px; max-width: 190px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: none; backdrop-filter: blur(6px); animation: mpop .18s ease-out }
        @keyframes mpop { from { transform: scale(.85) translateY(4px); opacity: 0 } to { transform: scale(1) translateY(0); opacity: 1 } }
        canvas { position: fixed; top: 0; left: 0 }
        .gspeaking { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #00dc64; margin-right: 5px; vertical-align: middle; animation: speakPulse .55s ease-in-out infinite alternate }
        @keyframes speakPulse { from { transform: scale(.7); opacity: .5 } to { transform: scale(1.2); opacity: 1 } }

        /* ── Ad billboard labels ── */
        .ad-label { text-align: center; pointer-events: none }
        .ad-board { background: rgba(4,2,18,.92); border: 1px solid rgba(255,200,60,.35); border-radius: 10px; padding: 8px 14px 7px; min-width: 110px; max-width: 160px; box-shadow: 0 0 18px rgba(255,180,0,.18), 0 0 40px rgba(255,180,0,.06); backdrop-filter: blur(8px); transition: box-shadow .3s, border-color .3s; cursor: pointer; pointer-events: auto }
        .ad-board.nearby { border-color: rgba(255,200,60,.8); box-shadow: 0 0 28px rgba(255,180,0,.55), 0 0 60px rgba(255,180,0,.2) }
        .ad-tag { font-family: "Geist Mono", monospace; font-size: 6px; text-transform: uppercase; letter-spacing: .18em; color: rgba(255,180,0,.5); margin-bottom: 5px; display: flex; align-items: center; gap: 5px }
        .ad-tag::before { content: ''; display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #ffb800; animation: adPulse 1.4s ease-in-out infinite }
        @keyframes adPulse { 0%,100% { opacity: .4; transform: scale(.8) } 50% { opacity: 1; transform: scale(1.2) } }
        .ad-title { font-family: "Geist Mono", monospace; font-size: 11px; font-weight: 700; color: #fff; letter-spacing: .04em; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
        .ad-desc { font-family: "Geist Mono", monospace; font-size: 8px; color: rgba(255,255,255,.38); letter-spacing: .04em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
        .ad-cta { margin-top: 6px; font-family: "Geist Mono", monospace; font-size: 7px; text-transform: uppercase; letter-spacing: .12em; color: rgba(255,180,0,0); transition: color .25s }
        .ad-board.nearby .ad-cta { color: rgba(255,180,0,.8) }

        /* ── Ad visit toast ── */
        #ad-toast { position: fixed; bottom: 58px; left: 50%; transform: translateX(-50%); z-index: 400; font-family: "Geist Mono", monospace; font-size: 8px; text-transform: uppercase; letter-spacing: .12em; color: rgba(255,210,80,.85); background: rgba(0,0,0,.88); border: 1px solid rgba(255,180,0,.3); border-radius: 14px; padding: 6px 18px; pointer-events: none; opacity: 0; transform: translateX(-50%) translateY(4px); transition: opacity .25s, transform .25s; white-space: nowrap }
        #ad-toast.show { opacity: 1; transform: translateX(-50%) translateY(0) }

        #sync-badge { position: fixed; top: 54px; left: 16px; z-index: 300; font-family: "Geist Mono", monospace; font-size: 7px; text-transform: uppercase; letter-spacing: .1em; padding: 4px 10px; border-radius: 10px; pointer-events: none; opacity: 0; transition: opacity .3s; background: rgba(0,200,100,.12); border: 1px solid rgba(0,200,100,.2); color: rgba(0,255,120,.7) }
        #sync-badge.show { opacity: 1 }

        /* ── Claim sync-lock banner ── */
        #sync-lock-banner { position: fixed; top: 54px; left: 50%; transform: translateX(-50%); z-index: 350; font-family: "Geist Mono", monospace; font-size: 8px; text-transform: uppercase; letter-spacing: .12em; padding: 6px 18px; border-radius: 12px; pointer-events: none; opacity: 0; transition: opacity .4s; background: rgba(120,80,255,.16); border: 1px solid rgba(140,100,255,.3); color: rgba(180,150,255,.85); white-space: nowrap }
        #sync-lock-banner.show { opacity: 1 }
      `}</style>

      <Loader />

      <div id="scrim"></div>
      <div id="tpflash"></div>
      <div id="orb-toast"></div>
      <div id="copytip">✓ Link copied</div>
      <div id="sync-badge">⟳ Ledger synced</div>
      <div id="ad-toast"></div>
      <div id="sync-lock-banner">⟳ Syncing your orbs from the network…</div>

      <HudPill />
      <Panels />
      <Minimap />
      <Chat />

      {/* GameEngine runs all the Three.js / P2P / crypto logic */}
      <GameEngine />
    </>
  );
}
