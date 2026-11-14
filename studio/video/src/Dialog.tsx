// Диалоговые скетчи: два героя в кадре (Marcus — римлянин, Gunther — германец).
import React from 'react';
import {AbsoluteFill, interpolate, spring} from 'remotion';
import timeline from './timeline.json';
import {Cutaway} from './Cutaways';

const FONT = 'Montserrat, sans-serif';
const INK = '#1d1d2b';
export const SPEAKER = {
  M: {name: 'MARCUS', color: '#ff7a59'},
  G: {name: 'GUNTHER', color: '#8fe36b'},
} as const;

type Sc = {start: number; dur: number; speaker?: string; emo?: string; bg?: string; prop?: string; cut?: string; shots?: string[]; punch?: number; ru?: string; words: {w: string; t: number}[]};
const scenes = timeline.scenes as unknown as Sc[];

const sceneIndex = (t: number) => {
  let i = 0;
  scenes.forEach((s, k) => { if (t >= s.start) i = k; });
  return i;
};

// ---------- фоны ----------
const Pine: React.FC<{x: number; y: number; s: number; c: string}> = ({x, y, s, c}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-12} y={-20} width={24} height={60} fill="#4a3424" />
    <path d="M0 -330 L110 -120 L60 -120 L140 20 L-140 20 L-60 -120 L-110 -120 Z" fill={c} stroke={INK} strokeWidth={6} />
  </g>
);

const Background: React.FC<{bg: string; t: number}> = ({bg, t}) => {
  if (bg === 'rome') {
    return (
      <AbsoluteFill style={{background: 'linear-gradient(#ffe3b3, #f2b872)'}}>
        <svg width={1080} height={1920}>
          {[90, 330, 750, 990].map((x) => (
            <g key={x}>
              <rect x={x - 45} y={420} width={90} height={950} fill="#f4eee0" stroke={INK} strokeWidth={6} />
              {[0, 1, 2].map((k) => <line key={k} x1={x - 25 + k * 25} y1={440} x2={x - 25 + k * 25} y2={1350} stroke="#d8cfbc" strokeWidth={6} />)}
              <rect x={x - 65} y={395} width={130} height={40} fill="#f4eee0" stroke={INK} strokeWidth={6} />
            </g>
          ))}
          <rect x={430} y={460} width={220} height={330} fill="#b8323a" stroke={INK} strokeWidth={6} />
          <text x={540} y={650} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill="#ffd84d">SPQR</text>
          <rect x={0} y={1350} width={1080} height={570} fill="#d9c7a3" />
        </svg>
      </AbsoluteFill>
    );
  }
  const forest = bg === 'forest' || bg === 'rain';
  const dark = bg === 'rain';
  return (
    <AbsoluteFill style={{background: dark ? 'linear-gradient(#3b4a5a, #26323d)' : forest ? 'linear-gradient(#9fd3a5, #4f8f5a)' : 'linear-gradient(#8fd0ff, #d9f1ff)'}}>
      <svg width={1080} height={1920}>
        {!forest && (
          <>
            <circle cx={900} cy={430} r={80} fill="#ffd84d" />
            <path d="M0 1150 Q270 1000 540 1120 T1080 1080 V1920 H0 Z" fill="#7cc36a" />
            {/* римский лагерь: палатки и частокол */}
            {[120, 330].map((x) => <path key={x} d={`M${x} 1180 l90 -140 l90 140 Z`} fill="#e9dcc0" stroke={INK} strokeWidth={6} />)}
            {Array.from({length: 12}).map((_, i) => <path key={i} d={`M${560 + i * 44} 1200 v-120 l18 -26 l18 26 v120 Z`} fill="#a87645" stroke={INK} strokeWidth={5} />)}
            <rect x={0} y={1340} width={1080} height={580} fill="#8bc36f" />
          </>
        )}
        {forest && (
          <>
            {Array.from({length: 9}).map((_, i) => <Pine key={`b${i}`} x={i * 135 + 20} y={1150} s={1.1} c={dark ? '#24452f' : '#3f7f4c'} />)}
            {Array.from({length: 6}).map((_, i) => <Pine key={`f${i}`} x={i * 210 - 40} y={1330} s={1.5} c={dark ? '#1b3a26' : '#2f6b3c'} />)}
            <rect x={0} y={1340} width={1080} height={580} fill={dark ? '#5a4632' : '#5f8f45'} />
            {dark && Array.from({length: 7}).map((_, i) => <ellipse key={i} cx={(i * 173) % 1080} cy={1400 + (i % 3) * 60} rx={90} ry={16} fill="#4a3826" />)}
          </>
        )}
      </svg>
      {dark && (
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          {Array.from({length: 90}).map((_, i) => {
            const x = (i * 97) % 1100;
            const y = ((t * 1400 + i * 211) % 2100) - 100;
            return <line key={i} x1={x} y1={y} x2={x - 18} y2={y + 60} stroke="rgba(200,220,255,0.55)" strokeWidth={4} />;
          })}
        </svg>
      )}
    </AbsoluteFill>
  );
};

// ---------- лицо: глаза, брови, рот по эмоции ----------
export const Face: React.FC<{emo: string; open: number; look: number; blink: boolean; skin: string}> = ({emo, open, look, blink, skin}) => {
  const happy = emo === 'laugh';
  const lid = blink ? 1 : emo === 'smug' ? 0.45 : emo === 'sad' ? 0.3 : 0;
  const eyeR = emo === 'shock' ? 1.25 : 1;
  const brow = {
    angry: ['M-95 -75 L-25 -50', 'M95 -75 L25 -50'],
    sad: ['M-90 -55 L-25 -80', 'M90 -55 L25 -80'],
    shock: ['M-90 -100 Q-55 -120 -20 -100', 'M90 -100 Q55 -120 20 -100'],
    nervous: ['M-90 -70 Q-55 -85 -20 -75', 'M90 -60 Q55 -80 20 -70'],
    proud: ['M-90 -90 Q-55 -105 -20 -90', 'M90 -90 Q55 -105 20 -90'],
    smug: ['M-90 -70 L-20 -75', 'M90 -85 Q55 -100 20 -80'],
  } as Record<string, string[]>;
  const b = brow[emo] ?? ['M-90 -80 Q-55 -92 -20 -80', 'M90 -80 Q55 -92 20 -80'];
  const closed = {
    proud: 'M-45 60 Q0 95 45 60',
    smug: 'M-40 70 Q10 80 50 55',
    nervous: 'M-45 70 q15 -12 30 0 t30 0 t30 0',
    angry: 'M-40 75 Q0 60 40 75',
    sad: 'M-40 80 Q0 55 40 80',
    shock: 'M-15 70 Q0 60 15 70',
    laugh: 'M-50 55 Q0 110 50 55',
  } as Record<string, string>;
  const eye = (cx: number) => (
    <g>
      {happy ? (
        <path d={`M${cx - 30} -15 Q${cx} -50 ${cx + 30} -15`} stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
      ) : (
        <>
          <ellipse cx={cx} cy={-15} rx={34 * eyeR} ry={40 * eyeR} fill="white" stroke={INK} strokeWidth={8} />
          <circle cx={cx + look * 12} cy={-10} r={15} fill={INK} />
          {lid > 0 && <path d={`M${cx - 38} ${-58} h76 v${84 * lid} h-76 Z`} fill={skin} stroke={INK} strokeWidth={8} />}
        </>
      )}
    </g>
  );
  return (
    <g>
      {eye(-55)}{eye(55)}
      <path d={b[0]} stroke={INK} strokeWidth={11} strokeLinecap="round" fill="none" />
      <path d={b[1]} stroke={INK} strokeWidth={11} strokeLinecap="round" fill="none" />
      {open > 0.08 || happy ? (
        <ellipse cx={0} cy={68} rx={happy ? 55 : 40} ry={Math.max(open, happy ? 0.7 : 0) * 42 + 6} fill="#7a1f2b" stroke={INK} strokeWidth={8} />
      ) : (
        <path d={closed[emo] ?? 'M-40 70 Q0 85 40 70'} stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
      )}
      {emo === 'nervous' && <path d="M120 -60 q-16 28 0 38 q16 -10 0 -38" fill="#7cc8ff" stroke={INK} strokeWidth={4} />}
      {emo === 'sad' && <path d="M-60 25 q-10 25 0 35 q10 -10 0 -35" fill="#7cc8ff" />}
      {emo === 'angry' && <circle cx={0} cy={0} r={150} fill="#ff2a2a" opacity={0.18} />}
    </g>
  );
};

// ---------- герои ----------
const Marcus: React.FC<{emo: string; open: number; look: number; blink: boolean}> = (p) => {
  const skin = '#ffd696';
  return (
    <g>
      <ellipse cx={0} cy={560} rx={170} ry={22} fill="#000" opacity={0.2} />
      <rect x={-50} y={470} width={36} height={85} fill="#7a4a2a" stroke={INK} strokeWidth={7} />
      <rect x={14} y={470} width={36} height={85} fill="#7a4a2a" stroke={INK} strokeWidth={7} />
      <rect x={-105} y={150} width={210} height={340} rx={50} fill="#b8323a" stroke={INK} strokeWidth={9} />
      {[210, 260, 310].map((y) => <line key={y} x1={-100} x2={100} y1={y} y2={y} stroke="#d9b13b" strokeWidth={14} />)}
      <circle cx={0} cy={0} r={150} fill={skin} stroke={INK} strokeWidth={10} />
      <path d="M-155 -10 Q-150 -160 0 -160 Q150 -160 155 -10 L118 -10 Q110 -115 0 -115 Q-110 -115 -118 -10 Z" fill="#d9b13b" stroke={INK} strokeWidth={9} />
      <path d="M-60 -150 Q0 -260 60 -150" fill="#c8202c" stroke={INK} strokeWidth={9} />
      <g transform="translate(0 15)"><Face {...p} skin={skin} /></g>
      {/* щит-скутум */}
      <rect x={95} y={170} width={150} height={260} rx={22} fill="#b8323a" stroke={INK} strokeWidth={10} />
      <circle cx={170} cy={300} r={28} fill="#d9b13b" stroke={INK} strokeWidth={7} />
      <path d="M170 182v88M170 330v88" stroke="#d9b13b" strokeWidth={9} />
    </g>
  );
};

const Gunther: React.FC<{emo: string; open: number; look: number; blink: boolean}> = (p) => {
  const skin = '#f6c9a0';
  return (
    <g>
      <ellipse cx={0} cy={560} rx={180} ry={22} fill="#000" opacity={0.2} />
      <rect x={-55} y={470} width={40} height={85} fill="#5b4632" stroke={INK} strokeWidth={7} />
      <rect x={15} y={470} width={40} height={85} fill="#5b4632" stroke={INK} strokeWidth={7} />
      <rect x={-115} y={150} width={230} height={340} rx={55} fill="#4f7a3a" stroke={INK} strokeWidth={9} />
      {/* меховой плащ */}
      <path d="M-130 170 Q0 120 130 170 L120 240 Q60 215 0 230 Q-60 215 -120 240 Z" fill="#8a5a33" stroke={INK} strokeWidth={8} />
      <path d="M-110 200 l15 -18 l15 18 l15 -18 l15 18 M40 200 l15 -18 l15 18 l15 -18 l15 18" stroke="#6b4426" strokeWidth={5} fill="none" />
      {/* волосы сзади */}
      <path d="M-165 10 Q-170 -170 0 -170 Q170 -170 165 10 L165 120 L120 110 L120 0 L-120 0 L-120 110 L-165 120 Z" fill="#e8c35a" stroke={INK} strokeWidth={9} />
      <circle cx={0} cy={0} r={145} fill={skin} stroke={INK} strokeWidth={10} />
      <path d="M-145 -20 Q-120 -150 0 -150 Q120 -150 145 -20 Q90 -95 0 -90 Q-90 -95 -145 -20 Z" fill="#e8c35a" stroke={INK} strokeWidth={8} />
      {/* борода с косичками */}
      <path d="M-120 40 Q-110 170 0 190 Q110 170 120 40 Q90 120 0 120 Q-90 120 -120 40 Z" fill="#e8c35a" stroke={INK} strokeWidth={8} />
      <path d="M-30 180 l-10 70 M30 180 l10 70" stroke="#e8c35a" strokeWidth={22} strokeLinecap="round" />
      <path d="M-30 180 l-10 70 M30 180 l10 70" stroke={INK} strokeWidth={4} strokeDasharray="10 12" />
      <g transform="translate(0 5)"><Face {...p} skin={skin} /></g>
      {/* круглый деревянный щит */}
      <circle cx={-165} cy={330} r={120} fill="#a8743f" stroke={INK} strokeWidth={10} />
      {[-40, 0, 40].map((dx) => <line key={dx} x1={-165 + dx} y1={215} x2={-165 + dx} y2={445} stroke="#8a5a2f" strokeWidth={6} />)}
      <circle cx={-165} cy={330} r={30} fill="#9aa0ad" stroke={INK} strokeWidth={7} />
    </g>
  );
};

// ---------- субтитры с именем говорящего ----------
const DialogCaptions: React.FC<{t: number; fps: number; frame: number; i: number}> = ({t, fps, frame, i}) => {
  const sc = scenes[i];
  const sp = SPEAKER[(sc.speaker as 'M' | 'G') ?? 'M'] ?? SPEAKER.M;
  const chunks: {w: string; t: number}[][] = [];
  let c: {w: string; t: number}[] = [];
  sc.words.forEach((w) => {
    c.push(w);
    if (c.length === 3 || /[.,?!:…–]$/.test(w.w)) { chunks.push(c); c = []; }
  });
  if (c.length) chunks.push(c);
  if (!chunks.length) return null;
  let ci = 0;
  chunks.forEach((ch, k) => { if (t >= ch[0].t) ci = k; });
  const chunk = chunks[ci];
  let cur = 0;
  chunk.forEach((w, k) => { if (t >= w.t) cur = k; });
  const pop = spring({frame: frame - Math.round(chunk[cur].t * fps), fps, config: {damping: 12, stiffness: 220}});
  const longest = Math.max(...chunk.map((w) => w.w.length));
  const size = Math.min(92, Math.floor(1300 / Math.max(longest, 1)));
  return (
    <div style={{position: 'absolute', top: 1470, left: 40, right: 40, textAlign: 'center', fontFamily: FONT, fontWeight: 900}}>
      <div style={{display: 'inline-block', background: sp.color, color: INK, fontSize: 40, padding: '6px 26px', borderRadius: 20, border: `6px solid ${INK}`, marginBottom: 18}}>{sp.name}</div>
      <div style={{fontSize: size, lineHeight: 1.2, textTransform: 'uppercase'}}>
        {chunk.map((w, k) => (
          <span key={`${ci}-${k}`} style={{display: 'inline-block', margin: '0 14px', color: k === cur ? sp.color : 'white', WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill', transform: k === cur ? `scale(${0.9 + 0.12 * pop})` : 'scale(1)', textShadow: `0 8px 0 ${INK}`}}>{w.w}</span>
        ))}
      </div>
      {(timeline as any).showRu && sc.ru && (
        <div style={{marginTop: 22, fontFamily: FONT, fontWeight: 700, fontSize: 38, lineHeight: 1.25, color: '#fff', background: 'rgba(0,0,0,0.55)', padding: '10px 18px', borderRadius: 16}}>{sc.ru}</div>
      )}
    </div>
  );
};

// ---------- сцена ----------
// точки, на которые наводится камера (лица героев в координатах кадра)
const FOCUS = {M: [290, 860], G: [800, 860], two: [540, 980]} as const;

export const DialogScene: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const t = frame / fps;
  const i = sceneIndex(t);
  const sc = scenes[i];
  const local = t - sc.start;
  const speaking = local < sc.dur - 0.35;
  const env = speaking ? interpolate(local, [0, 0.1], [0, 1], {extrapolateRight: 'clamp'}) : 0;
  const mouth = env * (0.45 + 0.55 * Math.abs(Math.sin(t * 13) * Math.sin(t * 7.3 + 1)));
  const isM = sc.speaker === 'M';
  const emoM = isM ? sc.emo ?? '' : 'annoyed';
  const emoG = !isM ? sc.emo ?? '' : 'smug';
  const pop = spring({frame: Math.round(local * fps), fps, config: {damping: 10, stiffness: 140}});
  const bounce = (me: boolean) => (me ? -Math.abs(Math.sin(t * 6)) * 10 : 0);
  const scaleOf = (me: boolean) => (me ? 1 + 0.06 * pop : 0.94);
  const shake = sc.emo === 'shock' || sc.emo === 'angry' ? Math.sin(frame * 2.1) * 6 : 0;
  const blinkM = frame % 97 < 4, blinkG = (frame + 40) % 113 < 4;

  // план камеры: строка делится на части, каждая со своим планом (смена кадра каждые 2–4 с)
  const shots = sc.shots && sc.shots.length ? sc.shots : ['two'];
  const part = Math.min(shots.length - 1, Math.floor(local / (sc.dur / shots.length)));
  const shot = shots[part];
  const partStart = (sc.dur / shots.length) * part;
  const listener = isM ? 'G' : 'M';
  const target = shot === 'closeM' ? 'M' : shot === 'closeG' ? 'G' : shot === 'react' ? listener : 'two';
  const [fx, fy] = FOCUS[target as keyof typeof FOCUS];
  const drift = (local - partStart) * 0.03; // медленный наезд, чтобы кадр «жил»
  const punch = sc.punch ? spring({frame: Math.round(local * fps), fps, config: {damping: 8, stiffness: 300}}) * 0.15 : 0;
  const zoom = (target === 'two' ? 1 : 1.55) + drift + punch;
  // сдвиг ограничен, чтобы картинка всегда закрывала весь экран (без чёрных полос)
  const tx = Math.min(0, Math.max(1080 - 1080 * zoom, 540 - fx * zoom));
  const ty = Math.min(0, Math.max(1920 - 1920 * zoom, 820 - fy * zoom));
  const camTransform = `translate(${tx}px, ${ty}px) scale(${zoom})`;

  if (sc.cut) {
    return (
      <AbsoluteFill>
        <Cutaway name={sc.cut} t={t} local={local} />
        <DialogCaptions t={t} fps={fps} frame={frame} i={i} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: camTransform, transformOrigin: '0 0'}}>
        <Background bg={sc.bg ?? 'camp'} t={t} />
        {sc.prop === 'peek' && (
          <svg width={1080} height={1920} style={{position: 'absolute'}}>
            {[[150, 1050], [420, 980], [700, 1060], [950, 990], [300, 1180], [820, 1170]].map(([x, y], k) => {
              const up = interpolate(local, [k * 0.15, k * 0.15 + 0.3], [60, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
              return (
                <g key={k} transform={`translate(${x} ${y + up}) scale(0.32)`}>
                  <circle r={145} fill="#f6c9a0" stroke={INK} strokeWidth={14} />
                  <path d="M-145 -20 Q-120 -150 0 -150 Q120 -150 145 -20 Q90 -95 0 -90 Q-90 -95 -145 -20 Z" fill="#e8c35a" stroke={INK} strokeWidth={10} />
                  <circle cx={-50} cy={-10} r={22} fill={INK} /><circle cx={50} cy={-10} r={22} fill={INK} />
                </g>
              );
            })}
          </svg>
        )}
        <svg width={1080} height={1920} style={{position: 'absolute', transform: `translateX(${shake}px)`}}>
          <g transform={`translate(290 ${880 + bounce(isM)}) scale(${0.82 * scaleOf(isM)})`}>
            <Marcus emo={emoM} open={isM ? mouth : 0} look={1} blink={blinkM} />
          </g>
          <g transform={`translate(800 ${880 + bounce(!isM)}) scale(${0.82 * scaleOf(!isM)})`}>
            <Gunther emo={emoG} open={!isM ? mouth : 0} look={-1} blink={blinkG} />
          </g>
          {sc.prop === 'heat' && [0, 1, 2].map((k) => (
            <path key={k} d={`M${200 + k * 60} ${1370 - ((t * 120 + k * 40) % 120)} q15 -20 0 -40 q-15 -20 0 -40`} stroke="#ff8a3d" strokeWidth={8} fill="none" opacity={0.8} />
          ))}
          {sc.prop === 'vanish' && [0, 1, 2].map((k) => {
            const o = interpolate(local, [0.3 + k * 0.4, 0.8 + k * 0.4], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return (
              <g key={k} transform={`translate(${120 + k * 120} 560)`} opacity={o}>
                <rect x={-35} y={0} width={70} height={110} rx={14} fill="#b8323a" stroke={INK} strokeWidth={6} />
                <circle cx={0} cy={-25} r={40} fill="#ffd696" stroke={INK} strokeWidth={6} />
                <path d="M-42 -30 Q-40 -72 0 -72 Q40 -72 42 -30 Z" fill="#d9b13b" stroke={INK} strokeWidth={6} />
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>
      <DialogCaptions t={t} fps={fps} frame={frame} i={i} />
    </AbsoluteFill>
  );
};
