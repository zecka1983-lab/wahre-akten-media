// Оформление канала «WAHRE AKTEN»: аватарка и обложки роликов.
import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import '@fontsource/montserrat/900.css';
import {Balloon} from './Story';

const INK = '#1d1d2b';
const FONT = 'Montserrat, sans-serif';
export const BRAND = {navy: '#0f1430', yellow: '#ffd84d', red: '#e02424', paper: '#e9c983'};

// фирменная папка-«дело» с красной печатью
const Folder: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`}>
    <path d="M-300 -170 h200 l40 -50 h360 v0 Q300 -220 300 -200 V-170 Z" fill="#d4ae64" stroke={INK} strokeWidth={16} strokeLinejoin="round" />
    <rect x={-300} y={-180} width={600} height={400} rx={26} fill={BRAND.paper} stroke={INK} strokeWidth={16} />
    <line x1={-240} y1={-100} x2={60} y2={-100} stroke="#b8924e" strokeWidth={14} strokeLinecap="round" />
    <line x1={-240} y1={-50} x2={-20} y2={-50} stroke="#b8924e" strokeWidth={14} strokeLinecap="round" />
    <g transform="translate(30 90) rotate(-12)">
      <rect x={-210} y={-75} width={420} height={150} rx={16} fill="none" stroke={BRAND.red} strokeWidth={18} />
      <text x={0} y={42} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={118} fill={BRAND.red} letterSpacing={6}>WAHR</text>
    </g>
  </g>
);

export const Avatar: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #26306a, ${BRAND.navy} 70%)`}}>
    <svg width={1080} height={1080}>
      {Array.from({length: 40}).map((_, i) => (
        <circle key={i} cx={random(`a${i}`) * 1080} cy={random(`b${i}`) * 1080} r={2 + random(`c${i}`) * 3} fill="white" opacity={0.5} />
      ))}
      <circle cx={540} cy={540} r={470} fill="none" stroke={BRAND.yellow} strokeWidth={22} />
      <g transform="translate(540 560)"><Folder s={1.15} /></g>
    </svg>
  </AbsoluteFill>
);

// обложка ролика: сцена + крупный заголовок + плашка «WAHRE GESCHICHTE»
export const CoverBallon: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(#0b1030, #2a2350)'}}>
    <svg width={1080} height={1920}>
      {Array.from({length: 90}).map((_, i) => (
        <circle key={i} cx={random(`x${i}`) * 1080} cy={random(`y${i}`) * 1300} r={1.5 + random(`r${i}`) * 3} fill="white" opacity={0.4 + random(`o${i}`) * 0.6} />
      ))}
      <circle cx={860} cy={420} r={90} fill="#f4efd8" />
      {/* прожекторы */}
      <path d="M170 1290 L-80 700 L120 700 Z" fill="rgba(255,250,200,0.2)" />
      <path d="M910 1290 L760 700 L1000 700 Z" fill="rgba(255,250,200,0.2)" />
      <Balloon x={540} y={880} s={1.25} flame={0.9} />
      <rect x={0} y={1290} width={1080} height={630} fill="#151a24" />
      {Array.from({length: 23}).map((_, i) => <rect key={i} x={i * 48} y={1150} width={8} height={160} fill="#5a5f6a" />)}
      {Array.from({length: 6}).map((_, i) => <line key={i} x1={0} x2={1080} y1={1150 + i * 28} y2={1150 + i * 28} stroke="#5a5f6a" strokeWidth={3} />)}
    </svg>
    <div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center'}}>
      <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 46, color: INK, background: BRAND.yellow, padding: '10px 28px', borderRadius: 14, border: `6px solid ${INK}`}}>WAHRE GESCHICHTE · 1979</span>
    </div>
    <div style={{position: 'absolute', top: 1380, left: 40, right: 40, textAlign: 'center', fontFamily: FONT, fontWeight: 900, lineHeight: 1.05}}>
      <div style={{fontSize: 150, color: 'white', WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill'}}>FLUCHT IM</div>
      <div style={{fontSize: 175, color: BRAND.yellow, WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill'}}>BALLON</div>
      <div style={{fontSize: 44, color: 'white', marginTop: 20}}>8 Menschen · 28 Minuten · DDR → BRD</div>
    </div>
  </AbsoluteFill>
);

// обложка страницы Facebook (1640×624): всё важное в центральной зоне, края обрезаются на телефоне
export const FbCover: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(#0b1030, #2a2350)'}}>
    <svg width={1640} height={624}>
      {Array.from({length: 110}).map((_, i) => (
        <circle key={i} cx={random(`fx${i}`) * 1640} cy={random(`fy${i}`) * 470} r={1.2 + random(`fr${i}`) * 2.5} fill="white" opacity={0.35 + random(`fo${i}`) * 0.6} />
      ))}
      <circle cx={1575} cy={95} r={40} fill="#f4efd8" />
      <path d="M140 540 L-40 230 L120 230 Z" fill="rgba(255,250,200,0.16)" />
      <path d="M1500 540 L1380 230 L1580 230 Z" fill="rgba(255,250,200,0.16)" />
      <rect x={0} y={530} width={1640} height={94} fill="#151a24" />
      {Array.from({length: 35}).map((_, i) => <rect key={i} x={i * 48} y={460} width={7} height={80} fill="#4a4f5a" />)}
      {[0, 1, 2].map((i) => <line key={i} x1={0} x2={1640} y1={465 + i * 28} y2={465 + i * 28} stroke="#4a4f5a" strokeWidth={3} />)}
      <g transform="translate(1470 330) scale(0.5)"><Balloon x={0} y={0} s={1} flame={0.9} /></g>
      <g transform="translate(450 300) scale(0.32)"><Folder /></g>
    </svg>
    <div style={{position: 'absolute', left: 580, top: 190, fontFamily: FONT, fontWeight: 900, color: 'white'}}>
      <div style={{fontSize: 92, lineHeight: 1, WebkitTextStroke: `8px ${INK}`, paintOrder: 'stroke fill'}}>WAHRE <span style={{color: BRAND.yellow}}>AKTEN</span></div>
      <div style={{fontSize: 30, marginTop: 16, color: '#e8e2d2'}}>Unglaubliche Geschichten aus Deutschland.</div>
      <div style={{fontSize: 30, color: BRAND.yellow}}>Alle wirklich passiert.</div>
    </div>
  </AbsoluteFill>
);

// баннер YouTube 2560×1440: текст и логотип только в безопасной зоне 1546×423 по центру
export const YtBanner: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(#070b22, #1b1840 55%, #2a2350)'}}>
    <svg width={2560} height={1440}>
      {Array.from({length: 260}).map((_, i) => (
        <circle key={i} cx={random(`yx${i}`) * 2560} cy={random(`yy${i}`) * 1100} r={1.5 + random(`yr${i}`) * 3} fill="white" opacity={0.3 + random(`yo${i}`) * 0.6} />
      ))}
      <circle cx={2420} cy={230} r={80} fill="#f4efd8" />
      {/* граница по низу: вышки, прожекторы, забор */}
      {[260, 2300].map((x, k) => (
        <g key={k}>
          <path d={`M${x} 980 L${x + (k ? -420 : 420)} 560 L${x + (k ? -250 : 250)} 560 Z`} fill="rgba(255,250,200,0.13)" />
          <rect x={x - 30} y={980} width={60} height={300} fill="#8a8a8a" stroke={INK} strokeWidth={8} />
          <rect x={x - 75} y={890} width={150} height={100} rx={10} fill="#a5a5a5" stroke={INK} strokeWidth={8} />
          <rect x={x - 55} y={912} width={110} height={44} fill="#ffe28a" opacity={0.85} />
          <rect x={x - 90} y={870} width={180} height={28} fill="#6a6a6a" stroke={INK} strokeWidth={8} />
        </g>
      ))}
      <rect x={0} y={1240} width={2560} height={200} fill="#151a24" />
      {Array.from({length: 54}).map((_, i) => <rect key={i} x={i * 48} y={1120} width={8} height={130} fill="#4a4f5a" />)}
      {[0, 1, 2, 3].map((i) => <line key={i} x1={0} x2={2560} y1={1125 + i * 32} y2={1125 + i * 32} stroke="#4a4f5a" strokeWidth={4} />)}
      <g transform="translate(2230 560) scale(0.5)"><Balloon x={0} y={0} s={1} flame={0.9} /></g>
      {/* безопасная зона: папка + название */}
      <g transform="translate(700 720) scale(0.4)"><Folder /></g>
    </svg>
    <div style={{position: 'absolute', left: 880, top: 585, fontFamily: FONT, fontWeight: 900, color: 'white'}}>
      <div style={{fontSize: 128, lineHeight: 1, WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill'}}>WAHRE <span style={{color: BRAND.yellow}}>AKTEN</span></div>
      <div style={{fontSize: 42, marginTop: 18, color: '#e8e2d2'}}>Unglaubliche Geschichten aus Deutschland.</div>
      <div style={{fontSize: 42, color: BRAND.yellow}}>Alle wirklich passiert.</div>
    </div>
  </AbsoluteFill>
);
