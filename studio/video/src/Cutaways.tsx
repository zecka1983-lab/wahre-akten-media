// Библиотека сцен-вставок «Рим и германцы»: показываем то, о чём говорят герои.
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';

const INK = '#1d1d2b';
const FONT = 'Montserrat, sans-serif';
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- маленькие фигурки ----------
export const Legionary: React.FC<{x: number; y: number; s?: number; step?: number; face?: 'ok' | 'shock' | 'sad'; plume?: string; cape?: string}> = ({x, y, s = 1, step = 0, face = 'ok', plume = '#c8202c', cape}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={150} rx={60} ry={10} fill="#000" opacity={0.2} />
    <rect x={-22 + step * 6} y={95} width={18} height={55} fill="#7a4a2a" stroke={INK} strokeWidth={5} />
    <rect x={4 - step * 6} y={95} width={18} height={55} fill="#7a4a2a" stroke={INK} strokeWidth={5} />
    {cape && <path d="M-50 20 Q-70 110 -55 130 L50 130 Q65 110 45 20 Z" fill={cape} stroke={INK} strokeWidth={5} />}
    <rect x={-40} y={10} width={80} height={95} rx={20} fill="#b8323a" stroke={INK} strokeWidth={6} />
    <line x1={-38} x2={38} y1={40} y2={40} stroke="#d9b13b" strokeWidth={8} />
    <circle cx={0} cy={-30} r={48} fill="#ffd696" stroke={INK} strokeWidth={6} />
    <path d="M-50 -30 Q-48 -82 0 -82 Q48 -82 50 -30 L38 -30 Q34 -65 0 -65 Q-34 -65 -38 -30 Z" fill="#d9b13b" stroke={INK} strokeWidth={5} />
    <path d="M-22 -78 Q0 -118 22 -78" fill={plume} stroke={INK} strokeWidth={5} />
    {face === 'shock' ? (
      <>
        <circle cx={-16} cy={-30} r={11} fill="white" stroke={INK} strokeWidth={4} /><circle cx={16} cy={-30} r={11} fill="white" stroke={INK} strokeWidth={4} />
        <circle cx={-16} cy={-29} r={4} fill={INK} /><circle cx={16} cy={-29} r={4} fill={INK} />
        <ellipse cx={0} cy={-6} rx={9} ry={12} fill="#7a1f2b" stroke={INK} strokeWidth={4} />
      </>
    ) : (
      <>
        <circle cx={-16} cy={-30} r={6} fill={INK} /><circle cx={16} cy={-30} r={6} fill={INK} />
        <path d={face === 'sad' ? 'M-14 -4 Q0 -14 14 -4' : 'M-14 -10 Q0 0 14 -10'} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
      </>
    )}
    <rect x={30} y={15} width={45} height={80} rx={8} fill="#b8323a" stroke={INK} strokeWidth={5} />
  </g>
);

export const Germane: React.FC<{x: number; y: number; s?: number; roar?: boolean; wink?: boolean; roman?: boolean}> = ({x, y, s = 1, roar, wink, roman}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={150} rx={60} ry={10} fill="#000" opacity={0.2} />
    <rect x={-22} y={95} width={18} height={55} fill="#5b4632" stroke={INK} strokeWidth={5} />
    <rect x={4} y={95} width={18} height={55} fill="#5b4632" stroke={INK} strokeWidth={5} />
    <rect x={-42} y={10} width={84} height={95} rx={22} fill={roman ? '#b8323a' : '#4f7a3a'} stroke={INK} strokeWidth={6} />
    {roman && <path d="M-55 15 Q-70 100 -60 125 L-40 120 L-40 20 Z" fill="#6a2c8c" stroke={INK} strokeWidth={5} />}
    {!roman && <path d="M-48 18 Q0 0 48 18 L44 40 Q0 30 -44 40 Z" fill="#8a5a33" stroke={INK} strokeWidth={5} />}
    <path d="M-58 -25 Q-60 -92 0 -92 Q60 -92 58 -25 L58 20 L-58 20 Z" fill="#e8c35a" stroke={INK} strokeWidth={5} />
    <circle cx={0} cy={-30} r={46} fill="#f6c9a0" stroke={INK} strokeWidth={6} />
    {roman ? (
      <path d="M-48 -32 Q-46 -84 0 -84 Q46 -84 48 -32 L36 -32 Q32 -66 0 -66 Q-32 -66 -36 -32 Z" fill="#d9b13b" stroke={INK} strokeWidth={5} />
    ) : (
      <path d="M-46 -38 Q-38 -84 0 -84 Q38 -84 46 -38 Q24 -62 0 -60 Q-24 -62 -46 -38 Z" fill="#e8c35a" stroke={INK} strokeWidth={4} />
    )}
    <path d="M-40 -8 Q-36 40 0 46 Q36 40 40 -8 Q26 18 0 18 Q-26 18 -40 -8 Z" fill="#e8c35a" stroke={INK} strokeWidth={4} />
    <circle cx={-16} cy={-34} r={6} fill={INK} />
    {wink ? <path d="M8 -34 h18" stroke={INK} strokeWidth={5} strokeLinecap="round" /> : <circle cx={16} cy={-34} r={6} fill={INK} />}
    {roar ? <ellipse cx={0} cy={2} rx={14} ry={14} fill="#7a1f2b" stroke={INK} strokeWidth={4} /> : <path d="M-14 0 Q0 10 16 -4" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />}
    {!roman && <circle cx={-62} cy={60} r={42} fill="#a8743f" stroke={INK} strokeWidth={6} />}
  </g>
);

const Pine: React.FC<{x: number; y: number; s: number; c: string}> = ({x, y, s, c}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-12} y={-20} width={24} height={60} fill="#4a3424" />
    <path d="M0 -330 L110 -120 L60 -120 L140 20 L-140 20 L-60 -120 L-110 -120 Z" fill={c} stroke={INK} strokeWidth={6} />
  </g>
);

const Rain: React.FC<{t: number}> = ({t}) => (
  <svg width={1080} height={1920} style={{position: 'absolute'}}>
    {Array.from({length: 90}).map((_, i) => {
      const x = (i * 97) % 1100;
      const y = ((t * 1400 + i * 211) % 2100) - 100;
      return <line key={i} x1={x} y1={y} x2={x - 18} y2={y + 60} stroke="rgba(200,220,255,0.55)" strokeWidth={4} />;
    })}
  </svg>
);

const Bubble: React.FC<{x: number; y: number; text: string; o?: number; w?: number}> = ({x, y, text, o = 1, w = 520}) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <rect x={-w / 2} y={-70} width={w} height={110} rx={40} fill="white" stroke={INK} strokeWidth={7} />
    <path d="M-20 38 L-50 90 L20 38 Z" fill="white" stroke={INK} strokeWidth={7} />
    <rect x={-25} y={30} width={50} height={14} fill="white" />
    <text x={0} y={5} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={INK}>{text}</text>
  </g>
);

// ---------- сцены ----------
const March: React.FC<{t: number; local: number; rain: boolean}> = ({t, local, rain}) => {
  const pan = local * 90;
  return (
    <AbsoluteFill style={{background: rain ? 'linear-gradient(#3b4a5a, #26323d)' : 'linear-gradient(#9fd3a5, #4f8f5a)'}}>
      <svg width={1080} height={1920}>
        <g transform={`translate(${-pan * 0.4} 0)`}>
          {Array.from({length: 14}).map((_, i) => <Pine key={i} x={i * 140} y={1000} s={1} c={rain ? '#24452f' : '#3f7f4c'} />)}
        </g>
        <rect x={0} y={1000} width={1080} height={920} fill={rain ? '#5a4632' : '#6f9a4f'} />
        {/* три ряда марширующих легионеров, уходящих вдаль */}
        {[0, 1, 2].map((row) => (
          <g key={row}>
            {Array.from({length: 14}).map((_, k) => {
              const x = ((k * 150 - pan * (1 + row * 0.2)) % 2100) - 200;
              const step = Math.sin(t * 8 + k) > 0 ? 1 : -1;
              const bob = Math.abs(Math.sin(t * 8 + k)) * 8;
              return <Legionary key={k} x={x} y={1080 + row * 170 - bob} s={0.7 + row * 0.25} step={step} face={rain ? 'sad' : 'ok'} />;
            })}
          </g>
        ))}
        <g transform={`translate(${-pan * 1.5} 0)`}>
          {Array.from({length: 8}).map((_, i) => <Pine key={i} x={i * 330 + 100} y={1880} s={1.6} c={rain ? '#1b3a26' : '#2f6b3c'} />)}
        </g>
      </svg>
      {rain && <Rain t={t} />}
    </AbsoluteFill>
  );
};

const Arminius: React.FC<{t: number; local: number}> = ({t, local}) => {
  const walk = local * 60;
  const bubble = interpolate(local, [0.6, 0.9], [0, 1], cl);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#9fd3a5, #4f8f5a)'}}>
      <svg width={1080} height={1920}>
        {/* тёмный лес справа, куда он ведёт */}
        <rect x={700} y={500} width={380} height={800} fill="#16301f" />
        {Array.from({length: 4}).map((_, i) => <Pine key={i} x={760 + i * 110} y={1250} s={1.3} c="#16301f" />)}
        <text x={890} y={700} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill="#ff4d4d" opacity={0.6 + 0.4 * Math.sin(t * 6)}>?!</text>
        <rect x={0} y={1250} width={1080} height={670} fill="#6f9a4f" />
        <Germane x={560 + walk * 0.3} y={1050} s={2.1} roman wink={local % 2 > 1} />
        <path d={`M${700 + walk * 0.3} 1090 l120 -40`} stroke={INK} strokeWidth={22} strokeLinecap="round" />
        <path d={`M${700 + walk * 0.3} 1090 l120 -40`} stroke="#f6c9a0" strokeWidth={12} strokeLinecap="round" />
        <Legionary x={230 + walk * 0.2} y={1080} s={2.1} plume="#ffd84d" cape="#6a2c8c" step={Math.sin(t * 6) > 0 ? 1 : -1} />
        <text x={230 + walk * 0.2} y={1400} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill="white" stroke={INK} strokeWidth={3}>VARUS</text>
        <text x={560 + walk * 0.3} y={1400} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill="white" stroke={INK} strokeWidth={3}>ARMINIUS</text>
        <Bubble x={640} y={700} text="Hier entlang!" o={bubble} />
      </svg>
    </AbsoluteFill>
  );
};

const Ambush: React.FC<{t: number; local: number}> = ({t, local}) => {
  const spots = [[140, 1150], [420, 1100], [700, 1160], [960, 1110], [280, 1330], [840, 1320]];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#3b4a5a, #26323d)'}}>
      <svg width={1080} height={1920}>
        {Array.from({length: 8}).map((_, i) => <Pine key={i} x={i * 150 + 20} y={1150} s={1.2} c="#24452f" />)}
        <rect x={0} y={1150} width={1080} height={770} fill="#5a4632" />
        {/* римляне в центре в шоке */}
        {[380, 540, 700].map((x, k) => <Legionary key={x} x={x} y={1420 + (k === 1 ? 30 : 0)} s={1.3} face="shock" />)}
        {spots.map(([x, y], k) => {
          const up = interpolate(local, [0.2 + k * 0.18, 0.45 + k * 0.18], [180, 0], cl);
          const o = interpolate(local, [0.2 + k * 0.18, 0.3 + k * 0.18], [0, 1], cl);
          return (
            <g key={k} opacity={o}>
              <Germane x={x} y={y + up} s={1.1} roar />
              <text x={x + 50} y={y - 120 + up} fontFamily={FONT} fontWeight={900} fontSize={60} fill="#ffd84d" stroke={INK} strokeWidth={3}>!</text>
            </g>
          );
        })}
        {Array.from({length: 5}).map((_, i) => <Pine key={`f${i}`} x={i * 260 - 20} y={1900} s={1.5} c="#1b3a26" />)}
      </svg>
      <Rain t={t} />
    </AbsoluteFill>
  );
};

const Augustus: React.FC<{t: number; local: number}> = ({t, local}) => {
  const bonk = Math.max(0, Math.sin(local * 7));
  const hit = bonk > 0.95;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#ffe3b3, #f2b872)'}}>
      <svg width={1080} height={1920}>
        <rect x={700} y={300} width={170} height={1100} fill="#f4eee0" stroke={INK} strokeWidth={8} />
        {[0, 1, 2].map((k) => <line key={k} x1={740 + k * 45} y1={330} x2={740 + k * 45} y2={1380} stroke="#d8cfbc" strokeWidth={8} />)}
        <rect x={0} y={1400} width={1080} height={520} fill="#d9c7a3" />
        <g transform={`translate(${460 + bonk * 70} 1000) rotate(${bonk * 18})`}>
          <rect x={-110} y={60} width={220} height={330} rx={60} fill="#fafafa" stroke={INK} strokeWidth={9} />
          <path d="M-110 120 L110 260" stroke="#6a2c8c" strokeWidth={26} />
          <circle cx={0} cy={-60} r={130} fill="#ffd696" stroke={INK} strokeWidth={9} />
          <path d="M-125 -110 Q0 -230 125 -110" stroke="#3f8f3f" strokeWidth={28} fill="none" strokeDasharray="34 12" />
          <path d="M-70 -80 l40 12 M70 -80 l-40 12" stroke={INK} strokeWidth={10} strokeLinecap="round" />
          <path d="M-60 -50 q10 -12 20 0 M40 -50 q10 -12 20 0" stroke={INK} strokeWidth={8} fill="none" />
          <ellipse cx={0} cy={10} rx={45} ry={30} fill="#7a1f2b" stroke={INK} strokeWidth={8} />
          <path d="M-70 -30 q-10 30 0 45" stroke="#7cc8ff" strokeWidth={10} fill="none" />
        </g>
        <text x={540} y={1650} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill="white" stroke={INK} strokeWidth={4}>AUGUSTUS</text>
        {hit && <text x={680} y={820} fontFamily={FONT} fontWeight={900} fontSize={110} fill="#ffd84d" stroke={INK} strokeWidth={5}>BONK!</text>}
        {[0, 1, 2].map((k) => (
          <text key={k} x={560 + Math.cos(t * 5 + k * 2) * 120} y={780 + Math.sin(t * 5 + k * 2) * 40} fontSize={50} fill="#ffd84d" stroke={INK} strokeWidth={2}>★</text>
        ))}
        <Bubble x={420} y={520} w={760} text="Varus, gib mir meine Legionen!" o={interpolate(local, [0.3, 0.5], [0, 1], cl)} />
      </svg>
    </AbsoluteFill>
  );
};

const Numbers: React.FC<{local: number}> = ({local}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#cfc6b4, #9d9480)'}}>
    <svg width={1080} height={1920}>
      {['XVII', 'XVIII', 'XIX'].map((n, k) => {
        const y = 520 + k * 300;
        const slash = interpolate(local, [0.8 + k * 0.7, 1.1 + k * 0.7], [0, 1], cl);
        return (
          <g key={n}>
            <rect x={240} y={y} width={600} height={220} rx={20} fill="#e8e2d2" stroke={INK} strokeWidth={10} />
            <text x={540} y={y + 150} textAnchor="middle" fontFamily="serif" fontWeight={900} fontSize={140} fill="#5a5245">{n}</text>
            <line x1={260} y1={y + 200} x2={260 + 560 * slash} y2={y + 20 + 180 * (1 - slash)} stroke="#e02424" strokeWidth={26} strokeLinecap="round" opacity={slash > 0 ? 1 : 0} />
            <line x1={820} y1={y + 200} x2={820 - 560 * slash} y2={y + 20 + 180 * (1 - slash)} stroke="#e02424" strokeWidth={26} strokeLinecap="round" opacity={slash > 0 ? 1 : 0} />
          </g>
        );
      })}
    </svg>
  </AbsoluteFill>
);

export const Cutaway: React.FC<{name: string; t: number; local: number}> = ({name, t, local}) => {
  if (name === 'march') return <March t={t} local={local} rain={false} />;
  if (name === 'march_rain') return <March t={t} local={local} rain />;
  if (name === 'arminius') return <Arminius t={t} local={local} />;
  if (name === 'ambush') return <Ambush t={t} local={local} />;
  if (name === 'augustus') return <Augustus t={t} local={local} />;
  if (name === 'numbers') return <Numbers local={local} />;
  return null;
};
