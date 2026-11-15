// «Warum verlor Napoleon in Russland?» — маршрут армии (как у Минара): толщина ленты = размер армии.
import React from 'react';
import {AbsoluteFill, Img, random, spring, staticFile} from 'remotion';
import geo from './eurdata.json';
import timeline from './timeline.json';
import {cam, Emoji, FontFaces, Tag} from './MapStory';
import {Char, Horse, Kremlin, Pose} from './Chars';

type W8 = {w: string; t: number};
type Sc = {start: number; dur: number; cut: string; words: W8[]};
const SC = (timeline as any).scenes as Sc[];
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
const c01 = (x: number) => Math.min(1, Math.max(0, x));
const wordT = (sc: Sc, re: RegExp, fb = 0.3) => (sc.words.find((x) => re.test(x.w))?.t ?? sc.start + fb);
const P = (lon: number, lat: number) => [(lon - geo.LON0) * geo.C * geo.K, (geo.LATT - lat) * geo.K];
const PARIS = P(2.35, 48.86), KOWNO = P(23.9, 54.9), VILNA = P(25.28, 54.69), VITEBSK = P(30.2, 55.19), SMOL = P(32.05, 54.78), BORO = P(35.82, 55.52), MOSK = P(37.62, 55.75), BERE = P(28.5, 54.23);
const ADV = [KOWNO, VILNA, VITEBSK, SMOL, BORO, MOSK];
const RET = [MOSK, BORO, SMOL, BERE, VILNA, KOWNO];
const lens = (pts: number[][]) => { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return L; };
const along = (pts: number[][], f: number) => {
  const L = lens(pts), d = c01(f) * L[L.length - 1];
  let i = 1; while (i < pts.length - 1 && L[i] < d) i++;
  const k = (d - L[i - 1]) / (L[i] - L[i - 1] || 1);
  return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)];
};
const sub = (pts: number[][], f: number) => {
  const L = lens(pts), d = c01(f) * L[L.length - 1], out = [pts[0]];
  for (let i = 1; i < pts.length; i++) { if (L[i] <= d) out.push(pts[i]); else { out.push(along(pts, f)); break; } }
  return out.map((p) => p.join(',')).join(' ');
};
const MID = [(KOWNO[0] + MOSK[0]) / 2, (KOWNO[1] + MOSK[1]) / 2 + 20];
const OVER = [MID[0], MID[1], 1.75];
const CAMS: Record<string, number[][]> = {
  nhook: [[MOSK[0] - 40, MOSK[1], 3.2], OVER], nstart: [[(PARIS[0] + MOSK[0]) / 2, (PARIS[1] + MOSK[1]) / 2 + 60, 1.6]],
  ncross: [[KOWNO[0] + 40, KOWNO[1], 3.2]], nretreat: [[(KOWNO[0] + SMOL[0]) / 2, KOWNO[1], 2.4]], nhunger: [[(SMOL[0] + BORO[0]) / 2, SMOL[1], 2.8]],
  nborodino: [[BORO[0], BORO[1], 3.6]], nmoscow: [[MOSK[0] - 20, MOSK[1], 3.6]], nfire: [[MOSK[0] - 20, MOSK[1], 4.2]], nwait: [[MOSK[0] - 20, MOSK[1], 3.6]],
  nwinter: [[(MOSK[0] + SMOL[0]) / 2, SMOL[1], 2.6]], nberezina: [[BERE[0] + 20, BERE[1] + 80, 3.4]], nend: [[MID[0], MID[1] + 160, 1.75]],
};
const camOf = (i: number, t: number) => { const s = SC[i], p = CAMS[s.cut] ?? [OVER]; const k = ease(c01((t - s.start) / s.dur)); const a = p[0], b = p[p.length - 1]; return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), Math.exp(lerp(Math.log(a[2]), Math.log(b[2]), k))]; };
const camAt = (i: number, t: number) => { const cur = camOf(i, t); if (i === 0) return cur; const k = ease(c01((t - SC[i].start) / 0.8)); const prev = camOf(i - 1, SC[i].start); return [lerp(prev[0], cur[0], k), lerp(prev[1], cur[1], k), Math.exp(lerp(Math.log(prev[2]), Math.log(cur[2]), k))]; };

// персонаж-«клубок»: голова-шар с шляпой (двууголка Наполеона / ушанка России)
type Mood = 'ok' | 'happy' | 'sad' | 'shock' | 'cold' | 'angry';
const Blob: React.FC<{x: number; y: number; color: string; hat: 'bicorne' | 'ushanka'; mood: Mood; name: string; t: number; s?: number; crown?: boolean}> = ({x, y, color, hat, mood, name, t, s = 1, crown}) => {
  const r = 78 * s; const shiver = mood === 'cold' ? Math.sin(t * 50) * 3 : 0; const blink = Math.floor(t * 10) % 41 === 0;
  return (
    <div style={{position: 'absolute', left: x - r * 1.8 + shiver, top: y - r * 2.2, width: r * 3.6, height: r * 3.9}}>
      <svg width={r * 3.6} height={r * 3.2} style={{overflow: 'visible'}}>
        <g transform={`translate(${r * 1.8} ${r * 1.9})`}>
          <circle r={r} fill={color} stroke="#1d1d2b" strokeWidth={6 * s} />
          {hat === 'bicorne' ? <path d={`M${-r * 1.15} ${-r * 0.55} Q0 ${-r * 1.75} ${r * 1.15} ${-r * 0.55} Q0 ${-r * 0.8} ${-r * 1.15} ${-r * 0.55} Z`} fill="#1d1d2b" /> :
            <><path d={`M${-r * 0.95} ${-r * 0.35} Q${-r} ${-r * 1.35} 0 ${-r * 1.35} Q${r} ${-r * 1.35} ${r * 0.95} ${-r * 0.35} Z`} fill="#6b4a2f" stroke="#1d1d2b" strokeWidth={5 * s} /><rect x={-r} y={-r * 0.55} width={r * 2} height={r * 0.3} rx={r * 0.12} fill="#8a6a48" stroke="#1d1d2b" strokeWidth={4 * s} /></>}
          {hat === 'bicorne' && <circle cx={0} cy={-r * 0.95} r={r * 0.12} fill="#e53935" stroke="white" strokeWidth={3 * s} />}
          {[-1, 1].map((d) => <g key={d}>
            <ellipse cx={d * r * 0.32} cy={-r * 0.02} rx={r * 0.17} ry={blink ? r * 0.03 : mood === 'shock' ? r * 0.25 : r * 0.21} fill="white" stroke="#1d1d2b" strokeWidth={4 * s} />
            {!blink && <circle cx={d * r * 0.32} cy={r * 0.02} r={r * 0.09} fill="#1d1d2b" />}
            {(mood === 'sad' || mood === 'cold') && <path d={`M${d * r * 0.12} ${-r * 0.3} L${d * r * 0.48} ${-r * 0.22}`} stroke="#1d1d2b" strokeWidth={5 * s} strokeLinecap="round" />}
            {mood === 'angry' && <path d={`M${d * r * 0.12} ${-r * 0.22} L${d * r * 0.5} ${-r * 0.34}`} stroke="#1d1d2b" strokeWidth={5 * s} strokeLinecap="round" />}
          </g>)}
          {mood === 'shock' ? <ellipse cx={0} cy={r * 0.45} rx={r * 0.13} ry={r * 0.17} fill="#1d1d2b" /> :
            mood === 'cold' ? <path d={`M${-r * 0.32} ${r * 0.45} l${r * 0.16} ${-r * 0.08} l${r * 0.16} ${r * 0.08} l${r * 0.16} ${-r * 0.08} l${r * 0.16} ${r * 0.08}`} stroke="#1d1d2b" strokeWidth={5 * s} fill="none" /> :
            <path d={mood === 'happy' ? `M${-r * 0.36} ${r * 0.3} Q0 ${r * 0.75} ${r * 0.36} ${r * 0.3} Z` : mood === 'sad' || mood === 'angry' ? `M${-r * 0.3} ${r * 0.55} Q0 ${r * 0.3} ${r * 0.3} ${r * 0.55}` : `M${-r * 0.3} ${r * 0.42} Q0 ${r * 0.52} ${r * 0.3} ${r * 0.42}`} stroke="#1d1d2b" strokeWidth={6 * s} fill={mood === 'happy' ? '#7a1f2b' : 'none'} strokeLinecap="round" />}
          {mood === 'cold' && <rect x={-r} y={-r} width={r * 2} height={r * 2} rx={r} fill="#9fd8ff" opacity={0.25} />}
        </g>
      </svg>
      {crown && <Img src={staticFile('map/1f451.webp')} style={{position: 'absolute', left: r * 1.8 - r * 0.55, top: r * 1.9 - r * 2.25, width: r * 1.1, height: r * 1.1}} />}
      <div style={{position: 'absolute', left: 0, right: 0, top: r * 3.0, textAlign: 'center'}}><span style={{background: '#111', color: 'white', fontFamily: 'MontserratX', fontWeight: 900, fontSize: 34 * s + 8, padding: '4px 14px', borderRadius: 6}}>{name}</span></div>
    </div>
  );
};

// размер армии (тыс.) и положение по сценам
const ARMY: Record<string, [number, number]> = {nhook: [0, 0], nstart: [0, 0], ncross: [420, 420], nretreat: [420, 330], nhunger: [330, 240], nborodino: [240, 130], nmoscow: [120, 100], nfire: [100, 100], nwait: [100, 100], nwinter: [100, 55], nberezina: [55, 25], nend: [25, 15]};
const ADVF: Record<string, [number, number]> = {ncross: [0, 0.05], nretreat: [0.05, 0.55], nhunger: [0.55, 0.8], nborodino: [0.8, 0.85], nmoscow: [0.85, 1], nfire: [1, 1], nwait: [1, 1], nwinter: [1, 1], nberezina: [1, 1], nend: [1, 1]};
const RETF: Record<string, [number, number]> = {nwinter: [0, 0.45], nberezina: [0.45, 0.7], nend: [0.7, 1]};

export const NapoleonScene: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const t = frame / fps; let i = 0; SC.forEach((s, k) => { if (t >= s.start) i = k; });
  const sc = SC[i], cut = sc.cut, L = t - sc.start, K = ease(c01(L / sc.dur));
  const [cx0, cy0, z] = camAt(i, t);
  const cx = Math.min(geo.W - 540 / z, Math.max(540 / z, cx0)), cy = Math.min(geo.H - 1020 / z, Math.max(900 / z, cy0));
  const S = (p: number[]) => [540 + (p[0] - cx) * z, 900 + (p[1] - cy) * z];
  const at = (tt: number) => spring({frame: frame - Math.round(tt * fps), fps, config: {damping: 11, stiffness: 170}});
  const P0 = at(sc.start - 0.15);
  const a = ARMY[cut] ?? [0, 0], size = lerp(a[0], a[1], K);
  const af = ADVF[cut], rf = RETF[cut];
  const advF = af ? lerp(af[0], af[1], K) : 0, retF = rf ? lerp(rf[0], rf[1], K) : 0;
  const head = rf ? along(RET, retF) : af ? along(ADV, advF) : PARIS;
  const [hx, hy] = S(head);
  const bandW = (w: number) => Math.max(10, w / 420 * 90);
  const winter = cut === 'nwinter' || cut === 'nberezina' || cut === 'nend' ? (cut === 'nwinter' ? c01(L / 1.5) : 1) : 0;
  let napMood: Mood = 'ok';
  if (cut === 'nhook') napMood = L > 2.5 ? 'sad' : 'happy';
  if (cut === 'nstart' || cut === 'ncross') napMood = 'happy';
  if (cut === 'nretreat') napMood = 'angry';
  if (cut === 'nhunger' || cut === 'nwait' || cut === 'nend') napMood = 'sad';
  if (cut === 'nborodino' || cut === 'nfire' || cut === 'nberezina') napMood = 'shock';
  if (cut === 'nmoscow') napMood = 'happy';
  if (cut === 'nwinter') napMood = 'cold';
  const napPose: Pose = cut === 'nhook' ? (L > 2.5 ? 'cold' : 'cheer') : cut === 'nstart' ? 'hand' : cut === 'ncross' || cut === 'nretreat' || cut === 'nhunger' || cut === 'nwinter' ? 'walk' : cut === 'nborodino' ? 'point' : cut === 'nmoscow' ? 'cheer' : cut === 'nwait' ? 'hand' : cut === 'nfire' || cut === 'nberezina' ? 'fist' : 'stand';
  const rusPose: Pose = cut === 'nstart' ? 'fist' : cut === 'nretreat' ? 'walk' : cut === 'nborodino' ? 'fist' : 'stand';
  const rusPos = cut === 'nretreat' ? along(ADV, Math.min(1, advF + 0.28)) : cut === 'nhunger' ? along(ADV, Math.min(1, advF + 0.15)) : cut === 'nborodino' ? along(ADV, 0.9) : cut === 'nstart' ? MOSK : null;
  const napXY = cut === 'nstart' ? S(PARIS) : cut === 'nhook' ? [540, 960] : [hx, hy];
  const clampXY = (p: number[]) => [['nmoscow', 'nfire', 'nwait'].includes(cut) ? 300 : Math.min(rusPos ? 440 : 680, Math.max(['nretreat', 'nhunger', 'ncross'].includes(cut) ? 420 : 320, p[0])), 660];
  const [nx, ny] = clampXY(napXY);
  const fires = cut === 'nretreat' ? [0, 1, 2, 3, 4].filter((k) => L > 0.6 + k * 0.5) : [];
  return (
    <AbsoluteFill style={{background: '#12344e', overflow: 'hidden'}}>
      <FontFaces />
      <AbsoluteFill style={{transform: cam(cx, cy, z), transformOrigin: '0 0'}}>
        <Img src={staticFile('map/eur.jpg')} style={{position: 'absolute', width: geo.W, height: geo.H, filter: `brightness(${1.1 + winter * 0.25}) saturate(${1 - winter * 0.6})`}} />
        <svg width={geo.W} height={geo.H} style={{position: 'absolute', overflow: 'visible'}}>
          <path d={(geo as any).rus} fill="#2e9e5b" fillOpacity={0.42 + 0.1 * Math.sin(t * 2.4)} stroke="#ffffff" strokeWidth={3.2 / z} strokeLinejoin="round" />
          <path d={(geo as any).fra} fill="#2b59c3" fillOpacity={0.5} stroke="#ffffff" strokeWidth={3.2 / z} strokeLinejoin="round" />
          {/* Березина */}
          {(cut === 'nberezina') && <path d={`M${BERE[0] + 6} ${BERE[1] - 120} C${BERE[0] - 14} ${BERE[1] - 50} ${BERE[0] + 16} ${BERE[1] + 30} ${BERE[0] - 4} ${BERE[1] + 120}`} stroke="#3aa0ff" strokeWidth={22 / z} fill="none" strokeLinecap="round" />}
          {/* лента наступления */}
          {af && <polyline points={sub(ADV, advF)} fill="none" stroke="#e8b04a" strokeOpacity={rf ? 0.55 : 0.95} strokeWidth={bandW(rf ? 100 : size) / z} strokeLinejoin="round" strokeLinecap="round" style={{filter: `drop-shadow(0 0 ${4 + 3 * Math.sin(t * 2.4)}px rgba(255,220,120,0.9))`}} />}
          {/* лента отступления */}
          {rf && <polyline points={sub(RET, retF)} fill="none" stroke="#3a1010" style={{filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.9))'}} strokeWidth={bandW(size) / z} strokeLinejoin="round" strokeLinecap="round" />}
          {[KOWNO, MOSK].map((p, k) => <circle key={k} cx={p[0]} cy={p[1]} r={6 / z} fill="#ffd84d" stroke="#1d1d2b" strokeWidth={2 / z} />)}
        </svg>
      </AbsoluteFill>
      {/* снег */}
      {winter > 0 && <AbsoluteFill style={{background: `rgba(200,230,255,${0.18 * winter})`}}>
        {Array.from({length: 70}).map((_, k) => { const x = random(`sx${k}`) * 1080 + Math.sin(t + k) * 30; const y = ((random(`sy${k}`) * 1920 + t * (90 + random(`sv${k}`) * 120)) % 1920); return <div key={k} style={{position: 'absolute', left: x, top: y, width: 10, height: 10, borderRadius: 5, background: 'white', opacity: 0.85 * winter}} />; })}
      </AbsoluteFill>}
      {fires.map((k) => <Emoji key={k} code="1f525" x={150 + k * 195} y={490} s={110} pop={at(sc.start + 0.6 + k * 0.5)} />)}
      {rusPos && (() => { const [rx, ry] = cut === 'nstart' ? [790, 660] : [Math.min(800, nx + 340), 660]; return <Char x={rx} y={ry + 160} kind="russian" mood={cut === 'nstart' ? 'angry' : 'happy'} pose={rusPose} name="RUSSLAND" t={t} s={1.25} dir={-1} />; })()}
      {af && !rf && ['ncross', 'nretreat', 'nhunger', 'nmoscow'].includes(cut) && Array.from({length: Math.max(1, Math.round(size / 70))}).map((_, k) => (
        <Char key={`s${k}`} x={Math.max(110, nx - 240) - (k % 3) * 80 + (nx - 240 < 110 ? 0 : 0)} y={ny + 330 + Math.floor(k / 3) * 60} kind="fsoldier" mood={cut === 'nhunger' ? 'sad' : 'ok'} pose="walk" t={t + k * 0.3} s={0.7} />))}
      {rf && ['nwinter', 'nberezina'].includes(cut) && Array.from({length: Math.max(1, Math.round(size / 25))}).map((_, k) => (
        <Char key={`r${k}`} x={Math.min(970, nx + 240) + (k % 2) * 80 - (nx + 320 > 970 ? 80 : 0)} y={ny + 330 + Math.floor(k / 2) * 60} kind="fsoldier" mood="cold" pose="cold" t={t + k * 0.3} s={0.7} dir={-1} />))}
      {cut !== 'nend' && <Char x={nx} y={ny + 340} kind="napoleon" mood={napMood} pose={napPose} name="NAPOLEON" t={t} s={1.35} />}

      {(cut === 'nmoscow' || cut === 'nfire' || cut === 'nwait') && <Kremlin x={cut === 'nmoscow' ? 800 : 820} y={1060} s={0.85} t={t} burn={cut === 'nfire' ? c01((t - wordT(sc, /brennt/, 1.5)) / 1.2) : cut === 'nwait' ? 0.6 : 0} />}
      {cut === 'ncross' && [0, 1].map((k) => <Horse key={k} x={lerp(-250, 260 + k * 330, ease(c01((L - 0.6 - k * 0.5) / 2.5)))} y={1400} s={0.95} t={t + k} rider="french" />)}
      {cut === 'nretreat' && <Horse x={lerp(1300, 820, ease(c01((L - 1) / 2)))} y={1400} s={0.95} t={t} dir={-1} rider="cossack" state={L > 3 ? 'stand' : 'run'} />}
      {cut === 'nborodino' && [0, 1].map((k) => <Horse key={k} x={lerp(k ? 1300 : -220, k ? 800 : 280, ease(c01((L - 0.5) / 2)))} y={1400} s={0.95} t={t + k} dir={k ? -1 : 1} rider={k ? 'cossack' : 'french'} state={L > 2.6 ? 'stand' : 'run'} />)}
      {cut === 'nwinter' && <Horse x={820} y={1400} s={0.9} t={t} state={t > wordT(sc, /Pferde/, 2.5) ? 'down' : 'stand'} color="#7a6a5a" />}
      {cut === 'nhook' && (<>
        <Tag text="WARUM VERLOR NAPOLEON?" red="NAPOLEON?" x={540} y={330} size={56} pop={Math.max(0.9, P0)} />
        {[[170, 490], [910, 490]].map(([x, y], k) => <Emoji key={k} code="1f525" x={x} y={y} s={150} pop={at(sc.start + 2.5 + k * 0.2)} />)}
      </>)}
      {cut === 'nstart' && <Tag text="1812" x={540} y={330} size={72} pop={P0} />}
      {cut === 'ncross' && (() => { const n = Math.round(400000 * ease(c01((t - wordT(sc, /vierhunderttausend/, 1.5)) / 1.5))); return <Tag text={`${n.toLocaleString('de-DE')}+ SOLDATEN`} red="SOLDATEN" x={540} y={330} size={58} pop={at(wordT(sc, /vierhunderttausend/, 1.5))} />; })()}
      {cut === 'nretreat' && <Tag text="VERBRANNTE ERDE" red="ERDE" x={540} y={330} size={60} pop={at(wordT(sc, /verbrennen/, 2))} />}
      {cut === 'nhunger' && (<>
        <Tag text="HUNGER" red="HUNGER" x={540} y={330} size={66} pop={P0} />
        <Emoji code="1f35e" x={540} y={490} s={120} pop={at(sc.start + 0.4)} />
        <Emoji code="274c" x={540} y={490} s={140} pop={at(sc.start + 0.9)} />
      </>)}
      {cut === 'nborodino' && (<>
        <Tag text="BORODINO" red="BORODINO" x={540} y={330} size={64} pop={P0} />
        <Emoji code="2694-fe0f" x={540} y={490} s={130} pop={at(sc.start + 0.4)} />
        {[[230, 490], [850, 490]].map(([x, y], k) => <Emoji key={k} code="1f4a5" x={x} y={y} s={140} pop={at(sc.start + 1 + k * 0.4)} />)}
      </>)}
      {cut === 'nmoscow' && (<>
        <Tag text="MOSKAU" red="MOSKAU" x={540} y={330} size={66} pop={P0} />
      </>)}
      {cut === 'nfire' && (<>
        <Tag text="MOSKAU BRENNT" red="BRENNT" x={540} y={330} size={62} pop={at(wordT(sc, /brennt/, 1.5))} />
        {[[160, 490], [920, 490]].map(([x, y], k) => <Emoji key={k} code="1f525" x={x} y={y} s={150} pop={at(wordT(sc, /brennt/, 1.5) + k * 0.15)} />)}
      </>)}
      {cut === 'nwait' && (<>
        <Tag text="ÜBER EINEN MONAT" red="MONAT" x={540} y={330} size={58} pop={P0} />
        <Emoji code="23f3" x={230} y={490} s={130} pop={at(sc.start + 0.3)} />
        <Emoji code="2709-fe0f" x={850} y={490} s={130} pop={at(sc.start + 0.6)} />
        <Emoji code="274c" x={850} y={490} s={140} pop={at(sc.start + 1.4)} />
      </>)}
      {cut === 'nwinter' && (<>
        <Tag text="MINUS 30 GRAD" red="30" x={540} y={330} size={62} pop={at(wordT(sc, /dreißig/, 2))} />
        <Emoji code="2603-fe0f" x={150} y={490} s={130} pop={at(sc.start + 0.6)} />
        <Tag text="RÜCKZUG" red="RÜCKZUG" x={330} y={1250} size={50} pop={at(sc.start + 0.8)} />
      </>)}
      {cut === 'nberezina' && (<>
        <Tag text="BERESINA" red="BERESINA" x={540} y={330} size={64} pop={P0} />
        <Tag text="FLUSS" x={230} y={1190} size={48} pop={at(sc.start + 0.4)} />
        <Tag text="ANGRIFF" red="ANGRIFF" x={830} y={1190} size={48} pop={at(wordT(sc, /angegriffen/, 1.5))} />
      </>)}
      {cut === 'nend' && (<>
        <Tag text="HIN 400.000+" red="400.000+" x={540} y={330} size={52} pop={P0} />
        <Tag text="ZURÜCK WENIGE" red="WENIGE" x={540} y={440} size={52} pop={at(sc.start + 1.2)} />
        <Char x={540} y={1225} kind="napoleon" mood="sad" pose="stand" name="NAPOLEON" t={t} s={1.05} />
      </>)}
    </AbsoluteFill>
  );
};
