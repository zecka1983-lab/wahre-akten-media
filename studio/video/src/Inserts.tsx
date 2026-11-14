// Вставки-крупняки под ключевые слова (1–2 с): печать, мины, игла, решётка, газ, мигалка, ткань.
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';

const INK = '#1d1d2b';
const FONT = 'Montserrat, sans-serif';
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Stamp: React.FC<{l: number}> = ({l}) => {
  const hit = interpolate(l, [0.15, 0.3], [2.6, 1], cl);
  const o = interpolate(l, [0.15, 0.2], [0, 1], cl);
  const shake = l > 0.3 && l < 0.5 ? Math.sin(l * 120) * 10 : 0;
  return (
    <AbsoluteFill style={{background: '#cdb88a', transform: `translateX(${shake}px)`}}>
      <svg width={1080} height={1920}>
        <rect x={140} y={420} width={800} height={1000} rx={20} fill="#efe3c4" stroke={INK} strokeWidth={10} transform="rotate(-3 540 920)" />
        {[0, 1, 2, 3, 4, 5, 6].map((k) => <line key={k} x1={220} x2={820 - (k % 3) * 120} y1={560 + k * 70} y2={560 + k * 70} stroke="#b9a77d" strokeWidth={14} strokeLinecap="round" />)}
        <text x={230} y={500} fontFamily="monospace" fontWeight={900} fontSize={46} fill="#6b5a3a">MfS · GEHEIM</text>
      </svg>
      <div style={{position: 'absolute', top: 1060, width: '100%', textAlign: 'center', opacity: o, transform: `scale(${hit}) rotate(-12deg)`}}>
        <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 150, color: '#d32020', border: '16px solid #d32020', padding: '0 40px', borderRadius: 20}}>STASI</span>
      </div>
    </AbsoluteFill>
  );
};

const Mines: React.FC<{l: number}> = ({l}) => {
  const sway = Math.sin(l * 9) * 4;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#1c1f2a, #3a3328)'}}>
      <svg width={1080} height={1920}>
        <g transform={`translate(540 860) rotate(${sway}) scale(${interpolate(l, [0, 0.25], [1.3, 1], cl)})`}>
          <rect x={-18} y={120} width={36} height={700} fill="#7a7a7a" stroke={INK} strokeWidth={8} />
          <rect x={-330} y={-230} width={660} height={400} rx={18} fill="#f4f4f4" stroke={INK} strokeWidth={14} />
          <path d="M0 -190 L120 10 H-120 Z" fill="#ffd84d" stroke={INK} strokeWidth={10} />
          <text x={0} y={-10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120} fill={INK}>!</text>
          <text x={0} y={120} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill="#c62828">MINEN</text>
        </g>
        <rect x={0} y={1500} width={1080} height={420} fill="#4a3f30" />
      </svg>
    </AbsoluteFill>
  );
};

const Needle: React.FC<{l: number}> = ({l}) => {
  const y = Math.sin(l * 34) * 60;
  const feed = (l * 420) % 160;
  return (
    <AbsoluteFill style={{background: '#16131d'}}>
      <svg width={1080} height={1920}>
        <path d="M540 300 L180 1500 L900 1500 Z" fill="rgba(255,226,138,0.12)" />
        <rect x={260} y={200} width={560} height={520} rx={40} fill="#2b2f3a" stroke={INK} strokeWidth={12} />
        <rect x={500} y={700} width={80} height={140} fill="#3a3f4c" stroke={INK} strokeWidth={10} />
        <line x1={540} y1={840} x2={540} y2={1060 + y} stroke="#d9dde6" strokeWidth={16} strokeLinecap="round" />
        <circle cx={540} cy={1060 + y} r={6} fill="#fff" />
        {Array.from({length: 9}).map((_, i) => (
          <rect key={i} x={-160 + i * 160 + feed} y={1100} width={160} height={240} fill={['#d94848', '#f2c14e', '#3d7dd8', '#e8e2d2'][i % 4]} stroke={INK} strokeWidth={6} />
        ))}
        {Array.from({length: 20}).map((_, i) => <line key={i} x1={-40 + i * 60 + (feed % 60)} x2={-10 + i * 60 + (feed % 60)} y1={1220} y2={1220} stroke={INK} strokeWidth={6} />)}
      </svg>
    </AbsoluteFill>
  );
};

const Bars: React.FC<{l: number}> = ({l}) => {
  const close = interpolate(l, [0.05, 0.35], [-1100, 0], cl);
  return (
    <AbsoluteFill style={{background: '#20232c'}}>
      <svg width={1080} height={1920}>
        <rect x={260} y={600} width={560} height={700} fill="#2e3340" />
        <circle cx={540} cy={820} r={90} fill="#ffd8a8" stroke={INK} strokeWidth={8} />
        <circle cx={505} cy={810} r={10} fill={INK} /><circle cx={575} cy={810} r={10} fill={INK} />
        <ellipse cx={540} cy={860} rx={14} ry={18} fill={INK} />
        <rect x={420} y={910} width={240} height={300} rx={50} fill="#5d6670" stroke={INK} strokeWidth={8} />
        <g transform={`translate(${close} 0)`}>
          {Array.from({length: 9}).map((_, i) => <rect key={i} x={120 + i * 105} y={300} width={34} height={1300} fill="#8a8f99" stroke={INK} strokeWidth={6} />)}
          <rect x={100} y={300} width={900} height={40} fill="#8a8f99" stroke={INK} strokeWidth={6} />
          <rect x={100} y={1560} width={900} height={40} fill="#8a8f99" stroke={INK} strokeWidth={6} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const Gauge: React.FC<{l: number}> = ({l}) => {
  const a = interpolate(l, [0, 1.2], [-20, -80], cl) + Math.sin(l * 30) * 2;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #1d2a44, #070a14)'}}>
      <svg width={1080} height={1920}>
        <g transform="translate(540 900)">
          <circle r={360} fill="#e8e2d2" stroke={INK} strokeWidth={18} />
          <path d="M-300 0 A300 300 0 0 1 -212 -212" stroke="#e02424" strokeWidth={40} fill="none" />
          <path d="M-212 -212 A300 300 0 0 1 300 0" stroke="#4caf6a" strokeWidth={40} fill="none" />
          <text x={-230} y={80} fontFamily={FONT} fontWeight={900} fontSize={60} fill="#e02424">LEER</text>
          <text x={0} y={200} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={80} fill={INK}>GAS</text>
          <g transform={`rotate(${a - 90})`}>
            <rect x={-12} y={-290} width={24} height={300} rx={12} fill={INK} />
          </g>
          <circle r={40} fill={INK} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const Siren: React.FC<{l: number}> = ({l}) => {
  const on = Math.sin(l * 5) > -0.2; // плавная пульсация вместо резкого мигания
  return (
    <AbsoluteFill style={{background: on ? '#0b1a4a' : '#05070f'}}>
      <svg width={1080} height={1920}>
        <ellipse cx={540} cy={900} rx={on ? 520 : 200} ry={on ? 520 : 200} fill="rgba(61,125,255,0.25)" />
        <rect x={340} y={760} width={400} height={240} rx={60} fill={on ? '#3d7dff' : '#1a2a5a'} stroke={INK} strokeWidth={14} />
        <rect x={260} y={1000} width={560} height={90} rx={20} fill="#f2f2f2" stroke={INK} strokeWidth={12} />
        <text x={540} y={1065} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill="#2e7d4f">POLIZEI</text>
      </svg>
    </AbsoluteFill>
  );
};

const Fabric: React.FC<{l: number}> = ({l}) => (
  <AbsoluteFill style={{background: '#2a2230'}}>
    <svg width={1080} height={1920}>
      {Array.from({length: 6}).map((_, i) => {
        const drop = interpolate(l, [i * 0.12, i * 0.12 + 0.25], [-600, 0], cl);
        return (
          <g key={i} transform={`translate(0 ${drop})`}>
            <rect x={200 + (i % 2) * 120} y={1400 - i * 115} width={560} height={105} rx={52} fill={['#d94848', '#f2c14e', '#3d7dd8', '#e8e2d2', '#4caf6a', '#d94848', '#f2c14e'][i]} stroke={INK} strokeWidth={10} />
            <circle cx={260 + (i % 2) * 120} cy={1452 - i * 115} r={36} fill="rgba(0,0,0,0.2)" />
          </g>
        );
      })}
    </svg>
  </AbsoluteFill>
);

export const Insert: React.FC<{name: string; l: number}> = ({name, l}) => {
  if (name === 'stamp') return <Stamp l={l} />;
  if (name === 'mines') return <Mines l={l} />;
  if (name === 'needle') return <Needle l={l} />;
  if (name === 'bars') return <Bars l={l} />;
  if (name === 'gauge') return <Gauge l={l} />;
  if (name === 'siren') return <Siren l={l} />;
  if (name === 'fabric') return <Fabric l={l} />;
  return null;
};
