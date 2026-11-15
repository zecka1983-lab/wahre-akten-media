// «Der Emu-Krieg» (Австралия, 1932): карта региона + свои мультяшные эму и солдаты.
import React from 'react';
import {AbsoluteFill, Img, random, spring, staticFile} from 'remotion';
import geo from './ausdata.json';
import timeline from './timeline.json';
import {cam, Emoji, FontFaces, Tag} from './MapStory';

type W8 = {w: string; t: number};
type Sc = {start: number; dur: number; cut: string; words: W8[]};
const SC = (timeline as any).scenes as Sc[];
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
const c01 = (x: number) => Math.min(1, Math.max(0, x));
const wordT = (sc: Sc, re: RegExp, fb = 0.3) => (sc.words.find((x) => re.test(x.w))?.t ?? sc.start + fb);
const P = (lon: number, lat: number) => [(lon - geo.LON0) * geo.C * geo.K, (geo.LATT - lat) * geo.K];
const CAMP = P(118.6, -31.0), PERTH = P(115.86, -31.95);
const AUSV = [P(134, -27)[0], P(134, -27)[1], 0.66], WAV = [CAMP[0] + 40, CAMP[1] - 20, 1.7], CLOSE = [CAMP[0], CAMP[1] + 10, 5];
const CAMS: Record<string, number[][]> = {
  ehook: [CLOSE, [CAMP[0], CAMP[1] + 10, 5.6]], eaus: [AUSV, WAV], eherd: [WAV, CLOSE], earmy: [[(CAMP[0] + PERTH[0]) / 2, CAMP[1] + 30, 3.2]],
  escatter: [CLOSE, [CAMP[0], CAMP[1] + 10, 4]], etruck: [CLOSE], ejam: [[CAMP[0], CAMP[1] + 10, 6]], ecount: [CLOSE], equote: [CLOSE], esize: [CLOSE],
  eretreat: [[(CAMP[0] + PERTH[0]) / 2, CAMP[1] + 30, 3.2]], ebounty: [CLOSE], eend: [WAV, AUSV],
};
const camOf = (i: number, t: number) => {
  const s = SC[i], p = CAMS[s.cut] ?? [AUSV];
  const k = ease(c01((t - s.start) / s.dur)); const a = p[0], b = p[p.length - 1];
  return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), Math.exp(lerp(Math.log(a[2]), Math.log(b[2]), k))];
};
const camAt = (i: number, t: number) => {
  const cur = camOf(i, t); if (i === 0) return cur;
  const k = ease(c01((t - SC[i].start) / 0.7)); const prev = camOf(i - 1, SC[i].start);
  return [lerp(prev[0], cur[0], k), lerp(prev[1], cur[1], k), Math.exp(lerp(Math.log(prev[2]), Math.log(cur[2]), k))];
};

// мультяшный эму: тело-клубок, длинная шея, голова с большими глазами, бегущие ноги
const EmuBird: React.FC<{x: number; y: number; s?: number; dir?: number; t: number; run?: number; crown?: boolean; mood?: 'ok' | 'smug' | 'shock'}> = ({x, y, s = 1, dir = 1, t, run = 1, crown, mood = 'ok'}) => {
  const ph = t * 14 * run; const sw = Math.sin(ph) * 18 * Math.min(1, run); const bob = Math.abs(Math.sin(ph)) * 6 * Math.min(1, run);
  return (
    <svg width={220 * s} height={240 * s} style={{position: 'absolute', left: x - 110 * s, top: y - 220 * s, overflow: 'visible'}}>
      <g transform={`translate(${110 * s} ${220 * s}) scale(${s * dir} ${s}) translate(0 ${-bob})`}>
        <path d={`M-6 -60 L${-10 + sw} 0 M8 -60 L${12 - sw} 0`} stroke="#8a6d4a" strokeWidth={8} strokeLinecap="round" />
        <ellipse cx={0} cy={-80} rx={52} ry={36} fill="#5b4632" stroke="#1d1d2b" strokeWidth={5} />
        <path d="M-40 -95 q10 -12 22 -2 q10 -12 22 -2 q10 -12 22 -2" stroke="#7a6046" strokeWidth={5} fill="none" />
        <path d="M30 -100 Q44 -140 40 -170" stroke="#5b4632" strokeWidth={16} fill="none" strokeLinecap="round" />
        <circle cx={44} cy={-178} r={22} fill="#7f8fa0" stroke="#1d1d2b" strokeWidth={5} />
        <circle cx={52} cy={-183} r={10} fill="white" stroke="#1d1d2b" strokeWidth={3} />
        {mood === 'smug' ? <path d="M44 -184 h16" stroke="#1d1d2b" strokeWidth={4} /> : <circle cx={55} cy={-182} r={mood === 'shock' ? 3 : 5} fill="#1d1d2b" />}
        <path d="M64 -178 L80 -174 L64 -170 Z" fill="#3a3a3a" />
        {crown && <path d="M25 -197 l6 -20 l10 12 l8 -17 l8 17 l10 -12 l6 20 Z" fill="#ffd84d" stroke="#1d1d2b" strokeWidth={3} />}
      </g>
    </svg>
  );
};

// солдат: каска, форма, «ствол» палкой, эмоция
const Soldier: React.FC<{x: number; y: number; s?: number; mood?: 'ok' | 'angry' | 'shock' | 'sad'; t: number; aim?: boolean; dir?: number; fire?: boolean}> = ({x, y, s = 1, mood = 'ok', t, aim, dir = 1, fire}) => {
  const shake = mood === 'angry' ? Math.sin(t * 40) * 2 : 0;
  return (
    <svg width={200 * s} height={260 * s} style={{position: 'absolute', left: x - 100 * s + shake, top: y - 250 * s, overflow: 'visible'}}>
      <g transform={`translate(${100 * s} ${250 * s}) scale(${s * dir} ${s})`}>
        <rect x={-22} y={-60} width={16} height={60} rx={6} fill="#3d4426" /><rect x={6} y={-60} width={16} height={60} rx={6} fill="#3d4426" />
        <rect x={-36} y={-140} width={72} height={90} rx={22} fill="#6b7a3a" stroke="#1d1d2b" strokeWidth={5} />
        {aim && <><rect x={10} y={-120} width={110} height={12} rx={4} fill="#2b2b2b" /><rect x={10} y={-112} width={34} height={22} rx={4} fill="#5a3d26" /></>}
        {aim && fire && Math.floor(t * 12) % 2 === 0 && <path d="M122 -114 l18 -14 l-4 12 l22 2 l-22 4 l4 12 Z" fill="#ffd84d" stroke="#ff8a00" strokeWidth={3} />}
        <circle cx={0} cy={-175} r={38} fill="#f6c9a0" stroke="#1d1d2b" strokeWidth={5} />
        <path d="M-44 -180 Q-44 -228 0 -228 Q44 -228 44 -180 Z" fill="#4d5a2e" stroke="#1d1d2b" strokeWidth={5} />
        {[-1, 1].map((d) => <circle key={d} cx={d * 13} cy={-170} r={mood === 'shock' ? 8 : 6} fill="#1d1d2b" />)}
        {mood === 'angry' && <path d="M-24 -186 L-6 -180 M24 -186 L6 -180" stroke="#1d1d2b" strokeWidth={5} />}
        {mood === 'shock' ? <ellipse cx={0} cy={-150} rx={7} ry={9} fill="#1d1d2b" /> :
          <path d={mood === 'sad' || mood === 'angry' ? 'M-12 -146 Q0 -156 12 -146' : 'M-12 -152 Q0 -142 12 -152'} stroke="#1d1d2b" strokeWidth={5} fill="none" strokeLinecap="round" />}
      </g>
    </svg>
  );
};

const N = 8;
export const EmuScene: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const t = frame / fps;
  let i = 0; SC.forEach((s, k) => { if (t >= s.start) i = k; });
  const sc = SC[i], cut = sc.cut, L = t - sc.start;
  const [cx, cy, z] = camAt(i, t);
  const S = (p: number[]) => [540 + (p[0] - cx) * z, 900 + (p[1] - cy) * z];
  const at = (tt: number) => spring({frame: frame - Math.round(tt * fps), fps, config: {damping: 11, stiffness: 170}});
  const P0 = at(sc.start - 0.15);
  const [kx, ky] = S(CAMP);
  const close = z > 3.5;
  const glow = 1 + 0.12 * Math.sin(t * 2.4);
  // стадо: позиции вокруг Кэмпиона (экран), в разных сценах — приход, бегство, гуляние
  const herd = Array.from({length: N}).map((_, k) => {
    const ang = random(`a${k}`) * Math.PI * 2, r = 180 + random(`r${k}`) * 300;
    let x = kx + Math.cos(ang) * r, y = ky + 120 + Math.sin(ang) * r * 0.55, run = 0.4, dir = Math.cos(ang) > 0 ? 1 : -1;
    if (cut === 'eherd') { const q = ease(c01((L - 0.5 - random(`d${k}`) * 1.2) / 2.2)); x = lerp(x + 900, x, q); y = lerp(y - 300, y, q); run = q < 1 ? 1.4 : 0.4; dir = -1; }
    if (cut === 'escatter' || cut === 'ehook') { const q = c01((L - (cut === 'ehook' ? 0.2 : wordT(sc, /geschossen/, 1) - sc.start)) / 2.5); x += Math.cos(ang) * q * 700; y += Math.sin(ang) * q * 380; run = 1.8; }
    if (cut === 'etruck' || cut === 'ejam') { x += Math.sin(t * 1.5 + k) * 120; run = 1.3; dir = Math.cos(t * 1.5 + k) > 0 ? 1 : -1; }
    return {x, y, run, dir, k};
  }).filter((e) => e.y < 1180 && e.y > 720 && e.x > 40 && e.x < 1040).sort((a, b) => a.y - b.y);
  const showHerd = close && !['ecount', 'equote', 'ebounty', 'esize'].includes(cut);
  const wheatGone = ['eherd'].includes(cut) ? c01((L - 2.5) / 1.5) : ['earmy', 'escatter', 'etruck', 'ejam', 'ecount', 'equote', 'eretreat', 'ebounty', 'eend'].includes(cut) ? 1 : 0;
  return (
    <AbsoluteFill style={{background: '#12344e', overflow: 'hidden'}}>
      <FontFaces />
      <AbsoluteFill style={{transform: cam(cx, cy, z), transformOrigin: '0 0'}}>
        <Img src={staticFile('map/aus.jpg')} style={{position: 'absolute', width: geo.W, height: geo.H, filter: 'brightness(1.1)'}} />
        <svg width={geo.W} height={geo.H} style={{position: 'absolute', overflow: 'visible', filter: `brightness(${glow})`}}>
          <path d={geo.country} fill="none" stroke="white" strokeWidth={2.5 / z} strokeLinejoin="round" />
          <path d={(geo.regions as any)['Western Australia']} fill="#ff9f1c" fillOpacity={close ? 0.45 : 0.55} stroke="white" strokeWidth={3 / z} strokeLinejoin="round" />
          {(cut === 'earmy' || cut === 'eretreat') && [PERTH, CAMP].map((p, k) => <circle key={k} cx={p[0]} cy={p[1]} r={6 / z} fill="#ffd84d" stroke="#1d1d2b" strokeWidth={2 / z} />)}
          {(cut === 'earmy' || cut === 'eretreat') && <line x1={PERTH[0]} y1={PERTH[1]} x2={CAMP[0]} y2={CAMP[1]} stroke="#1d1d2b" strokeWidth={6 / z} strokeDasharray={`${10 / z} ${6 / z}`} />}
        </svg>
      </AbsoluteFill>

      {/* пшеница */}
      {close && wheatGone < 1 && [[-260, 60], [-80, 160], [120, 40], [280, 170], [-200, 260], [60, 300], [250, 330]].map(([dx, dy], k) => (
        <Emoji key={k} code="1f33e" x={kx + dx} y={ky + dy} s={130} pop={1 - wheatGone} />))}
      {showHerd && herd.map((e) => <EmuBird key={e.k} x={e.x} y={e.y} s={1.25} dir={e.dir} t={t + e.k} run={e.run} mood={cut === 'escatter' ? 'shock' : 'ok'} />)}

      {cut === 'ehook' && (<>
        <Tag text="ARMEE GEGEN VÖGEL" red="VÖGEL" x={540} y={330} size={62} pop={Math.max(0.9, P0)} />
        <Soldier x={220} y={1230} s={1.7} t={t} aim fire={L < 2.5} mood={L > 2.5 ? 'shock' : 'angry'} />
      </>)}
      {cut === 'eaus' && (<>
        <Tag text="AUSTRALIEN 1932" red="1932" x={540} y={330} size={62} pop={P0} />
        <Emoji code="1f33e" x={S(CAMP)[0] + 80} y={S(CAMP)[1] - 120} s={190} pop={at(wordT(sc, /Weizen/, 2))} />
      </>)}
      {cut === 'eherd' && (() => { const n = Math.round(20000 * ease(c01((L - 0.4) / 2))); return (<>
        <Tag text={`${n.toLocaleString('de-DE')} EMUS`} red="EMUS" x={540} y={330} size={64} pop={P0} />
      </>); })()}
      {cut === 'earmy' && (() => { const q = ease(c01((L - 0.3) / (sc.dur - 0.6))); const [px, py] = S(PERTH), [qx, qy] = S(CAMP); const tx = lerp(px, qx, q), ty = lerp(py, qy, q); return (<>
        <Tag text="DIE ARMEE KOMMT" red="ARMEE" x={540} y={330} size={60} pop={P0} />
        <Img src={staticFile('map/1f6fb.webp')} style={{position: 'absolute', left: tx - 90, top: ty - 150 + Math.sin(t * 25) * 5, width: 180, height: 180, transform: 'scaleX(-1)', filter: 'drop-shadow(0 8px 8px rgba(0,0,0,0.4))'}} />
        <Tag text="1 OFFIZIER" x={250} y={1040} size={52} pop={at(wordT(sc, /Offizier/, 2))} />
        <Tag text="2 SOLDATEN" x={790} y={1040} size={52} pop={at(wordT(sc, /Soldaten/, 3))} />
        <Tag text="2 MG" x={250} y={1160} size={52} pop={at(wordT(sc, /Maschinengewehre/, 4))} />
        <Tag text="10.000 SCHUSS" red="10.000" x={720} y={1160} size={52} pop={at(wordT(sc, /zehntausend/, 5))} />
      </>); })()}
      {cut === 'escatter' && (<>
        <Tag text="50 KM/H" red="50" x={540} y={330} size={70} pop={at(wordT(sc, /fünfzig/, 3))} />
        <Soldier x={540} y={1230} s={1.7} t={t} aim mood="shock" />
      </>)}
      {cut === 'etruck' && (<>
        <Tag text="DANEBEN" red="DANEBEN" x={540} y={330} size={66} pop={at(wordT(sc, /trifft/, 3))} />
        <div style={{position: 'absolute', left: 300 + Math.sin(L * 1.2) * 220, top: 900 + Math.sin(t * 30) * 14 + Math.sin(t * 17) * 8, transform: `rotate(${Math.sin(t * 22) * 6}deg)`}}>
          <Img src={staticFile('map/1f6fb.webp')} style={{width: 340, height: 340, transform: Math.cos(L * 1.2) > 0 ? 'scaleX(-1)' : 'none', filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.4))'}} />
        </div>
      </>)}
      {cut === 'ejam' && (<>
        <Tag text="KLEMMT" red="KLEMMT" x={540} y={330} size={70} pop={at(wordT(sc, /klemmt/, 1))} />
        <Soldier x={540} y={1230} s={1.8} t={t} aim fire={false} mood="angry" />
      </>)}
      {cut === 'ecount' && (() => { const a1 = ease(c01((t - wordT(sc, /zehntausend/, 2)) / 1.2)), a2 = ease(c01((t - wordT(sc, /neunhundertsechsundachtzig/, 3)) / 1.2)); return (<>
        <Tag text="BILANZ" x={540} y={330} size={66} pop={P0} />
        <Tag text={`${Math.round(9860 * a1).toLocaleString('de-DE')} SCHUSS`} x={540} y={500} size={64} pop={at(wordT(sc, /zehntausend/, 2))} />
        <Tag text={`${Math.round(986 * a2)} EMUS`} red="EMUS" x={540} y={630} size={64} pop={at(wordT(sc, /neunhundertsechsundachtzig/, 3))} />
        <Tag text="10 KUGELN = 1 EMU" red="10" x={540} y={760} size={58} pop={at(wordT(sc, /Kugeln/, 4))} />
        <EmuBird x={540} y={1230} s={1.6} t={t} run={0.2} mood="smug" />
      </>); })()}
      {cut === 'esize' && (() => { const g = ease(c01((t - wordT(sc, /zwei/, 2)) / 1.2)); return (<>
        <Tag text="FAST 2 METER" red="2" x={540} y={330} size={66} pop={at(wordT(sc, /zwei/, 2))} />
        <EmuBird x={720} y={1230} s={lerp(1.6, 2.6, g)} t={t} run={0.15} mood="smug" />
        <Soldier x={300} y={1230} s={1.7} t={t} mood={g > 0.5 ? 'shock' : 'ok'} />
      </>); })()}
      {cut === 'equote' && (<>
        <Emoji code="1f6e1-fe0f" x={540} y={500} s={200} pop={P0} />
        <Tag text="ZÄH WIE PANZER" red="PANZER" x={540} y={680} size={62} pop={at(sc.start + 1)} />
        <EmuBird x={330} y={1230} s={2} t={t} run={0.2} mood="smug" />
        <Soldier x={790} y={1230} s={1.7} t={t} mood="shock" dir={-1} />
      </>)}
      {cut === 'eretreat' && (() => { const q = ease(c01((L - 0.3) / (sc.dur - 0.6))); const [px, py] = S(PERTH), [qx, qy] = S(CAMP); const tx = lerp(qx, px, q), ty = lerp(qy, py, q); return (<>
        <Tag text="RÜCKZUG" red="RÜCKZUG" x={540} y={330} size={66} pop={P0} />
        <Img src={staticFile('map/1f6fb.webp')} style={{position: 'absolute', left: tx - 90, top: ty - 150, width: 180, height: 180}} />
        <Emoji code="1f3c6" x={Math.min(960, qx + 260)} y={qy - 160} s={180} pop={at(wordT(sc, /bleiben/, 1.5))} />
        <EmuBird x={qx + 40} y={qy - 40} s={1.4} t={t} run={0.6} crown />
      </>); })()}
      {cut === 'ebounty' && (<>
        <Tag text="PRÄMIE PRO EMU" red="PRÄMIE" x={540} y={330} size={60} pop={P0} />
        {[[220, 560], [540, 520], [860, 560]].map(([x, y], k) => <Emoji key={k} code="1f4b0" x={x} y={y} s={170} pop={at(wordT(sc, /Prämie/, 2) + k * 0.2)} />)}
        <Soldier x={540} y={1230} s={1.8} t={t} mood="sad" />
      </>)}
      {cut === 'eend' && (<>
        <Tag text="WER HAT GEWONNEN?" red="GEWONNEN?" x={540} y={330} size={58} pop={P0} />
        <EmuBird x={760} y={1230} s={2.2} t={t} run={0.3} crown mood="smug" />
        <Soldier x={290} y={1230} s={1.8} t={t} mood="sad" />
      </>)}
    </AbsoluteFill>
  );
};
