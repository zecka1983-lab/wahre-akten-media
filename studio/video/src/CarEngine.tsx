// 3D-последовательность «машина → рентген → двигатель внутри → обратно, машина уезжает» (~14 с).
import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import '@fontsource/montserrat/900.css';
import {Engine, Rig} from './Engine4';

const FONT = 'Montserrat, sans-serif';
const ease = (x: number) => x * x * (3 - 2 * x);

// ключевые кадры камеры: [секунда, позиция, точка взгляда]
const KEYS: [number, [number, number, number], [number, number, number]][] = [
  [0, [9.5, 3.2, 11.5], [0, 0.8, 0]],
  [3, [-5.8, 3.4, 8.0], [-1.0, 0.7, 0]],
  [6, [-3.3, 2.9, 3.6], [-1.35, 0.7, 0]],
  [8.5, [-2.2, 2.1, 1.75], [-1.35, 0.68, 0]],
  [10.5, [-3.3, 2.9, 3.6], [-1.35, 0.7, 0]],
  [14, [6.5, 3.2, 12.5], [-2.5, 0.8, 0]],
];
const camAt = (t: number) => {
  let k = 0;
  while (k < KEYS.length - 2 && t > KEYS[k + 1][0]) k++;
  const [t0, p0, l0] = KEYS[k], [t1, p1, l1] = KEYS[k + 1];
  const u = ease(Math.min(1, Math.max(0, (t - t0) / (t1 - t0))));
  const mix = (a: number[], b: number[]) => a.map((v, i) => v + (b[i] - v) * u) as [number, number, number];
  return {pos: mix(p0, p1), look: mix(l0, l1)};
};

// кузов: боковой профиль, выдавленный в ширину
const Car: React.FC<{xray: number; wheelRot: number}> = ({xray, wheelRot}) => {
  const body = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-2.1, 0.32); s.lineTo(2.05, 0.32); s.quadraticCurveTo(2.25, 0.35, 2.2, 0.72);
    s.lineTo(1.25, 0.95); s.lineTo(0.5, 1.42); s.quadraticCurveTo(-0.3, 1.55, -1.2, 1.48);
    s.lineTo(-1.95, 1.08); s.quadraticCurveTo(-2.2, 0.95, -2.15, 0.6); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {depth: 1.6, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 4});
    g.translate(0, 0, -0.8);
    return g;
  }, []);
  const glass = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(1.05, 1.0); s.lineTo(0.5, 1.38); s.quadraticCurveTo(-0.3, 1.5, -1.15, 1.43); s.lineTo(-1.8, 1.08); s.lineTo(-1.8, 1.0); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {depth: 1.66, bevelEnabled: false});
    g.translate(0, 0, -0.83);
    return g;
  }, []);
  const edges = useMemo(() => new THREE.EdgesGeometry(body, 25), [body]);
  const solid = 1 - xray;
  return (
    <group>
      <mesh geometry={body}>
        <meshStandardMaterial color="#2f6fd6" metalness={0.75} roughness={0.25} envMapIntensity={1.3} transparent opacity={0.1 + 0.9 * solid} depthWrite={solid > 0.5} />
      </mesh>
      <lineSegments geometry={edges}><lineBasicMaterial color="#6fe3ff" transparent opacity={xray} /></lineSegments>
      <mesh geometry={glass}><meshStandardMaterial color="#0b1220" metalness={0.9} roughness={0.1} transparent opacity={0.08 + 0.85 * solid} /></mesh>
      {/* фары и фонари */}
      {[-0.55, 0.55].map((z) => (
        <group key={z}>
          <mesh position={[2.22, 0.62, z]}><boxGeometry args={[0.06, 0.12, 0.32]} /><meshStandardMaterial color="#fff6d0" emissive="#fff2b0" emissiveIntensity={2} /></mesh>
          <mesh position={[-2.2, 0.82, z]}><boxGeometry args={[0.06, 0.12, 0.3]} /><meshStandardMaterial color="#ff3030" emissive="#ff1a1a" emissiveIntensity={1.6} /></mesh>
        </group>
      ))}
      {/* колёса */}
      {[[-1.35, 0.86], [-1.35, -0.86], [1.35, 0.86], [1.35, -0.86]].map(([x, z]) => (
        <group key={`${x}${z}`} position={[x, 0.36, z]} rotation={[Math.PI / 2, wheelRot, 0]}>
          <mesh><cylinderGeometry args={[0.36, 0.36, 0.26, 32]} /><meshStandardMaterial color="#141414" roughness={0.9} /></mesh>
          <mesh position={[0, z > 0 ? 0.135 : -0.135, 0]}><cylinderGeometry args={[0.22, 0.22, 0.02, 24]} /><meshStandardMaterial color="#c9ced8" metalness={0.9} roughness={0.25} /></mesh>
        </group>
      ))}
    </group>
  );
};

// дорога, разметка и деревья бегут назад — ощущение скорости
const World: React.FC<{dist: number}> = ({dist}) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}><planeGeometry args={[200, 6]} /><meshStandardMaterial color="#3a3f48" roughness={0.9} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}><planeGeometry args={[200, 60]} /><meshStandardMaterial color="#4f7d3d" roughness={1} /></mesh>
    {Array.from({length: 40}).map((_, i) => {
      const x = ((i * 3 - dist) % 120 + 120) % 120 - 60;
      return <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, 1.8]}><planeGeometry args={[1.4, 0.12]} /><meshStandardMaterial color="#e8e8e8" /></mesh>;
    })}
    {Array.from({length: 24}).map((_, i) => {
      const x = ((i * 5.5 - dist) % 132 + 132) % 132 - 66;
      const z = i % 2 ? -5 - (i % 3) : 6 + (i % 4);
      return (
        <group key={`t${i}`} position={[x, 0, z]}>
          <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.12, 0.15, 1, 8]} /><meshStandardMaterial color="#5a3d26" /></mesh>
          <mesh position={[0, 1.6, 0]}><coneGeometry args={[0.8, 2.2, 10]} /><meshStandardMaterial color="#2f6b3c" roughness={0.9} /></mesh>
        </group>
      );
    })}
  </group>
);

const PHASES: [number, number, string, string][] = [
  [0, 3, 'Du gibst Gas…', 'Ты жмёшь на газ…'],
  [3, 6, 'Was passiert unter der Haube?', 'Что происходит под капотом?'],
  [6, 10.5, 'Ansaugen · Verdichten · Zünden · Ausstoßen', 'Впуск · Сжатие · Вспышка · Выпуск'],
  [10.5, 14.5, 'Tausende Male pro Minute.', 'Тысячи раз в минуту.'],
];

export const CarEngine: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;
  const cam = camAt(t);
  const xray = interpolate(t, [3.2, 5, 10.5, 12], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cut = t > 6.8 && t < 10.3;
  const drive = interpolate(t, [12, 14.5], [0, 9], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const dist = t * 14;
  const phase = PHASES.find(([a, b]) => t >= a && t < b);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#7fb6e8, #cfe4f5 55%, #e9eef2)'}}>
      <ThreeCanvas width={width} height={height} gl={{alpha: true, antialias: true}}>
        <Rig pos={cam.pos} look={cam.look} fov={42} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[6, 10, 6]} intensity={2.6} />
        <directionalLight position={[-6, 4, -5]} intensity={1.0} color="#9fc3ff" />
        <group rotation={[0, Math.PI, 0]}>
        <World dist={dist} />
        <group position={[drive, 0, 0]}>
          <Car xray={xray} wheelRot={-t * 18} />
          {/* двигатель под капотом */}
          <group position={[1.35, 0.56, 0]} scale={0.14}>
            <Engine cut={cut} oil={0} angle={t * 720} t={t} />
          </group>
          {xray > 0.3 && <pointLight position={[1.3, 1.1, 0]} intensity={4 * xray} color="#6fe3ff" distance={3} />}
        </group>
        </group>
      </ThreeCanvas>
      {phase && (
        <div style={{position: 'absolute', top: 220, left: 60, right: 60, textAlign: 'center', fontFamily: FONT}}>
          <div style={{fontWeight: 900, fontSize: 70, lineHeight: 1.1, color: 'white', WebkitTextStroke: '8px #1d1d2b', paintOrder: 'stroke fill'}}>{phase[2]}</div>
          <div style={{fontWeight: 700, fontSize: 34, color: '#1d1d2b', marginTop: 14, background: 'rgba(255,255,255,0.75)', display: 'inline-block', padding: '6px 16px', borderRadius: 10}}>{phase[3]}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
