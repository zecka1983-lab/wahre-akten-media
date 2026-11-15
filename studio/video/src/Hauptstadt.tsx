// «Berlin oder Bonn»: плоская яркая карта, города-персонажи с лицами, наклейки каждую 1–2 с.
import React from 'react';
import {AbsoluteFill, Img, spring, staticFile} from 'remotion';
import map from './mapdata.json';
import timeline from './timeline.json';
import {cam, Emoji, FontFaces, Tag} from './MapStory';

type W8 = {w: string; t: number};
type Sc = {start: number; dur: number; cut: string; words: W8[]};
const SC = (timeline as any).scenes as Sc[];
const C = map.cities as Record<string, number[]>;
const BN = C.Bonn, BE = C.Berlin;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const wordT = (sc: Sc, re: RegExp, fb = 0.3) => (sc.words.find((x) => re.test(x.w))?.t ?? sc.start + fb);

const GER = [769, 820, 1.42];
const WESTV = [560, 860, 2.4];
const BONNV = [BN[0] + 40, BN[1] + 30, 3.6];
const CAMS: Record<string, number[][]> = {
  hhook: [[769, 800, 1.55], GER],
  h49: [GER, WESTV],
  h40: [WESTV],
  h90: [WESTV, GER],
  hvs: [GER],
  hpoll: [GER],
  hdebate: [BONNV, [BN[0] + 40, BN[1] + 30, 4.2]],
  hvote: [BONNV],
  hresult: [GER],
  hirony: [[BN[0] + 40, BN[1] + 30, 4.2]],
  hmove: [GER],
  hstay: [[BN[0] + 40, BN[1] + 30, 3.8]],
  hend: [GER],
};
const camOf = (i: number, t: number) => {
  const s = SC[i], p = CAMS[s.cut] ?? [GER];
  const k = ease(clamp01((t - s.start) / s.dur));
  const a = p[0], b = p[p.length - 1];
  return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), Math.exp(lerp(Math.log(a[2]), Math.log(b[2]), k))];
};
const camAt = (i: number, t: number) => {
  const cur = camOf(i, t);
  if (i === 0) return cur;
  const k = ease(clamp01((t - SC[i].start) / 0.7));
  const prev = camOf(i - 1, SC[i].start);
  return [lerp(prev[0], cur[0], k), lerp(prev[1], cur[1], k), Math.exp(lerp(Math.log(prev[2]), Math.log(cur[2]), k))];
};

// город-персонаж: круглая «голова» с глазами и ртом
type Mood = 'ok' | 'happy' | 'sad' | 'smug' | 'shock';
const City: React.FC<{x: number; y: number; name: string; color: string; mood: Mood; s?: number; pop?: number; t: number; bounce?: boolean; crown?: number}> = ({x, y, name, color, mood, s = 1, pop = 1, t, bounce, crown = 0}) => {
  const r = 70 * s;
  const by = bounce ? -Math.abs(Math.sin(t * 7)) * 22 * s : 0;
  const blink = Math.floor(t * 10) % 37 === 0;
  const eyeY = -r * 0.12;
  const mouth = {
    ok: `M${-r * 0.3} ${r * 0.32} Q0 ${r * 0.42} ${r * 0.3} ${r * 0.32}`,
    happy: `M${-r * 0.38} ${r * 0.22} Q0 ${r * 0.72} ${r * 0.38} ${r * 0.22} Z`,
    sad: `M${-r * 0.3} ${r * 0.48} Q0 ${r * 0.22} ${r * 0.3} ${r * 0.48}`,
    smug: `M${-r * 0.3} ${r * 0.36} Q${r * 0.1} ${r * 0.46} ${r * 0.36} ${r * 0.24}`,
    shock: '',
  }[mood];
  return (
    <div style={{position: 'absolute', left: x - r * 1.6, top: y - r * 1.6 + by, width: r * 3.2, height: r * 3.6, transform: `scale(${pop})`}}>
      {crown > 0 && <Img src={staticFile('map/1f451.webp')} style={{position: 'absolute', left: r * 1.6 - r * 0.6, top: r * 1.6 - r * 1.75, width: r * 1.2, height: r * 1.2, transform: `scale(${crown}) rotate(-10deg)`}} />}
      <svg width={r * 3.2} height={r * 3.2} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <g transform={`translate(${r * 1.6} ${r * 1.6})`}>
          <circle r={r} fill={color} stroke="#1d1d2b" strokeWidth={6 * s} />
          <ellipse cx={-r * 0.3} cy={-r * 0.45} rx={r * 0.25} ry={r * 0.12} fill="white" opacity={0.25} />
          {[-1, 1].map((d) => (
            <g key={d}>
              <ellipse cx={d * r * 0.3} cy={eyeY} rx={r * 0.17} ry={blink ? r * 0.03 : mood === 'shock' ? r * 0.24 : r * 0.21} fill="white" stroke="#1d1d2b" strokeWidth={4 * s} />
              {!blink && <circle cx={d * r * 0.3 + (mood === 'smug' ? r * 0.05 : 0)} cy={eyeY + r * 0.04} r={r * 0.09} fill="#1d1d2b" />}
              {mood === 'smug' && <rect x={d * r * 0.3 - r * 0.2} y={eyeY - r * 0.24} width={r * 0.4} height={r * 0.14} fill={color} />}
              {mood === 'sad' && <path d={`M${d * r * 0.12} ${-r * 0.42} L${d * r * 0.46} ${-r * 0.34}`} stroke="#1d1d2b" strokeWidth={5 * s} strokeLinecap="round" />}
            </g>
          ))}
          {mood === 'shock' ? <ellipse cx={0} cy={r * 0.4} rx={r * 0.14} ry={r * 0.18} fill="#1d1d2b" /> :
            <path d={mouth} stroke="#1d1d2b" strokeWidth={6 * s} fill={mood === 'happy' ? '#7a1f2b' : 'none'} strokeLinecap="round" />}
          {mood === 'sad' && <ellipse cx={r * 0.32} cy={eyeY + r * 0.3 + ((t * 120) % (r * 0.6))} rx={r * 0.07} ry={r * 0.11} fill="#7fd0ff" />}
        </g>
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: r * 2.75, textAlign: 'center'}}>
        <span style={{background: '#111', color: 'white', fontFamily: 'MontserratX', fontWeight: 900, fontSize: 34 * s + 12, padding: '4px 14px', borderRadius: 6}}>{name}</span>
      </div>
    </div>
  );
};

const Bar: React.FC<{x: number; label: string; v: number; max: number; color: string; k: number}> = ({x, label, v, max, color, k}) => {
  const h = 420 * (v / max) * k;
  return (
    <div style={{position: 'absolute', left: x - 90, top: 1240 - h, width: 180, height: h, background: color, border: '6px solid #1d1d2b', borderRadius: 14, boxShadow: '0 10px 20px rgba(0,0,0,0.35)'}}>
      <div style={{position: 'absolute', top: -78, left: -40, right: -40, textAlign: 'center', fontFamily: 'MontserratX', fontWeight: 900, fontSize: 58, color: 'white', WebkitTextStroke: '8px #1d1d2b', paintOrder: 'stroke fill'}}>{Math.round(v * k)}</div>
      <div style={{position: 'absolute', bottom: -64, left: -40, right: -40, textAlign: 'center'}}><span style={{background: '#111', color: 'white', fontFamily: 'MontserratX', fontWeight: 900, fontSize: 50, padding: '4px 16px', borderRadius: 6}}>{label}</span></div>
    </div>
  );
};

export const HauptstadtScene: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const t = frame / fps;
  let i = 0;
  SC.forEach((s, k) => { if (t >= s.start) i = k; });
  const sc = SC[i], cut = sc.cut;
  const [cx, cy, z] = camAt(i, t);
  const S = (p: number[]) => [540 + (p[0] - cx) * z, 900 + (p[1] - cy) * z];
  const at = (tt: number) => spring({frame: frame - Math.round(tt * fps), fps, config: {damping: 11, stiffness: 170}});
  const P0 = at(sc.start - 0.15);
  const idx = (c: string) => SC.findIndex((s) => s.cut === c);
  const split = i >= idx('h49') && i < idx('h90') ? 1 : 0;
  const unify = cut === 'h90' ? ease(clamp01((t - wordT(sc, /Einheit/)) / 1.2)) : i > idx('h90') ? 1 : 0;
  const ddrCol = split || cut === 'h90' ? `rgb(${Math.round(lerp(229, 47, unify))},${Math.round(lerp(57, 191, unify))},${Math.round(lerp(53, 113, unify))})` : '#2fbf71';
  const [bnx, bny] = S(BN), [bex, bey] = S(BE);
  const big = z < 3; // общий план: персонажи крупнее, рядом с городами
  const cs = big ? 1.55 : 1.8;
  let bonnMood: Mood = 'ok', berlinMood: Mood = 'ok';
  if (cut === 'h49' || cut === 'h40') bonnMood = 'happy';
  if (cut === 'hvs') { bonnMood = 'smug'; berlinMood = 'smug'; }
  if (cut === 'hpoll') { bonnMood = 'happy'; berlinMood = 'sad'; }
  if (cut === 'hdebate' || cut === 'hvote') { bonnMood = 'shock'; berlinMood = 'shock'; }
  if (cut === 'hresult') { const k = t > wordT(sc, /320/, 1.5) + 0.6; bonnMood = k ? 'sad' : 'shock'; berlinMood = k ? 'happy' : 'shock'; }
  if (cut === 'hirony') bonnMood = 'sad';
  if (cut === 'hmove') { bonnMood = 'sad'; berlinMood = 'happy'; }
  if (cut === 'hstay') bonnMood = 'happy';
  if (cut === 'hend') { bonnMood = 'smug'; berlinMood = 'happy'; }
  const showBerlin = i !== idx('h49') && i !== idx('h40') && cut !== 'hdebate' && cut !== 'hvote' && cut !== 'hirony' && cut !== 'hstay' && cut !== 'hpoll' && cut !== 'hresult';
  const showBonn = cut !== 'hpoll' && cut !== 'hresult';
  const crownBonn = cut === 'h49' ? at(wordT(sc, /Bonn/, 2)) : cut === 'h40' || cut === 'h90' || cut === 'hvs' ? 1 : 0;
  const crownBerlin = cut === 'hresult' ? at(wordT(sc, /320/, 1.5) + 0.6) : ['hirony', 'hmove', 'hend'].includes(cut) ? 1 : 0;
  // позиции персонажей: на общих планах — около городов, но внутри кадра
  const pos = (p: number[], dx: number) => [Math.min(900, Math.max(180, p[0] + dx)), Math.min(1120, Math.max(cut === 'hend' ? 600 : 470, p[1] - 90))];
  const [bnX, bnY] = pos([bnx, bny], big ? -40 : 0);
  const [beX, beY] = pos([bex, bey], big ? 30 : 0);
  return (
    <AbsoluteFill style={{background: '#0a2a38', overflow: 'hidden'}}>
      <FontFaces />
      <AbsoluteFill style={{transform: cam(cx, cy, z), transformOrigin: '0 0'}}>
        <Img src={staticFile('map/europe.jpg')} style={{position: 'absolute', width: map.W, height: map.H, filter: 'brightness(1.25) saturate(1.15)'}} />
        <svg width={map.W} height={map.H} style={{position: 'absolute', overflow: 'visible', filter: `brightness(${1 + 0.12 * Math.sin(t * 2.4)}) drop-shadow(0 0 ${8 + 6 * Math.sin(t * 2.4)}px rgba(255,255,220,0.55))`}}>
          {unify < 1 ? (<>
            <path d={map.brd} fill="#2fbf71" stroke="white" strokeWidth={2.5 / z} strokeLinejoin="round" />
            <path d={map.ddr} fill={ddrCol} stroke={split ? 'white' : ddrCol} strokeWidth={2.5 / z} strokeLinejoin="round" />
          </>) : (
            <path d={(map as any).germany} fill="#2fbf71" stroke="white" strokeWidth={2.5 / z} strokeLinejoin="round" />
          )}
          {cut === 'hmove' && (() => {
            const k = ease(clamp01((t - sc.start - 0.3) / (sc.dur - 0.8)));
            return <line x1={BN[0]} y1={BN[1]} x2={lerp(BN[0], BE[0], k)} y2={lerp(BN[1], BE[1], k)} stroke="#ffd84d" strokeWidth={7 / z} strokeDasharray={`${14 / z} ${8 / z}`} />;
          })()}
          {[BN, BE].map((p, k) => <circle key={k} cx={p[0]} cy={p[1]} r={7 / z} fill="#ffd84d" stroke="#1d1d2b" strokeWidth={3 / z} />)}
        </svg>
      </AbsoluteFill>

      {showBonn && <City x={bnX} y={bnY} name="BONN" color="#ffb020" mood={bonnMood} s={cs} pop={at(SC[0].start + 0.2)} t={t} crown={crownBonn} bounce={bonnMood === 'happy'} />}
      {showBerlin && <City x={beX} y={beY} name="BERLIN" color="#ff4d6d" mood={berlinMood} s={cs} pop={i === 0 ? at(0.5) : cut === 'h90' ? at(wordT(sc, /Kandidaten/, 2)) : 1} t={t} crown={crownBerlin} bounce={berlinMood === 'happy'} />}

      {cut === 'hhook' && (<>
        <Tag text="BERLIN ODER BONN?" red="BONN?" x={540} y={330} size={64} pop={Math.max(0.9, P0)} />
        <Tag text="18 STIMMEN" red="18" x={540} y={1250} size={70} pop={at(wordT(sc, /18/, 3))} />
      </>)}
      {cut === 'h49' && (<>
        <Tag text="1949" x={540} y={330} size={72} pop={P0} />
        <Tag text="BRD" x={Math.max(bnX + 260, 640)} y={Math.min(bnY + 200, 1100)} size={62} pop={at(sc.start + 0.6)} />
        <Tag text="VORLÄUFIG" red="VORLÄUFIG" x={540} y={1250} size={64} rot={-4} pop={at(wordT(sc, /vorläufig/, 4))} />
      </>)}
      {cut === 'h40' && (() => {
        const y = Math.round(lerp(1949, 1990, ease(clamp01((t - sc.start) / (sc.dur - 0.3)))));
        return (<>
          <Emoji code="1f4c5" x={540} y={330} s={170} pop={P0} />
          <Tag text={`${y}`} x={540} y={1250} size={84} pop={P0} />
        </>);
      })()}
      {cut === 'h90' && (<>
        <Tag text="1990" x={540} y={330} size={72} pop={P0} />
        <Tag text="EINHEIT" red="EINHEIT" x={540} y={1250} size={64} pop={at(wordT(sc, /Einheit/))} />
      </>)}
      {cut === 'hvs' && (<>
        <Tag text="VS" red="VS" x={540} y={760} size={110} pop={at(sc.start + 0.3)} />
        <Emoji code="1f3db-fe0f" x={beX} y={beY - 250} s={170} badge pop={at(wordT(sc, /Hauptstadt/))} />
        <Emoji code="1f3e2" x={bnX} y={bnY - 250} s={170} badge pop={at(wordT(sc, /Ministerien/, 3))} />
      </>)}
      {cut === 'hpoll' && (() => {
        const k = ease(clamp01((t - wordT(sc, /Ergebnis/, 2)) / 1.2));
        return (<>
          <Tag text="UMFRAGE" x={540} y={330} size={66} pop={P0} />
          <Bar x={330} label="BONN" v={343} max={360} color="#ffb020" k={k} />
          <Bar x={750} label="BERLIN" v={267} max={360} color="#ff4d6d" k={k} />
        </>);
      })()}
      {cut === 'hdebate' && (<>
        <Tag text="20. JUNI 1991" red="1991" x={540} y={330} size={60} pop={P0} />
        <Emoji code="23f0" x={250} y={560} s={180} pop={at(wordT(sc, /Stunden/, 2))} />
        <Tag text="12 STUNDEN" red="12" x={540} y={1250} size={64} pop={at(wordT(sc, /Stunden/, 2))} />
        {[[800, 520], [860, 900], [220, 950], [700, 1100]].map(([x, y], k) => <Emoji key={k} code="1f4ac" x={x} y={y} s={170} pop={at(sc.start + 0.8 + k * 0.45)} />)}
      </>)}
      {cut === 'hvote' && (<>
        <Emoji code="1f5f3-fe0f" x={540} y={560} s={240} pop={P0} />
        <Tag text="ABSTIMMUNG" red="ABSTIMMUNG" x={540} y={1250} size={64} pop={P0} />
      </>)}
      {cut === 'hresult' && (() => {
        const k1 = ease(clamp01((t - wordT(sc, /338/, 0.3)) / 1.0));
        const k2 = ease(clamp01((t - wordT(sc, /320/, 1.5)) / 1.0));
        return (<>
          <Bar x={330} label="BERLIN" v={338} max={360} color="#ff4d6d" k={k1} />
          <Bar x={750} label="BONN" v={320} max={360} color="#ffb020" k={k2} />
          {k2 > 0.95 && [[200, 420], [880, 470], [540, 360]].map(([x, y], k) => <Emoji key={k} code="1f389" x={x} y={y} s={170} pop={at(wordT(sc, /320/, 1.5) + 1 + k * 0.15)} />)}
        </>);
      })()}
      {cut === 'hresult' && (() => {
        const k = ease(clamp01((t - wordT(sc, /320/, 1.5) - 0.3) / 1.2));
        if (k <= 0) return null;
        const [ax, ay] = S(BN), [bx2, by2] = S(BE);
        const x = lerp(ax, bx2, k), y = lerp(ay, by2, k) - Math.sin(k * Math.PI) * 300;
        return <Img src={staticFile('map/1f451.webp')} style={{position: 'absolute', left: x - 90, top: y - 90, width: 180, height: 180, transform: `rotate(${k * 720}deg)`, filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))'}} />;
      })()}
      {cut === 'hirony' && (<>
        <Tag text="18 STIMMEN" red="18" x={540} y={330} size={64} pop={P0} />
        <Tag text="VERLOREN IN BONN" red="BONN" x={540} y={1250} size={62} pop={at(wordT(sc, /ausgerechnet/, 2))} />
      </>)}
      {cut === 'hmove' && (() => {
        const k = ease(clamp01((t - sc.start - 0.3) / (sc.dur - 0.8)));
        const [tx, ty] = S([lerp(BN[0], BE[0], k), lerp(BN[1], BE[1], k)]);
        return (<>
          <Tag text="1999" x={540} y={330} size={72} pop={P0} />
          <Img src={staticFile('map/1f69a.webp')} style={{position: 'absolute', left: tx - 70, top: ty - 110, width: 140, height: 140, transform: 'scaleX(-1)', filter: 'drop-shadow(0 8px 8px rgba(0,0,0,0.4))'}} />
          <Emoji code="1f3db-fe0f" x={bex} y={bey - 240} s={170} badge pop={at(wordT(sc, /Reichstag/, 2))} />
        </>);
      })()}
      {cut === 'hstay' && (<>
        <Tag text="BONN BLEIBT" red="BLEIBT" x={540} y={330} size={64} pop={P0} />
        {[[170, 520], [910, 540], [170, 1120], [910, 1120]].map(([x, y], k) => <Emoji key={k} code="1f3e2" x={x} y={y} s={170} badge pop={at(wordT(sc, /Ministerien/, 1.5) + k * 0.2)} />)}
      </>)}
      {cut === 'hend' && (<>
        <Tag text="Berlin oder Bonn?" red="Bonn?" x={540} y={330} size={62} pop={P0} />
        <Tag text="BERLIN" x={300} y={1250} size={62} pop={at(sc.start + sc.dur * 0.55)} />
        <Emoji code="1f44d" x={300} y={1150} s={170} pop={at(sc.start + sc.dur * 0.6)} />
        <Tag text="BONN" x={780} y={1250} size={62} pop={at(sc.start + sc.dur * 0.75)} />
        <Emoji code="1f44d" x={780} y={1150} s={170} pop={at(sc.start + sc.dur * 0.8)} />
      </>)}
    </AbsoluteFill>
  );
};
