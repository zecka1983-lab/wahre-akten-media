// Карта-объяснялка (формат «карта + вопрос»): спутниковая подложка NASA Blue Marble,
// контуры Natural Earth / OpenStreetMap, 3D-эмодзи Microsoft Fluent (MIT), шрифт Montserrat (OFL).
import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import map from './mapdata.json';

const FONT = 'MontserratX';
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const FontFaces: React.FC = () => (
  <style>{`
    @font-face {font-family: MontserratX; font-weight: 800; src: url(${staticFile('fonts/montserrat-latin-800-normal.woff2')}) format('woff2');}
    @font-face {font-family: MontserratX; font-weight: 900; src: url(${staticFile('fonts/montserrat-latin-900-normal.woff2')}) format('woff2');}
    @font-face {font-family: MontserratX; font-weight: 900; src: url(${staticFile('fonts/montserrat-latin-ext-900-normal.woff2')}) format('woff2'); unicode-range: U+0100-024F;}
  `}</style>
);

// плашка как в образце: чёрный блок, белый текст, ключевое слово красным
export const Tag: React.FC<{text: string; red?: string; x: number; y: number; size?: number; pop?: number; rot?: number}> = ({text, red, x, y, size = 44, pop = 1, rot = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${pop}) rotate(${rot}deg)`, background: '#111', padding: `${size * 0.18}px ${size * 0.35}px`, borderRadius: 6, boxShadow: '0 6px 18px rgba(0,0,0,0.45)', whiteSpace: 'nowrap', fontFamily: FONT, fontWeight: 900, fontSize: size, color: 'white', letterSpacing: 0.5}}>
    {text.split(' ').map((w, i) => <span key={i} style={{color: red && w.replace(/[?!.,]/g, '') === red ? '#ff2b2b' : 'white'}}>{w} </span>)}
  </div>
);

const Emoji: React.FC<{code: string; x: number; y: number; s: number; pop?: number; badge?: boolean}> = ({code, x, y, s, pop = 1, badge}) => (
  <>
  {badge && <div style={{position: 'absolute', left: x - s * 0.62, top: y - s * 0.62, width: s * 1.24, height: s * 1.24, borderRadius: '50%', background: 'white', transform: `scale(${pop})`, boxShadow: '0 6px 14px rgba(0,0,0,0.35)'}} />}
  <Img src={staticFile(`map/${code}.webp`)} style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, transform: `scale(${pop})`, filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.4))'}} />
  </>
);

// камера: точка мира (wx, wy) в центре кадра (540, 900) с зумом z
const cam = (wx: number, wy: number, z: number) => `translate(${540 - wx * z}px, ${900 - wy * z}px) scale(${z})`;

export const MapTest: React.FC<{shot: 'germany' | 'berlin'}> = ({shot}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = (d: number) => spring({frame: f - d, fps, config: {damping: 11, stiffness: 170}});
  const [bx, by] = map.cities.Berlin;
  const germany = shot === 'germany';
  const z = germany ? 1.42 : 26;
  const wx = germany ? 769 : bx - 3, wy = germany ? 800 : by + 1;
  const pulse = 0.5 + 0.5 * Math.sin(f / 9);
  return (
    <AbsoluteFill style={{background: '#06222e'}}>
      <FontFaces />
      <AbsoluteFill style={{transform: cam(wx, wy, z), transformOrigin: '0 0'}}>
        <Img src={staticFile('map/europe.jpg')} style={{position: 'absolute', width: map.W, height: map.H, filter: germany ? 'none' : 'blur(0.6px) brightness(0.55) saturate(1.3)'}} />
        <svg width={map.W} height={map.H} style={{position: 'absolute', overflow: 'visible'}}>
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={germany ? 3 : 0.25} result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <path d={map.brd} fill="rgba(90,185,255,0.66)" stroke="white" strokeWidth={2.2 / z} strokeLinejoin="round" />
          <path d={map.ddr} fill="rgba(235,60,60,0.62)" stroke="white" strokeWidth={2.2 / z} strokeLinejoin="round" />
          <path d={map.wb} fill="#ffd84d" stroke="#fff" strokeWidth={(germany ? 1.5 : 5) / z} filter="url(#glow)" opacity={0.75 + 0.25 * pulse} />
          {!germany && <path d={map.wb} fill="none" stroke="#9aa0a6" strokeWidth={9 / z} strokeDasharray={`${14 / z} ${6 / z}`} />}
        </svg>
      </AbsoluteFill>
      {germany ? (
        <>
          <Tag text="BRD" x={330} y={1010} size={52} pop={pop(8)} />
          <Tag text="DDR" x={760} y={1020} size={52} pop={pop(14)} />
          <Emoji code="1f914" x={900} y={560} s={150} pop={pop(22)} />
          <Tag text="WEST-BERLIN" red="WEST-BERLIN" x={810} y={690} size={40} pop={pop(18)} />
          <Tag text="Warum war West-Berlin eine Insel?" red="Insel" x={540} y={330} size={42} pop={pop(0)} />
        </>
      ) : (
        <>
          <Tag text="WEST-BERLIN" x={520} y={880} size={56} pop={pop(4)} />
          <Tag text="155 km MAUER" red="MAUER" x={540} y={330} size={50} pop={pop(0)} />
          <Tag text="DDR" x={180} y={1250} size={46} pop={pop(10)} />
          <Emoji code="1f9f1" x={900} y={1180} s={170} pop={pop(14)} />
        </>
      )}
    </AbsoluteFill>
  );
};

// ================== ролик целиком по timeline.json (theme: "map") ==================
import timeline from './timeline.json';
type W8 = {w: string; t: number};
type MSc = {start: number; dur: number; cut: string; words: W8[]};
const MS = (timeline as any).scenes as MSc[];
const C = map.cities as Record<string, number[]>;
const [BX, BY] = C.Berlin;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
const wordT = (sc: MSc, re: RegExp, fb = 0.3) => {
  const w = sc.words.find((x) => re.test(x.w));
  return w ? w.t : sc.start + fb;
};
const GER: number[] = [769, 800, 1.42];
const BER: number[] = [BX - 3, BY + 1, 24];
const WEST: number[] = [900, 690, 2.6];
const CAMS: Record<string, number[][]> = {
  hook: [[880, 720, 1.75], [BX, BY, 3.4]],
  facts: [[(BX + C.Grenze[0]) / 2 + 10, (BY + C.Grenze[1]) / 2 + 20, 2.5]],
  why: [[BX - 60, BY + 40, 2.1]],
  zones: [GER],
  sectors: [BER],
  blockade: [WEST],
  airlift: [[830, 760, 2.15]],
  candy: [[BX - 3, BY + 2, 13]],
  fail: [WEST],
  wall: [BER],
  stein: [BER, [C.Stein[0] + 0.25, C.Stein[1] - 0.35, 150]],
  transit: [WEST],
  fall: [BER, [BX - 3, BY + 1, 18]],
  end: [GER],
};
// камера: внутри сцены — от первой точки ко второй; при смене сцены плавный перелёт 0,8 с
const camOf = (i: number, t: number): number[] => {
  const sc = MS[i];
  const pts = CAMS[sc.cut] ?? [GER];
  const span = sc.cut === 'stein' ? sc.dur * 0.45 : sc.dur;
  const k = ease(Math.min(1, Math.max(0, (t - sc.start) / span)));
  const a = pts[0], b = pts[pts.length - 1];
  return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), Math.exp(lerp(Math.log(a[2]), Math.log(b[2]), k))];
};
const camAt = (i: number, t: number): number[] => {
  const cur = camOf(i, t);
  if (i === 0) return cur;
  const k = ease(Math.min(1, (t - MS[i].start) / 0.8));
  if (k >= 1) return cur;
  const prev = camOf(i - 1, MS[i].start);
  return [lerp(prev[0], cur[0], k), lerp(prev[1], cur[1], k), Math.exp(lerp(Math.log(prev[2]), Math.log(cur[2]), k))];
};

const Counter: React.FC<{to: number; t: number; t0: number; dur?: number; fmt: (n: number) => string; x: number; y: number; red?: string; pop: number}> = ({to, t, t0, dur = 1.6, fmt, x, y, red, pop}) => {
  const n = Math.round(to * ease(Math.min(1, Math.max(0, (t - t0) / dur))));
  return <Tag text={fmt(n)} red={red} x={x} y={y} size={56} pop={pop} />;
};

export const MapScene: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const t = frame / fps;
  let i = 0;
  MS.forEach((s, k) => { if (t >= s.start) i = k; });
  const sc = MS[i];
  const [cx, cy, z] = camAt(i, t);
  const S = (p: number[]) => [540 + (p[0] - cx) * z, 900 + (p[1] - cy) * z]; // мир -> экран
  const at = (tt: number) => spring({frame: frame - Math.round(tt * fps), fps, config: {damping: 11, stiffness: 170}});
  const P0 = at(sc.start - 0.2);
  const cut = sc.cut;
  const pulse = 0.5 + 0.5 * Math.sin(t * 4);
  const dim = interpolate(z, [3, 9], [0, 1], cl);
  const unify = cut === 'end' ? ease(Math.min(1, (t - sc.start) / 1.5)) : 0;
  const zoomed = z > 8;
  const routes = [C.Hamburg, C.Helmstedt, C.Hannover];
  const blocked = cut === 'blockade' ? at(wordT(sc, /sperrt/)) : 0;
  const reopened = cut === 'fail';
  const wallDraw = cut === 'stein' ? 1 : cut === 'wall' ? ease(Math.min(1, Math.max(0, (t - wordT(sc, /Mauer/)) / 2.2))) : cut === 'fall' ? 1 : 0;
  const wallGone = cut === 'fall' ? ease(Math.min(1, Math.max(0, (t - wordT(sc, /öffnet/, sc.dur * 0.6)) / 1.2))) : 0;
  const [sbx, sby] = S([BX, BY]);
  const [wcx, wcy] = S(C.WBc);
  const ringR = Math.max(46, (map as any).wbR * z) + 10 + pulse * 8;
  return (
    <AbsoluteFill style={{background: '#0a2a38', overflow: 'hidden'}}>
      <FontFaces />
      <AbsoluteFill style={{transform: cam(cx, cy, z), transformOrigin: '0 0'}}>
        <Img src={staticFile('map/europe.jpg')} style={{position: 'absolute', width: map.W, height: map.H, filter: `brightness(${1.35 - dim * 0.6}) saturate(${1.15 + dim * 0.2})`}} />
        <svg width={map.W} height={map.H} style={{position: 'absolute', overflow: 'visible'}}>
          <path d={map.brd} fill={`rgba(80,170,255,${lerp(0.34, 0.55, unify)})`} stroke="#e6f4ff" strokeWidth={2.2 / z} strokeLinejoin="round" style={{filter: "drop-shadow(0 0 5px rgba(90,180,255,1))"}} />
          <path d={map.ddr} fill={`rgba(${Math.round(lerp(255, 80, unify))},${Math.round(lerp(70, 170, unify))},${Math.round(lerp(60, 255, unify))},${lerp(0.46, 0.62, unify)})`} stroke="#fff0ec" strokeWidth={(2.2 / z) * (1 - unify)} strokeLinejoin="round" style={{filter: `drop-shadow(0 0 4px rgba(${Math.round(lerp(255, 90, unify))},${Math.round(lerp(70, 180, unify))},${Math.round(lerp(50, 255, unify))},1))`}} />
          {(cut === 'sectors') && <path d={map.eb} fill="#6e0f16" stroke="none" />}
          <path d={map.wb} fill="#ffd84d" stroke="#fff" strokeWidth={(zoomed ? 5 : 1.5) / z} strokeLinejoin="round" />
          {wallDraw > 0 && z > 40 && <path d={(map as any).stein} fill="none" stroke="#1d1d1d" strokeWidth={20 / z} strokeLinejoin="round" />}
          <path d={(map as any).stein} fill="#ffd84d" stroke={z > 40 ? '#f2f2ee' : 'none'} strokeWidth={(wallDraw > 0 ? 14 : 4) / z} strokeLinejoin="round" />
          {/* Стена: рисуется по контуру */}
          {wallDraw > 0 && (
            <g opacity={1 - wallGone}>
              <path d={map.wb} fill="none" stroke="#1d1d1d" strokeWidth={24 / z} pathLength={1} strokeLinecap={wallDraw < 1 ? "butt" : "round"} strokeLinejoin="round" strokeDasharray={`${wallDraw} 1`} />
              <path d={map.wb} fill="none" stroke="#f2f2ee" strokeWidth={17 / z} pathLength={1} strokeLinecap={wallDraw < 1 ? "butt" : "round"} strokeLinejoin="round" strokeDasharray={`${wallDraw} 1`} />
            </g>
          )}
          {/* дороги в Западный Берлин: блокада и снова открыты */}
          {(cut === 'blockade' || reopened) && routes.map((r, k) => (
            <line key={`o${k}`} x1={r[0]} y1={r[1]} x2={C.WBnah[0]} y2={C.WBnah[1]} stroke="white" strokeWidth={15 / z} />
          ))}
          {(cut === 'blockade' || reopened) && routes.map((r, k) => (
            <line key={k} x1={r[0]} y1={r[1]} x2={C.WBnah[0]} y2={C.WBnah[1]} stroke={reopened ? '#1fa85a' : blocked > 0.5 ? '#151515' : '#555'} strokeWidth={9 / z} strokeDasharray={`${14 / z} ${7 / z}`} />
          ))}
          {/* транзитная трасса */}
          {cut === 'transit' && <line x1={C.Helmstedt[0]} y1={C.Helmstedt[1]} x2={C.WBnah[0]} y2={C.WBnah[1]} stroke="#ffd84d" strokeWidth={6 / z} strokeDasharray={`${12 / z} ${7 / z}`} />}
          {/* воздушные коридоры */}
          {cut === 'airlift' && [C.Hamburg, C.Hannover, C.Frankfurt].map((r, k) => (
            <line key={k} x1={r[0]} y1={r[1]} x2={C.Tempelhof[0]} y2={C.Tempelhof[1]} stroke="white" strokeWidth={4 / z} strokeDasharray={`${8 / z} ${8 / z}`} opacity={0.9} />
          ))}
          {/* расстояние до ФРГ */}
          {cut === 'facts' && (() => {
            const k = ease(Math.min(1, Math.max(0, (t - wordT(sc, /Bundesrepublik/)) / 0.8)));
            return <line x1={C.WBnah[0]} y1={C.WBnah[1]} x2={lerp(C.WBnah[0], C.Grenze[0], k)} y2={lerp(C.WBnah[1], C.Grenze[1], k)} stroke="#ffd84d" strokeWidth={5 / z} strokeDasharray={`${9 / z} ${6 / z}`} />;
          })()}
        </svg>
      </AbsoluteFill>
      {/* пульсирующее кольцо вокруг Западного Берлина на общих планах */}
      {!zoomed && cut !== 'candy' && (
        <div style={{position: 'absolute', left: wcx - ringR, top: wcy - ringR, width: ringR * 2, height: ringR * 2, borderRadius: '50%', border: '5px solid #ffd84d', boxShadow: '0 0 18px rgba(255,216,77,0.8)', opacity: 0.95 - pulse * 0.3, boxSizing: 'border-box'}} />
      )}

      {cut === 'hook' && (
        <>
          <Tag text="EINE INSEL IM OSTEN" red="INSEL" x={540} y={340} size={58} pop={Math.max(P0, 0.9)} />
          <Tag text="DDR" x={sbx + 170} y={sby + 230} size={50} pop={at(sc.start + 0.6)} />
          <Emoji code="1f914" x={sbx + 190} y={sby - 170} s={160} pop={at(sc.start + 1.0)} />
        </>
      )}
      {cut === 'facts' && (
        <>
          <Tag text="WEST-BERLIN" x={sbx + 40} y={sby - 120} size={46} pop={P0} />
          <Emoji code="1f465" x={sbx + 60} y={sby + 170} s={150} pop={at(wordT(sc, /Million/))} />
          <Tag text="2 MIO. MENSCHEN" red="2" x={sbx + 60} y={sby + 290} size={46} pop={at(wordT(sc, /Million/))} />
          <Tag text="100+ km" red="100+" x={(sbx + S(C.Grenze)[0]) / 2 - 70} y={(sby + S(C.Grenze)[1]) / 2 + 80} size={52} pop={at(wordT(sc, /100/, sc.dur - 1.5))} />
        </>
      )}
      {cut === 'why' && (
        <>
          <Emoji code="1f914" x={540} y={720} s={300} pop={P0} />
          <Tag text="WIE KAM ES DAZU?" red="DAZU?" x={540} y={1000} size={58} pop={at(sc.start + 0.3)} />
        </>
      )}
      {cut === 'zones' && (
        <>
          <Tag text="1945" x={540} y={330} size={70} pop={P0} />
          <Tag text="WESTZONEN" x={S([600, 860])[0]} y={S([600, 860])[1]} size={44} pop={at(sc.start + 0.8)} />
          <Tag text="SOWJETISCHE ZONE" red="SOWJETISCHE" x={Math.min(820, S([990, 790])[0])} y={S([990, 790])[1]} size={38} pop={at(wordT(sc, /sowjetischen/))} />
          <Emoji code="1f4cd" badge x={sbx} y={sby - 50} s={110} pop={at(wordT(sc, /Berlin/))} />
        </>
      )}
      {cut === 'sectors' && (
        <>
          <Tag text="OST-BERLIN" x={S(C.SU)[0] - 30} y={S(C.SU)[1]} size={44} pop={P0} />
          <Tag text="USA" x={S(C.USA)[0]} y={S(C.USA)[1]} size={52} pop={at(wordT(sc, /Amerikaner/))} />
          <Tag text="GB" x={S(C.GB)[0]} y={S(C.GB)[1]} size={52} pop={at(wordT(sc, /Briten/))} />
          <Tag text="F" x={S(C.F)[0]} y={S(C.F)[1]} size={52} pop={at(wordT(sc, /Franzosen/))} />
        </>
      )}
      {cut === 'blockade' && (
        <>
          <Tag text="1948" x={540} y={330} size={70} pop={P0} />
          {routes.map((r, k) => {
            const m = S([(r[0] + C.WBnah[0]) / 2, (r[1] + C.WBnah[1]) / 2]);
            return <Emoji key={k} code="274c" badge x={m[0]} y={m[1]} s={80} pop={at(wordT(sc, /sperrt/) + k * 0.25)} />;
          })}
          <Emoji code="1f6ab" badge x={sbx + 60} y={sby - 140} s={150} pop={at(wordT(sc, /aufgeben/))} />
          <Tag text="BLOCKADE" red="BLOCKADE" x={540} y={1240} size={58} pop={at(wordT(sc, /sperrt/))} />
        </>
      )}
      {cut === 'airlift' && (
        <>
          <Tag text="LUFTBRÜCKE" red="LUFTBRÜCKE" x={540} y={330} size={62} pop={P0} />
          {[C.Hamburg, C.Hannover, C.Frankfurt].flatMap((r, k) => [0, 0.5].map((ph) => {
            const q = ((t - sc.start) / 2.6 + ph + k * 0.17) % 1;
            const p = S([lerp(r[0], C.Tempelhof[0], q), lerp(r[1], C.Tempelhof[1], q)]);
            const ang = Math.atan2(C.Tempelhof[1] - r[1], C.Tempelhof[0] - r[0]) * 180 / Math.PI + 45;
            return <Img key={`${k}-${ph}`} src={staticFile('map/2708-fe0f.webp')} style={{position: 'absolute', left: p[0] - 45, top: p[1] - 45, width: 90, height: 90, transform: `rotate(${ang}deg)`, opacity: Math.min(1, q * 8, (1 - q) * 8), filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.4))'}} />;
          }))}
          <Counter to={280000} t={t} t0={wordT(sc, /fast/, 2)} fmt={(n) => `${n.toLocaleString('de-DE')} FLÜGE`} x={540} y={1260} red="FLÜGE" pop={at(wordT(sc, /fast/, 2))} />
        </>
      )}
      {cut === 'candy' && (
        <>
          {(() => {
            const q = (t - sc.start) / sc.dur;
            const px = lerp(-150, 1230, q), py = 520;
            return (
              <>
                <Img src={staticFile('map/2708-fe0f.webp')} style={{position: 'absolute', left: px - 90, top: py - 90, width: 180, height: 180, transform: 'rotate(45deg)', filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.4))'}} />
                {[0.15, 0.3, 0.45, 0.6].map((d0, k) => {
                  const age = q - d0;
                  if (age < 0) return null;
                  const x0 = lerp(-150, 1230, d0);
                  return (
                    <div key={k} style={{position: 'absolute', left: x0 - 50 + Math.sin(age * 20 + k) * 20, top: py + 40 + age * 900}}>
                      <Img src={staticFile('map/1fa82.webp')} style={{width: 100, height: 100}} />
                      <Img src={staticFile('map/1f36c.webp')} style={{width: 70, height: 70, marginLeft: 15, marginTop: -20, display: 'block'}} />
                    </div>
                  );
                })}
              </>
            );
          })()}
          <Tag text="ROSINENBOMBER" red="ROSINENBOMBER" x={540} y={1250} size={58} pop={at(wordT(sc, /Rosinenbomber/))} />
        </>
      )}
      {cut === 'fail' && (
        <>
          <Tag text="1949" x={540} y={330} size={70} pop={P0} />
          {routes.map((r, k) => {
            const m = S([(r[0] + C.WBnah[0]) / 2, (r[1] + C.WBnah[1]) / 2]);
            return <Emoji key={k} code="2705" badge x={m[0]} y={m[1]} s={90} pop={at(wordT(sc, /offen/) + k * 0.2)} />;
          })}
          <Tag text="BLOCKADE GESCHEITERT" red="GESCHEITERT" x={540} y={1250} size={48} pop={at(wordT(sc, /scheitert/))} />
        </>
      )}
      {cut === 'wall' && (
        <>
          <Tag text="1961" x={540} y={330} size={70} pop={P0} />
          <Emoji code="1f9f1" x={900} y={1180} s={170} pop={at(wordT(sc, /Mauer/))} />
          <Counter to={155} t={t} t0={wordT(sc, /155/, 2)} fmt={(n) => `${n} KM MAUER`} red="MAUER" x={540} y={1260} pop={at(wordT(sc, /155/, 2))} />
        </>
      )}
      {cut === 'stein' && (() => {
        const st = S(C.Stein), kh = S(C.Kohlhasen);
        const q = ((t - wordT(sc, /Amerikanische/, sc.dur * 0.4)) / 2.6);
        const qq = Math.min(1, Math.max(0, q));
        return (
          <>
            <Tag text="INSEL IN DER INSEL" red="INSEL" x={540} y={330} size={56} pop={at(wordT(sc, /Insel/))} />
            <Tag text="STEINSTÜCKEN" x={Math.min(860, Math.max(220, st[0]))} y={Math.min(1300, st[1] + 120)} size={44} pop={at(wordT(sc, /Steinstücken/))} />
            {q > 0 && <Img src={staticFile('map/1f681.webp')} style={{position: 'absolute', left: lerp(kh[0] + 260, st[0], ease(qq)) - 85, top: lerp(kh[1] - 260, st[1] - 150, ease(qq)) - 85 + Math.sin(t * 6) * 6, width: 170, height: 170, filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.45))'}} />}
          </>
        );
      })()}
      {cut === 'transit' && (() => {
        const h = S(C.Helmstedt), w = S(C.WBnah);
        const q = ease(Math.min(1, Math.max(0, (t - sc.start - 0.6) / (sc.dur - 1))));
        return (
          <>
            <Tag text="TRANSIT" red="TRANSIT" x={540} y={330} size={66} pop={P0} />
            <Emoji code="1f6c2" x={h[0]} y={h[1] - 110} s={120} pop={at(wordT(sc, /Grenze/))} />
            <Emoji code="1f6c2" x={w[0] - 40} y={w[1] - 120} s={120} pop={at(wordT(sc, /kontrolliert/))} />
            <Img src={staticFile('map/1f697.webp')} style={{position: 'absolute', left: lerp(h[0], w[0], q) - 60, top: lerp(h[1], w[1], q) - 70, width: 120, height: 120, transform: 'scaleX(-1)', filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.4))'}} />
          </>
        );
      })()}
      {cut === 'fall' && (
        <>
          <Tag text="28 JAHRE" red="28" x={540} y={330} size={66} pop={P0} />
          <Tag text="9. NOVEMBER 1989" red="1989" x={540} y={1250} size={54} pop={at(wordT(sc, /November/))} />
          {[[250, 600], [830, 650], [300, 1050], [800, 1080]].map(([x, y], k) => <Emoji key={k} code="1f389" x={x} y={y} s={140} pop={at(wordT(sc, /öffnet/, sc.dur * 0.6) + k * 0.15)} />)}
        </>
      )}
      {cut === 'end' && (
        <>
          <Tag text="Hättest du dort leben wollen?" red="leben" x={540} y={340} size={48} pop={at(sc.start + 0.4)} />
          <Emoji code="1f914" x={Math.min(sbx - 150, 900)} y={sby - 170} s={160} pop={at(sc.start + 0.8)} />
        </>
      )}
    </AbsoluteFill>
  );
};
