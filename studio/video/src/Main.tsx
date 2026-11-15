import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/montserrat/900.css';
import '@fontsource/montserrat/700.css';
import timeline from './timeline.json';
import {DialogScene} from './Dialog';
import {MapScene} from './MapStory';
import {HauptstadtScene} from './Hauptstadt';
import {EmuScene} from './Emu';
import {StoryScene} from './Story';

type Scene = (typeof timeline.scenes)[number];
const FONT = 'Montserrat, sans-serif';

const sceneAt = (t: number) => {
  let i = 0;
  timeline.scenes.forEach((s, k) => { if (t >= s.start) i = k; });
  return i;
};

// плавная «усталость» между сценами
const tiredAt = (t: number) => {
  const i = sceneAt(t);
  const s = timeline.scenes[i];
  const prev = i > 0 ? timeline.scenes[i - 1].tired : s.tired;
  return interpolate(t - s.start, [0, 0.8], [prev, s.tired], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
};

const mix = (a: number[], b: number[], k: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',')})`;

const Background: React.FC<{tired: number; frame: number}> = ({tired, frame}) => {
  const top = mix([26, 35, 82], [70, 18, 52], tired);
  const bottom = mix([8, 10, 30], [20, 4, 14], tired);
  return (
    <AbsoluteFill style={{background: `linear-gradient(${top}, ${bottom})`}}>
      {Array.from({length: 40}).map((_, i) => {
        const x = (i * 263) % 1080, y = (i * 517) % 1300;
        const tw = 0.3 + 0.7 * Math.abs(Math.sin(frame / 20 + i));
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 6, height: 6, borderRadius: 3, background: 'white', opacity: tw * (1 - tired * 0.6)}} />;
      })}
      {/* луна */}
      <div style={{position: 'absolute', right: 90, top: 330, width: 150, height: 150, borderRadius: 75, boxShadow: '-34px 18px 0 0 #ffe9a8', opacity: 0.9}} />
    </AbsoluteFill>
  );
};

// тени-галлюцинации (сцены 72 h)
const Shadows: React.FC<{tired: number; frame: number}> = ({tired, frame}) => {
  const o = interpolate(tired, [0.8, 0.9], [0, 0.55], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (o <= 0) return null;
  return (
    <>
      {[0, 1].map((k) => (
        <svg key={k} width={260} height={700} style={{position: 'absolute', bottom: 260, [k ? 'right' : 'left']: -40 + Math.sin(frame / 25 + k) * 30, opacity: o, filter: 'blur(6px)'}}>
          <ellipse cx={130} cy={110} rx={70} ry={85} fill="black" />
          <path d="M40 700 Q20 300 130 200 Q240 300 220 700 Z" fill="black" />
          <circle cx={105} cy={105} r={9} fill="#ff3355" opacity={0.5 + 0.5 * Math.sin(frame / 6)} />
          <circle cx={155} cy={105} r={9} fill="#ff3355" opacity={0.5 + 0.5 * Math.sin(frame / 6)} />
        </svg>
      ))}
    </>
  );
};

// персонаж: веки опускаются, мешки под глазами, кивает при «секундном сне»
type CharProps = {tired: number; frame: number; fps: number; skinTo?: number[]; sleepy?: boolean; helmet?: boolean; top?: number; size?: number; lookUp?: number};
const Character: React.FC<CharProps> = ({tired, frame, fps, skinTo = [222, 196, 170], sleepy = true, helmet = false, top = 380, size = 1, lookUp = 0}) => {
  const t = frame / fps;
  const breathe = size * (1 + Math.sin(t * 2.2) * 0.015);
  const nod = sleepy && tired > 0.5 ? Math.max(0, Math.sin(t * 1.3)) ** 8 * 22 * tired : 0;
  const blinkCycle = (frame % 110) < 5;
  const lid = Math.min(1, (blinkCycle ? 1 : 0) + tired * (sleepy ? 0.62 : 0.4) + (nod > 10 ? 0.4 : 0));
  const lookX = Math.sin(t * 0.9) * 10 * (1 - tired);
  const skin = mix([255, 214, 150], skinTo, tired);
  const mouth = tired < 0.3
    ? 'M440 690 Q540 760 640 690'
    : tired < 0.8 ? 'M455 715 Q540 720 625 715' : `M450 715 Q490 ${700 + Math.sin(t * 8) * 10} 540 715 T630 715`;
  const eye = (cx: number) => (
    <g>
      <clipPath id={`eye${cx}`}><ellipse cx={cx} cy={560} rx={62} ry={70} /></clipPath>
      <ellipse cx={cx} cy={560} rx={62} ry={70} fill="white" />
      <g clipPath={`url(#eye${cx})`}>
        <circle cx={cx + lookX} cy={575 - lookUp * 35} r={26 - tired * 6} fill="#1d1d2b" />
        {tired > 0.6 && <path d={`M${cx - 40} 560 l14 6 M${cx + 20} 545 l16 10`} stroke="#e0405a" strokeWidth={4} />}
        <rect x={cx - 70} y={480} width={140} height={10 + 120 * lid} fill={skin} />
        {lid > 0.05 && <line x1={cx - 70} x2={cx + 70} y1={490 + 120 * lid} y2={490 + 120 * lid} stroke="#1d1d2b" strokeWidth={10} />}
      </g>
      <ellipse cx={cx} cy={560} rx={62} ry={70} fill="none" stroke="#1d1d2b" strokeWidth={10} />
      <path d={`M${cx - 50} 655 Q${cx} ${670 + tired * 20} ${cx + 50} 655`} stroke="#6b4a8a" strokeWidth={8} fill="none" opacity={tired} />
    </g>
  );
  return (
    <svg viewBox="0 0 1080 1100" width={1080} height={1100} style={{position: 'absolute', top, transform: `rotate(${nod * 0.4}deg) translateY(${nod * 3}px) scale(${breathe})`}}>
      <ellipse cx={540} cy={1040} rx={260} ry={30} fill="black" opacity={0.25} />
      <path d="M330 1040 Q330 830 540 830 Q750 830 750 1040 Z" fill="#4a6cf7" stroke="#1d1d2b" strokeWidth={10} />
      <circle cx={540} cy={590} r={270} fill={skin} stroke="#1d1d2b" strokeWidth={12} />
      <path d="M300 470 Q380 300 540 320 Q720 300 790 470 Q700 400 540 410 Q400 400 300 470 Z" fill="#3b2a1f" />
      {eye(445)}{eye(635)}
      <path d={mouth} stroke="#1d1d2b" strokeWidth={12} fill="none" strokeLinecap="round" />
      {!helmet && tired > 0.55 && <path d={`M790 ${470 + (t * 60) % 120} q-18 30 0 40 q18 -10 0 -40`} fill="#7cc8ff" />}
      {!sleepy && tired > 0.5 && <path d="M470 705 l15 12 l-8 10 M590 700 l-12 14" stroke="#a0522d" strokeWidth={5} fill="none" />}
      {helmet && (
        <g>
          <circle cx={540} cy={600} r={350} fill="rgba(180,230,255,0.18)" stroke="#c9a227" strokeWidth={28} />
          <path d="M330 430 Q380 320 480 290" stroke="white" strokeWidth={22} fill="none" strokeLinecap="round" opacity={0.6} />
          <rect x={500} y={225} width={80} height={40} rx={10} fill="#ffe28a" stroke="#1d1d2b" strokeWidth={8} />
        </g>
      )}
      {sleepy && tired < 0.15 && <text x={760} y={330} fontSize={70} fontFamily={FONT} fontWeight={900} fill="#ffe9a8" opacity={0.5 + 0.5 * Math.sin(t * 3)}>z</text>}
    </svg>
  );
};

const HourBadge: React.FC<{scene: Scene; local: number; fps: number}> = ({scene, local, fps}) => {
  const pop = spring({frame: local, fps, config: {damping: 9, stiffness: 160}});
  return (
    <div style={{position: 'absolute', top: 210, width: '100%', display: 'flex', justifyContent: 'center'}}>
      <div style={{transform: `scale(${pop})`, background: '#ffd84d', color: '#1d1d2b', fontFamily: FONT, fontWeight: 900, fontSize: Math.min(120, Math.floor(1250 / Math.max(String(scene.big).length, 1))), padding: '10px 50px', whiteSpace: 'nowrap', borderRadius: 40, border: '8px solid #1d1d2b', boxShadow: '0 14px 0 #1d1d2b'}}>
        {scene.big}
      </div>
    </div>
  );
};

const Progress: React.FC<{t: number}> = ({t}) => (
  <div style={{position: 'absolute', top: 120, left: 80, right: 80, height: 18, borderRadius: 9, background: 'rgba(255,255,255,0.2)'}}>
    <div style={{width: `${Math.min(100, (t / timeline.duration) * 100)}%`, height: '100%', borderRadius: 9, background: '#ffd84d'}} />
  </div>
);

// субтитры: по 3 слова, текущее слово подсвечено
const Captions: React.FC<{t: number; fps: number; frame: number}> = ({t, fps, frame}) => {
  // группы до 3 слов; новая группа после знака препинания и в начале сцены
  const chunks: {w: string; t: number}[][] = [];
  timeline.scenes.forEach((s) => {
    let c: {w: string; t: number}[] = [];
    s.words.forEach((w) => {
      c.push(w);
      if (c.length === 3 || /[.,?!:]$/.test(w.w)) { chunks.push(c); c = []; }
    });
    if (c.length) chunks.push(c);
  });
  let ci = 0;
  chunks.forEach((c, k) => { if (t >= c[0].t) ci = k; });
  const chunk = chunks[ci];
  let cur = 0;
  chunk.forEach((w, k) => { if (t >= w.t) cur = k; });
  const pop = spring({frame: frame - Math.round(chunk[cur].t * fps), fps, config: {damping: 12, stiffness: 220}});
  const longest = Math.max(...chunk.map((w) => w.w.length));
  const size = Math.min(62, Math.floor(1000 / Math.max(longest, 1)));
  return (
    <div style={{position: 'absolute', top: 1300, left: 60, right: 60, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.2, textTransform: 'uppercase'}}>
      {chunk.map((w, k) => {
        const active = k === cur;
        return (
          <span key={`${ci}-${k}`} style={{display: 'inline-block', margin: '0 16px', color: active ? '#ffd84d' : 'white', WebkitTextStroke: '6px #1d1d2b', paintOrder: 'stroke fill', transform: active ? `scale(${0.9 + 0.12 * pop})` : 'scale(1)', textShadow: '0 8px 0 #1d1d2b'}}>
            {w.w.replace(/[.,:;!?…„“"»«]/g, '')}
          </span>
        );
      })}
    </div>
  );
};

export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const i = sceneAt(t);
  const scene = timeline.scenes[i];
  const tired = tiredAt(t);
  const local = frame - Math.round(scene.start * fps);
  const shake = scene.big === '!' ? Math.sin(frame * 1.7) * 12 : 0;
  const theme = (timeline as any).theme ?? 'schlaf';
  return (
    <AbsoluteFill style={{transform: `translateX(${shake}px)`}}>
      {theme === 'map' && (timeline as any).style === 'emu' ? <EmuScene frame={frame} fps={fps} />
        : theme === 'map' && (timeline as any).style === 'flat' ? <HauptstadtScene frame={frame} fps={fps} />
        : theme === 'map' ? <MapScene frame={frame} fps={fps} />
        : theme === 'story' ? <StoryScene frame={frame} fps={fps} />
        : theme === 'dialog' ? <DialogScene frame={frame} fps={fps} />
        : theme === 'wasser' ? <WasserScene k={tired} frame={frame} fps={fps} />
        : theme === 'mond' ? <MondScene k={tired} moon={valAt(t, 'moon')} frame={frame} fps={fps} />
        : theme === 'graben' ? <GrabenScene k={tired} frame={frame} fps={fps} />
        : (
          <>
            <Background tired={tired} frame={frame} />
            <Shadows tired={tired} frame={frame} />
            <Character tired={tired} frame={frame} fps={fps} />
          </>
        )}
      {/* полоска прогресса убрана по просьбе владельца */}
      {theme !== 'map' && !(i === 0 && (timeline as any).hookText) && <HourBadge scene={scene} local={local} fps={fps} />}
      {theme !== 'dialog' && <Captions t={t} fps={fps} frame={frame} />}
      {theme !== 'dialog' && (timeline as any).showRu && (scene as any).ru && (
        <div style={{position: 'absolute', top: 1730, left: 40, right: 40, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 32, lineHeight: 1.25, color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '10px 18px', borderRadius: 16}}>{(scene as any).ru}</div>
      )}
      <Audio src={staticFile('voice.wav')} />
    </AbsoluteFill>
  );
};

// ---------- общий плавный параметр сцены ----------
const valAt = (t: number, key: 'moon' | 'tired') => {
  const i = sceneAt(t);
  const s: any = timeline.scenes[i];
  const prev: any = i > 0 ? timeline.scenes[i - 1] : s;
  return interpolate(t - s.start, [0, 0.8], [prev[key] ?? 0, s[key] ?? 0], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
};

// ---------- ВОДА: жара, персонаж «высыхает», шкала воды в теле ----------
const WasserScene: React.FC<{k: number; frame: number; fps: number}> = ({k, frame, fps}) => {
  const t = frame / fps;
  const level = 1 - k * 0.55; // доля воды в шкале
  return (
    <>
      <AbsoluteFill style={{background: `linear-gradient(${mix([120, 200, 255], [255, 140, 60], k)}, ${mix([255, 230, 170], [200, 90, 40], k)})`}} />
      {/* солнце */}
      <div style={{position: 'absolute', right: 60, top: 330, width: 190 + k * 60, height: 190 + k * 60, borderRadius: '50%', background: '#ffd84d', boxShadow: `0 0 ${60 + k * 120}px ${20 + k * 60}px rgba(255,200,60,0.7)`, transform: `scale(${1 + Math.sin(t * 3) * 0.03})`}} />
      {/* дрожащий от жары воздух */}
      {Array.from({length: 6}).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: 80 + i * 170, top: 1300 + Math.sin(t * 2 + i) * 30, width: 120, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.35)', opacity: k}} />
      ))}
      <Character tired={k} frame={frame} fps={fps} skinTo={[214, 190, 120]} sleepy={false} top={400} size={0.92} />
      {/* шкала воды */}
      <div style={{position: 'absolute', left: 50, top: 520, width: 110, height: 620, borderRadius: 55, border: '10px solid #1d1d2b', background: 'rgba(255,255,255,0.5)', overflow: 'hidden'}}>
        <div style={{position: 'absolute', bottom: 0, width: '100%', height: `${level * 100}%`, background: mix([40, 150, 255], [120, 170, 200], k)}}>
          <svg width={110} height={30} style={{position: 'absolute', top: -14}}>
            <path d={`M0 15 Q${27 + Math.sin(t * 4) * 8} 0 55 15 T110 15 V30 H0 Z`} fill={mix([40, 150, 255], [120, 170, 200], k)} />
          </svg>
        </div>
      </div>
      <div style={{position: 'absolute', left: 30, top: 1160, width: 150, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 44, color: '#1d1d2b'}}>{Math.round(60 - k * 6)}%</div>
    </>
  );
};

// ---------- ЛУНА: Земля-маскот, море, Луна появляется и исчезает ----------
const MondScene: React.FC<{k: number; moon: number; frame: number; fps: number}> = ({k, moon, frame, fps}) => {
  const t = frame / fps;
  const tilt = 23 + (k > 0.7 ? Math.sin(t * 1.6) * 25 * (k - 0.5) * 2 : 0);
  const wave = 10 + moon * 45;
  const dark = 1 - moon * 0.5;
  return (
    <>
      <AbsoluteFill style={{background: `linear-gradient(${mix([30, 40, 100], [5, 6, 20], dark)}, ${mix([10, 12, 40], [0, 0, 5], dark)})`}} />
      {Array.from({length: 70}).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: (i * 263) % 1080, top: (i * 517) % 1500, width: 5, height: 5, borderRadius: 3, background: 'white', opacity: 0.3 + 0.7 * Math.abs(Math.sin(t + i))}} />
      ))}
      {/* Луна */}
      <div style={{position: 'absolute', right: 90, top: 380, width: 200, height: 200, borderRadius: '50%', background: '#f4efd8', boxShadow: '0 0 90px 30px rgba(255,250,220,0.45)', opacity: moon, transform: `scale(${0.4 + moon * 0.6})`}}>
        <div style={{position: 'absolute', left: 50, top: 60, width: 40, height: 40, borderRadius: '50%', background: '#d9d2b5'}} />
        <div style={{position: 'absolute', left: 120, top: 120, width: 28, height: 28, borderRadius: '50%', background: '#d9d2b5'}} />
      </div>
      {/* Земля с лицом и осью */}
      <svg viewBox="0 0 800 800" width={760} height={760} style={{position: 'absolute', left: 160, top: 560, transform: `rotate(${tilt - 23}deg)`}}>
        <line x1={400} y1={20} x2={400} y2={780} stroke="#ffd84d" strokeWidth={10} strokeDasharray="30 20" transform="rotate(23 400 400)" />
        <circle cx={400} cy={400} r={300} fill="#2f7bf5" stroke="#1d1d2b" strokeWidth={14} />
        <clipPath id="earth"><circle cx={400} cy={400} r={293} /></clipPath>
        <g clipPath="url(#earth)"><g transform={`translate(${((t * 25) % 600) - 300} 0)`}>
          {[-600, 0, 600].map((dx) => (
            <g key={dx} transform={`translate(${dx} 0)`} fill="#3fbf6a">
              <path d="M180 220 Q260 150 330 230 Q360 320 280 340 Q200 330 180 220 Z" />
              <path d="M430 420 Q520 380 600 450 Q620 560 520 600 Q440 560 430 420 Z" />
              <path d="M220 480 Q280 460 300 540 Q260 600 210 560 Z" />
            </g>
          ))}
        </g></g>
        {[330, 470].map((cx) => (
          <g key={cx}>
            <ellipse cx={cx} cy={370} rx={42} ry={50} fill="white" stroke="#1d1d2b" strokeWidth={8} />
            <circle cx={cx + 10 * moon} cy={360 - 18 * moon + (1 - moon) * 15} r={18} fill="#1d1d2b" />
          </g>
        ))}
        <path d={moon > 0.5 ? 'M340 470 Q400 520 460 470' : 'M345 500 Q400 465 455 500'} stroke="#1d1d2b" strokeWidth={10} fill="none" strokeLinecap="round" />
      </svg>
      {/* море: приливы слабеют без Луны */}
      <svg width={1080} height={400} style={{position: 'absolute', bottom: 0}}>
        <path d={`M0 ${200 - wave} ${Array.from({length: 7}).map((_, i) => `Q${i * 180 + 90} ${200 - wave + Math.sin(t * 2 + i) * wave} ${(i + 1) * 180} ${200 - wave}`).join(' ')} V400 H0 Z`} fill="rgba(30,90,200,0.85)" />
      </svg>
    </>
  );
};

// ---------- ВПАДИНА: погружение, глубиномер, светящиеся рыбы ----------
const GrabenScene: React.FC<{k: number; frame: number; fps: number}> = ({k, frame, fps}) => {
  const t = frame / fps;
  const water = k < 0.3 ? mix([79, 195, 247], [11, 61, 145], k / 0.3) : mix([11, 61, 145], [0, 0, 0], Math.min(1, (k - 0.3) / 0.4));
  const fish = interpolate(k, [0.45, 0.55], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <>
      <AbsoluteFill style={{background: water}} />
      {/* пузыри летят вверх — ощущение погружения */}
      {Array.from({length: 24}).map((_, i) => {
        const y = 1920 - ((t * (180 + (i % 5) * 40) + i * 140) % 2100);
        return <div key={i} style={{position: 'absolute', left: (i * 97) % 1000 + 30, top: y, width: 14 + (i % 4) * 8, height: 14 + (i % 4) * 8, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.45)'}} />;
      })}
      {/* светящиеся рыбы */}
      {[0, 1, 2].map((i) => (
        <svg key={i} width={220} height={120} style={{position: 'absolute', left: ((t * (40 + i * 25) + i * 400) % 1300) - 220, top: 600 + i * 330, opacity: fish}}>
          <path d="M20 60 Q90 10 160 60 Q90 110 20 60 Z" fill="#14202e" stroke="#47e0ff" strokeWidth={4} />
          <path d="M160 60 l40 -30 v60 Z" fill="#14202e" stroke="#47e0ff" strokeWidth={4} />
          <circle cx={50} cy={55} r={7} fill="#47e0ff" />
          {i === 1 && <><path d="M40 35 Q20 0 0 10" stroke="#ffe28a" strokeWidth={4} fill="none" /><circle cx={0} cy={12} r={12} fill="#ffe28a" style={{filter: 'drop-shadow(0 0 14px #ffe28a)'}} /></>}
        </svg>
      ))}
      {/* фонарь шлема: темнота вокруг */}
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 46%, rgba(0,0,0,0) 300px, rgba(0,0,0,${0.85 * Math.max(0, k - 0.45) * 1.8}) 620px)`}} />
      <Character tired={0} frame={frame} fps={fps} sleepy={false} helmet top={430} size={0.78} />
      {/* глубиномер */}
      <div style={{position: 'absolute', right: 50, top: 520, width: 26, height: 760, borderRadius: 13, background: 'rgba(255,255,255,0.25)'}}>
        <div style={{position: 'absolute', top: `${k * 100}%`, left: -22, width: 70, height: 26, borderRadius: 13, background: '#ffd84d', border: '5px solid #1d1d2b', transform: 'translateY(-13px)'}} />
      </div>
      <div style={{position: 'absolute', right: 20, top: 1300, fontFamily: FONT, fontWeight: 900, fontSize: 40, color: 'white'}}>11 km</div>
    </>
  );
};
