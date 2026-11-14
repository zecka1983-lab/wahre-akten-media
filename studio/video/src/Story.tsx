// «Unglaubliche wahre Geschichten aus Deutschland»: кинематографичные сцены рассказа.
// Каждая строка сценария имеет "cut" — имя сцены. Общие элементы: люди, шар, вышки, прожекторы.
import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile} from 'remotion';
import timeline from './timeline.json';
import {Insert} from './Inserts';
import {Face} from './Dialog';

const INK = '#1d1d2b';
const FONT = 'Montserrat, sans-serif';
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
type Sc = {start: number; dur: number; cut?: string; big?: string; cuts?: {t: number; cam?: number; insert?: string}[]};
const scenes = timeline.scenes as unknown as Sc[];

// ---------- общие элементы ----------
const Stars: React.FC<{t: number; n?: number; h?: number}> = ({t, n = 70, h = 1300}) => (
  <>
    {Array.from({length: n}).map((_, i) => (
      <circle key={i} cx={random(`sx${i}`) * 1080} cy={random(`sy${i}`) * h} r={1.5 + random(`sr${i}`) * 2.5} fill="white" opacity={0.3 + 0.7 * Math.abs(Math.sin(t * (0.5 + random(`st${i}`)) + i))} />
    ))}
  </>
);

export const Person: React.FC<{x: number; y: number; s?: number; kid?: boolean; c?: string; hair?: string; arms?: 'down' | 'up' | 'hold'; t?: number; face?: 'ok' | 'fear' | 'joy'}> = ({x, y, s = 1, kid, c = '#4a6cf7', hair = '#3b2a1f', arms = 'down', face = 'ok'}) => {
  const k = kid ? 0.7 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * k})`}>
      <rect x={-20} y={60} width={16} height={50} rx={6} fill="#2b2b3a" />
      <rect x={4} y={60} width={16} height={50} rx={6} fill="#2b2b3a" />
      <rect x={-32} y={-10} width={64} height={80} rx={22} fill={c} stroke={INK} strokeWidth={5} />
      {arms === 'up' ? (
        <path d="M-28 5 L-52 -50 M28 5 L52 -50" stroke={INK} strokeWidth={14} strokeLinecap="round" />
      ) : arms === 'hold' ? (
        <path d="M-28 10 L-10 30 M28 10 L10 30" stroke={INK} strokeWidth={12} strokeLinecap="round" />
      ) : (
        <path d="M-30 5 L-38 55 M30 5 L38 55" stroke={INK} strokeWidth={12} strokeLinecap="round" />
      )}
      <circle cx={0} cy={-42} r={34} fill="#ffd8a8" stroke={INK} strokeWidth={5} />
      <path d="M-34 -48 Q-30 -82 0 -80 Q30 -82 34 -48 Q18 -62 0 -60 Q-18 -62 -34 -48 Z" fill={hair} />
      <circle cx={-11} cy={-42} r={face === 'fear' ? 6 : 4.5} fill={INK} />
      <circle cx={11} cy={-42} r={face === 'fear' ? 6 : 4.5} fill={INK} />
      {face === 'joy' ? <path d="M-14 -26 Q0 -10 14 -26" stroke={INK} strokeWidth={5} fill="#7a1f2b" /> :
        face === 'fear' ? <ellipse cx={0} cy={-22} rx={6} ry={8} fill={INK} /> :
          <path d="M-10 -24 Q0 -18 10 -24" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />}
    </g>
  );
};

// лоскутный шар (настоящий был сшит из кусков разной ткани)
export const Balloon: React.FC<{x: number; y: number; s?: number; flame?: number; people?: boolean; t?: number; deflate?: number}> = ({x, y, s = 1, flame = 0, people = true, t = 0, deflate = 0}) => {
  const cols = ['#d94848', '#f2c14e', '#3d7dd8', '#e8e2d2', '#4caf6a', '#d94848', '#f2c14e', '#3d7dd8'];
  const sq = 1 - deflate * 0.6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g transform={`scale(1 ${sq}) translate(0 ${deflate * 120})`}>
        <clipPath id="env"><path d="M0 -320 C180 -320 230 -150 160 -20 L60 90 L-60 90 L-160 -20 C-230 -150 -180 -320 0 -320 Z" /></clipPath>
        <g clipPath="url(#env)">
          {cols.map((c, i) => <rect key={i} x={-240 + i * 60} y={-330} width={60} height={430} fill={c} />)}
          <path d="M-240 -120 Q0 -90 240 -120 M-240 -30 Q0 0 240 -30" stroke="rgba(0,0,0,0.15)" strokeWidth={8} fill="none" />
          <ellipse cx={-70} cy={-210} rx={40} ry={80} fill="white" opacity={0.18} />
        </g>
        <path d="M0 -320 C180 -320 230 -150 160 -20 L60 90 L-60 90 L-160 -20 C-230 -150 -180 -320 0 -320 Z" fill="none" stroke={INK} strokeWidth={8} />
      </g>
      <path d="M-60 90 L-50 190 M60 90 L50 190 M-20 92 L-25 190 M20 92 L25 190" stroke={INK} strokeWidth={4} />
      {flame > 0 && (
        <g>
          <ellipse cx={0} cy={110} rx={70 * flame} ry={90 * flame} fill="#ffb347" opacity={0.25} />
          <path d={`M-18 165 Q0 ${80 - flame * 40 - Math.sin(t * 30) * 10} 18 165 Z`} fill="#ff8a3d" />
          <path d={`M-9 165 Q0 ${110 - flame * 30} 9 165 Z`} fill="#ffe28a" />
        </g>
      )}
      <rect x={-75} y={185} width={150} height={14} rx={4} fill="#8a6a45" stroke={INK} strokeWidth={4} />
      {people && [-55, -30, -8, 14, 36, 58, -42, 46].map((px, i) => (
        <g key={i} transform={`translate(${px} ${172 - (i > 5 ? 0 : (i % 2) * 4)})`}>
          <circle r={i > 5 ? 8 : 11} fill="#ffd8a8" stroke={INK} strokeWidth={3} />
        </g>
      ))}
    </g>
  );
};

const Watchtower: React.FC<{x: number; y: number; s?: number; beam?: number; t?: number}> = ({x, y, s = 1, beam, t = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {beam !== undefined && (
      <path d={`M0 -200 L${-260 + Math.sin(t * 0.9 + beam) * 380} 260 L${-80 + Math.sin(t * 0.9 + beam) * 380} 260 Z`} fill="rgba(255,250,200,0.22)" />
    )}
    <rect x={-22} y={-170} width={44} height={260} fill="#9a9a9a" stroke={INK} strokeWidth={6} />
    <rect x={-55} y={-250} width={110} height={85} rx={8} fill="#b5b5b5" stroke={INK} strokeWidth={6} />
    <rect x={-40} y={-232} width={80} height={36} fill="#ffe28a" opacity={0.85} />
    <rect x={-65} y={-268} width={130} height={22} fill="#7a7a7a" stroke={INK} strokeWidth={6} />
    <circle cx={45} cy={-205} r={12} fill="#fff6c0" stroke={INK} strokeWidth={4} />
  </g>
);

const Fence: React.FC<{y: number; h?: number; dark?: boolean}> = ({y, h = 160, dark}) => (
  <g>
    {Array.from({length: 23}).map((_, i) => <rect key={i} x={i * 48} y={y - h} width={8} height={h} fill={dark ? '#5a5f6a' : '#8a8f99'} />)}
    {Array.from({length: 7}).map((_, i) => <line key={i} x1={0} x2={1080} y1={y - h + i * (h / 6)} y2={y - h + i * (h / 6)} stroke={dark ? '#5a5f6a' : '#9aa0aa'} strokeWidth={3} />)}
  </g>
);

const Label: React.FC<{x: number; y: number; text: string; c?: string; size?: number; o?: number}> = ({x, y, text, c = '#ffd84d', size = 48, o = 1}) => (
  <g opacity={o}>
    <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={c} stroke={INK} strokeWidth={size / 9} paintOrder="stroke">{text}</text>
  </g>
);

// ---------- сцены ----------
const NightSky: React.FC<{t: number; top?: string; bottom?: string}> = ({t, top = '#0b1030', bottom = '#2a2350'}) => (
  <AbsoluteFill style={{background: `linear-gradient(${top}, ${bottom})`}}>
    <svg width={1080} height={1920}><Stars t={t} /></svg>
  </AbsoluteFill>
);

const Hook: React.FC<{t: number; local: number; dur: number}> = ({t, local, dur}) => {
  const bx = interpolate(local, [0, dur], [-150, 1150]);
  const secs = Math.max(0, 28 * 60 - Math.floor(local * 37));
  return (
    <>
      <NightSky t={t} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <circle cx={850} cy={380} r={70} fill="#f4efd8" opacity={0.9} />
        <Balloon x={bx} y={700 + Math.sin(t) * 20} s={0.9} flame={0.6 + 0.4 * Math.abs(Math.sin(t * 3))} t={t} />
        <rect x={0} y={1260} width={1080} height={660} fill="#151a24" />
        <Watchtower x={180} y={1260} s={1} beam={0} t={t} />
        <Watchtower x={880} y={1260} s={1} beam={2} t={t} />
        <Fence y={1300} dark />
      </svg>
      <div style={{position: 'absolute', top: 430, left: 60, fontFamily: 'monospace', fontWeight: 900, fontSize: 64, color: '#ff4d4d', textShadow: '0 0 20px #ff4d4d'}}>
        {String(Math.floor(secs / 60)).padStart(2, '0')}:{String(secs % 60).padStart(2, '0')}
      </div>
    </>
  );
};

const MapScene: React.FC<{t: number; local: number}> = ({t, local}) => {
  const ping = (local * 1.2) % 1;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#1b2a3a, #0f1822)'}}>
      <svg width={1080} height={1920}>
        {/* упрощённая карта Германии: запад и ГДР */}
        <path d="M300 380 L520 330 L560 420 L600 520 L560 700 L590 900 L520 1080 L560 1250 L430 1330 L320 1270 L270 1080 L230 880 L260 700 L230 520 Z" fill="#3d6ea8" stroke="#e8e2d2" strokeWidth={5} />
        <path d="M520 330 L720 300 L820 380 L830 600 L800 820 L700 900 L590 900 L560 700 L600 520 L560 420 Z" fill="#8a3b3b" stroke="#e8e2d2" strokeWidth={5} />
        <path d="M520 330 L560 420 L600 520 L560 700 L590 900" stroke="#ff4d4d" strokeWidth={10} fill="none" strokeDasharray="22 12" />
        <Label x={380} y={760} text="BRD" c="#bfe0ff" size={56} />
        <Label x={700} y={560} text="DDR" c="#ffc0c0" size={56} />
        <circle cx={650} cy={820} r={14} fill="#ffd84d" stroke={INK} strokeWidth={5} />
        <circle cx={650} cy={820} r={14 + ping * 60} fill="none" stroke="#ffd84d" strokeWidth={4} opacity={1 - ping} />
        <Label x={720} y={790} text="Pößneck" size={42} c="white" o={interpolate(local, [0.3, 0.6], [0, 1], cl)} />
        {/* семьи */}
        {[0, 1, 2, 3].map((i) => <Person key={i} x={360 + i * 110} y={1240} s={1.1} kid={i % 2 === 1} c={['#4a6cf7', '#d94848', '#4caf6a', '#f2c14e'][i]} t={t} />)}
      </svg>
    </AbsoluteFill>
  );
};

const Border: React.FC<{t: number; local: number}> = ({t, local}) => {
  const dogX = ((local * 120) % 1400) - 200;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#0d1220, #1f2433)'}}>
      <svg width={1080} height={1920}>
        <Stars t={t} n={40} h={700} />
        <rect x={0} y={1000} width={1080} height={920} fill="#3a3530" />
        <rect x={0} y={1080} width={1080} height={160} fill="#6d6250" />
        {Array.from({length: 30}).map((_, i) => <line key={i} x1={i * 40} y1={1090 + (i % 3) * 40} x2={i * 40 + 20} y2={1100 + (i % 3) * 40} stroke="#5a5040" strokeWidth={4} />)}
        <Fence y={1080} h={220} />
        <Fence y={1300} h={200} dark />
        <Watchtower x={540} y={1000} s={1.4} beam={1} t={t} />
        {/* предупреждающий знак */}
        <g transform="translate(160 1180)">
          <rect x={-90} y={-60} width={180} height={110} fill="#f2f2f2" stroke={INK} strokeWidth={6} />
          <text x={0} y={-12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#c62828">HALT!</text>
          <text x={0} y={28} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={INK}>MINEN</text>
          <rect x={-6} y={50} width={12} height={90} fill="#7a7a7a" />
        </g>
        {/* патруль с собакой */}
        <g transform={`translate(${dogX} 1200)`}>
          <Person x={0} y={0} s={1} c="#5b6b4a" hair="#2b2b2b" />
          <ellipse cx={90} cy={60} rx={45} ry={22} fill="#4a3a2a" />
          <circle cx={135} cy={45} r={18} fill="#4a3a2a" />
          <path d="M30 20 Q60 40 90 50" stroke={INK} strokeWidth={3} fill="none" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const Sewing: React.FC<{t: number; local: number}> = ({t, local}) => {
  const feed = (local * 80) % 120;
  const needle = Math.sin(t * 40) * 18;
  return (
    <AbsoluteFill style={{background: '#14121c'}}>
      <svg width={1080} height={1920}>
        {/* окно с луной */}
        <rect x={700} y={300} width={260} height={320} fill="#1c2a48" stroke="#3b3550" strokeWidth={14} />
        <circle cx={830} cy={420} r={45} fill="#f4efd8" />
        <line x1={830} y1={300} x2={830} y2={620} stroke="#3b3550" strokeWidth={10} />
        {/* конус света лампы */}
        <path d="M420 380 L180 1250 L700 1250 Z" fill="rgba(255,226,138,0.18)" />
        <path d="M380 320 h80 l30 60 h-140 Z" fill="#f2c14e" stroke={INK} strokeWidth={6} />
        <line x1={420} y1={200} x2={420} y2={320} stroke="#555" strokeWidth={6} />
        <rect x={100} y={1250} width={880} height={40} fill="#6b4a2f" stroke={INK} strokeWidth={6} />
        {/* швейная машинка */}
        <g transform="translate(380 1050)">
          <path d="M-160 200 L-160 60 Q-160 0 -100 0 L160 0 Q200 0 200 40 L200 90 L40 90 L40 200 Z" fill="#2b2f3a" stroke={INK} strokeWidth={8} />
          <rect x={-200} y={190} width={440} height={20} fill="#3a3f4c" stroke={INK} strokeWidth={6} />
          <line x1={160} y1={90} x2={160} y2={150 + needle} stroke="#cfd3dc" strokeWidth={6} />
          <text x={-30} y={60} fontFamily="serif" fontStyle="italic" fontSize={34} fill="#d9b13b">Veritas</text>
        </g>
        {/* лоскуты ткани ползут под иглой */}
        {Array.from({length: 8}).map((_, i) => {
          const x = 980 - ((i * 120 + feed) % 960);
          return <rect key={i} x={x} y={1225} width={120} height={30} fill={['#d94848', '#f2c14e', '#3d7dd8', '#e8e2d2'][i % 4]} stroke={INK} strokeWidth={3} />;
        })}
        <Person x={780} y={1130} s={1.6} c="#d94848" hair="#6b3a1f" arms="hold" />
        {/* часы */}
        <g transform="translate(250 820)">
          <circle r={70} fill="#e8e2d2" stroke={INK} strokeWidth={8} />
          <line x1={0} y1={0} x2={0} y2={-45} stroke={INK} strokeWidth={8} transform={`rotate(${t * 60})`} />
          <line x1={0} y1={0} x2={30} y2={0} stroke={INK} strokeWidth={8} transform={`rotate(${t * 5 - 30})`} />
        </g>
        <Label x={250} y={950} text="02:00" size={40} c="white" />
      </svg>
    </AbsoluteFill>
  );
};

const Shops: React.FC<{t: number; local: number}> = ({local}) => {
  const names = ['STOFFE', 'TEXTIL', 'HO-KAUFHAUS', 'KONSUM', 'STOFFE'];
  const pan = local * 260;
  const rolls = Math.min(12, Math.floor(local * 3));
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#8fa3b8, #c9c2b0)'}}>
      <svg width={1080} height={1920}>
        <rect x={0} y={1150} width={1080} height={770} fill="#7a7a7a" />
        <g transform={`translate(${-pan} 0)`}>
          {names.map((n, i) => (
            <g key={i} transform={`translate(${i * 520 + 60} 0)`}>
              <rect x={0} y={520} width={460} height={630} fill={['#e8d8b8', '#d8c8a8', '#c8d0d8', '#e0d0c0', '#e8d8b8'][i]} stroke={INK} strokeWidth={8} />
              <rect x={30} y={560} width={400} height={80} fill={INK} />
              <text x={230} y={618} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#ffd84d">{n}</text>
              <rect x={40} y={690} width={180} height={300} fill="#a8c8e0" stroke={INK} strokeWidth={6} />
              <rect x={260} y={690} width={160} height={460} fill="#7a5a3a" stroke={INK} strokeWidth={6} />
            </g>
          ))}
        </g>
        <Person x={540} y={1180} s={1.5} c="#4a6cf7" arms="hold" />
        {/* растущая стопка рулонов */}
        {Array.from({length: rolls}).map((_, i) => (
          <rect key={i} x={760 + (i % 3) * 70} y={1240 - Math.floor(i / 3) * 50} width={66} height={46} rx={20} fill={['#d94848', '#f2c14e', '#3d7dd8', '#e8e2d2', '#4caf6a'][i % 5]} stroke={INK} strokeWidth={4} />
        ))}
        <Label x={860} y={1060} text={`+${rolls * 10} m`} size={52} />
      </svg>
    </AbsoluteFill>
  );
};

const Crash: React.FC<{t: number; local: number; dur: number}> = ({t, local, dur}) => {
  const up = interpolate(local, [0, dur * 0.35], [0, 1], cl);
  const fall = interpolate(local, [dur * 0.4, dur * 0.8], [0, 1], cl);
  const y = 1000 - up * 450 + fall * 700;
  return (
    <>
      <NightSky t={t} top="#1a1838" bottom="#4a2f4f" />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <Balloon x={380 + local * 25} y={y} s={0.7} flame={fall > 0 ? 0 : 0.8} t={t} deflate={fall * 0.8} />
        {Array.from({length: 9}).map((_, i) => (
          <path key={i} d={`M${i * 130 - 20} 1320 l70 -260 l70 260 Z`} fill="#16301f" stroke={INK} strokeWidth={4} />
        ))}
        <rect x={0} y={1310} width={1080} height={610} fill="#101a12" />
        <Fence y={1250} h={120} dark />
        <Watchtower x={930} y={1250} s={0.8} beam={0.5} t={t} />
        {/* отметка расстояния до границы */}
        <g opacity={interpolate(local, [dur * 0.7, dur * 0.85], [0, 1], cl)}>
          <line x1={480} y1={1180} x2={880} y2={1180} stroke="#ff4d4d" strokeWidth={6} strokeDasharray="16 10" />
          <Label x={680} y={1150} text="~ 200 m" c="#ff4d4d" size={56} />
        </g>
      </svg>
    </>
  );
};

const Stasi: React.FC<{t: number; local: number}> = ({t, local}) => {
  const stamp = interpolate(local, [1.2, 1.5], [3, 1], cl);
  const so = interpolate(local, [1.2, 1.3], [0, 1], cl);
  return (
    <AbsoluteFill style={{background: '#0a0f0c'}}>
      <svg width={1080} height={1920}>
        {Array.from({length: 7}).map((_, i) => <rect key={i} x={i * 170 + 20} y={300} width={40} height={1000} fill="#1a2a1e" />)}
        {/* лучи фонарей */}
        {[0, 1].map((k) => (
          <path key={k} d={`M${300 + k * 480} 1050 L${380 + k * 300 + Math.sin(t * 1.5 + k * 2) * 160} 1290 L${520 + k * 300 + Math.sin(t * 1.5 + k * 2) * 160} 1290 Z`} fill="rgba(255,250,200,0.28)" />
        ))}
        <rect x={0} y={1290} width={1080} height={630} fill="#141c14" />
        {/* остатки шара */}
        <path d="M380 1300 q60 -70 140 -30 q90 -60 160 20 q40 30 -20 50 h-260 Z" fill="#d94848" stroke={INK} strokeWidth={6} />
        <path d="M450 1290 q40 -40 90 -10" stroke="#f2c14e" strokeWidth={22} fill="none" />
        {/* офицеры в серых плащах */}
        {[260, 820].map((x, k) => (
          <g key={k} transform={`translate(${x} 1150)`}>
            <Person x={0} y={0} s={1.6} c="#5d6670" hair="#2b2b2b" face="ok" />
            <rect x={-46} y={-150} width={92} height={22} rx={6} fill="#4a525a" stroke={INK} strokeWidth={5} />
            <rect x={-36} y={-175} width={72} height={30} rx={6} fill="#4a525a" stroke={INK} strokeWidth={5} />
          </g>
        ))}
      </svg>
      <div style={{position: 'absolute', top: 500, width: '100%', textAlign: 'center', opacity: so, transform: `scale(${stamp}) rotate(-8deg)`}}>
        <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 120, color: '#e02424', border: '12px solid #e02424', padding: '6px 40px', borderRadius: 18}}>FAHNDUNG</span>
      </div>
    </AbsoluteFill>
  );
};

const Countdown: React.FC<{t: number; local: number; dur: number}> = ({t, local, dur}) => {
  const day = Math.min(42, Math.floor(interpolate(local, [0, dur * 0.85], [1, 42], cl)));
  const area = Math.floor(interpolate(local, [0, dur * 0.9], [0, 1245], cl));
  const grow = interpolate(local, [0, dur], [0.35, 0.9], cl);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#1a1626, #2a1f2f)'}}>
      <svg width={1080} height={1920}>
        {/* отрывной календарь */}
        <g transform="translate(260 560)">
          <rect x={-150} y={-160} width={300} height={320} rx={18} fill="#f2f2f2" stroke={INK} strokeWidth={8} />
          <rect x={-150} y={-160} width={300} height={80} rx={18} fill="#d94848" stroke={INK} strokeWidth={8} />
          <text x={0} y={-105} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="white">TAG</text>
          <text x={0} y={90} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={150} fill={INK}>{day}</text>
        </g>
        <Balloon x={760} y={900} s={grow} people={false} t={t} />
        <Label x={760} y={1320} text={`${area.toLocaleString('de-DE')} m²`} size={64} />
        <Label x={260} y={820} text="/ 42" size={46} c="white" />
      </svg>
    </AbsoluteFill>
  );
};

const Launch: React.FC<{t: number; local: number; dur: number}> = ({t, local, dur}) => {
  const inflate = interpolate(local, [0, dur * 0.45], [0.3, 1], cl);
  const lift = interpolate(local, [dur * 0.65, dur], [0, 520], cl);
  const flame = local > dur * 0.3 ? 0.7 + 0.3 * Math.abs(Math.sin(t * 12)) : 0.2;
  return (
    <>
      <NightSky t={t} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <rect x={0} y={1320} width={1080} height={600} fill="#1a2418" />
        <g transform={`translate(540 ${1020 - lift})`}>
          <g transform={`scale(1.25 ${1.25 * inflate}) translate(0 ${(1 - inflate) * 160})`}>
            <Balloon x={0} y={0} s={1} flame={flame} t={t} />
          </g>
        </g>
        <ellipse cx={540} cy={1330} rx={300} ry={30} fill="#ffb347" opacity={flame * 0.25} />
      </svg>
    </>
  );
};

const Flight: React.FC<{t: number; local: number; dur: number}> = ({t, local, dur}) => {
  const alt = Math.floor(interpolate(local, [0, dur * 0.5], [800, 2000], cl));
  const gas = interpolate(local, [0, dur], [0.55, 0.08], cl);
  const lights = (local * 60) % 1080;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#050816, #142040)'}}>
      <svg width={1080} height={1920}>
        <Stars t={t} n={90} h={1000} />
        {/* земля далеко внизу с прожекторами */}
        <rect x={0} y={1300} width={1080} height={620} fill="#070a10" />
        {Array.from({length: 14}).map((_, i) => <circle key={i} cx={(i * 160 + lights) % 1200 - 60} cy={1350 + (i % 3) * 30} r={5} fill="#ffe28a" />)}
        {[0, 1, 2].map((k) => (
          <path key={k} d={`M${200 + k * 340} 1360 L${150 + k * 340 + Math.sin(t + k * 2) * 220} 900 L${230 + k * 340 + Math.sin(t + k * 2) * 220} 900 Z`} fill="rgba(255,250,200,0.13)" />
        ))}
        {/* иней */}
        {Array.from({length: 40}).map((_, i) => (
          <circle key={i} cx={(random(`fx${i}`) * 1080 + t * 40) % 1080} cy={(random(`fy${i}`) * 1300 + t * 90) % 1300} r={3} fill="#cfe8ff" opacity={0.7} />
        ))}
        <Balloon x={540} y={760 + Math.sin(t * 1.3) * 15} s={1.1} flame={gas > 0.15 ? 0.6 + 0.4 * Math.abs(Math.sin(t * 9)) : 0.15} t={t} />
      </svg>
      {/* HUD как в игре: высота и газ */}
      <div style={{position: 'absolute', top: 430, left: 50, fontFamily: 'monospace', fontWeight: 900, color: '#8fe3ff'}}>
        <div style={{fontSize: 34}}>HÖHE</div>
        <div style={{fontSize: 70}}>{alt} m</div>
        <div style={{fontSize: 34, marginTop: 20}}>GAS</div>
        <div style={{width: 240, height: 34, border: '5px solid #8fe3ff', borderRadius: 8, marginTop: 6}}>
          <div style={{width: `${gas * 100}%`, height: '100%', background: gas < 0.2 ? '#ff4d4d' : '#8fe3ff'}} />
        </div>
        <div style={{fontSize: 34, marginTop: 20}}>−20 °C</div>
      </div>
    </AbsoluteFill>
  );
};

const Landing: React.FC<{t: number; local: number; dur: number}> = ({t, local, dur}) => {
  const head = interpolate(local, [dur * 0.5, dur], [0, 1], cl);
  return (
    <>
      <NightSky t={t} top="#05070f" bottom="#141a2a" />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <rect x={0} y={1100} width={1080} height={820} fill="#1d2616" />
        {Array.from({length: 18}).map((_, i) => <line key={i} x1={i * 70} y1={1100} x2={i * 70 - 200} y2={1920} stroke="#26321d" strokeWidth={6} />)}
        <Balloon x={760} y={1080} s={0.8} people={false} t={t} deflate={0.95} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Person key={i} x={260 + (i % 4) * 85} y={1260 + Math.floor(i / 4) * 40} s={0.9} kid={i >= 4} c={['#4a6cf7', '#d94848', '#4caf6a', '#f2c14e'][i % 4]} face="fear" />
        ))}
        {/* фары вдали */}
        <circle cx={120} cy={1110} r={6 + head * 22} fill="#fff6c0" opacity={head} />
        <circle cx={170} cy={1110} r={6 + head * 22} fill="#fff6c0" opacity={head} />
        <ellipse cx={145} cy={1110} rx={60 + head * 160} ry={20 + head * 40} fill="rgba(255,246,192,0.15)" opacity={head} />
        <Label x={540} y={780} text="?" size={260} c="white" o={0.6 + 0.4 * Math.sin(t * 4)} />
      </svg>
    </>
  );
};

const Police: React.FC<{t: number; local: number; dur: number}> = ({t, local, dur}) => {
  const car = interpolate(local, [0, dur * 0.35], [-500, 200], cl);
  const reveal = interpolate(local, [dur * 0.55, dur * 0.65], [0, 1], cl);
  const blue = Math.sin(t * 14) > 0;
  return (
    <AbsoluteFill style={{background: `linear-gradient(${reveal > 0.5 ? '#f7b26a' : '#141a2a'}, ${reveal > 0.5 ? '#ffe3b3' : '#1d2616'})`}}>
      <svg width={1080} height={1920}>
        <rect x={0} y={1150} width={1080} height={770} fill={reveal > 0.5 ? '#6f9a4f' : '#1d2616'} />
        {/* полицейская машина 1979: зелёно-белая */}
        <g transform={`translate(${car} 1000)`}>
          <rect x={0} y={60} width={420} height={110} rx={24} fill="#f2f2f2" stroke={INK} strokeWidth={8} />
          <path d="M70 60 L120 0 H300 L350 60 Z" fill="#2e7d4f" stroke={INK} strokeWidth={8} />
          <rect x={0} y={100} width={420} height={34} fill="#2e7d4f" />
          <text x={210} y={128} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="white">POLIZEI</text>
          <rect x={185} y={-22} width={50} height={22} rx={6} fill={blue ? '#3d7dff' : '#1a2a5a'} />
          <circle cx={90} cy={175} r={36} fill="#2b2b2b" stroke={INK} strokeWidth={6} />
          <circle cx={330} cy={175} r={36} fill="#2b2b2b" stroke={INK} strokeWidth={6} />
        </g>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Person key={i} x={700 + (i % 4) * 85 - 100} y={1270 + Math.floor(i / 4) * 40 - (reveal > 0.5 ? Math.abs(Math.sin(t * 8 + i)) * 40 : 0)} s={0.9} kid={i >= 4} arms={reveal > 0.5 ? 'up' : 'down'} face={reveal > 0.5 ? 'joy' : 'fear'} c={['#4a6cf7', '#d94848', '#4caf6a', '#f2c14e'][i % 4]} />
        ))}
        {/* баварский флаг-ромбы */}
        <g opacity={reveal} transform="translate(540 560)">
          <clipPath id="bay"><rect x={-260} y={-120} width={520} height={240} rx={20} /></clipPath>
          <g clipPath="url(#bay)">
            <rect x={-260} y={-120} width={520} height={240} fill="white" />
            {Array.from({length: 12}).map((_, i) => Array.from({length: 6}).map((_, j) => (
              (i + j) % 2 === 0 ? <path key={`${i}-${j}`} d={`M${-280 + i * 50} ${-120 + j * 50} l25 -25 l25 25 l-25 25 Z`} fill="#3d8bd8" /> : null
            )))}
          </g>
          <rect x={-260} y={-120} width={520} height={240} rx={20} fill="none" stroke={INK} strokeWidth={8} />
        </g>
        <Label x={540} y={800} text="FREI!" size={110} o={reveal} />
      </svg>
    </AbsoluteFill>
  );
};

const Cta: React.FC<{t: number; local: number}> = ({t, local}) => (
  <>
    <NightSky t={t} top="#0b1030" bottom="#3a2a5a" />
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <circle cx={540} cy={560} r={200} fill="#f4efd8" opacity={0.95} />
      <Balloon x={540 + Math.sin(t * 0.7) * 30} y={720 - local * 30} s={0.45} flame={0.5} t={t} />
      <rect x={0} y={1300} width={1080} height={620} fill="#10141c" />
    </svg>
  </>
);


// зацепка по «формуле первой секунды»: шар крупно, прожекторы бьют в него, резкий наезд, тревожная красная рамка
const Hook2: React.FC<{t: number; local: number; dur: number}> = ({t, local}) => {
  const zoom = interpolate(local, [0, 0.6], [1.35, 1], cl);
  const alarm = 0.35 + 0.35 * Math.abs(Math.sin(t * 6));
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#141a3a, #3a2050)'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <svg width={1080} height={1920}>
          <Stars t={t} n={60} h={1400} />
          <path d={`M-40 1500 L${430 + Math.sin(t * 2) * 120} 820 L${560 + Math.sin(t * 2) * 120} 820 Z`} fill="rgba(255,250,200,0.35)" />
          <path d={`M1120 1500 L${560 + Math.sin(t * 2 + 2) * 120} 820 L${690 + Math.sin(t * 2 + 2) * 120} 820 Z`} fill="rgba(255,250,200,0.35)" />
          <Balloon x={540} y={1090} s={1.45} flame={0.7 + 0.3 * Math.abs(Math.sin(t * 10))} t={t} />
          <rect x={0} y={1420} width={1080} height={500} fill="#151a24" />
          {Array.from({length: 23}).map((_, i) => <rect key={i} x={i * 48} y={1300} width={8} height={130} fill="#5a5f6a" />)}
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{boxShadow: `inset 0 0 160px 40px rgba(224,36,36,${alarm})`}} />
    </AbsoluteFill>
  );
};


// ракурсы камеры по сценам: [x, y, zoom] — точка в кадре 1080×1920, на которую наводимся
const CAMS: Record<string, number[][]> = {
  khook: [[540, 960, 1.02], [540, 1000, 1.12]],
  workshop: [[540, 960, 1], [540, 1000, 1.15], [540, 960, 1.08]],
  junkshop: [[540, 960, 1], [700, 900, 1.15], [420, 1000, 1.12]],
  street: [[540, 960, 1], [420, 1000, 1.12], [620, 1080, 1.08]],
  train: [[540, 960, 1], [400, 1000, 1.15]],
  townhall: [[540, 960, 1], [420, 1000, 1.12], [700, 1000, 1.12]],
  cash: [[540, 960, 1], [560, 900, 1.1]],
  leave: [[540, 960, 1], [700, 1000, 1.08]],
  papers: [[540, 960, 1], [540, 900, 1.06]],
  arrest: [[540, 960, 1], [480, 1000, 1.12]],
  pardon: [[540, 960, 1], [540, 940, 1.08]],
  kend: [[540, 960, 1], [540, 1000, 1.1]],
  drillhook: [[540, 960, 1.05], [540, 980, 1.18]],
  mine: [[540, 960, 1], [420, 1000, 1.18], [600, 1050, 1.12]],
  flood: [[540, 960, 1], [420, 1000, 1.15], [540, 1050, 1.1]],
  cavity: [[540, 960, 1], [540, 960, 1.15], [540, 1100, 1.1]],
  surface: [[540, 960, 1], [540, 1050, 1.12]],
  days: [[540, 960, 1], [460, 960, 1.15], [600, 900, 1.1]],
  drill: [[540, 960, 1], [540, 900, 1.15]],
  hole: [[540, 960, 1], [540, 950, 1.15]],
  capsule: [[540, 960, 1], [540, 900, 1.1]],
  rise: [[540, 960, 1], [540, 760, 1.12]],
  crowd: [[540, 960, 1], [480, 960, 1.12]],
  sky: [[540, 960, 1], [540, 1000, 1.3]],
  berlinwall: [[540, 960, 1], [540, 1060, 1.35], [600, 960, 1.15], [540, 1000, 1.15]],
  courier: [[540, 960, 1], [600, 1000, 1.12], [480, 1000, 1.12], [540, 960, 1.08]],
  streets: [[540, 960, 1], [420, 1000, 1.3], [540, 960, 1.12]],
  courtyard: [[540, 960, 1], [480, 1000, 1.15], [540, 980, 1.12]],
  password: [[540, 960, 1], [560, 1000, 1.1]],
  hole: [[540, 960, 1], [540, 900, 1.25]],
  tunnelhook: [[540, 960, 1.12], [500, 960, 1.2]],
  tunnel: [[540, 960, 1], [540, 1000, 1.1], [540, 980, 1.05]],
  tunnelup: [[540, 960, 1], [540, 960, 1.08], [540, 1000, 1.05]],
  light: [[540, 960, 1], [540, 900, 1.2]],
  bakery: [[540, 960, 1], [540, 1020, 1.15], [540, 1000, 1.08]],
  betrayal: [[540, 960, 1], [540, 1000, 1.15]],
  files: [[540, 960, 1], [540, 960, 1.04]],
  endwest: [[540, 960, 1], [540, 1050, 1.5]],
  wake: [[540, 960, 1], [380, 1000, 1.5], [540, 940, 1.15], [540, 960, 1.1]],
  kitchen: [[540, 960, 1], [520, 980, 1.25], [465, 1000, 1.3], [540, 1040, 1.15]],
  memory: [[540, 900, 1], [520, 1000, 1.6], [880, 1150, 2]],
  bed: [[540, 960, 1], [380, 1000, 1.6], [700, 1000, 1.4]],
  meadow: [[540, 960, 1], [400, 1060, 1.3], [540, 1000, 1.12], [480, 1040, 1.22]],
  liftoff: [[540, 960, 1], [540, 1500, 1.6]],
  gas: [[540, 960, 1], [540, 1000, 1.45], [540, 900, 1.3]],
  answer: [[540, 960, 1], [540, 1060, 1.7]],
  end: [[540, 960, 1], [540, 1060, 1.8]],
  hook2: [[540, 960, 1], [540, 1250, 1.9]],
  map: [[540, 960, 1], [650, 820, 2.1], [500, 1220, 1.8]],
  border: [[540, 960, 1], [540, 820, 1.9], [160, 1180, 2.3]],
  sewing: [[540, 960, 1], [540, 1100, 1.3], [540, 960, 1.12], [700, 1080, 1.3]],
  crash: [[540, 900, 1], [520, 1000, 1.6], [880, 1150, 2]],
  stasi: [[540, 960, 1], [530, 1270, 2.1], [260, 1060, 1.9]],
  countdown: [[540, 960, 1], [260, 600, 2], [760, 1000, 1.7], [760, 1300, 2.3]],
  launch: [[540, 960, 1], [540, 1220, 1.9], [540, 760, 1.4]],
  flight: [[540, 960, 1], [540, 900, 1.5], [540, 1000, 1.25], [540, 900, 1.35]],
  landing: [[540, 960, 1], [540, 1000, 1.5], [540, 960, 1.2], [540, 1000, 1.35]],
  police: [[540, 960, 1], [500, 960, 1.12], [420, 1060, 1.2], [480, 1000, 1.12], [540, 960, 1.08], [500, 1020, 1.1]],
  whook: [[540, 960, 1.02], [540, 900, 1.1]],
  ministry: [[540, 960, 1], [560, 900, 1.08], [700, 820, 1.12]],
  toilet: [[540, 960, 1], [540, 860, 1.1], [540, 920, 1.06]],
  roof: [[540, 960, 1], [480, 860, 1.2], [620, 900, 1.12]],
  throw: [[540, 960, 1]],
  cable: [[540, 960, 1]],
  harness: [[540, 960, 1], [700, 960, 1.15]],
  slide: [[540, 960, 1]],
  west: [[540, 960, 1], [540, 900, 1.1]],
  mum: [[540, 960, 1]],
  dad: [[540, 960, 1], [560, 900, 1.15]],
  dadslide: [[540, 960, 1]],
  family: [[540, 960, 1], [540, 960, 1.08]],
  endrope: [[540, 960, 1], [540, 1000, 1.2]],
};

// ---------- кинематографичная обёртка: медленный наезд, виньетка, зерно ----------
export const StoryScene: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const t = frame / fps;
  let i = 0;
  scenes.forEach((s, k) => { if (t >= s.start) i = k; });
  const sc = scenes[i];
  const local = t - sc.start;
  const dur = sc.dur;
  // текущий кадр раскадровки (меняется на каждой фразе)
  const cuts = sc.cuts && sc.cuts.length ? sc.cuts : [{t: sc.start, cam: 0}];
  let ci = 0;
  cuts.forEach((c, k) => { if (t >= c.t) ci = k; });
  const cut = cuts[ci];
  const ls = t - (ci === 0 ? sc.start : cut.t);
  const nextT = ci + 1 < cuts.length ? cuts[ci + 1].t : sc.start + dur;
  const shotLen = Math.max(0.5, nextT - (ci === 0 ? sc.start : cut.t));
  const presets = CAMS[sc.cut ?? ''] ?? [[540, 960, 1]];
  const [fx, fy, z0] = presets[(cut.cam ?? 0) % presets.length];
  const dir = ci % 2 === 0 ? 1 : -1;
  const zoom = z0 * (1 + interpolate(ls, [0, shotLen], [0, 0.06], cl)) * (1 + interpolate(ls, [0, 0.25], [0.04, 0], cl)); // мягкий наезд
  const panX = dir * interpolate(ls, [0, shotLen], [-14, 14], cl);
  const tx = Math.min(0, Math.max(1080 - 1080 * zoom, 540 - fx * zoom + panX));
  const ty = Math.min(0, Math.max(1920 - 1920 * zoom, 900 - fy * zoom));
  const camT = `translate(${tx}px, ${ty}px) scale(${zoom})`;
  const flash = 0; // без вспышек: они утомляют глаза (замечание владельца)
  const p = {t, local, dur};
  const name = sc.cut ?? '';
  // режим «готовые картинки» (кадры от нейросети): timeline.images = {cut: файл}
  const imgMap = (timeline as any).images as Record<string, string> | undefined;
  const IMG_CAMS = [[540, 960, 1.04], [540, 760, 1.32], [540, 1120, 1.28], [400, 900, 1.24], [680, 900, 1.24]];
  if (imgMap) {
    const [ix, iy, iz] = IMG_CAMS[ci % IMG_CAMS.length];
    const z = iz * (1 + interpolate(ls, [0, shotLen], [0, 0.07], cl)) * (1 + interpolate(ls, [0, 0.18], [0.06, 0], cl));
    const dx = (ci % 2 ? 1 : -1) * interpolate(ls, [0, shotLen], [-18, 18], cl);
    const itx = Math.min(0, Math.max(1080 - 1080 * z, 540 - ix * z + dx));
    const ity = Math.min(0, Math.max(1920 - 1920 * z, 900 - iy * z));
    return (
      <AbsoluteFill style={{background: '#000'}}>
        <AbsoluteFill style={{transform: `translate(${itx}px, ${ity}px) scale(${z})`, transformOrigin: '0 0'}}>
          <Img src={staticFile(imgMap[name] ?? Object.values(imgMap)[0])} style={{width: 1080, height: 1920, objectFit: 'cover'}} />
        </AbsoluteFill>
        <AbsoluteFill style={{background: 'linear-gradient(rgba(0,0,0,0) 62%, rgba(0,0,0,0.75) 100%)'}} />
        <AbsoluteFill style={{background: 'white', opacity: i === 0 && ci === 0 ? 0 : interpolate(ls, [0, 0.08], [0.25, 0], cl)}} />
        {i === 0 && ci === 0 && (timeline as any).hookText && (
          <div style={{position: 'absolute', top: 170, left: 50, right: 50, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 88, lineHeight: 1.08, color: 'white', WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill', textTransform: 'uppercase'}}>
            {(timeline as any).hookText}
          </div>
        )}
      </AbsoluteFill>
    );
  }
  const body =
    name === 'hook' ? <Hook {...p} /> :
    name === 'hook2' ? <Hook2 {...p} /> :
    name === 'wake' ? <Wake {...p} /> :
    name === 'kitchen' ? <Kitchen {...p} /> :
    name === 'memory' ? <Memory {...p} /> :
    name === 'bed' ? <Bed {...p} /> :
    name === 'meadow' ? <Meadow {...p} /> :
    name === 'liftoff' ? <Liftoff {...p} /> :
    name === 'gas' ? <GasOut {...p} /> :
    name === 'landing' && (timeline as any).hookText?.startsWith('DU') ? <LandingPov {...p} /> :
    name === 'police' && (timeline as any).hookText?.startsWith('DU') ? <PolicePov {...p} /> :
    name === 'flight' && (timeline as any).hookText?.startsWith('DU') ? <FlightPov {...p} /> :
    name === 'khook' ? <KHook {...p} /> :
    name === 'workshop' ? <Workshop {...p} /> :
    name === 'junkshop' ? <Junkshop {...p} /> :
    name === 'street' ? <KStreet {...p} /> :
    name === 'train' ? <Train {...p} /> :
    name === 'townhall' ? <Townhall {...p} /> :
    name === 'cash' ? <Cash {...p} /> :
    name === 'leave' ? <Leave {...p} /> :
    name === 'papers' ? <Papers {...p} /> :
    name === 'arrest' ? <KArrest {...p} /> :
    name === 'pardon' ? <Pardon {...p} /> :
    name === 'kend' ? <KEnd {...p} /> :
    name === 'drillhook' ? <DrillHook {...p} /> :
    name === 'mine' ? <Mine {...p} /> :
    name === 'flood' && sc.big === 'DUNKEL' ? <Flood {...p} dark /> :
    name === 'flood' ? <Flood {...p} /> :
    name === 'cavity' ? <Cavity {...p} /> :
    name === 'surface' ? <Surface {...p} /> :
    name === 'days' ? <Days {...p} /> :
    name === 'drill' ? <DrillThrough {...p} /> :
    name === 'hole' ? <DrillThrough {...p} light /> :
    name === 'capsule' ? <Capsule {...p} /> :
    name === 'rise' ? <Capsule {...p} up /> :
    name === 'crowd' ? <Crowd {...p} /> :
    name === 'sky' ? <SkyEnd {...p} /> :
    name === 'berlinwall' ? <BerlinWall {...p} /> :
    name === 'courier' ? <Courier {...p} /> :
    name === 'streets' ? <Streets {...p} /> :
    name === 'courtyard' ? <Courtyard {...p} /> :
    name === 'password' ? <Courtyard {...p} open /> :
    name === 'hole' ? <Hole {...p} /> :
    name === 'tunnelhook' ? <TunnelCut {...p} part={2} /> :
    name === 'tunnel' ? <TunnelCut {...p} part={0} /> :
    name === 'tunnelup' ? <TunnelCut {...p} part={1} /> :
    name === 'light' ? <LightUp {...p} /> :
    name === 'bakery' ? <Bakery {...p} /> :
    name === 'betrayal' ? <Betrayal {...p} /> :
    name === 'files' ? <Files {...p} /> :
    name === 'endwest' ? <EndWest {...p} /> :
    name === 'answer' ? <Answer {...p} /> :
    name === 'end' ? <Answer {...p} free /> :
    name === 'map' ? <MapScene {...p} /> :
    name === 'border' ? <Border {...p} /> :
    name === 'sewing' ? <Sewing {...p} /> :
    name === 'shops' ? <Shops {...p} /> :
    name === 'crash' ? <Crash {...p} /> :
    name === 'stasi' ? <Stasi {...p} /> :
    name === 'countdown' ? <Countdown {...p} /> :
    name === 'launch' ? <Launch {...p} /> :
    name === 'flight' ? <Flight {...p} /> :
    name === 'landing' ? <Landing {...p} /> :
    name === 'police' ? <Police {...p} /> :
    name === 'whook' ? <WHook {...p} /> :
    name === 'ministry' ? <Ministry {...p} /> :
    name === 'toilet' ? <Toilet {...p} steps={sc.big === 'PSST'} /> :
    name === 'roof' ? <Roof {...p} /> :
    name === 'throw' ? <Throw {...p} /> :
    name === 'cable' ? <Cable {...p} /> :
    name === 'harness' ? <Harness {...p} /> :
    name === 'slide' ? <SlideScene {...p} who="kid" /> :
    name === 'west' ? <WestArrive {...p} /> :
    name === 'mum' ? <SlideScene {...p} who="mum" /> :
    name === 'dad' ? <DadAlone {...p} /> :
    name === 'dadslide' ? <SlideScene {...p} who="dad" /> :
    name === 'family' ? <Family {...p} /> :
    name === 'endrope' ? <EndRope {...p} /> :
    <Cta {...p} />;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {cut.insert ? (
        <AbsoluteFill style={{transform: `scale(${1 + interpolate(ls, [0, 0.18], [0.1, 0], cl) + ls * 0.03})`}}><Insert name={cut.insert} l={ls} /></AbsoluteFill>
      ) : (
        <AbsoluteFill style={{transform: camT, transformOrigin: '0 0'}}>{body}</AbsoluteFill>
      )}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
      {/* зерно убрано: мерцание утомляет глаза */}
      <AbsoluteFill style={{background: 'white', opacity: flash}} />
      {i === 0 && ci === 0 && (timeline as any).hookText && (
        <div style={{position: 'absolute', top: 170, left: 50, right: 50, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 92, lineHeight: 1.08, color: 'white', WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 10px 0 ${INK}`, textTransform: 'uppercase'}}>
          {(timeline as any).hookText.split(' ').map((w: string, k: number) => (
            <span key={k} style={{color: /DDR|BALLON|FLIEHEN/.test(w) ? '#ffd84d' : 'white'}}>{w} </span>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ================== POV-сцены: реальная история глазами героя (крупные лица, эмоции) ==================

const Teen: React.FC<{x: number; y: number; s?: number; emo?: string; look?: number; blink?: boolean; shiver?: number; glow?: string; sweater?: string; stripe?: string; hair?: string}> = ({x, y, s = 1, emo = 'ok', look = 0, blink = false, shiver = 0, glow, sweater = '#c8642c', stripe = '#8a3f1c', hair = '#5a3a22'}) => {
  const skin = '#ffd8a8';
  return (
    <g transform={`translate(${x + shiver} ${y}) scale(${s})`}>
      <path d="M-150 520 Q-150 210 0 200 Q150 210 150 520 Z" fill={sweater} stroke={INK} strokeWidth={10} />
      {[260, 320, 380, 440].map((yy) => <path key={yy} d={`M-148 ${yy} H148`} stroke={stripe} strokeWidth={18} />)}
      <circle cx={0} cy={0} r={150} fill={skin} stroke={INK} strokeWidth={10} />
      <path d="M-155 -20 Q-150 -175 0 -170 Q150 -175 155 -20 Q120 -110 40 -100 Q-30 -130 -155 -20 Z" fill={hair} stroke={INK} strokeWidth={8} />
      <g transform="translate(0 10)"><Face emo={emo} open={0} look={look} blink={blink} skin={skin} /></g>
      {glow && <circle cx={0} cy={0} r={150} fill={glow} opacity={0.22} />}
    </g>
  );
};

const Adult: React.FC<{x: number; y: number; s?: number; emo?: string; look?: number; mum?: boolean; blink?: boolean}> = ({x, y, s = 1, emo = 'ok', look = 0, mum, blink = false}) => {
  const skin = '#f6c9a0';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-170 560 Q-170 220 0 210 Q170 220 170 560 Z" fill={mum ? '#6a7fb8' : '#5d6670'} stroke={INK} strokeWidth={10} />
      {mum && <path d="M-160 -10 Q-170 -190 0 -185 Q170 -190 160 -10 L175 150 L120 140 L115 0 L-115 0 L-120 140 L-175 150 Z" fill="#7a4a2a" stroke={INK} strokeWidth={8} />}
      <circle cx={0} cy={0} r={150} fill={skin} stroke={INK} strokeWidth={10} />
      {!mum && <path d="M-150 -30 Q-140 -160 0 -160 Q140 -160 150 -30 Q110 -120 0 -115 Q-110 -120 -150 -30 Z" fill="#3b2a1f" stroke={INK} strokeWidth={8} />}
      {mum && <path d="M-150 -20 Q-130 -160 0 -160 Q130 -160 150 -20 Q60 -110 -150 -20 Z" fill="#7a4a2a" stroke={INK} strokeWidth={8} />}
      <g transform="translate(0 10)"><Face emo={emo} open={0} look={look} blink={blink} skin={skin} /></g>
      {!mum && <path d="M-60 55 Q0 30 60 55 Q30 70 0 62 Q-30 70 -60 55 Z" fill="#3b2a1f" />}
    </g>
  );
};

const room = (c1: string, c2: string) => ({background: `linear-gradient(${c1}, ${c2})`});

// 1. мать будит ночью (луч фонарика, будильник 02:00)
const Wake: React.FC<{t: number; local: number}> = ({t, local}) => (
  <AbsoluteFill style={room('#0d1430', '#1b2448')}>
    <svg width={1080} height={1920}>
      <rect x={640} y={330} width={300} height={360} fill="#16224a" stroke="#2a3766" strokeWidth={16} />
      <circle cx={780} cy={460} r={40} fill="#f4efd8" opacity={0.8} />
      {/* кровать */}
      <rect x={60} y={1150} width={960} height={420} rx={40} fill="#3a4a7a" stroke={INK} strokeWidth={10} />
      <rect x={90} y={980} width={420} height={200} rx={60} fill="#e8e2d2" stroke={INK} strokeWidth={8} />
      <Teen x={330} y={1010} s={0.95} emo={local > 0.6 ? 'shock' : 'sad'} look={1} blink={local < 0.6} />
      <rect x={60} y={1250} width={960} height={330} rx={40} fill="#4a6cf7" stroke={INK} strokeWidth={10} />
      {/* мать с фонариком */}
      <Adult x={850} y={820} s={0.9} mum emo="nervous" look={-1} />
      <path d={`M780 980 L${300 + Math.sin(t * 2) * 20} 900 L${330 + Math.sin(t * 2) * 20} 1120 Z`} fill="rgba(255,240,170,0.35)" />
      <rect x={760} y={960} width={60} height={34} rx={8} fill="#555" stroke={INK} strokeWidth={6} />
      {/* будильник */}
      <g transform="translate(250 780)">
        <rect x={-110} y={-60} width={220} height={120} rx={20} fill="#2b2b3a" stroke={INK} strokeWidth={8} />
        <text x={0} y={30} textAnchor="middle" fontFamily="monospace" fontWeight={900} fontSize={76} fill="#ff4d4d">02:00</text>
      </g>
    </svg>
  </AbsoluteFill>
);

// 2. кухня: отец шёпотом показывает чертёж шара
const Kitchen: React.FC<{t: number; local: number}> = ({t}) => (
  <AbsoluteFill style={room('#2a1e14', '#3a2a1c')}>
    <svg width={1080} height={1920}>
      <path d="M540 330 L120 1300 L960 1300 Z" fill="rgba(255,214,120,0.16)" />
      <path d="M490 300 h100 l40 70 h-180 Z" fill="#f2c14e" stroke={INK} strokeWidth={6} />
      <Adult x={680} y={900} s={1} emo="nervous" look={-1} />
      <path d="M720 1000 L760 860" stroke={INK} strokeWidth={22} strokeLinecap="round" />
      <path d="M720 1000 L760 860" stroke="#f6c9a0" strokeWidth={12} strokeLinecap="round" />
      <Teen x={250} y={1040} s={0.85} emo="shock" look={1} blink={Math.floor(t * 10) % 37 === 0} />
      <rect x={60} y={1300} width={960} height={60} fill="#6b4a2f" stroke={INK} strokeWidth={8} />
      {/* чертёж шара на столе */}
      <g transform="translate(560 1230) rotate(-6)">
        <rect x={-170} y={-120} width={340} height={200} fill="#efe6cf" stroke={INK} strokeWidth={6} />
        <path d="M0 -100 C70 -100 90 -40 60 0 L20 40 L-20 40 L-60 0 C-90 -40 -70 -100 0 -100 Z" fill="none" stroke="#3d7dd8" strokeWidth={6} />
        <path d="M-20 40 L-15 70 M20 40 L15 70" stroke="#3d7dd8" strokeWidth={5} />
        <text x={110} y={60} fontFamily="monospace" fontSize={22} fill="#3d7dd8">BRD?</text>
      </g>
      <text x={720} y={680} fontFamily={FONT} fontWeight={900} fontSize={56} fill="white" opacity={0.7}>pssst…</text>
    </svg>
  </AbsoluteFill>
);

// 4. воспоминание о падении: та же сцена падения, но в сепии
const Memory: React.FC<{t: number; local: number; dur: number}> = (p) => (
  <AbsoluteFill style={{filter: 'sepia(0.85) contrast(1.1) brightness(0.9)'}}>
    <Crash {...p} />
  </AbsoluteFill>
);

// 5. страх: лежит без сна, свет под дверью, звонок
const Bed: React.FC<{t: number; local: number}> = ({t, local}) => {
  const ring = Math.sin(local * 5) > 0.6;
  return (
    <AbsoluteFill style={room('#0a0e1e', '#151b33')}>
      <svg width={1080} height={1920}>
        <rect x={720} y={420} width={260} height={760} fill="#1e2440" stroke={INK} strokeWidth={10} />
        <rect x={720} y={1170} width={260} height={14} fill="#ffe28a" opacity={0.6 + 0.4 * Math.sin(t * 3)} />
        <circle cx={940} cy={800} r={14} fill="#c9a227" />
        <rect x={40} y={1180} width={640} height={380} rx={40} fill="#3a4a7a" stroke={INK} strokeWidth={10} />
        <Teen x={330} y={1020} s={0.95} emo="fear" look={1} shiver={ring ? Math.sin(t * 60) * 4 : 0} />
        <rect x={40} y={1260} width={640} height={300} rx={40} fill="#4a6cf7" stroke={INK} strokeWidth={10} />
        {ring && <text x={850} y={380} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill="#ffd84d" stroke={INK} strokeWidth={3}>DING-DONG</text>}
      </svg>
    </AbsoluteFill>
  );
};

// 6. поляна в лесу: шар надувается, пламя освещает лицо
const Meadow: React.FC<{t: number; local: number; dur: number}> = ({t, local, dur}) => {
  const inflate = interpolate(local, [0, dur], [0.7, 1], cl);
  return (
    <>
      <NightSky t={t} top="#070b1c" bottom="#1a1f3a" />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {Array.from({length: 8}).map((_, i) => <path key={i} d={`M${i * 150 - 40} 1250 l80 -320 l80 320 Z`} fill="#122418" />)}
        <g transform={`translate(560 820) scale(1.2 ${1.2 * inflate})`}><Balloon x={0} y={0} s={1} flame={0.8 + 0.2 * Math.sin(t * 20)} t={t} /></g>
        <rect x={0} y={1240} width={1080} height={680} fill="#16301f" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <Person key={i} x={330 + i * 70} y={1240} s={0.55} kid={i > 4} c={['#4a6cf7', '#d94848', '#4caf6a', '#f2c14e'][i % 4]} />)}
        <Teen x={250} y={1110} s={0.85} emo="nervous" look={1} glow="#ff9a3d" blink={Math.floor(t * 10) % 41 === 0} />
      </svg>
    </>
  );
};

// 7. взлёт глазами героя: смотрим вниз, земля уходит
const Liftoff: React.FC<{t: number; local: number; dur: number}> = ({t, local, dur}) => {
  const up = interpolate(local, [0.4, dur], [1, 0.25], cl);
  return (
    <AbsoluteFill style={{background: '#0d1a12'}}>
      <svg width={1080} height={1920}>
        <g transform={`translate(540 1100) scale(${up})`}>
          <rect x={-900} y={-900} width={1800} height={1800} fill="#16301f" />
          {Array.from({length: 30}).map((_, i) => <circle key={i} cx={random(`tx${i}`) * 1800 - 900} cy={random(`ty${i}`) * 1800 - 900} r={60 + random(`tr${i}`) * 60} fill="#1f4a2c" stroke={INK} strokeWidth={6} />)}
          <ellipse cx={0} cy={0} rx={260} ry={180} fill="#2f6b3c" />
          <circle cx={0} cy={0} r={40} fill="#ffb347" opacity={0.6} />
        </g>
        {/* край платформы и ботинки */}
        <rect x={0} y={1520} width={1080} height={400} fill="#8a8f99" stroke={INK} strokeWidth={10} />
        <path d="M300 1600 q60 -60 160 -20 v80 h-170 Z M620 1580 q60 -60 160 -20 v80 h-170 Z" fill="#3a2a1f" stroke={INK} strokeWidth={8} />
        <path d="M60 0 L140 1520 M1020 0 L940 1520" stroke="#cfc6b4" strokeWidth={10} />
        <ellipse cx={540} cy={200} rx={700} ry={300} fill="rgba(255,154,61,0.15)" />
      </svg>
    </AbsoluteFill>
  );
};

// 8. полёт: лицо крупно, пар изо рта, дрожь; внизу огни границы
const FlightPov: React.FC<{t: number; local: number}> = ({t, local}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#04060f, #101a36)'}}>
    <svg width={1080} height={1920}>
      <Stars t={t} n={80} h={900} />
      {Array.from({length: 18}).map((_, i) => <circle key={i} cx={(i * 70 + local * 30) % 1080} cy={1600 + (i % 4) * 40} r={6} fill="#ffe28a" />)}
      {[0, 1].map((k) => <path key={k} d={`M${250 + k * 560} 1700 L${200 + k * 560 + Math.sin(t + k * 3) * 200} 1200 L${290 + k * 560 + Math.sin(t + k * 3) * 200} 1200 Z`} fill="rgba(255,250,200,0.12)" />)}
      <Teen x={540} y={900} s={1.25} emo="fear" look={Math.sin(t * 2)} shiver={Math.sin(t * 50) * 3} glow="#7cc8ff" />
      {[0, 1, 2].map((k) => {
        const ph = (local * 0.8 + k * 0.33) % 1;
        return <ellipse key={k} cx={540 + ph * 120} cy={1000 - ph * 160} rx={30 + ph * 60} ry={20 + ph * 40} fill="white" opacity={0.35 * (1 - ph)} />;
      })}
      {Array.from({length: 40}).map((_, i) => <circle key={`s${i}`} cx={(random(`fs${i}`) * 1080 + t * 50) % 1080} cy={(random(`fz${i}`) * 1920 + t * 120) % 1920} r={3} fill="#cfe8ff" opacity={0.7} />)}
    </svg>
  </AbsoluteFill>
);

// 9. газ кончается: пламя горелки крупно гаснет, лицо в страхе
const GasOut: React.FC<{t: number; local: number; dur: number}> = ({t, local, dur}) => {
  const f = interpolate(local, [0, dur], [1, 0.15], cl);
  return (
    <AbsoluteFill style={{background: '#05070f'}}>
      <svg width={1080} height={1920}>
        <ellipse cx={540} cy={520} rx={420 * f} ry={420 * f} fill="#ff9a3d" opacity={0.18} />
        <path d={`M440 760 Q540 ${760 - 450 * f - Math.sin(t * 30) * 30} 640 760 Z`} fill="#ff8a3d" />
        <path d={`M490 760 Q540 ${760 - 290 * f} 590 760 Z`} fill="#ffe28a" />
        <rect x={420} y={760} width={200} height={70} rx={10} fill="#5a5f6a" stroke={INK} strokeWidth={8} />
        <Teen x={540} y={1130} s={0.85} emo="shock" look={0} glow={f > 0.4 ? '#ff9a3d' : undefined} />
      </svg>
    </AbsoluteFill>
  );
};

// 10. посадка в темноте: где мы?
const LandingPov: React.FC<{t: number; local: number}> = ({t, local}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#03050b, #10160f)'}}>
    <svg width={1080} height={1920}>
      <rect x={0} y={1200} width={1080} height={720} fill="#1d2616" />
      {Array.from({length: 14}).map((_, i) => <line key={i} x1={i * 90} y1={1200} x2={i * 90 - 250} y2={1920} stroke="#26321d" strokeWidth={6} />)}
      <Teen x={540} y={1050} s={1.1} emo="nervous" look={Math.sin(local * 3)} blink={Math.floor(t * 10) % 29 === 0} />
    </svg>
  </AbsoluteFill>
);

// 11. фары полицейской машины, отец идёт к ней
const PolicePov: React.FC<{t: number; local: number; dur: number}> = ({t, local, dur}) => {
  const walk = interpolate(local, [0, dur], [0, 160], cl);
  return (
    <AbsoluteFill style={{background: '#05070f'}}>
      <svg width={1080} height={1920}>
        <ellipse cx={700} cy={900} rx={460} ry={240} fill="rgba(255,246,192,0.2)" />
        <circle cx={620} cy={900} r={60} fill="#fff6c0" /><circle cx={820} cy={900} r={60} fill="#fff6c0" />
        <rect x={540} y={760} width={360} height={60} rx={10} fill="#2e7d4f" />
        <rect x={680} y={735} width={60} height={26} rx={6} fill={Math.sin(t * 14) > 0 ? '#3d7dff' : '#1a2a5a'} />
        <rect x={0} y={1150} width={1080} height={770} fill="#1d2616" />
        <g transform={`translate(${320 + walk} 980) scale(0.7)`}>
          <path d="M-170 560 Q-170 220 0 210 Q170 220 170 560 Z" fill="#5d6670" stroke={INK} strokeWidth={10} />
          <circle cx={0} cy={0} r={150} fill="#3b2a1f" stroke={INK} strokeWidth={10} />
        </g>
        <Teen x={230} y={1120} s={0.85} emo="nervous" look={1} />
      </svg>
    </AbsoluteFill>
  );
};

// 12–13. ответ «Бавария» и финал «ты свободен»: рассвет, радость
const Answer: React.FC<{t: number; local: number; free?: boolean}> = ({t, local, free}) => (
  <AbsoluteFill style={room('#f7b26a', '#ffe3b3')}>
    <svg width={1080} height={1920}>
      <circle cx={540} cy={1250} r={360} fill="#ffd84d" opacity={0.6} />
      <rect x={0} y={1250} width={1080} height={670} fill="#6f9a4f" />
      {!free && (
        <g transform="translate(540 520)">
          <clipPath id="bay2"><rect x={-300} y={-140} width={600} height={280} rx={20} /></clipPath>
          <g clipPath="url(#bay2)">
            <rect x={-300} y={-140} width={600} height={280} fill="white" />
            {Array.from({length: 14}).map((_, i) => Array.from({length: 7}).map((_, j) => ((i + j) % 2 === 0 ? <path key={`${i}-${j}`} d={`M${-320 + i * 50} ${-140 + j * 50} l25 -25 l25 25 l-25 25 Z`} fill="#3d8bd8" /> : null)))}
          </g>
          <rect x={-300} y={-140} width={600} height={280} rx={20} fill="none" stroke={INK} strokeWidth={8} />
        </g>
      )}
      <Teen x={540} y={1060 - Math.abs(Math.sin(t * 6)) * (free ? 0 : 30)} s={1.15} emo="laugh" look={0} />
    </svg>
  </AbsoluteFill>
);

// ================== «Tunnel 57» (POV, 20 лет): Берлин 1964 ==================
const HERO = {sweater: '#3d6a8f', stripe: '#27486a', hair: '#2e1f14'};
const Hero20: React.FC<{x: number; y: number; s?: number; emo?: string; look?: number; blink?: boolean; shiver?: number; glow?: string}> = (p) => <Teen {...p} {...HERO} />;

const WallStrip: React.FC<{y: number; t: number}> = ({y, t}) => (
  <g>
    <rect x={0} y={y - 230} width={1080} height={230} fill="#9a9a96" stroke={INK} strokeWidth={8} />
    {Array.from({length: 9}).map((_, i) => <line key={i} x1={i * 130} y1={y - 230} x2={i * 130} y2={y} stroke="#7a7a76" strokeWidth={6} />)}
    <rect x={0} y={y - 250} width={1080} height={26} rx={13} fill="#b5b5b0" stroke={INK} strokeWidth={6} />
    <g transform={`translate(860 ${y - 230})`}>
      <path d={`M0 -230 L${-300 + Math.sin(t * 0.8) * 260} 240 L${-120 + Math.sin(t * 0.8) * 260} 240 Z`} fill="rgba(255,250,200,0.2)" />
      <rect x={-22} y={-200} width={44} height={200} fill="#9a9a9a" stroke={INK} strokeWidth={6} />
      <rect x={-55} y={-270} width={110} height={80} rx={8} fill="#b5b5b5" stroke={INK} strokeWidth={6} />
      <rect x={-40} y={-255} width={80} height={34} fill="#ffe28a" />
    </g>
  </g>
);

// 1–2. ночная улица у Стены
const BerlinWall: React.FC<{t: number; local: number}> = ({t, local}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#070b1c, #1a1f38)'}}>
    <svg width={1080} height={1920}>
      <Stars t={t} n={50} h={600} />
      <WallStrip y={1000} t={t} />
      <rect x={0} y={1000} width={1080} height={920} fill="#2a2d36" />
      {/* фонарь */}
      <rect x={140} y={560} width={14} height={440} fill="#3a3f4c" />
      <path d="M100 560 h94 l-20 36 h-54 Z" fill="#3a3f4c" stroke={INK} strokeWidth={5} />
      <path d="M147 596 L40 1000 L254 1000 Z" fill="rgba(255,226,138,0.18)" />
      <Hero20 x={540} y={1080} s={0.95} emo={local > 3 ? 'sad' : 'nervous'} look={1} blink={Math.floor(t * 10) % 37 === 0} />
      <text x={820} y={1180} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill="#bfe0ff" opacity={0.8}>WEST →</text>
    </svg>
  </AbsoluteFill>
);

// 3. незнакомец шепчет адрес и пароль
const Courier: React.FC<{t: number; local: number}> = ({t, local}) => {
  const note = interpolate(local, [1.2, 1.6], [0, 1], cl);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#0d1020, #1d2033)'}}>
      <svg width={1080} height={1920}>
        <rect x={60} y={420} width={440} height={880} fill="#151826" stroke="#2a2f45" strokeWidth={14} />
        <path d="M280 430 L80 1300 L480 1300 Z" fill="rgba(255,226,138,0.08)" />
        {/* незнакомец в шляпе, в тени */}
        <g transform="translate(270 960) scale(0.8)">
          <path d="M-170 560 Q-170 220 0 210 Q170 220 170 560 Z" fill="#2b2f3a" stroke={INK} strokeWidth={10} />
          <circle r={150} fill="#c9a98a" stroke={INK} strokeWidth={10} />
          <rect x={-190} y={-110} width={380} height={40} rx={18} fill="#1d1d2b" />
          <path d="M-120 -110 Q-110 -230 0 -230 Q110 -230 120 -110 Z" fill="#1d1d2b" />
          <rect x={-150} y={-90} width={300} height={110} fill="rgba(0,0,0,0.45)" />
          <circle cx={-50} cy={-10} r={12} fill="#ffe28a" /><circle cx={50} cy={-10} r={12} fill="#ffe28a" />
        </g>
        <Hero20 x={790} y={1000} s={0.9} emo="shock" look={-1} />
        {/* записка с адресом и паролем */}
        <g opacity={note} transform={`translate(600 760) rotate(-4) scale(${0.6 + 0.08 * note})`}>
          <rect x={-300} y={-110} width={600} height={220} rx={10} fill="#efe6cf" stroke={INK} strokeWidth={8} />
          <text x={0} y={-25} textAnchor="middle" fontFamily="monospace" fontWeight={900} fontSize={44} fill={INK}>Strelitzer Str. 55</text>
          <text x={0} y={60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill="#d32020">„TOKIO“</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// 4. ночные улицы, фары проезжающей машины
const Streets: React.FC<{t: number; local: number; dur: number}> = ({t, local, dur}) => {
  const car = interpolate(local, [0.5, dur], [1400, -600], cl);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#05070f, #12162a)'}}>
      <svg width={1080} height={1920}>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={i * 280 - 20} y={300 + (i % 2) * 80} width={260} height={900} fill="#1a1e30" stroke="#262b42" strokeWidth={8} />
            {Array.from({length: 6}).map((_, k) => <rect key={k} x={i * 280 + 30 + (k % 2) * 110} y={380 + (i % 2) * 80 + Math.floor(k / 2) * 200} width={70} height={100} fill={(i + k) % 4 === 0 ? '#ffe28a' : '#0d1020'} opacity={0.8} />)}
          </g>
        ))}
        <rect x={0} y={1200} width={1080} height={720} fill="#22252e" />
        <ellipse cx={car} cy={1260} rx={420} ry={90} fill="rgba(255,246,192,0.22)" />
        <g transform={`translate(${car} 1150)`}>
          <rect x={0} y={20} width={330} height={90} rx={22} fill="#3a3f4c" stroke={INK} strokeWidth={8} />
          <path d="M60 20 L100 -30 H240 L280 20 Z" fill="#2b2f3a" stroke={INK} strokeWidth={8} />
          <circle cx={6} cy={70} r={22} fill="#fff6c0" />
          <circle cx={70} cy={115} r={30} fill="#141414" /><circle cx={260} cy={115} r={30} fill="#141414" />
        </g>
        <Hero20 x={300} y={1000} s={0.85} emo="fear" look={1} />
      </svg>
    </AbsoluteFill>
  );
};

// 5–6. задний двор, дворовый туалет, дверь открывается на «Токио»
const Courtyard: React.FC<{t: number; local: number; open?: boolean}> = ({t, local, open}) => {
  const door = open ? interpolate(local, [0.6, 1.4], [0, 1], cl) : 0;
  const knock = !open && Math.sin(local * 9) > 0.7;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#070a16, #151a2c)'}}>
      <svg width={1080} height={1920}>
        <rect x={0} y={250} width={1080} height={1000} fill="#1c2033" />
        {Array.from({length: 8}).map((_, i) => <rect key={i} x={60 + (i % 4) * 260} y={320 + Math.floor(i / 4) * 300} width={110} height={160} fill={i === 5 ? '#ffe28a' : '#0d1020'} opacity={0.8} />)}
        <rect x={0} y={1250} width={1080} height={670} fill="#2a2a2a" />
        {/* дворовый туалет */}
        <g transform="translate(700 760)">
          <path d="M-190 0 L0 -110 L190 0 Z" fill="#5a3d26" stroke={INK} strokeWidth={8} />
          <rect x={-170} y={0} width={340} height={500} fill="#6b4a2f" stroke={INK} strokeWidth={8} />
          <path d="M-20 60 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0" fill="#ffe28a" opacity={0.7} />
          <rect x={-120} y={110} width={240} height={390} fill={door > 0 ? '#ffe28a' : '#4a3220'} stroke={INK} strokeWidth={8} />
          {door > 0 && <rect x={-120} y={110} width={240 * (1 - door)} height={390} fill="#4a3220" stroke={INK} strokeWidth={8} />}
          {door > 0 && <path d={`M-120 500 L${-260 - door * 120} 760 L${260 + door * 60} 760 L120 500 Z`} fill="rgba(255,226,138,0.25)" />}
        </g>
        {knock && <text x={680} y={680} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill="#ffd84d" stroke={INK} strokeWidth={3}>KLOPF</text>}
        <Hero20 x={300} y={1050} s={0.85} emo={open ? 'shock' : 'nervous'} look={1} glow={door > 0.3 ? '#ffb347' : undefined} />
      </svg>
    </AbsoluteFill>
  );
};

// 7. дыра в полу и лестница вниз (вид сверху)
const Hole: React.FC<{t: number; local: number}> = ({local}) => (
  <AbsoluteFill style={{background: '#3a2a1c'}}>
    <svg width={1080} height={1920}>
      {Array.from({length: 12}).map((_, i) => <rect key={i} x={0} y={i * 160} width={1080} height={150} fill={i % 2 ? '#5a3d26' : '#644530'} />)}
      <g transform={`translate(540 860) scale(${1 + local * 0.06})`}>
        <ellipse rx={300} ry={300} fill="#120c08" stroke={INK} strokeWidth={12} />
        <ellipse rx={200} ry={200} fill="#070504" />
        <ellipse rx={90} ry={90} fill="#000" />
        {[-70, 70].map((x) => <line key={x} x1={x * 2.6} y1={-260} x2={x * 0.7} y2={-40} stroke="#a8743f" strokeWidth={20} />)}
        {[0, 1, 2, 3, 4].map((k) => <line key={k} x1={-180 + k * 32} y1={-220 + k * 45} x2={180 - k * 32} y2={-220 + k * 45} stroke="#a8743f" strokeWidth={14} />)}
      </g>
      <text x={540} y={1330} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={80} fill="#ffd84d" stroke={INK} strokeWidth={4}>↓ 12 m</text>
    </svg>
  </AbsoluteFill>
);

// 8–9. тоннель в разрезе: наверху Стена, вышка, солдат с собакой; внизу ползёшь ты
const TunnelCut: React.FC<{t: number; local: number; dur: number; part: number}> = ({t, local, dur, part}) => {
  const prog = part === 2 ? 0.42 : interpolate(local, [0, dur], part === 0 ? [0.05, 0.55] : [0.55, 0.92], cl);
  const x = 150 + prog * 760;
  const meters = Math.round(prog * 145);
  const crawl = part === 2 ? 0 : Math.sin(t * 9); // в зацепке герой замер
  const patrol = part === 2 ? interpolate(local, [0, dur], [x - 260, x + 120], cl) : 380 + Math.sin(t * 0.7) * 220;
  return (
    <AbsoluteFill style={{background: '#070a14'}}>
      <svg width={1080} height={1920}>
        <Stars t={t} n={40} h={500} />
        {/* поверхность: ГДР слева, Стена, Запад справа */}
        <rect x={0} y={640} width={1080} height={40} fill="#3a3d46" />
        <rect x={600} y={430} width={40} height={210} fill="#9a9a96" stroke={INK} strokeWidth={6} />
        <rect x={590} y={418} width={60} height={20} rx={10} fill="#b5b5b0" />
        <text x={300} y={610} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#ffc0c0" opacity={0.8}>OST</text>
        <text x={860} y={610} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#bfe0ff" opacity={0.8}>WEST</text>
        <g transform="translate(470 640)">
          <path d={`M0 -190 L${-180 + Math.sin(t * 0.9) * 160} 0 L${-80 + Math.sin(t * 0.9) * 160} 0 Z`} fill="rgba(255,250,200,0.2)" />
          <rect x={-14} y={-170} width={28} height={170} fill="#9a9a9a" stroke={INK} strokeWidth={5} />
          <rect x={-40} y={-220} width={80} height={56} rx={6} fill="#b5b5b5" stroke={INK} strokeWidth={5} />
        </g>
        <g transform={`translate(${patrol} ${part === 2 ? 625 : 600}) scale(${part === 2 ? 1.4 : 1})`}>
          <Person x={0} y={-30} s={0.55} c="#5b6b4a" hair="#2b2b2b" />
          <ellipse cx={50} cy={20} rx={26} ry={12} fill="#4a3a2a" /><circle cx={74} cy={12} r={10} fill="#4a3a2a" />
        </g>
        {/* земля слоями */}
        <rect x={0} y={680} width={1080} height={1240} fill="#4a3424" />
        <rect x={0} y={860} width={1080} height={220} fill="#553b28" />
        <rect x={0} y={1300} width={1080} height={620} fill="#3d2b1d" />
        {Array.from({length: 40}).map((_, i) => <ellipse key={i} cx={(i * 211) % 1080} cy={720 + ((i * 137) % 1150)} rx={14 + (i % 4) * 6} ry={9} fill="#6b4c33" />)}
        {/* шахты и тоннель */}
        <rect x={60} y={680} width={80} height={420} fill="#140d08" />
        <rect x={940} y={680} width={80} height={420} fill="#140d08" />
        <rect x={60} y={1060} width={960} height={170} rx={50} fill="#140d08" stroke="#2a1d12" strokeWidth={8} />
        <line x1={90} y1={1220} x2={1000} y2={1220} stroke="#8a6a45" strokeWidth={6} strokeDasharray="20 14" />
        {/* зацепка: с потолка тоннеля сыплется земля от шагов */}
        {part === 2 && Array.from({length: 14}).map((_, k) => {
          const yy = 1065 + ((t * 260 + k * 37) % 120);
          return <circle key={`d${k}`} cx={x + ((k * 47) % 220) - 110} cy={yy} r={4 + (k % 3)} fill="#8a6a45" />;
        })}
        {part === 2 && <text x={x - 60} y={990} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill="#ffd84d" opacity={0.6 + 0.4 * Math.sin(t * 7)}>tap… tap…</text>}
        {/* свет фонарика вокруг тебя */}
        <ellipse cx={x + 90} cy={1150} rx={260} ry={95} fill="rgba(255,226,138,0.28)" />
        {/* ты: ползёшь на коленях (вид сбоку) */}
        <g transform={`translate(${x} 1200) scale(1.9)`}>
          <ellipse cx={0} cy={-18} rx={46} ry={20} fill={HERO.sweater} stroke={INK} strokeWidth={5} />
          <circle cx={52} cy={-26} r={18} fill="#ffd8a8" stroke={INK} strokeWidth={5} />
          <path d="M40 -42 q12 -12 26 -2" stroke={HERO.hair} strokeWidth={10} fill="none" />
          <line x1={30} y1={-10} x2={44 + crawl * 10} y2={14} stroke={INK} strokeWidth={8} strokeLinecap="round" />
          <line x1={-34} y1={-10} x2={-48 - crawl * 10} y2={14} stroke={INK} strokeWidth={8} strokeLinecap="round" />
        </g>
        {/* шкала пройденного */}
        {part !== 2 && <text x={540} y={1380} textAnchor="middle" fontFamily="monospace" fontWeight={900} fontSize={80} fill="#ffd84d">{meters} / 145 m</text>}
        <line x1={80} y1={1060} x2={80} y2={680} stroke="#ffd84d" strokeWidth={4} strokeDasharray="10 10" />
        <text x={150} y={900} fontFamily={FONT} fontWeight={900} fontSize={40} fill="#ffd84d">12 m</text>
      </svg>
    </AbsoluteFill>
  );
};

// 10. свет в конце, руки тянут наверх
const LightUp: React.FC<{t: number; local: number}> = ({local}) => {
  const pull = interpolate(local, [0.8, 2.2], [0, 1], cl);
  return (
    <AbsoluteFill style={{background: '#0a0705'}}>
      <svg width={1080} height={1920}>
        <ellipse cx={540} cy={520} rx={420} ry={420} fill="rgba(255,236,170,0.35)" />
        <rect x={340} y={300} width={400} height={1200} fill="#120c08" />
        <rect x={340} y={300} width={400} height={180} fill="#ffe9b0" />
        {[0, 1].map((k) => <path key={k} d={`M${470 + k * 140} 380 L${500 + k * 80} ${560 + pull * 60}`} stroke="#f6c9a0" strokeWidth={34} strokeLinecap="round" />)}
        <Hero20 x={540} y={1000 - pull * 180} s={0.8} emo="shock" look={0} glow="#ffe28a" />
      </svg>
    </AbsoluteFill>
  );
};

// 11. пекарня на Западе: тепло, мешки муки, радость
const Bakery: React.FC<{t: number; local: number}> = ({t}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#f2c48a, #e3a663)'}}>
    <svg width={1080} height={1920}>
      <rect x={0} y={1250} width={1080} height={670} fill="#b07a45" />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${190 + i * 120} ${1180 - (i % 2) * 40})`}>
          <path d="M-60 70 Q-70 -40 0 -60 Q70 -40 60 70 Z" fill="#efe6cf" stroke={INK} strokeWidth={6} />
          <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill="#8a6a45">MEHL</text>
        </g>
      ))}
      <rect x={600} y={460} width={320} height={240} rx={14} fill="#3a2a1c" stroke={INK} strokeWidth={8} />
      <rect x={626} y={486} width={268} height={188} rx={10} fill={Math.sin(t * 3) > 0 ? '#ff9a3d' : '#ff8a2d'} />
      <Hero20 x={540} y={1000 - Math.abs(Math.sin(t * 6)) * 25} s={1.0} emo="laugh" look={0} />
      <Person x={810} y={1200} s={1.05} c="#efe6cf" arms="up" face="joy" />
      <Person x={270} y={1220} s={0.95} c="#4a6cf7" arms="up" face="joy" />
    </svg>
  </AbsoluteFill>
);

// 12. предательство: солдаты с фонарями во дворе (без насилия на экране)
const Betrayal: React.FC<{t: number; local: number}> = ({t}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#05070f, #10142a)'}}>
    <svg width={1080} height={1920}>
      <rect x={0} y={1250} width={1080} height={670} fill="#1e1e1e" />
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <path d={`M${250 + k * 300} 980 L${120 + k * 300 + Math.sin(t * 1.4 + k * 2) * 160} 1260 L${360 + k * 300 + Math.sin(t * 1.4 + k * 2) * 160} 1260 Z`} fill="rgba(255,250,200,0.2)" />
          <Person x={250 + k * 300} y={1060} s={1.2} c="#5b6b4a" hair="#2b2b2b" />
        </g>
      ))}
      <text x={540} y={700} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill="#e02424" stroke={INK} strokeWidth={5} opacity={0.85}>VERRATEN</text>
    </svg>
  </AbsoluteFill>
);

// 13. архивная папка: правда раскрыта
const Files: React.FC<{t: number; local: number}> = ({local}) => {
  const open = interpolate(local, [0.4, 1.4], [0, 1], cl);
  return (
    <AbsoluteFill style={{background: '#cdb88a'}}>
      <svg width={1080} height={1920}>
        <rect x={160} y={560} width={760} height={820} rx={20} fill="#efe3c4" stroke={INK} strokeWidth={10} transform="rotate(-2 540 970)" />
        {[0, 1, 2, 3, 4].map((k) => <line key={k} x1={230} x2={850 - (k % 3) * 140} y1={720 + k * 80} y2={720 + k * 80} stroke="#b9a77d" strokeWidth={16} strokeLinecap="round" opacity={open} />)}
        <text x={240} y={650} fontFamily="monospace" fontWeight={900} fontSize={46} fill="#6b5a3a">AKTE · 1964</text>
        <g opacity={open} transform={`translate(540 1180) rotate(-10) scale(${0.8 + 0.2 * open})`}>
          <rect x={-330} y={-80} width={660} height={160} rx={16} fill="none" stroke="#d32020" strokeWidth={16} />
          <text x={0} y={40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill="#d32020">WAHRHEIT</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// 14. финал: рассвет на Западе
const EndWest: React.FC<{t: number; local: number}> = ({t}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#f7b26a, #ffe3b3)'}}>
    <svg width={1080} height={1920}>
      <circle cx={540} cy={1250} r={360} fill="#ffd84d" opacity={0.6} />
      <rect x={0} y={1250} width={1080} height={670} fill="#8a8f99" />
      <Hero20 x={540} y={1050} s={1.15} emo="laugh" look={0} blink={Math.floor(t * 10) % 31 === 0} />
    </svg>
  </AbsoluteFill>
);

// ================== «Lengede 1963» (POV, горняк) ==================
const Miner: React.FC<{x: number; y: number; s?: number; emo?: string; look?: number; blink?: boolean; lamp?: number; dirty?: boolean}> = ({x, y, s = 1, emo = 'ok', look = 0, blink = false, lamp = 1, dirty}) => (
  <g>
    <Teen x={x} y={y} s={s} emo={emo} look={look} blink={blink} sweater="#3d4a5c" stripe="#2c3644" hair="#3b2a1f" />
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* каска с фонарём */}
      <path d="M-160 -40 Q-158 -190 0 -192 Q158 -190 160 -40 Z" fill="#f2c14e" stroke={INK} strokeWidth={9} />
      <rect x={-185} y={-52} width={370} height={30} rx={14} fill="#e0ad35" stroke={INK} strokeWidth={8} />
      <rect x={-34} y={-170} width={68} height={52} rx={12} fill="#5a5f6a" stroke={INK} strokeWidth={6} />
      <circle cx={0} cy={-144} r={20} fill={lamp > 0.1 ? '#fff6c0' : '#3a3f4c'} opacity={0.4 + 0.6 * lamp} />
      {dirty && [[-80, 40], [70, 70], [-30, 100], [90, -10]].map(([dx, dy], k) => <ellipse key={k} cx={dx} cy={dy} rx={22} ry={12} fill="#5a4632" opacity={0.55} />)}
    </g>
  </g>
);

const Rock: React.FC<{c1?: string; c2?: string}> = ({c1 = '#2a241e', c2 = '#1a1612'}) => (
  <>
    <rect x={0} y={0} width={1080} height={1920} fill={c1} />
    {Array.from({length: 60}).map((_, i) => <ellipse key={i} cx={random(`rx${i}`) * 1080} cy={random(`ry${i}`) * 1920} rx={20 + random(`rr${i}`) * 50} ry={12 + random(`rq${i}`) * 26} fill={c2} opacity={0.7} />)}
  </>
);

// штольня: арка с деревянной крепью, рельсы, лампы
const Stollen: React.FC<{t: number; lampsOn: number}> = ({t, lampsOn}) => (
  <>
    <Rock />
    <path d="M60 1420 L60 600 Q540 260 1020 600 L1020 1420 Z" fill="#3a3128" stroke={INK} strokeWidth={10} />
    {[160, 920].map((x) => <rect key={x} x={x - 22} y={600} width={44} height={820} fill="#7a5530" stroke={INK} strokeWidth={6} />)}
    <rect x={120} y={560} width={840} height={40} fill="#7a5530" stroke={INK} strokeWidth={6} />
    {[380, 700].map((x) => (
      <g key={x}>
        <line x1={x} y1={600} x2={x} y2={660} stroke="#222" strokeWidth={4} />
        <circle cx={x} cy={672} r={16} fill="#3a3f4c" />
        <circle cx={x} cy={672} r={16} fill="#ffe28a" opacity={lampsOn} />
        <ellipse cx={x} cy={900} rx={180} ry={260} fill="rgba(255,226,138,0.10)" opacity={lampsOn} />
      </g>
    ))}
    <rect x={60} y={1420} width={960} height={500} fill="#2a241e" />
    <line x1={300} y1={1420} x2={180} y2={1920} stroke="#8a8f99" strokeWidth={12} />
    <line x1={780} y1={1420} x2={900} y2={1920} stroke="#8a8f99" strokeWidth={12} />
    {Array.from({length: 6}).map((_, i) => <rect key={i} x={250 - i * 20} y={1450 + i * 80} width={580 + i * 40} height={22} fill="#5a3d26" />)}
  </>
);

// 1. зацепка: темнота, только фонарь каски; сверху пробивается бур
const DrillHook: React.FC<{t: number; local: number; dur: number}> = ({t, local, dur}) => {
  const bit = interpolate(local, [0, dur], [0, 1], cl);
  const shake = Math.sin(t * 60) * 3;
  return (
    <AbsoluteFill style={{background: '#050403'}}>
      <svg width={1080} height={1920}>
        <Rock c1="#0d0b09" c2="#060504" />
        <ellipse cx={540} cy={1000} rx={420} ry={520} fill="rgba(255,226,138,0.07)" />
        {/* бур прорывается сверху */}
        <g transform={`translate(${780 + shake} ${560 + bit * 260}) scale(1.4)`}>
          <rect x={-34} y={-400} width={68} height={400} fill="#8a8f99" stroke={INK} strokeWidth={6} />
          {Array.from({length: 6}).map((_, k) => <line key={k} x1={-34} y1={-60 * k - ((t * 400) % 60)} x2={34} y2={-60 * k - 30 - ((t * 400) % 60)} stroke="#5a5f6a" strokeWidth={8} />)}
          <path d="M-34 0 L0 70 L34 0 Z" fill="#cfd5df" stroke={INK} strokeWidth={6} />
        </g>
        {Array.from({length: 18}).map((_, k) => <circle key={k} cx={780 + ((k * 61) % 240) - 120} cy={640 + bit * 260 + ((t * 300 + k * 53) % 400)} r={5 + (k % 3) * 2} fill="#6b5a45" />)}
        <Miner x={430} y={1150} s={0.95} emo="shock" look={1} lamp={0.4 + 0.3 * Math.abs(Math.sin(t * 2))} dirty />
        <text x={780} y={1360} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill="#ffd84d" opacity={0.85}>BRRRR</text>
      </svg>
    </AbsoluteFill>
  );
};

// 2–3. обычная смена в штольне
const Mine: React.FC<{t: number; local: number}> = ({t, local}) => (
  <AbsoluteFill>
    <svg width={1080} height={1920}>
      <Stollen t={t} lampsOn={1} />
      <g transform={`translate(${720 - local * 30} 1260)`}>
        <rect x={-120} y={-110} width={240} height={130} rx={10} fill="#6b5a45" stroke={INK} strokeWidth={8} />
        {[-70, 70].map((x) => <circle key={x} cx={x} cy={30} r={28} fill="#2b2b2b" stroke={INK} strokeWidth={6} />)}
        {Array.from({length: 6}).map((_, k) => <circle key={k} cx={-80 + k * 32} cy={-118} r={22} fill="#8a4a2a" stroke={INK} strokeWidth={4} />)}
      </g>
      <Miner x={330} y={1020} s={0.85} emo="ok" look={1} blink={Math.floor(t * 10) % 41 === 0} />
    </svg>
  </AbsoluteFill>
);

// 4–5. прорыв воды: волна грязи, лампы гаснут
const Flood: React.FC<{t: number; local: number; dur: number; dark?: boolean}> = ({t, local, dur, dark}) => {
  const w = interpolate(local, [0, dur], dark ? [0.55, 1] : [0, 0.55], cl);
  const lamps = dark ? interpolate(local, [0, 0.9], [1, 0], cl) : 1; // плавно гаснут, без мерцания
  const waveX = 1080 * (1 - w) - 200;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <Stollen t={t} lampsOn={lamps} />
        <path d={`M${waveX} 1920 L${waveX} ${1300 - 260 * w} ${Array.from({length: 8}).map((_, k) => `Q${waveX + 60 + k * 160} ${1240 - 260 * w + Math.sin(t * 6 + k) * 40} ${waveX + 160 + k * 160} ${1300 - 260 * w}`).join(' ')} L1200 1920 Z`} fill="#6b5236" stroke={INK} strokeWidth={8} />
        {Array.from({length: 14}).map((_, k) => <circle key={k} cx={waveX + 40 + (k * 83) % 1000} cy={1250 - 260 * w + Math.sin(t * 8 + k) * 30} r={10 + (k % 3) * 6} fill="#e8dcc0" opacity={0.7} />)}
        <Miner x={dark ? 330 : 300} y={1000} s={0.85} emo={dark ? 'fear' : 'shock'} look={1} lamp={dark ? 0.6 : 1} />
        {dark && <AbsoluteFill />}
      </svg>
      {dark && <AbsoluteFill style={{background: `radial-gradient(circle at 31% 46%, rgba(0,0,0,0) 180px, rgba(0,0,0,${0.5 + 0.4 * w}) 520px)`}} />}
    </AbsoluteFill>
  );
};

// 6. пустота в породе: 11 человек, одна лампа
const Cavity: React.FC<{t: number; local: number}> = ({t}) => (
  <AbsoluteFill style={{background: '#070605'}}>
    <svg width={1080} height={1920}>
      <Rock c1="#14110d" c2="#0b0907" />
      <path d="M100 1400 Q80 700 540 620 Q1000 700 980 1400 Z" fill="#241e18" stroke={INK} strokeWidth={10} />
      <ellipse cx={540} cy={1100} rx={420} ry={320} fill="rgba(255,226,138,0.10)" />
      {Array.from({length: 10}).map((_, k) => {
        const x = 170 + (k % 5) * 185, y = 1240 + Math.floor(k / 5) * 110;
        return (
          <g key={k} transform={`translate(${x} ${y}) scale(0.36)`}>
            <circle r={110} fill="#e8c4a0" stroke={INK} strokeWidth={12} />
            <path d="M-118 -10 Q-116 -130 0 -132 Q116 -130 118 -10 Z" fill="#f2c14e" stroke={INK} strokeWidth={10} />
            <circle cx={-36} cy={10} r={12} fill={INK} /><circle cx={36} cy={10} r={12} fill={INK} />
          </g>
        );
      })}
      <Miner x={540} y={930} s={0.85} emo="nervous" look={0} blink={Math.floor(t * 10) % 33 === 0} dirty />
    </svg>
  </AbsoluteFill>
);

// 7. наверху: копёр, люди ждут
const Surface: React.FC<{t: number; local: number}> = ({t}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#8f99a8, #c9ccd2)'}}>
    <svg width={1080} height={1920}>
      <g transform="translate(540 300)">
        <path d="M-180 900 L-40 0 L40 0 L180 900" fill="none" stroke="#5a3d26" strokeWidth={30} />
        <path d="M-140 640 L140 640 M-100 360 L100 360" stroke="#5a3d26" strokeWidth={20} />
        <circle cx={0} cy={0} r={90} fill="none" stroke="#3a3f4c" strokeWidth={22} />
        {[0, 60, 120].map((a) => <line key={a} x1={-90 * Math.cos((a * Math.PI) / 180)} y1={-90 * Math.sin((a * Math.PI) / 180)} x2={90 * Math.cos((a * Math.PI) / 180)} y2={90 * Math.sin((a * Math.PI) / 180)} stroke="#3a3f4c" strokeWidth={10} />)}
      </g>
      <rect x={0} y={1200} width={1080} height={720} fill="#6b6f63" />
      {Array.from({length: 9}).map((_, k) => <Person key={k} x={130 + k * 105} y={1180 + (k % 2) * 40} s={0.95} c={['#5d6670', '#7a4a3a', '#3d4a5c', '#6a5a4a'][k % 4]} face="ok" />)}
    </svg>
  </AbsoluteFill>
);

// 8. дни: капает вода, на стене черточки
const Days: React.FC<{t: number; local: number; dur: number}> = ({t, local, dur}) => {
  const n = Math.min(7, 1 + Math.floor(interpolate(local, [0, dur * 0.9], [0, 7], cl)));
  const drop = (t * 1.3) % 1;
  return (
    <AbsoluteFill style={{background: '#070605'}}>
      <svg width={1080} height={1920}>
        <Rock c1="#14110d" c2="#0b0907" />
        <ellipse cx={540} cy={1000} rx={440} ry={460} fill="rgba(255,226,138,0.06)" />
        {Array.from({length: n}).map((_, k) => <line key={k} x1={150 + k * 40 + (k === 4 ? 0 : 0)} y1={560} x2={150 + k * 40} y2={700} stroke="#d8c8a8" strokeWidth={12} strokeLinecap="round" />)}
        <circle cx={800} cy={420 + drop * 640} r={14} fill="#9fd3ff" />
        <path d="M740 1080 h120 l-14 90 h-92 Z" fill="#8a8f99" stroke={INK} strokeWidth={6} />
        <Miner x={460} y={1000} s={0.85} emo="sad" look={1} lamp={0.25} dirty />
        {Math.sin(local * 4) > 0.8 && <text x={800} y={760} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={58} fill="#ffd84d" stroke={INK} strokeWidth={3}>KLOPF</text>}
      </svg>
    </AbsoluteFill>
  );
};

// 9–10. бур пробивает потолок, сверху свет и еда
const DrillThrough: React.FC<{t: number; local: number; light?: boolean}> = ({t, local, light}) => {
  const beam = light ? 1 : interpolate(local, [1.2, 2.2], [0, 1], cl);
  return (
    <AbsoluteFill style={{background: '#070605'}}>
      <svg width={1080} height={1920}>
        <Rock c1="#14110d" c2="#0b0907" />
        <path d={`M500 300 L540 300 L${740} 1500 L${300} 1500 Z`} fill={`rgba(255,240,190,${0.25 * beam})`} />
        <rect x={500} y={240} width={40} height={70} fill={beam > 0.2 ? '#fff2c0' : '#2a241e'} />
        {light && <g transform={`translate(520 ${360 + Math.min(1, local / 2) * 360})`}>
          <line x1={0} y1={-300} x2={0} y2={-20} stroke="#cfd5df" strokeWidth={4} />
          <rect x={-50} y={-20} width={100} height={60} rx={10} fill="#d9a066" stroke={INK} strokeWidth={6} />
          <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={INK}>BROT</text>
        </g>}
        <Miner x={540} y={1080} s={0.95} emo={light ? 'laugh' : 'shock'} look={0} lamp={0.3} dirty />
        {!light && <text x={800} y={560} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill="#ffd84d" opacity={0.85}>BRRRR</text>}
      </svg>
    </AbsoluteFill>
  );
};

// 11. узкая капсула спускается в шахту (разрез)
const Capsule: React.FC<{t: number; local: number; dur: number; up?: boolean}> = ({t, local, dur, up}) => {
  const p = interpolate(local, [0, dur], up ? [1, 0.1] : [0.1, 0.85], cl);
  const depth = Math.round(p * 60);
  const top = 580;
  return (
    <AbsoluteFill style={{background: '#14110d'}}>
      <svg width={1080} height={1920}>
        <rect x={0} y={0} width={1080} height={top} fill={up ? '#7f93ad' : '#5a6475'} />
        <rect x={0} y={top} width={1080} height={1920} fill="#3a2e22" />
        <rect x={0} y={700} width={1080} height={300} fill="#45372a" />
        <rect x={0} y={1200} width={1080} height={400} fill="#2f251b" />
        <rect x={470} y={top} width={140} height={860} fill="#0d0a07" stroke="#1d1712" strokeWidth={6} />
        <line x1={540} y1={top} x2={540} y2={top + 40 + p * 560} stroke="#cfd5df" strokeWidth={5} />
        <g transform={`translate(540 ${top + 40 + p * 560})`}>
          <rect x={-46} y={0} width={92} height={240} rx={40} fill="#d8dee8" stroke={INK} strokeWidth={8} />
          <rect x={-30} y={30} width={60} height={70} rx={14} fill="#1d2433" />
          {up && <circle cx={0} cy={60} r={22} fill="#e8c4a0" />}
        </g>
        <text x={180} y={900} fontFamily="monospace" fontWeight={900} fontSize={64} fill="#ffd84d">{depth} m</text>
        {up && Array.from({length: 7}).map((_, k) => <Person key={k} x={150 + k * 130} y={top - 70} s={0.6} c={['#5d6670', '#7a4a3a', '#3d4a5c'][k % 3]} arms="up" face="joy" />)}
        {!up && <Miner x={820} y={1080} s={0.55} emo="nervous" look={-1} lamp={0.4} dirty />}
      </svg>
    </AbsoluteFill>
  );
};

// 13. толпа, прожекторы, телекамера 60-х
const Crowd: React.FC<{t: number; local: number}> = ({t}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#0b0f1f, #1f2540)'}}>
    <svg width={1080} height={1920}>
      {[0, 1].map((k) => <path key={k} d={`M${200 + k * 680} 1200 L${150 + k * 680 + Math.sin(t + k) * 120} 300 L${260 + k * 680 + Math.sin(t + k) * 120} 300 Z`} fill="rgba(255,250,200,0.14)" />)}
      <rect x={0} y={1200} width={1080} height={720} fill="#2a2d36" />
      <g transform="translate(830 1040)">
        <rect x={-90} y={-60} width={180} height={110} rx={12} fill="#2b2f3a" stroke={INK} strokeWidth={8} />
        <circle cx={-110} cy={-5} r={44} fill="#141414" stroke={INK} strokeWidth={6} />
        <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#e8e8e8">TV</text>
        <line x1={-40} y1={50} x2={-80} y2={180} stroke="#3a3f4c" strokeWidth={10} /><line x1={40} y1={50} x2={80} y2={180} stroke="#3a3f4c" strokeWidth={10} />
      </g>
      {Array.from({length: 6}).map((_, k) => <Person key={k} x={120 + k * 100} y={1190 + (k % 2) * 30} s={0.95} c={['#5d6670', '#7a4a3a', '#3d4a5c'][k % 3]} arms="up" face="joy" />)}
      <Miner x={420} y={880} s={0.75} emo="laugh" look={0} dirty />
    </svg>
  </AbsoluteFill>
);

// 14. небо
const SkyEnd: React.FC<{t: number; local: number}> = ({t}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#5fa8e8, #cfe8fb)'}}>
    <svg width={1080} height={1920}>
      <circle cx={820} cy={420} r={110} fill="#fff1a8" />
      {[[200, 520], [600, 640], [880, 760]].map(([x, y], k) => (
        <g key={k} transform={`translate(${x + Math.sin(t * 0.3 + k) * 30} ${y})`}>
          <ellipse rx={110} ry={46} fill="white" /><ellipse cx={-60} cy={10} rx={70} ry={36} fill="white" /><ellipse cx={60} cy={10} rx={70} ry={36} fill="white" />
        </g>
      ))}
      <rect x={0} y={1300} width={1080} height={620} fill="#6f9a4f" />
      <Miner x={540} y={1060} s={1.05} emo="laugh" look={0} dirty />
    </svg>
  </AbsoluteFill>
);

// ================== «Hauptmann von Köpenick» (1906) ==================
// Войгт: пожилой, усы (Adult), в форме — фуражка с красным околышем, эполеты
const Voigt: React.FC<{x: number; y: number; s?: number; emo?: string; look?: number; uniform?: boolean; blink?: boolean}> = ({x, y, s = 1, emo = 'ok', look = 0, uniform, blink}) => (
  <g>
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-170 560 Q-170 220 0 210 Q170 220 170 560 Z" fill={uniform ? '#2c3e66' : '#6b5a45'} stroke={INK} strokeWidth={10} />
      {uniform && [-60, 60].map((bx) => <circle key={bx} cx={bx / 3} cy={300 + Math.abs(bx)} r={10} fill="#d9b13b" />)}
      {uniform && [-1, 1].map((k) => <rect key={k} x={k * 150 - 40} y={215} width={80} height={26} rx={10} fill="#d9b13b" stroke={INK} strokeWidth={5} />)}
      {!uniform && <path d="M-60 260 L0 330 L60 260" stroke="#3a2a1c" strokeWidth={12} fill="none" />}
    </g>
    <Adult x={x} y={y} s={s} emo={emo} look={look} blink={blink} />
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-150 30 Q-140 -90 0 -95 Q140 -90 150 30" fill="#cfcfcf" opacity={0.0} />
      {uniform ? (
        <g>
          <path d="M-150 -70 Q-140 -190 0 -195 Q140 -190 150 -70 Z" fill="#2c3e66" stroke={INK} strokeWidth={9} />
          <rect x={-155} y={-95} width={310} height={36} fill="#c62828" stroke={INK} strokeWidth={7} />
          <path d="M-150 -62 Q0 -20 160 -62 L170 -40 Q0 0 -160 -40 Z" fill="#1d1d2b" />
          <circle cx={0} cy={-150} r={14} fill="#d9b13b" />
        </g>
      ) : (
        <path d="M-140 -60 Q-130 -150 0 -152 Q130 -150 140 -60 Q80 -100 0 -98 Q-80 -100 -140 -60 Z" fill="#9a9a9a" />
      )}
    </g>
  </g>
);

// прусский солдат с пикельхельмом (маленький)
const Soldier: React.FC<{x: number; y: number; s?: number; step?: number}> = ({x, y, s = 1, step = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-22 + step * 6} y={60} width={16} height={52} rx={6} fill="#2b2b3a" />
    <rect x={6 - step * 6} y={60} width={16} height={52} rx={6} fill="#2b2b3a" />
    <rect x={-32} y={-10} width={64} height={80} rx={20} fill="#2c3e66" stroke={INK} strokeWidth={5} />
    <line x1={34} y1={-60} x2={34} y2={70} stroke="#7a5530" strokeWidth={8} />
    <circle cx={0} cy={-40} r={32} fill="#ffd8a8" stroke={INK} strokeWidth={5} />
    <path d="M-34 -48 Q-30 -82 0 -82 Q30 -82 34 -48 Z" fill="#1d1d2b" />
    <line x1={0} y1={-82} x2={0} y2={-104} stroke="#d9b13b" strokeWidth={8} />
    <circle cx={-10} cy={-38} r={4} fill={INK} /><circle cx={10} cy={-38} r={4} fill={INK} />
    <path d="M-10 -22 Q0 -16 10 -22" stroke={INK} strokeWidth={4} fill="none" />
  </g>
);

const OldStreet: React.FC<{t: number; sky?: string}> = ({t, sky = 'linear-gradient(#b9c4cf, #e3e0d6)'}) => (
  <>
    <rect x={0} y={0} width={1080} height={1920} fill="#d8d2c4" />
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <rect x={i * 280 - 20} y={300 + (i % 2) * 60} width={270} height={940} fill={['#c9b79a', '#b5a283', '#d2c2a5', '#bba98b'][i]} stroke={INK} strokeWidth={6} />
        {Array.from({length: 6}).map((_, k) => <rect key={k} x={i * 280 + 25 + (k % 2) * 120} y={380 + (i % 2) * 60 + Math.floor(k / 2) * 230} width={80} height={140} fill="#5d6f82" stroke={INK} strokeWidth={4} />)}
      </g>
    ))}
    <rect x={0} y={1240} width={1080} height={680} fill="#8a8578" />
    {Array.from({length: 40}).map((_, i) => <rect key={i} x={(i % 10) * 110} y={1260 + Math.floor(i / 10) * 60} width={100} height={50} fill="#9a9488" stroke="#7a7468" strokeWidth={3} />)}
  </>
);

// 1. зацепка: марш к ратуше
const KHook: React.FC<{t: number; local: number}> = ({t, local}) => (
  <AbsoluteFill>
    <svg width={1080} height={1920}>
      <OldStreet t={t} />
      <g transform="translate(540 300)">
        <rect x={-300} y={0} width={600} height={940} fill="#c97a4a" stroke={INK} strokeWidth={8} />
        <path d="M-320 0 L0 -160 L320 0 Z" fill="#8a3b2a" stroke={INK} strokeWidth={8} />
        <rect x={-90} y={640} width={180} height={300} rx={80} fill="#5a3d26" stroke={INK} strokeWidth={8} />
        <rect x={-180} y={200} width={360} height={60} fill="#efe6cf" stroke={INK} strokeWidth={5} />
        <text x={0} y={244} textAnchor="middle" fontFamily="serif" fontWeight={900} fontSize={44} fill={INK}>RATHAUS</text>
      </g>
      {Array.from({length: 6}).map((_, k) => <Soldier key={k} x={180 + k * 140 - (local * 20) % 40} y={1300 + (k % 2) * 30} s={1.3} step={Math.sin(t * 8 + k) > 0 ? 1 : -1} />)}
      <Voigt x={540} y={1050} s={0.75} emo="smug" look={0} uniform />
    </svg>
  </AbsoluteFill>
);

// 2–3. мастерская сапожника
const Workshop: React.FC<{t: number; local: number}> = ({t}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#3a2e22, #2a2118)'}}>
    <svg width={1080} height={1920}>
      <path d="M540 320 L180 1300 L900 1300 Z" fill="rgba(255,214,120,0.12)" />
      <path d="M490 290 h100 l40 70 h-180 Z" fill="#c9a227" stroke={INK} strokeWidth={6} />
      {Array.from({length: 5}).map((_, k) => <path key={k} d={`M${130 + k * 180} 520 q40 -60 90 -10 l10 70 h-110 Z`} fill="#4a3220" stroke={INK} strokeWidth={5} />)}
      <rect x={60} y={600} width={960} height={20} fill="#6b4a2f" />
      <rect x={60} y={1300} width={960} height={50} fill="#6b4a2f" stroke={INK} strokeWidth={8} />
      <Voigt x={540} y={980} s={0.85} emo="sad" look={1} blink={Math.floor(t * 10) % 37 === 0} />
      <path d="M700 1240 q60 -80 140 -20 l10 60 h-150 Z" fill="#3a2a1c" stroke={INK} strokeWidth={6} />
    </svg>
  </AbsoluteFill>
);

// 4. лавка старьёвщика: форма висит на вешалке
const Junkshop: React.FC<{t: number; local: number; dur: number}> = ({local, dur}) => {
  const parts = Math.min(3, Math.floor(interpolate(local, [0, dur * 0.8], [0, 3.99], cl)));
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#4a3c2c, #2f2519)'}}>
      <svg width={1080} height={1920}>
        <rect x={0} y={300} width={1080} height={20} fill="#6b4a2f" />
        {Array.from({length: 8}).map((_, k) => <rect key={k} x={60 + k * 125} y={340 + (k % 3) * 40} width={90} height={120} rx={8} fill={['#7a5a3a', '#5a6a7a', '#8a7a5a', '#6a4a4a'][k % 4]} stroke={INK} strokeWidth={4} />)}
        <g transform="translate(760 620)">
          <line x1={0} y1={-60} x2={0} y2={0} stroke={INK} strokeWidth={6} />
          {parts >= 1 && <path d="M-110 20 L110 20 L140 420 L-140 420 Z" fill="#2c3e66" stroke={INK} strokeWidth={8} />}
          {parts >= 2 && [-1, 1].map((k) => <rect key={k} x={k * 100 - 35} y={10} width={70} height={22} rx={8} fill="#d9b13b" stroke={INK} strokeWidth={5} />)}
          {parts >= 3 && <g transform="translate(0 -130)"><path d="M-90 0 Q-80 -70 0 -72 Q80 -70 90 0 Z" fill="#2c3e66" stroke={INK} strokeWidth={6} /><rect x={-92} y={-14} width={184} height={22} fill="#c62828" /></g>}
        </g>
        <Voigt x={330} y={1020} s={0.8} emo="smug" look={1} />
        <text x={760} y={1150} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill="#ffd84d">{parts}/3</text>
      </svg>
    </AbsoluteFill>
  );
};

// 5. улица: солдаты подчиняются
const KStreet: React.FC<{t: number; local: number}> = ({t, local}) => (
  <AbsoluteFill>
    <svg width={1080} height={1920}>
      <OldStreet t={t} />
      {Array.from({length: 5}).map((_, k) => <Soldier key={k} x={560 + k * 100} y={1250 + (k % 2) * 30} s={1.3} step={local > 1.5 ? (Math.sin(t * 8 + k) > 0 ? 1 : -1) : 0} />)}
      <Voigt x={300} y={980} s={0.8} emo="smug" look={1} uniform />
      {local > 0.6 && <text x={680} y={900} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill="#ffd84d" stroke={INK} strokeWidth={3}>Jawohl!</text>}
    </svg>
  </AbsoluteFill>
);

// 6. поезд
const Train: React.FC<{t: number; local: number}> = ({t}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#b9c4cf, #e3e0d6)'}}>
    <svg width={1080} height={1920}>
      {Array.from({length: 8}).map((_, i) => <path key={i} d={`M${((i * 200 - t * 300) % 1600 + 1600) % 1600 - 260} 1000 l90 -240 l90 240 Z`} fill="#6f9a4f" />)}
      <rect x={0} y={1000} width={1080} height={920} fill="#8fae6a" />
      <rect x={0} y={1260} width={1080} height={20} fill="#5a5f6a" />
      <g transform="translate(60 820)">
        <rect x={0} y={0} width={960} height={400} rx={24} fill="#3d6a3a" stroke={INK} strokeWidth={8} />
        {[0, 1, 2].map((k) => <rect key={k} x={60 + k * 300} y={50} width={240} height={180} rx={12} fill="#cfe2ee" stroke={INK} strokeWidth={6} />)}
        {[0, 1, 2].map((k) => <circle key={k} cx={150 + k * 330} cy={420} r={42} fill="#2b2b2b" stroke={INK} strokeWidth={6} />)}
      </g>
      <g transform="translate(250 960) scale(0.42)"><Voigt x={0} y={0} s={1} emo="smug" look={1} uniform /></g>
      {[0, 1, 2, 3].map((k) => <Soldier key={k} x={460 + (k % 2) * 110 + Math.floor(k / 2) * 300} y={1010} s={0.85} />)}
    </svg>
  </AbsoluteFill>
);

// 7. ратуша внутри: бургомистра уводят
const Townhall: React.FC<{t: number; local: number}> = ({t, local}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#d9c7a3, #b8a27e)'}}>
    <svg width={1080} height={1920}>
      <rect x={140} y={430} width={800} height={200} fill="#8a3b2a" stroke={INK} strokeWidth={6} />
      <text x={540} y={555} textAnchor="middle" fontFamily="serif" fontWeight={900} fontSize={60} fill="#e8d8a8">KÖPENICK</text>
      <rect x={0} y={1250} width={1080} height={670} fill="#7a5a3a" />
      <Adult x={760} y={1000} s={0.75} emo={local > 1 ? 'shock' : 'nervous'} look={-1} />
      <Soldier x={900} y={1190} s={1.3} />
      <Soldier x={620} y={1210} s={1.3} />
      <Voigt x={300} y={990} s={0.78} emo="smug" look={1} uniform />
      <text x={760} y={700} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>BÜRGERMEISTER</text>
    </svg>
  </AbsoluteFill>
);

// 8. касса: деньги и расписка
const Cash: React.FC<{t: number; local: number; dur: number}> = ({local, dur}) => {
  const coins = Math.floor(interpolate(local, [0, dur * 0.6], [0, 14], cl));
  const receipt = interpolate(local, [dur * 0.6, dur * 0.8], [0, 1], cl);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#d9c7a3, #b8a27e)'}}>
      <svg width={1080} height={1920}>
        <rect x={80} y={1000} width={920} height={60} fill="#5a3d26" stroke={INK} strokeWidth={8} />
        <g transform="translate(300 860)">
          <rect x={-150} y={-120} width={300} height={260} rx={14} fill="#4a4f58" stroke={INK} strokeWidth={8} />
          <text x={0} y={30} textAnchor="middle" fontFamily="serif" fontWeight={900} fontSize={40} fill="#d9b13b">KASSE</text>
        </g>
        {Array.from({length: coins}).map((_, k) => <ellipse key={k} cx={560 + (k % 7) * 50} cy={980 - Math.floor(k / 7) * 26} rx={24} ry={10} fill="#d9b13b" stroke={INK} strokeWidth={4} />)}
        <g opacity={receipt} transform={`translate(600 640) rotate(-6) scale(${0.85 + 0.15 * receipt})`}>
          <rect x={-200} y={-150} width={400} height={300} fill="#f4efe0" stroke={INK} strokeWidth={6} />
          <text x={0} y={-80} textAnchor="middle" fontFamily="serif" fontWeight={900} fontSize={50} fill={INK}>QUITTUNG</text>
          <text x={0} y={-10} textAnchor="middle" fontFamily="serif" fontSize={38} fill={INK}>~ 4.000 Mark</text>
          <path d="M-120 70 q40 -40 80 0 t80 0 t80 0" stroke="#1d3a8a" strokeWidth={6} fill="none" />
        </g>
        <Voigt x={300} y={1260} s={0.55} emo="laugh" look={1} uniform />
      </svg>
    </AbsoluteFill>
  );
};

// 9. уходит
const Leave: React.FC<{t: number; local: number; dur: number}> = ({t, local, dur}) => {
  const x = interpolate(local, [0, dur], [540, 980], cl);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <OldStreet t={t} />
        <g transform={`translate(${x - 540} 0)`}><Voigt x={540} y={1000} s={0.7} emo="smug" look={1} uniform /></g>
      </svg>
    </AbsoluteFill>
  );
};

// 10. газеты всего мира
const Papers: React.FC<{t: number; local: number}> = ({local}) => (
  <AbsoluteFill style={{background: '#2a2a2a'}}>
    <svg width={1080} height={1920}>
      {[['BERLINER BLATT', -5, 620], ['THE TIMES', 4, 940], ['LE PETIT JOURNAL', -3, 1260]].map(([n, r, y], k) => {
        const o = interpolate(local, [k * 0.5, k * 0.5 + 0.3], [0, 1], cl);
        return (
          <g key={k} opacity={o} transform={`translate(540 ${y}) rotate(${r})`}>
            <rect x={-400} y={-150} width={800} height={300} fill="#efe9dc" stroke={INK} strokeWidth={6} />
            <text x={0} y={-80} textAnchor="middle" fontFamily="serif" fontWeight={900} fontSize={46} fill={INK}>{n as string}</text>
            <text x={0} y={0} textAnchor="middle" fontFamily="serif" fontWeight={900} fontSize={44} fill="#8a1c1c">HAUPTMANN VON KÖPENICK</text>
            {[50, 90].map((ly) => <line key={ly} x1={-320} x2={320} y1={ly} y2={ly} stroke="#b9b2a2" strokeWidth={10} />)}
          </g>
        );
      })}
    </svg>
  </AbsoluteFill>
);

// 11. арест
const KArrest: React.FC<{t: number; local: number}> = ({t, local}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#3a2e22, #2a2118)'}}>
    <svg width={1080} height={1920}>
      <rect x={640} y={420} width={300} height={820} fill="#5a3d26" stroke={INK} strokeWidth={10} />
      <rect x={0} y={1240} width={1080} height={680} fill="#4a3a2a" />
      {[0, 1].map((k) => <Person key={k} x={760 + k * 130} y={1150} s={1.4} c="#1d2b4a" hair="#1d1d2b" />)}
      <Voigt x={330} y={980} s={0.8} emo={local > 0.5 ? 'shock' : 'ok'} look={1} />
    </svg>
  </AbsoluteFill>
);

// 12. помилование кайзера
const Pardon: React.FC<{t: number; local: number}> = ({local}) => {
  const o = interpolate(local, [0.4, 1.2], [0, 1], cl);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#e9dcc0, #cdb88a)'}}>
      <svg width={1080} height={1920}>
        <rect x={180} y={520} width={720} height={820} rx={12} fill="#f8f1de" stroke={INK} strokeWidth={8} />
        <text x={540} y={640} textAnchor="middle" fontFamily="serif" fontWeight={900} fontSize={56} fill={INK}>BEGNADIGUNG</text>
        {[0, 1, 2, 3, 4].map((k) => <line key={k} x1={260} x2={820 - (k % 2) * 120} y1={740 + k * 80} y2={740 + k * 80} stroke="#c9bfa5" strokeWidth={14} strokeLinecap="round" />)}
        <g opacity={o}><circle cx={540} cy={1200} r={80} fill="#b8322d" stroke={INK} strokeWidth={6} /><path d="M500 1200 l30 30 l60 -60" stroke="#f8f1de" strokeWidth={14} fill="none" /></g>
      </svg>
    </AbsoluteFill>
  );
};

// 13. финал: зеркало — в форме и без
const KEnd: React.FC<{t: number; local: number}> = ({t}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#3a2e22, #2a2118)'}}>
    <svg width={1080} height={1920}>
      <rect x={560} y={420} width={420} height={820} rx={200} fill="#9fb3c4" stroke="#8a6a3a" strokeWidth={22} />
      <g transform="translate(770 980) scale(0.62)"><Voigt x={0} y={0} s={1} emo="smug" look={-1} uniform /></g>
      <Voigt x={300} y={1000} s={0.75} emo="ok" look={1} blink={Math.floor(t * 10) % 31 === 0} />
    </svg>
  </AbsoluteFill>
);

// ================== «Seilbahn 1965» (POV, 9 лет): семья Хольцапфель, трос с крыши Дома министерств ==================
const KIDC = {sweater: '#f2b233', stripe: '#d0861b', hair: '#8a5226'};
const Kid9: React.FC<{x: number; y: number; s?: number; emo?: string; look?: number; blink?: boolean; shiver?: number; glow?: string}> = (p) => <Teen {...p} {...KIDC} />;
const blinkAt = (t: number, k = 37) => Math.floor(t * 10) % k === 0;

// трос: от флагштока на крыше (FX,FY) до опоры на Западе (WX,WY)
const FX = 300, FY = 560, WX = 1040, WY = 1150;
const onCable = (p: number) => [FX + (WX - FX) * p, FY + (WY - FY) * p];
const CABLE_ANG = Math.atan2(WY - FY, WX - FX) * 180 / Math.PI;

// человек, висящий на ролике под тросом (who: kid / mum / dad)
const Rider: React.FC<{x: number; y: number; who: 'kid' | 'mum' | 'dad'; emo?: string; t: number; sway?: number}> = ({x, y, who, emo = 'fear', t, sway = 1}) => {
  const hs = who === 'kid' ? 0.2 : 0.24;
  const r = 150 * hs;
  const body = who === 'kid' ? '#f2b233' : who === 'mum' ? '#6a7fb8' : '#5d6670';
  const hair = who === 'kid' ? '#8a5226' : who === 'mum' ? '#7a4a2a' : '#3b2a1f';
  const skin = who === 'kid' ? '#ffd8a8' : '#f6c9a0';
  const sw = Math.sin(t * 2.2) * 6 * sway;
  const hy = 70 + r; // центр головы
  const legs = Math.sin(t * 3) * 6;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={14} fill="#c9ccd2" stroke={INK} strokeWidth={5} />
      <g transform={`rotate(${sw})`}>
        <line x1={0} y1={0} x2={-r * 0.9} y2={hy + r + 10} stroke="#c0392b" strokeWidth={7} />
        <line x1={0} y1={0} x2={r * 0.9} y2={hy + r + 10} stroke="#c0392b" strokeWidth={7} />
        {/* руки держатся за ремни */}
        <path d={`M${-r * 0.8} ${hy + r + 20} L-10 ${30}`} stroke={INK} strokeWidth={10} strokeLinecap="round" />
        <path d={`M${r * 0.8} ${hy + r + 20} L10 ${30}`} stroke={INK} strokeWidth={10} strokeLinecap="round" />
        <rect x={-r * 0.85} y={hy + r - 4} width={r * 1.7} height={r * 1.9} rx={r * 0.5} fill={body} stroke={INK} strokeWidth={5} />
        <rect x={-r * 0.95} y={hy + r * 2.1} width={r * 1.9} height={14} rx={6} fill="#c0392b" stroke={INK} strokeWidth={3} />
        <path d={`M${-r * 0.4} ${hy + r * 2.8} l${-4 + legs} ${r * 1.4} M${r * 0.4} ${hy + r * 2.8} l${4 - legs} ${r * 1.4}`} stroke="#2b2b3a" strokeWidth={14} strokeLinecap="round" />
        <g transform={`translate(0 ${hy}) scale(${hs})`}>
          <circle r={150} fill={skin} stroke={INK} strokeWidth={12} />
          <path d="M-150 -30 Q-140 -170 0 -165 Q140 -170 150 -30 Q110 -115 0 -110 Q-110 -115 -150 -30 Z" fill={hair} stroke={INK} strokeWidth={10} />
          <g transform="translate(0 10)"><Face emo={emo} open={0} look={0} blink={blinkAt(t, 41)} skin={skin} /></g>
        </g>
      </g>
    </g>
  );
};

// общий ночной вид сбоку: слева Дом министерств, полоса, Стена, справа Запад
const Panorama: React.FC<{t: number; cable?: number; children?: React.ReactNode; follow?: number[]; dawn?: number; relatives?: boolean}> = ({t, cable = 1, children, follow, dawn = 0, relatives = true}) => {
  const [cx, cy, z] = follow ?? [540, 960, 1];
  const tx = Math.min(0, Math.max(1080 - 1080 * z, 540 - cx * z));
  const ty = Math.min(0, Math.max(1920 - 1920 * z, 820 - cy * z));
  const [ex, ey] = onCable(cable);
  const beam = Math.sin(t * 0.7) * 160;
  return (
    <AbsoluteFill style={{background: dawn ? 'linear-gradient(#3a4f8f, #f2a76a)' : 'linear-gradient(#0a1238, #24306a)'}}>
      <svg width={1080} height={1920}>
        <g transform={`translate(${tx} ${ty}) scale(${z})`}>
          <Stars t={t} n={dawn ? 15 : 60} h={700} />
          {/* огни Запада */}
          {Array.from({length: 7}).map((_, i) => (
            <g key={i}>
              <rect x={700 + i * 60} y={900 + (i % 3) * 50} width={56} height={400} fill="#2c3566" stroke="#1a2048" strokeWidth={4} />
              {[0, 1, 2, 3].map((k) => <rect key={k} x={712 + i * 60} y={930 + (i % 3) * 50 + k * 70} width={30} height={34} fill={(i + k) % 2 ? '#ffd76a' : '#ffb84d'} />)}
            </g>
          ))}
          {/* Дом министерств */}
          <rect x={-40} y={FY + 80} width={420} height={1300 - FY - 80} fill="#8c8fa0" stroke={INK} strokeWidth={8} />
          {Array.from({length: 36}).map((_, i) => <rect key={i} x={-10 + (i % 6) * 64} y={FY + 120 + Math.floor(i / 6) * 95} width={38} height={60} fill={i === 33 ? '#ffe28a' : '#3a3f5c'} />)}
          <rect x={-50} y={FY + 62} width={440} height={26} fill="#a6a9b8" stroke={INK} strokeWidth={6} />
          {/* флагшток */}
          <rect x={FX - 7} y={FY - 10} width={14} height={90} fill="#d8d8d8" stroke={INK} strokeWidth={4} />
          {/* полоса и Стена */}
          <rect x={-40} y={1300} width={1200} height={700} fill="#1c2033" />
          <rect x={380} y={1240} width={250} height={60} fill="#e9d9a8" />
          <rect x={620} y={1040} width={46} height={260} fill="#c9c9c2" stroke={INK} strokeWidth={6} />
          <rect x={612} y={1028} width={62} height={22} rx={11} fill="#e0e0d8" stroke={INK} strokeWidth={5} />
          <rect x={666} y={1240} width={500} height={60} fill="#3f7a4a" />
          {/* вышка и плавно гуляющий прожектор */}
          <path d={`M470 980 L${380 + beam} 1300 L${520 + beam} 1300 Z`} fill="rgba(255,248,190,0.22)" />
          <rect x={458} y={990} width={24} height={250} fill="#a0a0a0" stroke={INK} strokeWidth={5} />
          <rect x={432} y={940} width={76} height={56} rx={6} fill="#c4c4c4" stroke={INK} strokeWidth={5} />
          <rect x={442} y={952} width={56} height={24} fill="#ffe28a" />
          <text x={850} y={1225} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#bfe0ff">WEST</text>
          <text x={150} y={1225} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#ffb3a8">OST</text>
          {/* трос */}
          {cable > 0 && <line x1={FX} y1={FY} x2={ex} y2={ey} stroke="#e8e8e8" strokeWidth={6} />}
          {/* родственники на Западе */}
          {relatives && [930, 1010].map((x, k) => <Person key={k} x={x} y={1150} s={0.75} c={k ? '#d36b4a' : '#4caf6a'} arms="up" face="ok" />)}
          {children}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// 1. ХУК: крупно — ребёнок висит на тросе, далеко внизу Стена и прожектор
const WHook: React.FC<{t: number; local: number; dur: number}> = ({t, local, dur}) => {
  const slide = interpolate(local, [0, dur], [-60, 60], cl);
  const beam = Math.sin(t * 0.8) * 200;
  const sway = Math.sin(t * 2) * 4;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#0a1238, #2a3878)'}}>
      <svg width={1080} height={1920}>
        <Stars t={t} n={60} h={900} />
        {/* далеко внизу: Стена, полоса, вышка */}
        <rect x={0} y={1180} width={1080} height={740} fill="#1c2033" />
        <rect x={0} y={1150} width={1080} height={50} fill="#e9d9a8" />
        <rect x={0} y={1090} width={1080} height={60} fill="#c9c9c2" stroke={INK} strokeWidth={5} />
        <rect x={0} y={1080} width={1080} height={16} rx={8} fill="#e0e0d8" />
        <path d={`M230 1000 L${120 + beam} 1200 L${330 + beam} 1200 Z`} fill="rgba(255,248,190,0.25)" />
        <rect x={218} y={1000} width={24} height={150} fill="#a0a0a0" stroke={INK} strokeWidth={5} />
        <rect x={192} y={955} width={76} height={50} rx={6} fill="#c4c4c4" stroke={INK} strokeWidth={5} />
        <rect x={202} y={965} width={56} height={22} fill="#ffe28a" />
        {/* трос по диагонали */}
        <line x1={-40} y1={420} x2={1120} y2={760} stroke="#ececec" strokeWidth={12} />
        <g transform={`translate(${540 + slide} ${580 + slide * 0.293})`}>
          <circle r={26} fill="#c9ccd2" stroke={INK} strokeWidth={7} />
          <g transform={`rotate(${sway})`}>
            <line x1={0} y1={0} x2={-120} y2={260} stroke="#c0392b" strokeWidth={14} />
            <line x1={0} y1={0} x2={120} y2={260} stroke="#c0392b" strokeWidth={14} />
            <Kid9 x={0} y={350} s={0.62} emo="fear" look={0.5} blink={blinkAt(t)} />
            <path d="M-80 470 L-20 40 M80 470 L20 40" stroke={INK} strokeWidth={22} strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// 2. Дом министерств вечером, сразу за ним Стена (12 м)
const Ministry: React.FC<{t: number; local: number}> = ({t, local}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#6f86c9, #f2b98a)'}}>
    <svg width={1080} height={1920}>
      <rect x={40} y={430} width={700} height={560} fill="#9b9eae" stroke={INK} strokeWidth={8} />
      {Array.from({length: 30}).map((_, i) => <rect key={i} x={70 + (i % 10) * 66} y={470 + Math.floor(i / 10) * 140} width={36} height={70} fill="#3a3f5c" />)}
      <rect x={30} y={410} width={720} height={30} fill="#b3b6c4" stroke={INK} strokeWidth={6} />
      <rect x={270} y={330} width={14} height={90} fill="#d8d8d8" stroke={INK} strokeWidth={4} />
      <rect x={880} y={720} width={60} height={270} fill="#c9c9c2" stroke={INK} strokeWidth={7} />
      <rect x={870} y={705} width={80} height={24} rx={12} fill="#e0e0d8" stroke={INK} strokeWidth={5} />
      <g opacity={interpolate(local, [1, 1.6], [0, 1], cl)}>
        <path d="M750 650 H870" stroke="#ffd84d" strokeWidth={8} />
        <path d="M750 650 l20 -14 v28 Z M870 650 l-20 -14 v28 Z" fill="#ffd84d" />
        <Label x={810} y={620} text="12 m" size={56} />
      </g>
      <rect x={70} y={905} width={640} height={70} rx={10} fill="#2b2f45" stroke={INK} strokeWidth={5} /><Label x={390} y={955} text="HAUS DER MINISTERIEN" size={40} c="white" />
      <rect x={0} y={990} width={1080} height={930} fill="#5b5f6c" />
      <Adult x={250} y={1080} s={0.5} emo="nervous" look={1} blink={blinkAt(t, 43)} />
      <Adult x={830} y={1080} s={0.5} mum emo="nervous" look={-1} blink={blinkAt(t, 47)} />
      <Kid9 x={540} y={1140} s={0.45} emo={local > 4 ? 'shock' : 'nervous'} look={1} blink={blinkAt(t)} />
    </svg>
  </AbsoluteFill>
);

// 3–4. туалет изнутри: засов, табличка, шаги за дверью (тень в щели)
const Toilet: React.FC<{t: number; local: number; dur: number; steps?: boolean}> = ({t, local, dur, steps}) => {
  const bolt = steps ? 1 : interpolate(local, [0.8, 1.6], [0, 1], cl);
  const shadow = steps ? interpolate(local, [1.2, dur - 0.5], [-200, 1300], cl) : -999;
  return (
    <AbsoluteFill style={{background: '#cfe3ea'}}>
      <svg width={1080} height={1920}>
        {Array.from({length: 13 * 9}).map((_, i) => <rect key={i} x={(i % 9) * 122} y={Math.floor(i / 9) * 122} width={118} height={118} fill={(i % 9 + Math.floor(i / 9)) % 2 ? '#e4f1f4' : '#d3e7ee'} />)}
        {/* дверь */}
        <rect x={300} y={420} width={480} height={780} fill="#8a5a36" stroke={INK} strokeWidth={10} />
        <rect x={340} y={600} width={400} height={160} fill="#9b6a43" stroke={INK} strokeWidth={6} />
        <rect x={340} y={780} width={400} height={360} fill="#9b6a43" stroke={INK} strokeWidth={6} />
        {/* засов */}
        <rect x={600} y={760} width={150} height={30} rx={10} fill="#b8bcc4" stroke={INK} strokeWidth={5} />
        <rect x={600 + bolt * 110} y={748} width={60} height={54} rx={8} fill="#d8dbe0" stroke={INK} strokeWidth={5} />
        <rect x={780} y={755} width={40} height={40} fill="#b8bcc4" stroke={INK} strokeWidth={5} />
        {/* табличка */}
        <g transform="translate(540 520) rotate(-3)">
          <rect x={-170} y={-50} width={340} height={100} rx={10} fill="#f4ecd2" stroke={INK} strokeWidth={6} />
          <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#c0392b">GESCHLOSSEN</text>
        </g>
        {/* щель под дверью и тень шагов */}
        <rect x={300} y={1200} width={480} height={18} fill="#ffe9a8" />
        {steps && <rect x={shadow} y={1200} width={160} height={18} fill="#3a2a1a" />}
        <rect x={0} y={1218} width={1080} height={702} fill="#9fb6bf" />
        <Adult x={170} y={960} s={0.5} emo={steps ? 'fear' : 'nervous'} look={1} blink={blinkAt(t, 43)} />
        <Adult x={910} y={960} s={0.5} mum emo={steps ? 'fear' : 'nervous'} look={-1} blink={blinkAt(t, 47)} />
        <Kid9 x={540} y={1090} s={0.42} emo={steps ? 'fear' : 'nervous'} look={0} blink={blinkAt(t)} shiver={steps ? Math.sin(t * 30) * 2 : 0} />
      </svg>
    </AbsoluteFill>
  );
};

// 5. крыша ночью, отец подаёт знак фонариком на Запад (плавная пульсация, без вспышек)
const Roof: React.FC<{t: number; local: number}> = ({t, local}) => {
  const glow = 0.35 + 0.25 * Math.sin(local * 2.2);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#0a1238, #2a3878)'}}>
      <svg width={1080} height={1920}>
        <Stars t={t} n={70} h={800} />
        {Array.from({length: 8}).map((_, i) => (
          <g key={i}>
            <rect x={560 + i * 66} y={720 + (i % 3) * 40} width={60} height={400} fill="#2c3566" />
            {[0, 1, 2].map((k) => <rect key={k} x={575 + i * 66} y={750 + (i % 3) * 40 + k * 80} width={30} height={40} fill="#ffd76a" />)}
          </g>
        ))}
        <rect x={0} y={1100} width={1080} height={820} fill="#4a4e60" />
        <rect x={0} y={1090} width={1080} height={24} fill="#6a6e80" />
        <rect x={120} y={500} width={14} height={600} fill="#d8d8d8" stroke={INK} strokeWidth={4} />
        <path d={`M560 760 L1100 560 L1100 960 Z`} fill={`rgba(255,240,170,${glow})`} />
        <Adult x={390} y={860} s={0.6} emo="nervous" look={1} blink={blinkAt(t, 43)} />
        <rect x={500} y={740} width={70} height={40} rx={8} fill="#2b2b3a" stroke={INK} strokeWidth={5} />
        <circle cx={572} cy={760} r={18} fill="#fff3b0" />
        <Kid9 x={760} y={1150} s={0.4} emo="nervous" look={1} blink={blinkAt(t)} />
        <Label x={820} y={680} text="WEST" size={56} c="#bfe0ff" />
      </svg>
    </AbsoluteFill>
  );
};

// 6. молоток со шнуром летит через Стену
const Throw: React.FC<{t: number; local: number; dur: number}> = ({t, local, dur}) => {
  const k = interpolate(local, [0.6, Math.min(3, dur - 0.5)], [0, 1], cl);
  const hx = FX + 110 + (870 - FX) * k;
  const hy = FY - 40 + (1150 - FY) * k - Math.sin(k * Math.PI) * 260;
  return (
    <Panorama t={t} cable={0} relatives follow={[hx, hy + interpolate(k, [0, 0.35], [-120, 150], cl), interpolate(k, [0, 0.5, 1], [1.6, 1.35, 1.7])]}>
      <Person x={FX + 30} y={FY - 30} s={0.6} c="#5d6670" arms="up" face="ok" />
      <path d={`M${FX + 30} ${FY - 60} Q${(FX + hx) / 2} ${Math.min(FY, hy) - 200 * k} ${hx} ${hy}`} stroke="#fff3b0" strokeWidth={5} fill="none" />
      <g transform={`translate(${hx} ${hy}) rotate(${local * 300}) scale(1.8)`}>
        <rect x={-6} y={-30} width={12} height={60} fill="#a8743f" stroke={INK} strokeWidth={3} />
        <rect x={-22} y={-38} width={44} height={20} fill="#8a8f99" stroke={INK} strokeWidth={3} />
      </g>
    </Panorama>
  );
};

// 7. родители тянут стальной трос и крепят к флагштоку
const Cable: React.FC<{t: number; local: number; dur: number}> = ({t, local, dur}) => {
  const k = interpolate(local, [0.3, dur * 0.7], [0, 1], cl);
  const pull = Math.sin(t * 5) * 8;
  return (
    <Panorama t={t} cable={0} follow={[interpolate(k, [0, 1], [900, FX + 60]), interpolate(k, [0, 1], [1050, FY + 40]), interpolate(k, [0, 0.5, 1], [1.6, 1.15, 1.6])]}>
      {/* трос подтягивается от Запада к крыше */}
      <line x1={WX} y1={WY} x2={WX + (FX - WX) * k} y2={WY + (FY - WY) * k + Math.sin(k * Math.PI) * 120} stroke="#e8e8e8" strokeWidth={6} />
      <Person x={FX - 60 + pull} y={FY - 40} s={0.6} c="#5d6670" arms="hold" face="fear" />
      <Person x={FX + 70 - pull} y={FY - 40} s={0.6} c="#6a7fb8" hair="#7a4a2a" arms="hold" face="fear" />
    </Panorama>
  );
};

// 8. на крыше: отец смотрит на сына, «ты первый»
const Harness: React.FC<{t: number; local: number}> = ({t, local}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#0a1238, #2a3878)'}}>
    <svg width={1080} height={1920}>
      <Stars t={t} n={60} h={700} />
      <line x1={-20} y1={380} x2={1100} y2={1000} stroke="#ececec" strokeWidth={12} />
      <rect x={0} y={1180} width={1080} height={740} fill="#4a4e60" />
      <Adult x={290} y={860} s={0.75} emo="sad" look={1} blink={blinkAt(t, 43)} />
      <Kid9 x={760} y={1000} s={0.6} emo={local > 1.5 ? 'fear' : 'nervous'} look={-1} blink={blinkAt(t)} />
      <rect x={640} y={1180} width={240} height={34} rx={10} fill="#c0392b" stroke={INK} strokeWidth={5} />
    </svg>
  </AbsoluteFill>
);

// 9 / 11 / 13. спуск по тросу, камера следует за человеком
const SlideScene: React.FC<{t: number; local: number; dur: number; who: 'kid' | 'mum' | 'dad'}> = ({t, local, dur, who}) => {
  const p = interpolate(local, [0.2, dur - 0.3], [0.02, 0.9], cl);
  const shake = who === 'mum' ? Math.sin(t * 18) * 4 : 0;
  const [x, y] = onCable(p);
  return (
    <Panorama t={t} follow={[x, y + 120, 1.75]}>
      <Rider x={x} y={y + shake} who={who} emo={p > 0.75 ? 'laugh' : 'fear'} t={t} />
      {who !== 'kid' && <Kid9 x={985} y={1120} s={0.12} emo="nervous" look={-1} />}
    </Panorama>
  );
};

// 10. Запад: родственники ловят, ребёнок смеётся (развязка)
const WestArrive: React.FC<{t: number; local: number}> = ({t, local}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#2c3a7a, #f2a76a)'}}>
    <svg width={1080} height={1920}>
      <circle cx={540} cy={780} r={420} fill="#ffd84d" opacity={0.35} />
      <rect x={0} y={1200} width={1080} height={720} fill="#3f7a4a" />
      <Adult x={210} y={980} s={0.55} emo="laugh" look={1} blink={blinkAt(t, 43)} />
      <Adult x={870} y={980} s={0.55} mum emo="laugh" look={-1} blink={blinkAt(t, 47)} />
      <Kid9 x={540} y={1000 - Math.abs(Math.sin(local * 4)) * 20} s={0.7} emo="laugh" blink={blinkAt(t)} />
      <Label x={540} y={520} text="WEST-BERLIN" size={60} c="white" />
    </svg>
  </AbsoluteFill>
);

// 12. отец один на крыше
const DadAlone: React.FC<{t: number; local: number}> = ({t}) => {
  const beam = Math.sin(t * 0.7) * 260;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#0a1238, #2a3878)'}}>
      <svg width={1080} height={1920}>
        <Stars t={t} n={60} h={800} />
        <path d={`M900 1300 L${620 + beam} 200 L${820 + beam} 200 Z`} fill="rgba(255,248,190,0.16)" />
        <line x1={240} y1={560} x2={1100} y2={1050} stroke="#ececec" strokeWidth={10} />
        <rect x={232} y={540} width={16} height={700} fill="#d8d8d8" stroke={INK} strokeWidth={4} />
        <rect x={0} y={1230} width={1080} height={690} fill="#4a4e60" />
        <Adult x={560} y={900} s={0.8} emo="fear" look={1} blink={blinkAt(t, 43)} />
      </svg>
    </AbsoluteFill>
  );
};

// 14. новая жизнь: Мюнхен, вся семья вместе
const Family: React.FC<{t: number; local: number}> = ({t}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#7fb6f0, #ffe3b3)'}}>
    <svg width={1080} height={1920}>
      <circle cx={820} cy={420} r={110} fill="#ffd84d" />
      {/* силуэт с двумя башнями-куполами */}
      {[380, 700].map((x) => (
        <g key={x}>
          <rect x={x - 55} y={560} width={110} height={420} fill="#b2603f" stroke={INK} strokeWidth={6} />
          <path d={`M${x - 55} 560 Q${x - 55} 450 ${x} 440 Q${x + 55} 450 ${x + 55} 560 Z`} fill="#4f8a6a" stroke={INK} strokeWidth={6} />
        </g>
      ))}
      <rect x={200} y={760} width={680} height={180} fill="#c97a55" stroke={INK} strokeWidth={6} />
      <Label x={540} y={870} text="MÜNCHEN" size={64} c="white" />
      <rect x={0} y={1180} width={1080} height={740} fill="#8a8f99" />
      <Adult x={210} y={1110} s={0.5} emo="laugh" look={1} blink={blinkAt(t, 43)} />
      <Adult x={870} y={1110} s={0.5} mum emo="laugh" look={-1} blink={blinkAt(t, 47)} />
      <Kid9 x={540} y={1130} s={0.5} emo="laugh" blink={blinkAt(t)} />
    </svg>
  </AbsoluteFill>
);

// 15. кольцо: рассвет, трос всё ещё над Стеной, мальчик смотрит вверх
const EndRope: React.FC<{t: number; local: number}> = ({t, local}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#3a4f8f, #f2a76a)'}}>
    <svg width={1080} height={1920}>
      <line x1={-20} y1={420} x2={1100} y2={760} stroke="#ececec" strokeWidth={10} />
      <rect x={0} y={880} width={1080} height={70} fill="#c9c9c2" stroke={INK} strokeWidth={5} />
      <rect x={0} y={870} width={1080} height={16} rx={8} fill="#e0e0d8" />
      <rect x={0} y={950} width={1080} height={970} fill="#3f7a4a" />
      <Kid9 x={540} y={1070} s={0.75} emo="laugh" look={0} blink={blinkAt(t)} />
    </svg>
  </AbsoluteFill>
);
