// Мультяшные персонажи в полный рост (большая голова, маленькое тело), позы и эмоции.
import React from 'react';

export type Mood = 'ok' | 'happy' | 'sad' | 'shock' | 'cold' | 'angry';
export type Pose = 'stand' | 'point' | 'cheer' | 'cold' | 'fist' | 'walk' | 'hand';
export type Kind = 'napoleon' | 'russian' | 'fsoldier';
const INK = '#1d1d2b';

const Face: React.FC<{mood: Mood; t: number; skin: string}> = ({mood, t, skin}) => {
  const blink = Math.floor(t * 10) % 43 === 0;
  return (
    <g>
      {[-1, 1].map((d) => (
        <g key={d}>
          <ellipse cx={d * 16} cy={-4} rx={9} ry={blink ? 1.5 : mood === 'shock' ? 13 : 11} fill="white" stroke={INK} strokeWidth={3} />
          {!blink && <circle cx={d * 16 + (mood === 'angry' ? -d * 2 : 0)} cy={-2} r={4.5} fill={INK} />}
          {(mood === 'sad' || mood === 'cold') && <path d={`M${d * 6} -20 L${d * 26} -15`} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />}
          {mood === 'angry' && <path d={`M${d * 6} -14 L${d * 27} -22`} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />}
        </g>
      ))}
      {mood === 'shock' ? <ellipse cx={0} cy={22} rx={7} ry={9} fill={INK} /> :
        mood === 'cold' ? <path d="M-16 22 l8 -4 l8 4 l8 -4 l8 4" stroke={INK} strokeWidth={3.5} fill="none" /> :
        mood === 'happy' ? <path d="M-18 14 Q0 38 18 14 Z" fill="#7a1f2b" stroke={INK} strokeWidth={3.5} /> :
        <path d={mood === 'sad' || mood === 'angry' ? 'M-14 26 Q0 14 14 26' : 'M-14 20 Q0 27 14 20'} stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />}
      {mood === 'cold' && <circle r={46} fill="#9fd8ff" opacity={0.25} />}
      {mood === 'sad' && <ellipse cx={17} cy={10 + ((t * 40) % 20)} rx={3} ry={5} fill="#7fd0ff" />}
      <circle cx={-30} cy={12} r={6} fill={skin === '#ffd8a8' ? '#ffb4a0' : '#f0a090'} opacity={0.5} />
      <circle cx={30} cy={12} r={6} fill="#ffb4a0" opacity={0.5} />
    </g>
  );
};

export const Char: React.FC<{x: number; y: number; s?: number; kind: Kind; mood?: Mood; pose?: Pose; t: number; dir?: number; name?: string}> = ({x, y, s = 1, kind, mood = 'ok', pose = 'stand', t, dir = 1, name}) => {
  const skin = '#ffd8a8';
  const coat = kind === 'russian' ? '#c62828' : '#24408f';
  const trousers = kind === 'russian' ? '#3b3b3b' : '#f2f2ee';
  const walk = pose === 'walk' ? Math.sin(t * 10) : 0;
  const shiver = pose === 'cold' || mood === 'cold' ? Math.sin(t * 45) * 2 : 0;
  const bob = pose === 'cheer' ? -Math.abs(Math.sin(t * 7)) * 10 : pose === 'walk' ? -Math.abs(walk) * 4 : 0;
  // руки: [плечо -> кисть] для левой (-1) и правой (+1)
  const arm = (side: number): string => {
    const sx = side * 30, sy = -112;
    let hx = side * 40, hy = -60;
    if (pose === 'point' && side === 1) { hx = 95; hy = -125; }
    if (pose === 'cheer') { hx = side * 55; hy = -185 + Math.sin(t * 7 + side) * 8; }
    if (pose === 'fist') { hx = side * 52; hy = -150 + Math.sin(t * 9 + side) * 10; }
    if (pose === 'cold') { hx = -side * 12; hy = -95; }
    if (pose === 'walk') { hx = side * 34 + walk * side * 14; hy = -62; }
    if (pose === 'hand' && side === 1) { hx = 6; hy = -95; }
    return `M${sx} ${sy} Q${(sx + hx) / 2 + side * 10} ${(sy + hy) / 2} ${hx} ${hy}`;
  };
  const hands = [-1, 1].map((side) => { const m = arm(side).split(' '); return [Number(m[m.length - 2]), Number(m[m.length - 1])]; });
  return (
    <div style={{position: 'absolute', left: x - 130 * s + shiver, top: y - 300 * s + bob * s, width: 260 * s, height: 340 * s}}>
      <svg width={260 * s} height={310 * s} style={{overflow: 'visible'}}>
        <g transform={`translate(${130 * s} ${300 * s}) scale(${s * dir} ${s})`}>
          {/* ноги */}
          {[-1, 1].map((side) => (
            <g key={side} transform={`rotate(${side * walk * 14} ${side * 14} -40)`}>
              <rect x={side * 14 - 10} y={-48} width={20} height={42} rx={8} fill={trousers} stroke={INK} strokeWidth={3} />
              <path d={`M${side * 14 - 12} -10 h26 q4 0 4 6 v6 h-34 Z`} fill="#141414" />
            </g>
          ))}
          {/* туловище */}
          <path d="M-36 -130 Q-42 -90 -34 -42 L34 -42 Q42 -90 36 -130 Q0 -146 -36 -130 Z" fill={coat} stroke={INK} strokeWidth={4} />
          {kind !== 'russian' && <path d="M-18 -132 L0 -86 L18 -132" fill="#f2f2ee" stroke={INK} strokeWidth={2.5} />}
          {kind !== 'russian' && [-1, 1].map((d) => [-112, -96, -80, -64].map((yy) => <circle key={`${d}${yy}`} cx={d * 12} cy={yy} r={3} fill="#ffd84d" />))}
          {kind === 'napoleon' && <path d="M-34 -48 L34 -48" stroke="#e53935" strokeWidth={6} />}
          {kind === 'russian' && <><path d="M-32 -132 L30 -48 M32 -132 L-30 -48" stroke="#f2f2ee" strokeWidth={7} /><path d="M-34 -56 L34 -56" stroke="#1d1d2b" strokeWidth={6} /></>}
          {kind === 'napoleon' && [-1, 1].map((d) => <rect key={d} x={d * 36 - 9} y={-134} width={18} height={9} rx={3} fill="#ffd84d" stroke={INK} strokeWidth={2} />)}
          {/* руки */}
          {[-1, 1].map((side) => <path key={side} d={arm(side)} stroke={coat} strokeWidth={17} fill="none" strokeLinecap="round" />)}
          {[-1, 1].map((side) => <path key={`o${side}`} d={arm(side)} stroke={INK} strokeWidth={21} fill="none" strokeLinecap="round" opacity={0.25} />)}
          {hands.map(([hx, hy], k) => <circle key={k} cx={hx} cy={hy} r={9} fill={skin} stroke={INK} strokeWidth={3} />)}
          {kind === 'fsoldier' && <path d={`M${hands[1][0]} ${hands[1][1]} l6 -70`} stroke="#5a3d26" strokeWidth={6} strokeLinecap="round" />}
          {/* голова */}
          <g transform="translate(0 -178)">
            <circle r={46} fill={skin} stroke={INK} strokeWidth={4} />
            {kind === 'russian' && <path d="M-40 14 Q-36 58 0 60 Q36 58 40 14 Q20 34 0 32 Q-20 34 -40 14 Z" fill="#6b4226" stroke={INK} strokeWidth={3} />}
            <Face mood={mood} t={t} skin={skin} />
            {kind === 'napoleon' && <>
              <path d="M-38 -26 Q-30 -40 0 -40 Q30 -40 38 -26 Q20 -34 0 -32 Q-20 -34 -38 -26 Z" fill="#3b2a1f" />
              <path d="M-80 -30 Q0 -110 80 -30 Q0 -52 -80 -30 Z" fill="#1d1d2b" stroke={INK} strokeWidth={3} />
              <circle cx={0} cy={-58} r={8} fill="#e53935" stroke="white" strokeWidth={3} />
            </>}
            {kind === 'russian' && <>
              <path d="M-50 -18 Q-52 -70 0 -72 Q52 -70 50 -18 Z" fill="#7a5638" stroke={INK} strokeWidth={3} />
              <rect x={-52} y={-26} width={104} height={16} rx={7} fill="#9a7650" stroke={INK} strokeWidth={3} />
              {[-1, 1].map((d) => <rect key={d} x={d * 50 - 9} y={-18} width={18} height={34} rx={8} fill="#9a7650" stroke={INK} strokeWidth={3} />)}
            </>}
            {kind === 'fsoldier' && <>
              <rect x={-30} y={-92} width={60} height={56} rx={6} fill="#1d1d2b" />
              <rect x={-34} y={-42} width={68} height={10} rx={4} fill="#141414" />
              <circle cx={0} cy={-80} r={7} fill="#e53935" />
            </>}
          </g>
        </g>
      </svg>
      {name && <div style={{position: 'absolute', left: -40, right: -40, top: 310 * s, textAlign: 'center'}}><span style={{background: '#111', color: 'white', fontFamily: 'MontserratX', fontWeight: 900, fontSize: 30 * s + 8, padding: '4px 14px', borderRadius: 6}}>{name}</span></div>}
    </div>
  );
};

// лошадь (с всадником или без): галоп, стоит или лежит (замёрзла)
export const Horse: React.FC<{x: number; y: number; s?: number; t: number; dir?: number; rider?: 'french' | 'cossack' | null; state?: 'run' | 'stand' | 'down'; color?: string}> = ({x, y, s = 1, t, dir = 1, rider = null, state = 'run', color = '#8a5a34'}) => {
  const g = state === 'run' ? Math.sin(t * 14) : 0;
  const bob = state === 'run' ? -Math.abs(g) * 6 : 0;
  const leg = (lx: number, ph: number) => {
    const a = state === 'run' ? Math.sin(t * 14 + ph) * 28 : 0;
    return <g key={lx} transform={`rotate(${a} ${lx} -60)`}><rect x={lx - 6} y={-62} width={12} height={58} rx={5} fill={color} stroke={INK} strokeWidth={3} /><rect x={lx - 7} y={-10} width={14} height={9} rx={3} fill="#2b2b2b" /></g>;
  };
  return (
    <svg width={300 * s} height={300 * s} style={{position: 'absolute', left: x - 150 * s, top: y - 280 * s, overflow: 'visible'}}>
      <g transform={`translate(${150 * s} ${280 * s}) scale(${s * dir} ${s}) ${state === 'down' ? 'translate(0 -150) rotate(180 0 -60)' : ''} translate(0 ${bob})`}>
        {leg(-48, 0)}{leg(-30, 2)}{leg(36, 1)}{leg(54, 3)}
        <path d="M-70 -95 Q-100 -80 -92 -40" stroke="#3b2a1f" strokeWidth={12} fill="none" strokeLinecap="round" />
        <ellipse cx={0} cy={-90} rx={78} ry={36} fill={color} stroke={INK} strokeWidth={4} />
        <path d="M50 -105 Q70 -150 92 -160 L112 -135 Q92 -128 78 -96 Z" fill={color} stroke={INK} strokeWidth={4} />
        <path d="M58 -112 Q72 -150 94 -162" stroke="#3b2a1f" strokeWidth={9} fill="none" />
        <ellipse cx={110} cy={-150} rx={24} ry={14} fill={color} stroke={INK} strokeWidth={4} transform="rotate(25 110 -150)" />
        <circle cx={104} cy={-158} r={state === 'down' ? 1 : 4} fill={INK} />
        {state === 'down' && <path d="M98 -162 l12 0" stroke={INK} strokeWidth={3} />}
        {rider && <g transform="translate(-6 -118)">
          <path d="M-14 0 L-24 34 M14 0 L4 34" stroke={rider === 'french' ? '#f2f2ee' : '#3b3b3b'} strokeWidth={11} strokeLinecap="round" />
          <rect x={-22} y={-58} width={44} height={60} rx={16} fill={rider === 'french' ? '#24408f' : '#c62828'} stroke={INK} strokeWidth={3} />
          <path d={`M14 -44 L${rider === 'cossack' ? 70 : 52} ${rider === 'cossack' ? -80 : -56}`} stroke={rider === 'cossack' ? '#5a3d26' : INK} strokeWidth={rider === 'cossack' ? 5 : 9} strokeLinecap="round" />
          <circle cx={0} cy={-84} r={26} fill="#ffd8a8" stroke={INK} strokeWidth={3} />
          <circle cx={8} cy={-86} r={3.5} fill={INK} /><circle cx={-6} cy={-86} r={3.5} fill={INK} />
          {rider === 'french' ? <rect x={-20} y={-136} width={40} height={40} rx={4} fill="#1d1d2b" /> : <path d="M-28 -96 Q-28 -128 0 -128 Q28 -128 28 -96 Z" fill="#3b2a1f" stroke={INK} strokeWidth={3} />}
          {rider === 'cossack' && <path d="M-22 -70 Q0 -50 22 -70" stroke="#3b2a1f" strokeWidth={8} fill="none" />}
        </g>}
      </g>
    </svg>
  );
};

// Кремль: стена, башни, луковичные купола; burn 0..1 — темнеет и горит
export const Kremlin: React.FC<{x: number; y: number; s?: number; burn?: number; t: number}> = ({x, y, s = 1, burn = 0, t}) => {
  const wall = burn > 0 ? `rgb(${Math.round(200 - burn * 110)},${Math.round(60 - burn * 30)},${Math.round(50 - burn * 25)})` : '#c8423a';
  const dome = (cx: number, cy: number, r: number, c: string) => <g key={cx}><rect x={cx - r * 0.55} y={cy} width={r * 1.1} height={r * 2.2} fill="#f2e8d0" stroke={INK} strokeWidth={3} /><path d={`M${cx - r} ${cy} Q${cx - r} ${cy - r * 1.3} ${cx} ${cy - r * 2} Q${cx + r} ${cy - r * 1.3} ${cx + r} ${cy} Z`} fill={c} stroke={INK} strokeWidth={3} /><path d={`M${cx} ${cy - r * 2} v-14`} stroke="#ffd84d" strokeWidth={4} /></g>;
  return (
    <svg width={420 * s} height={330 * s} style={{position: 'absolute', left: x - 210 * s, top: y - 320 * s, overflow: 'visible'}}>
      <g transform={`translate(${210 * s} ${320 * s}) scale(${s})`}>
        {dome(-110, -170, 34, '#2e7d32')}{dome(0, -200, 44, '#ffd84d')}{dome(110, -170, 34, '#1565c0')}
        <rect x={-200} y={-80} width={400} height={80} fill={wall} stroke={INK} strokeWidth={4} />
        {Array.from({length: 10}).map((_, k) => <path key={k} d={`M${-200 + k * 40} -80 l8 -18 l12 0 l8 18`} fill={wall} stroke={INK} strokeWidth={3} />)}
        {[-190, 170].map((tx) => <g key={tx}><rect x={tx} y={-150} width={22} height={150} fill={wall} stroke={INK} strokeWidth={3} /><path d={`M${tx - 6} -150 L${tx + 11} -190 L${tx + 28} -150 Z`} fill="#2e7d32" stroke={INK} strokeWidth={3} /></g>)}
        <rect x={-24} y={-62} width={48} height={62} rx={22} fill="#3b2a1f" />
        {burn > 0 && [-150, -60, 40, 130, -10].map((fx, k) => {
          const h = (50 + 30 * Math.sin(t * 9 + k)) * burn;
          return <path key={k} d={`M${fx - 26} -60 Q${fx - 20} ${-60 - h} ${fx} ${-80 - h * 1.4} Q${fx + 20} ${-60 - h} ${fx + 26} -60 Z`} fill="#ff8a00" stroke="#ffd84d" strokeWidth={3} opacity={0.95} />;
        })}
        {burn > 0.4 && <circle cx={20} cy={-260} r={60 * burn} fill="#555" opacity={0.35} />}
      </g>
    </svg>
  );
};
