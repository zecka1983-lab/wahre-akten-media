// 3D: 4-тактный двигатель в разрезе (поршень, шатун, коленвал, клапаны, свеча, масляные каналы).
// Механика настоящая: положение поршня считается из угла коленвала.
import React, {useEffect, useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import '@fontsource/montserrat/900.css';

const FONT = 'Montserrat, sans-serif';
const R = 0.45;   // радиус кривошипа
const L = 1.45;   // длина шатуна

type Props = {shot: string; angle: number};

const metal = (c: string, rough = 0.3) => <meshStandardMaterial color={c} metalness={0.9} roughness={rough} envMapIntensity={1.4} />;

// масляный канал: путь + бегущие светящиеся капли
const OilLine: React.FC<{pts: [number, number, number][]; phase: number; glow: number}> = ({pts, phase, glow}) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), [pts]);
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 64, 0.028, 10, false), [curve]);
  return (
    <group>
      <mesh geometry={tube}>
        <meshStandardMaterial color="#ff9500" emissive="#ff7b00" emissiveIntensity={1.6 + glow} />
      </mesh>
      {Array.from({length: 7}).map((_, i) => {
        const p = curve.getPointAt(((phase + i / 7) % 1 + 1) % 1);
        return (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#fff2b0" emissive="#ffc04d" emissiveIntensity={2.2} />
          </mesh>
        );
      })}
    </group>
  );
};


// окружение (отражения на металле) и наведение камеры
const Rig: React.FC<{pos: [number, number, number]; look: [number, number, number]; fov: number}> = ({pos, look, fov}) => {
  const {camera, scene, gl} = useThree();
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.25;
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

const EngineScene: React.FC<Props & {t: number}> = ({shot, angle, t}) => {
  const th = (angle * Math.PI) / 180;          // угол коленвала
  const cycle = ((angle % 720) + 720) % 720;  // 4 такта = 720°
  const pinX = R * Math.sin(th);
  const pinY = R * Math.cos(th);
  const pistonY = pinY + Math.sqrt(L * L - pinX * pinX);
  const rodLen = Math.hypot(pinX, pistonY - pinY);
  const rodAng = Math.atan2(pinX, pistonY - pinY);
  const fire = cycle >= 360 && cycle < 420;   // рабочий ход: вспышка
  const intake = cycle < 180 ? Math.sin((cycle / 180) * Math.PI) : 0;
  const exhaust = cycle >= 540 ? Math.sin(((cycle - 540) / 180) * Math.PI) : 0;
  const oilFocus = shot === 'oil';
  const dim = oilFocus ? 0.35 : 1;
  const blockTop = 2.75;
  return (
    <>
      <color attach="background" args={['#0b0f1a']} />
      <mesh position={[0, -1.47, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[6, 64]} /><meshStandardMaterial color="#141a2a" metalness={0.6} roughness={0.35} /></mesh>
      <ambientLight intensity={0.35 * dim} />
      <directionalLight position={[4, 6, 5]} intensity={3 * dim} />
      <directionalLight position={[0, -2, 6]} intensity={1.2 * dim} color="#ffd9a8" />
      <directionalLight position={[-5, 2, -3]} intensity={1.1 * dim} color="#7fb2ff" />
      <pointLight position={[0, blockTop - 0.3, 0.6]} intensity={fire ? 30 : 0} color="#ff7a1a" distance={6} />

      <group rotation={[0, shot === 'hero' ? -0.55 : shot === 'oil' ? -0.9 : -0.25, 0]}>
        {/* блок цилиндра в разрезе: полупрозрачные стенки */}
        <mesh position={[0, 1.95, 0]}>
          <cylinderGeometry args={[0.62, 0.62, 1.7, 48, 1, true, 0, Math.PI]} />
          <meshStandardMaterial color="#8e98a8" metalness={0.6} roughness={0.5} side={THREE.DoubleSide} transparent opacity={0.35} />
        </mesh>
        <mesh position={[0, 1.95, -0.66]}>
          <boxGeometry args={[1.6, 1.7, 0.08]} />
          <meshStandardMaterial color="#5c6676" metalness={0.5} roughness={0.6} transparent opacity={0.55} />
        </mesh>
        {/* головка блока */}
        <mesh position={[0, blockTop + 0.18, -0.2]}>
          <boxGeometry args={[1.8, 0.36, 0.9]} />
          <meshStandardMaterial color="#6a7383" metalness={0.6} roughness={0.45} transparent opacity={0.6} />
        </mesh>
        {/* вспышка сгорания */}
        {fire && (
          <mesh position={[0, blockTop - 0.25, 0]}>
            <sphereGeometry args={[0.5, 24, 24]} />
            <meshStandardMaterial color="#ffb347" emissive="#ff6a00" emissiveIntensity={3} transparent opacity={0.75} />
          </mesh>
        )}
        {/* впуск (голубая смесь) и выпуск (дым) */}
        {intake > 0.05 && (
          <mesh position={[-0.32, blockTop - 0.35, 0]} scale={intake}>
            <sphereGeometry args={[0.35, 20, 20]} />
            <meshStandardMaterial color="#7cd4ff" emissive="#2aa8ff" emissiveIntensity={1.2} transparent opacity={0.55} />
          </mesh>
        )}
        {exhaust > 0.05 && (
          <mesh position={[0.32, blockTop - 0.35, 0]} scale={exhaust}>
            <sphereGeometry args={[0.35, 20, 20]} />
            <meshStandardMaterial color="#9aa0aa" transparent opacity={0.6} />
          </mesh>
        )}
        {/* клапаны */}
        {[[-0.3, intake], [0.3, exhaust]].map(([x, open], k) => (
          <group key={k} position={[x as number, blockTop + 0.35 - (open as number) * 0.18, 0]}>
            <mesh><cylinderGeometry args={[0.035, 0.035, 0.8, 12]} />{metal('#cfd5df')}</mesh>
            <mesh position={[0, -0.42, 0]}><cylinderGeometry args={[0.16, 0.06, 0.06, 24]} />{metal('#cfd5df')}</mesh>
          </group>
        ))}
        {/* распредвал с кулачками */}
        <group position={[0, blockTop + 0.95, 0]} rotation={[0, 0, th / 2]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.08, 0.08, 1.4, 16]} />{metal('#b7bfcc')}</mesh>
        </group>
        {/* свеча */}
        <mesh position={[0, blockTop + 0.5, 0]}><cylinderGeometry args={[0.06, 0.06, 0.5, 16]} />{metal('#e8e8e8', 0.2)}</mesh>
        {fire && <pointLight position={[0, blockTop - 0.05, 0]} intensity={8} color="#9fd8ff" distance={2} />}

        {/* поршень с кольцами */}
        <group position={[0, pistonY + 0.25, 0]}>
          <mesh><cylinderGeometry args={[0.56, 0.56, 0.55, 48]} />{metal('#c9ced8', 0.25)}</mesh>
          {[0.18, 0.08, -0.02].map((y) => (
            <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.565, 0.018, 8, 48]} />{metal('#6b7280')}</mesh>
          ))}
        </group>
        {/* шатун */}
        <mesh position={[pinX / 2, (pinY + pistonY) / 2, 0]} rotation={[0, 0, -rodAng]}>
          <boxGeometry args={[0.16, rodLen, 0.12]} />
          {metal('#9aa3b2', 0.35)}
        </mesh>
        {/* коленвал: шейка, щёки, противовес */}
        <group rotation={[0, 0, -th]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.13, 0.13, 1.8, 24]} />{metal('#aeb6c4')}</mesh>
          {[-0.22, 0.22].map((z) => (
            <group key={z} position={[0, 0, z]}>
              <mesh position={[0, R / 2, 0]}><boxGeometry args={[0.36, R + 0.3, 0.12]} />{metal('#8c95a4')}</mesh>
              <mesh position={[0, -0.32, 0]}><cylinderGeometry args={[0.42, 0.42, 0.12, 32, 1, false, Math.PI / 2, Math.PI]} />{metal('#7d8696')}</mesh>
            </group>
          ))}
          <mesh position={[0, R, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.1, 0.1, 0.5, 20]} />{metal('#d9dee6')}</mesh>
        </group>
        {/* картер с маслом */}
        <mesh position={[0, -1.1, 0]}>
          <boxGeometry args={[2.2, 0.7, 1.4]} />
          <meshStandardMaterial color="#4c5463" metalness={0.5} roughness={0.6} transparent opacity={0.35} />
        </mesh>
        <mesh position={[0, -1.3, 0]}>
          <boxGeometry args={[2.1, 0.28, 1.3]} />
          <meshStandardMaterial color="#ff9a00" emissive="#ff7a00" emissiveIntensity={oilFocus ? 1.8 : 0.9} transparent opacity={0.9} />
        </mesh>
        {/* масляные каналы: насос → коленвал → вверх к распредвалу */}
        <OilLine pts={[[0.8, -1.25, -0.4], [1.0, -0.6, -0.5], [0.55, 0, -0.45], [0.12, 0, -0.3]]} phase={t * 0.6} glow={oilFocus ? 1.5 : 0.2} />
        <OilLine pts={[[1.0, -0.6, -0.5], [1.05, 1.0, -0.62], [0.95, 2.6, -0.6], [0.6, blockTop + 0.95, -0.35], [0.1, blockTop + 0.95, -0.2]]} phase={t * 0.6 + 0.3} glow={oilFocus ? 1.5 : 0.2} />
        <OilLine pts={[[-0.1, blockTop + 0.95, -0.2], [-0.6, blockTop + 0.8, -0.4], [-0.95, 1.5, -0.6], [-0.8, -0.9, -0.5]]} phase={t * 0.6 + 0.6} glow={oilFocus ? 1.5 : 0.2} />
      </group>
    </>
  );
};

const CAMERAS: Record<string, {pos: [number, number, number]; look: [number, number, number]; fov: number}> = {
  hero: {pos: [4.6, 2.4, 6.8], look: [0, 0.9, 0], fov: 46},
  fire: {pos: [1.8, 3.6, 3.4], look: [0, 2.4, 0], fov: 40},
  oil: {pos: [-3.6, 1.6, -6.4], look: [0, 0.8, 0], fov: 48},
  crank: {pos: [2.2, 0.4, 3.0], look: [0, 0.0, 0], fov: 40},
  title: {pos: [4.2, 2.0, 7.4], look: [0, 1.0, 0], fov: 46},
};

const LABELS: Record<string, {text: string; sub: string; x: number; y: number}[]> = {
  hero: [{text: 'Kolben', sub: 'поршень', x: 120, y: 760}, {text: 'Pleuel', sub: 'шатун', x: 120, y: 1010}, {text: 'Kurbelwelle', sub: 'коленвал', x: 640, y: 1180}],
  fire: [{text: 'Zündkerze', sub: 'свеча', x: 640, y: 420}, {text: 'Arbeitstakt', sub: 'рабочий ход', x: 90, y: 1200}],
  oil: [{text: 'Ölpumpe', sub: 'масляный насос', x: 650, y: 1240}, {text: 'Ölkanal', sub: 'масляный канал', x: 640, y: 560}, {text: 'Ölwanne', sub: 'поддон', x: 90, y: 1330}],
  crank: [{text: 'Kurbelwelle', sub: 'коленвал', x: 90, y: 600}, {text: 'Gegengewicht', sub: 'противовес', x: 560, y: 1150}],
  title: [],
};

const orbit = (p: [number, number, number], frame: number): [number, number, number] => {
  const a = frame * 0.006;
  return [p[0] * Math.cos(a) - p[2] * Math.sin(a), p[1], p[0] * Math.sin(a) + p[2] * Math.cos(a)];
};

export const EngineStill: React.FC<Props> = ({shot, angle}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const cam = CAMERAS[shot] ?? CAMERAS.hero;
  return (
    <AbsoluteFill style={{background: '#0b0f1a'}}>
      <ThreeCanvas width={width} height={height}>
        <Rig pos={orbit(cam.pos, frame)} look={cam.look} fov={cam.fov} />
        <EngineScene shot={shot} angle={angle + frame * 6} t={frame / 30} />
      </ThreeCanvas>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)'}} />
      {(LABELS[shot] ?? []).map((l) => (
        <div key={l.text} style={{position: 'absolute', left: l.x, top: l.y, fontFamily: FONT}}>
          <div style={{background: 'rgba(15,20,40,0.85)', border: '3px solid #8fe3ff', borderRadius: 12, padding: '8px 18px'}}>
            <div style={{fontWeight: 900, fontSize: 44, color: 'white'}}>{l.text}</div>
            <div style={{fontWeight: 700, fontSize: 26, color: '#8fe3ff'}}>{l.sub}</div>
          </div>
        </div>
      ))}
      {shot === 'title' && (
        <div style={{position: 'absolute', top: 170, left: 50, right: 50, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 104, lineHeight: 1.05, color: 'white', WebkitTextStroke: '9px #1d1d2b', paintOrder: 'stroke fill'}}>
          WIE FUNKTIONIERT <span style={{color: '#ffd84d'}}>DEIN MOTOR?</span>
        </div>
      )}
    </AbsoluteFill>
  );
};
