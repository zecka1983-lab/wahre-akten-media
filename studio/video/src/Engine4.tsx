// 3D v2: рядный 4-цилиндровый двигатель целиком (блок, головка, крышка клапанов, ремень ГРМ, маховик,
// фильтр, поддон, впуск/выпуск) + режим разреза (передняя половина срезана) + маршрут масла стрелками.
import React, {useEffect, useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import '@fontsource/montserrat/900.css';

const FONT = 'Montserrat, sans-serif';
const R = 0.32, L = 1.0;                    // кривошип и шатун
const XS = [-1.5, -0.5, 0.5, 1.5];          // оси цилиндров вдоль двигателя
const PHASE = [0, 180, 180, 0];             // рядная четвёрка: 1 и 4 вместе, 2 и 3 напротив
const CUT = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0); // срезает всё, что ближе к камере (z>0)

type Props = {shot: string; angle: number};

export const Rig: React.FC<{pos: [number, number, number]; look: [number, number, number]; fov: number}> = ({pos, look, fov}) => {
  const {camera, scene, gl} = useThree();
  gl.localClippingEnabled = true;
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.0;
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  }, [gl, scene]);
  camera.position.set(...pos);
  (camera as THREE.PerspectiveCamera).fov = fov;
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  camera.lookAt(...look);
  return null;
};

// материал корпуса: в режиме разреза срезается плоскостью
const Body: React.FC<{c: string; cut: boolean; metal?: number; rough?: number; op?: number}> = ({c, cut, metal = 0.55, rough = 0.45, op = 1}) => (
  <meshStandardMaterial color={c} metalness={metal} roughness={rough} clippingPlanes={cut ? [CUT] : []} side={THREE.DoubleSide} transparent={op < 1} opacity={op} />
);
const Shiny: React.FC<{c: string}> = ({c}) => <meshStandardMaterial color={c} metalness={0.95} roughness={0.22} envMapIntensity={1.3} />;

// маршрут масла: светящаяся линия + бегущие стрелки
const OilRoute: React.FC<{pts: [number, number, number][]; t: number; show: number}> = ({pts, t, show}) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.1), [pts]);
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 200, 0.035, 8, false), [curve]);
  if (show <= 0) return null;
  const n = 26;
  return (
    <group>
      <mesh geometry={tube}><meshStandardMaterial color="#ff9500" emissive="#ff7a00" emissiveIntensity={1.4} transparent opacity={0.9 * show} /></mesh>
      {Array.from({length: n}).map((_, i) => {
        const u = ((t * 0.08 + i / n) % 1);
        const p = curve.getPointAt(u);
        const tan = curve.getTangentAt(u);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan);
        return (
          <mesh key={i} position={p} quaternion={q}>
            <coneGeometry args={[0.09, 0.22, 12]} />
            <meshStandardMaterial color="#ffd36b" emissive="#ffb300" emissiveIntensity={2.5} />
          </mesh>
        );
      })}
    </group>
  );
};

export const Engine: React.FC<{cut: boolean; oil: number; angle: number; t: number}> = ({cut, oil, angle, t}) => {
  const block = '#7f8896';
  const parts = oil > 0.5 ? 0.45 : 1;
  return (
    <group>
      {/* --- блок цилиндров --- */}
      <mesh position={[0, 0.95, 0]}><boxGeometry args={[4.2, 1.9, 1.5]} /><Body c={block} cut={cut} op={oil > 0.5 ? 0.35 : 1} /></mesh>
      {/* рёбра жёсткости */}
      {[-1.9, -1.0, 0, 1.0, 1.9].map((x) => (
        <mesh key={x} position={[x, 0.75, 0.78]}><boxGeometry args={[0.12, 1.3, 0.08]} /><Body c="#6f7886" cut={cut} /></mesh>
      ))}
      {/* гильзы цилиндров (видны в разрезе) */}
      {XS.map((x) => (
        <mesh key={x} position={[x, 1.25, 0]}><cylinderGeometry args={[0.42, 0.42, 1.35, 40, 1, true]} /><Body c="#a9b1bd" cut={cut} metal={0.8} rough={0.25} /></mesh>
      ))}
      {/* головка блока */}
      <mesh position={[0, 2.15, 0]}><boxGeometry args={[4.3, 0.5, 1.4]} /><Body c="#8d96a4" cut={cut} op={oil > 0.5 ? 0.35 : 1} /></mesh>
      {/* крышка клапанов */}
      <mesh position={[0, 2.62, 0]}><boxGeometry args={[4.0, 0.45, 1.15]} /><Body c="#b3262d" cut={cut} metal={0.4} rough={0.35} op={oil > 0.5 ? 0.35 : 1} /></mesh>
      {/* поддон */}
      <mesh position={[0, -0.55, 0]}><boxGeometry args={[4.0, 1.1, 1.45]} /><Body c="#5a626f" cut={cut} op={oil > 0.5 ? 0.35 : 1} /></mesh>
      {/* масло в поддоне */}
      <mesh position={[0, -0.85, 0]}><boxGeometry args={[3.9, 0.45, 1.38]} /><meshStandardMaterial color="#f08a00" emissive="#a85600" emissiveIntensity={oil > 0.5 ? 1.4 : 0.4} clippingPlanes={cut ? [CUT] : []} /></mesh>

      {/* --- впуск (сзади) и выпуск (сзади-сбоку) --- */}
      {XS.map((x) => (
        <group key={`m${x}`}>
          <mesh position={[x, 2.15, -0.95]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.13, 0.13, 0.6, 20]} /><Body c="#2b2f36" cut={false} metal={0.3} rough={0.6} /></mesh>
          <mesh position={[x, 1.75, -1.0]} rotation={[0.6, 0, 0]}><cylinderGeometry args={[0.1, 0.1, 0.7, 16]} /><Body c="#9c5a2c" cut={false} metal={0.8} rough={0.45} /></mesh>
        </group>
      ))}
      <mesh position={[0, 2.15, -1.3]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.25, 0.25, 4.0, 24]} /><Body c="#2b2f36" cut={false} metal={0.3} rough={0.6} /></mesh>

      {/* --- ремень ГРМ и шкивы спереди (x = -2.3) --- */}
      <mesh position={[-2.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.38, 0.38, 0.18, 40]} /><Shiny c="#4a4f58" /></mesh>
      {[-0.3, 0.3].map((z) => (
        <mesh key={z} position={[-2.25, 2.45, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.32, 0.32, 0.16, 40]} /><Shiny c="#4a4f58" /></mesh>
      ))}
      <mesh position={[-2.27, 1.22, 0]}><boxGeometry args={[0.06, 2.6, 0.95]} /><meshStandardMaterial color="#141414" roughness={0.8} transparent opacity={0.9} /></mesh>
      {/* маховик сзади */}
      <mesh position={[2.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.85, 0.85, 0.12, 64]} /><Shiny c="#8a929e" /></mesh>
      {/* масляный фильтр (оранжевый, сбоку) */}
      <mesh position={[0.9, 0.2, 0.95]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.22, 0.22, 0.45, 32]} /><meshStandardMaterial color="#ff6a13" metalness={0.3} roughness={0.4} /></mesh>

      {/* --- внутренности: поршни, шатуны, коленвал, распредвалы --- */}
      <group>
        {XS.map((x, k) => {
          const th = ((angle + PHASE[k]) * Math.PI) / 180;
          const px = R * Math.sin(th), py = R * Math.cos(th);
          const pistonY = py + Math.sqrt(L * L - px * px);
          const rodLen = Math.hypot(px, pistonY - py);
          const ang = Math.atan2(px, pistonY - py);
          const fire = ((((angle + PHASE[k] + k * 180) % 720) + 720) % 720) < 60;
          return (
            <group key={x} position={[x, 0, 0]}>
              <group rotation={[ang * 0, 0, 0]}>
                <mesh position={[0, pistonY + 0.55, 0]}><cylinderGeometry args={[0.4, 0.4, 0.38, 40]} /><meshStandardMaterial color="#c9ced8" metalness={0.9} roughness={0.25} transparent opacity={parts} /></mesh>
              </group>
              <mesh position={[0, (py + pistonY + 0.4) / 2, px / 2]} rotation={[ang, 0, 0]}><boxGeometry args={[0.12, rodLen + 0.35, 0.12]} /><meshStandardMaterial color="#98a1af" metalness={0.85} roughness={0.3} transparent opacity={parts} /></mesh>
              {fire && <mesh position={[0, 1.85, 0]}><sphereGeometry args={[0.3, 20, 20]} /><meshStandardMaterial color="#ffb347" emissive="#ff6a00" emissiveIntensity={3} transparent opacity={0.8} /></mesh>}
            </group>
          );
        })}
        {/* коленвал вдоль двигателя */}
        <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.1, 0.1, 4.4, 20]} /><Shiny c="#aeb6c4" /></mesh>
        {XS.map((x, k) => {
          const th = ((angle + PHASE[k]) * Math.PI) / 180;
          return (
            <group key={`c${x}`} position={[x, 0, 0]} rotation={[th, 0, 0]}>
              <mesh position={[0, R / 2, 0]}><boxGeometry args={[0.1, R + 0.25, 0.3]} /><Shiny c="#8c95a4" /></mesh>
              <mesh position={[0, -0.18, 0]}><boxGeometry args={[0.1, 0.32, 0.55]} /><Shiny c="#7d8696" /></mesh>
            </group>
          );
        })}
        {/* два распредвала в головке */}
        {[-0.3, 0.3].map((z) => (
          <group key={z} position={[0, 2.45, z]} rotation={[(angle * Math.PI) / 360, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.07, 0.07, 4.2, 16]} /><Shiny c="#b7bfcc" /></mesh>
          </group>
        ))}
      </group>

      {/* --- маршрут масла: поддон → насос → фильтр → главная магистраль → коленвал → вверх → распредвалы --- */}
      <OilRoute t={t} show={oil} pts={[
        [-1.2, -0.85, 0.2], [-1.9, -0.6, 0.45], [-1.9, 0.2, 0.75], [-0.3, 0.2, 0.95], [0.9, 0.2, 0.95],
        [1.4, 0.45, 0.55], [1.9, 0.4, 0.2], [1.9, 0.05, 0.05], [1.0, 0.05, 0.05], [0, 0.05, 0.05], [-1.0, 0.05, 0.05],
        [-1.95, 0.4, -0.3], [-1.95, 1.6, -0.5], [-1.9, 2.45, -0.3], [-0.5, 2.45, -0.3], [1.0, 2.45, -0.3], [1.9, 2.45, 0.3],
        [1.0, 2.45, 0.3], [0, 2.45, 0.3]]} />
    </group>
  );
};

const CAMS: Record<string, {pos: [number, number, number]; look: [number, number, number]; fov: number}> = {
  outside: {pos: [8.0, 5.2, 10.5], look: [0, 0.7, 0], fov: 42},
  front: {pos: [-10.5, 3.8, 6.0], look: [0, 0.8, 0], fov: 40},
  cut: {pos: [4.2, 2.8, 11.5], look: [0, 0.7, 0], fov: 42},
  cutclose: {pos: [1.6, 1.9, 5.2], look: [0.4, 1.0, 0], fov: 40},
  oil: {pos: [7.0, 4.0, 10.5], look: [0, 0.7, 0], fov: 42},
};

const LABELS: Record<string, {de: string; ru: string; x: number; y: number}[]> = {
  outside: [{de: 'Zylinderkopf', ru: 'головка блока', x: 60, y: 520}, {de: 'Motorblock', ru: 'блок цилиндров', x: 60, y: 900}, {de: 'Ölwanne', ru: 'поддон', x: 600, y: 1240}],
  front: [{de: 'Zahnriemen', ru: 'ремень ГРМ', x: 60, y: 560}, {de: 'Ölfilter', ru: 'масляный фильтр', x: 640, y: 1160}],
  cut: [{de: '4 Kolben', ru: '4 поршня', x: 60, y: 540}, {de: 'Kurbelwelle', ru: 'коленвал', x: 600, y: 1200}],
  cutclose: [{de: 'Zündung!', ru: 'вспышка', x: 600, y: 500}],
  oil: [{de: 'Ölpumpe', ru: 'насос', x: 50, y: 1180}, {de: 'Ölfilter', ru: 'фильтр', x: 650, y: 1100}, {de: 'Nockenwellen', ru: 'распредвалы', x: 560, y: 470}],
};

export const Engine4Still: React.FC<Props> = ({shot, angle}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const cam = CAMS[shot] ?? CAMS.outside;
  const cut = shot === 'cut' || shot === 'cutclose' || shot === 'oil';
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #4a5872 0%, #232c3d 55%, #0f141f 100%)'}}>
      <ThreeCanvas width={width} height={height} gl={{alpha: true, antialias: true}}>
        <Rig pos={cam.pos} look={cam.look} fov={cam.fov} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 6]} intensity={2.4} />
        <directionalLight position={[-6, 3, -4]} intensity={1.2} color="#8fb6ff" />
        <directionalLight position={[0, -3, 6]} intensity={0.6} color="#ffd9a8" />
        <mesh position={[0, -1.12, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[7, 64]} /><meshStandardMaterial color="#2a3346" metalness={0.3} roughness={0.55} /></mesh>
        <Engine cut={cut} oil={shot === 'oil' ? 1 : 0} angle={angle + frame * 6} t={frame / 30 + angle / 40} />
      </ThreeCanvas>
      {(LABELS[shot] ?? []).map((l) => (
        <div key={l.de} style={{position: 'absolute', left: l.x, top: l.y, fontFamily: FONT, background: 'rgba(15,20,40,0.85)', border: '3px solid #ffd84d', borderRadius: 12, padding: '8px 18px'}}>
          <div style={{fontWeight: 900, fontSize: 44, color: 'white'}}>{l.de}</div>
          <div style={{fontWeight: 700, fontSize: 26, color: '#ffd84d'}}>{l.ru}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
