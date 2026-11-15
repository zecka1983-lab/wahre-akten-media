// Timeline animation. frame(t) returns the full 1080x1920 SVG markup for time t (seconds).
(function () {
  const Z = window.ZF, C = Z.C, WORDS = window.WORDS;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const eOut = x => 1 - Math.pow(1 - x, 3);
  const back = x => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const lerp = (a, b, x) => a + (b - a) * x;
  const W = (word, n = 1) => { let k = 0; for (const w of WORDS) if (w.w.replace(/[^\wäöüßÄÖÜ-]/g, '') === word && ++k === n) return w.s; throw new Error('word ' + word); };
  const at = (x, y, s, inner, extra = '') => `<g transform="translate(${x},${y}) scale(${s})" ${extra}>${inner}</g>`;
  const cam = (s, cx, cy, inner) => `<g transform="translate(540,960) scale(${s}) translate(${-cx},${-cy})">${inner}</g>`;
  const FONT = `font-family="Inter Display, Inter, sans-serif"`;
  const recolor = (svg, map) => { for (const [a, b] of map) svg = svg.split(a).join(b); return svg; };

  // ---- key times
  const T = {
    city: W('In'), mill: W('Millionen'), inf: W('Infizierte'), und: W('Und'), wasser: W('Wasser'), essen: W('Essen'), abstand: W('Abstand'),
    t1: W('Erstens'), tor: W('Tor'), tiere: W('Tiere'), inf2: W('Infizierte', 2), bew: W('Bewegung'), laerm: W('Lärm'),
    t2: W('Zweitens'), pruef: W('Prüf'), ohne: W('Ohne'), drei: W('drei'),
    t3: W('Drittens'), teil: W('Teil'), auch: W('Auch'),
    t4: W('Viertens'), sichere: W('Sichere'), nicht: W('nicht'), vernagle: W('Vernagle'), schlaf: W('schlaf'),
    t5: W('Fünftens'), licht: W('Licht'), kein2: W('kein', 2), gen: W('Generator'), licht2: W('Licht', 2),
    t6: W('Sechstens'), gaense: W('Gänse'), hunde: W('Hunde'), alarm: W('schlagen'), bevor: W('bevor'),
    tm: W('Und', 2), oeffne: W('Öffne'), beob: W('Beobachte'), auch2: W('Auch', 2), gebissen: W('gebissen'), hilfe: W('Hilfe'),
    du: W('Du'), aber: W('Aber'), schreien: W('schreien'), dann: W('Und', 3), ploetz: W('plötzlich')
  };
  T.end = WORDS[WORDS.length - 1].e + 0.35;
  window.TIMES = T;

  // ---- reusable pieces
  const fire = t => .55 + .18 * Math.sin(t * 6.3) + .1 * Math.sin(t * 15.1);
  const vignette = (o = .75) => `<defs><radialGradient id="vg" cx=".5" cy=".45" r=".78"><stop offset=".5" stop-opacity="0"/><stop offset="1" stop-opacity="${o}"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#vg)"/>`;
  const rings = (x, y, t, col = '#fff', n = 3, sp = 1.2, max = 160) => {
    let o = '';
    for (let i = 0; i < n; i++) { const p = ((t * sp + i / n) % 1); o += `<circle cx="${x}" cy="${y}" r="${20 + p * max}" fill="none" stroke="${col}" stroke-width="${8 * (1 - p)}" opacity="${(1 - p) * .9}"/>`; }
    return o;
  };
  const grass = (t, y, n = 26, col = '#26331f', seed = 1) => {
    let o = '', s = seed; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < n; i++) { const x = r() * 1080, h = 30 + r() * 40, sw = Math.sin(t * 1.6 + x * .02) * 8;
      o += `<path d="M${x - 6},${y} Q${x + sw * .4},${y - h * .5} ${x + sw},${y - h} Q${x + 2},${y - h * .5} ${x + 6},${y} Z" fill="${col}"/>`; }
    return o;
  };
  const stranger = (p, infected) => {
    let s = Z.farmer(p);
    s = recolor(s, [[C.jacket, '#41608a'], [C.jacketD, '#2c4466'], [C.cap, '#1d1d22'], [C.denim, '#3a3a40']]);
    if (infected > 0) s = s.split('fill="#1b1410"').join(`fill="${C.zEye}" opacity="${0.4 + infected * .6}"`);
    return s;
  };
  // bandage + bite on the stranger's back (left) arm, drawn in stranger-local coords
  const bite = (glow) => `<g><rect x="-36" y="-122" width="22" height="16" rx="4" fill="#e9e6dc" transform="rotate(20 -25 -114)"/>
    <circle cx="-25" cy="-114" r="6" fill="${C.blood}"/>${glow ? `<circle cx="-25" cy="-114" r="${26 + glow * 6}" fill="none" stroke="${C.red}" stroke-width="5"/>` : ''}</g>`;

  function yard(t, o = {}) {
    const f = fire(t);
    let s = Z.bgFarm({ id: o.id || 'y', fire: f, crowdN: o.crowdN || 0, dark: o.dark || 0 });
    s += at(230, 1240, .9, Z.barn());
    s += at(820, 1262, .75, Z.house({ lights: o.lights || [0, 0, 0, 0], boards: o.boards ?? 1 }));
    s += at(0, 1380, 1, Z.fence(1080));
    s += at(540, 1400, .9, Z.gate(o.gate ?? 0, { locked: o.locked ?? true }));
    s += grass(t, 1420, 30, '#1f2a19', 4);
    return s;
  }

  // ---- number badge overlay
  const NUMS = ['ERSTENS', 'ZWEITENS', 'DRITTENS', 'VIERTENS', 'FÜNFTENS', 'SECHSTENS'];
  function badge(t, t0, n) {
    const lt = t - t0; if (lt < 0) return '';
    const label = n === '!' ? 'DAS WICHTIGSTE' : NUMS[n - 1], txt = n === '!' ? '!' : String(n);
    const big = lt < 1.0;
    const pin = eOut(prog(lt, 0.85, 1.25));
    const pop = back(prog(lt, 0, .35));
    const x = lerp(540, 150, pin), y = lerp(760, 300, pin), sc = lerp(1, .42, pin) * (pin > 0 ? 1 : pop);
    let o = '';
    if (big || pin < 1) o += `<rect width="1080" height="1920" fill="#000" opacity="${.55 * (1 - pin)}"/>`;
    o += `<g transform="translate(${x},${y}) scale(${sc})">
      <circle r="230" fill="${C.accent}" opacity=".18"/><circle r="200" fill="${n === '!' ? C.red : C.accent}"/>
      <text y="100" ${FONT} font-weight="900" font-size="300" text-anchor="middle" fill="#0a0c12">${txt}</text>
      <text y="${pin > .5 ? 330 : 320}" ${FONT} font-weight="900" font-size="${n === '!' ? 92 : 104}" text-anchor="middle" fill="#fff" stroke="#000" stroke-width="10" paint-order="stroke" letter-spacing="6" opacity="${1 - pin}">${label}</text>
    </g>`;
    return o;
  }

  // ---- icon cards (water / food / distance)
  function iconCard(x, y, t0, t, kind, label) {
    const p = back(prog(t, t0, t0 + .35)); if (p <= 0) return '';
    let ic = '';
    if (kind === 'water') ic = `<path d="M0,-70 C30,-30 50,-5 50,20 A50,50 0 0 1 -50,20 C-50,-5 -30,-30 0,-70 Z" fill="#4aa3df"/><path d="M-22,14 a24,24 0 0 0 20,26" stroke="#bfe3ff" stroke-width="8" fill="none" stroke-linecap="round"/>`;
    if (kind === 'food') ic = at(0, 30, .7, Z.foodPile());
    if (kind === 'dist') ic = `<path d="M-70,10 H70" stroke="#fff" stroke-width="10" stroke-dasharray="16 12"/><path d="M-70,10 l22,-18 v36 Z M70,10 l-22,-18 v36 Z" fill="#fff"/><text y="-24" ${FONT} font-weight="900" font-size="48" text-anchor="middle" fill="${C.accent}">KM</text>`;
    return `<g transform="translate(${x},${y}) scale(${p})"><circle r="120" fill="#0a0c12" opacity=".8" stroke="${C.accent}" stroke-width="6"/>${ic}
      <text y="180" ${FONT} font-weight="900" font-size="54" text-anchor="middle" fill="#fff" stroke="#000" stroke-width="8" paint-order="stroke">${label}</text></g>`;
  }

  // =================== SCENES ===================
  const scenes = [];
  const scene = (a, b, fn) => scenes.push({ a, b, fn });

  // 0 — Hook: farm at night, glow on horizon
  scene(0, T.city, t => {
    const z = lerp(1.35, 1.0, ease(prog(t, 0, 3.6)));
    let s = yard(t, { id: 'h', crowdN: 18, boards: 0 });
    s += at(560 + Math.sin(t * .8) * 2, 1760, 1.9, Z.farmer({ headTilt: t > W('bleib') ? Math.sin((t - W('bleib')) * 9) * 6 * (1 - prog(t, W('bleib'), W('bleib') + .6)) : -6, armL: [10, 6], armR: [-10, -6] }));
    s += at(330, 1830, 1.5, Z.dog({ phase: t * 2, wag: true }));
    s += at(860, 1800, 1.5, Z.goose({ peck: Math.sin(t * 2) > .3 }));
    let out = cam(z, 700, 1040 + (1 - z) * -1600, s);
    // zoom into the glow as transition
    const tz = prog(t, T.city - .45, T.city);
    if (tz > 0) out = `<g transform="translate(780,1000) scale(${1 + tz * tz * 3}) translate(-780,-1000)">${out}</g><rect width="1080" height="1920" fill="${C.glow}" opacity="${tz * .6}"/>`;
    return out;
  });

  // 1 — City: millions of people -> millions of infected
  scene(T.city, T.und, t => {
    const lt = t - T.city, inf = prog(t, T.inf, T.inf + .5);
    let s = Z.bgCity({ id: 'c', fire: fire(t) });
    const walkers = (y, sc, n, sp, seed) => {
      let o = '', q = seed; const r = () => (q = (q * 9301 + 49297) % 233280) / 233280;
      for (let i = 0; i < n; i++) { const dir = r() > .5 ? 1 : -1, x0 = r() * 1300 - 110, x = ((x0 + dir * lt * sp * (0.6 + r() * .6)) % 1300 + 1300) % 1300 - 110;
        const fig = inf > 0 ? Z.zombie({ phase: lt * 6 + i, reach: inf }) : Z.farmer({ legL: Math.sin(lt * 7 + i) * 20, legR: -Math.sin(lt * 7 + i) * 20, armL: [-Math.sin(lt * 7 + i) * 18, 8], armR: [Math.sin(lt * 7 + i) * 18, -8] });
        o += `<g transform="translate(${x},${y + r() * 30}) scale(${dir * sc},${sc})">${recolor(fig, [[C.jacket, '#14151c'], [C.jacketD, '#101118'], [C.denim, '#0d0e14'], [C.skin, '#1d1c22'], [C.skinD, '#16151a'], [C.cap, '#0d0d10'], [C.zSkin, '#1d1f1a'], [C.zSkinD, '#161813'], [C.zShirt, '#121310'], [C.zPants, '#0d0e0c']])}</g>`; }
      return o;
    };
    s += walkers(1600, .9, 14, 120, 3) + walkers(1820, 1.3, 9, 170, 8);
    // counter
    const cp = prog(t, T.mill, T.mill + 1.2), num = Math.floor(eOut(cp) * 1000000);
    if (cp > 0) s += `<text x="540" y="560" ${FONT} font-weight="900" font-size="150" text-anchor="middle" fill="${inf > 0 ? C.red : '#fff'}" stroke="#000" stroke-width="12" paint-order="stroke">${num.toLocaleString('de-DE')}</text>
      <text x="540" y="660" ${FONT} font-weight="900" font-size="64" text-anchor="middle" fill="${inf > 0 ? C.red : '#fff'}" letter-spacing="8" stroke="#000" stroke-width="8" paint-order="stroke">${inf > 0 ? 'INFIZIERTE' : 'MENSCHEN'}</text>`;
    const z = lerp(1.08, 1, ease(prog(lt, 0, 5)));
    return cam(z, 540, 960, s) + (inf > 0 && inf < 1 ? `<rect width="1080" height="1920" fill="${C.green}" opacity="${(1 - inf) * .25}"/>` : '');
  });

  // 1b — Farm: water, food, distance
  scene(T.und, T.t1, t => {
    const lt = t - T.und;
    let s = yard(t, { id: 'b', boards: 0 });
    s += at(200, 1700, 1.3, Z.well({ water: 1 }));
    s += at(560, 1770, 1.8, Z.farmer({ armR: [-20, -30], armL: [20, 30] }));
    s += at(880, 1820, 1.4, Z.goose({ peck: Math.sin(t * 2.4) > .2 }));
    const z = lerp(1, 1.06, prog(lt, 0, 5.3));
    let out = cam(z, 540, 1200, s);
    out += iconCard(220, 520, T.wasser, t, 'water', 'WASSER');
    out += iconCard(540, 520, T.essen, t, 'food', 'ESSEN');
    out += iconCard(860, 520, T.abstand, t, 'dist', 'ABSTAND');
    return out;
  });

  // 2 — Tip 1: close gate, drive animals in; infected react to movement and noise
  scene(T.t1, T.t2, t => {
    const g = 1 - ease(prog(t, T.tor, T.tor + .55));
    const locked = t > T.tor + .6;
    let s = Z.bgFarm({ id: 'g1', fire: fire(t) });
    // infected beyond the fence
    const turn = prog(t, T.bew, T.bew + .4), walk = prog(t, T.laerm, T.end);
    s += at(820 - walk * 120 * (t - T.laerm), 1230, .62, Z.zombie({ phase: t * (walk > 0 ? 5 : 1.2), headTilt: lerp(28, -10, turn), reach: lerp(.2, 1, turn) }), `opacity="${prog(t, T.inf2 - .3, T.inf2 + .3) * .95}"`);
    s += at(0, 1440, 1.4, Z.fence(1100, 110));
    s += at(540, 1460, 1.25, Z.gate(g, { locked }));
    s += grass(t, 1480, 28, '#1f2a19', 2);
    // farmer pushing gate
    s += at(lerp(260, 360, 1 - g), 1760, 1.9, Z.farmer({ armR: [70, 10], armL: [60, 20], legL: Math.sin(t * 8) * 18 * (g > 0 && g < 1 ? 1 : 0), legR: -Math.sin(t * 8) * 18 * (g > 0 && g < 1 ? 1 : 0) }));
    // animals walking in (right -> left, off screen)
    const ap = prog(t, T.tiere - .1, T.tiere + 2.2);
    if (ap > 0 && ap < 1) {
      const x = lerp(1250, -300, ap);
      s += `<g transform="translate(${x},1850) scale(-1.5,1.5)">${Z.cow({ phase: t * 6 })}</g>`;
      s += `<g transform="translate(${x + 300},1880) scale(-1.3,1.3)">${Z.goose()}</g>`;
      s += `<g transform="translate(${x + 420},1870) scale(-1.3,1.3)">${Z.goose({ alarm: t > T.bew && t < T.bew + .5 })}</g>`;
    }
    // a goose left outside flaps -> movement + noise
    if (t > T.inf2) {
      const fl = t > T.bew && t < T.t2;
      s += at(880, 1820, 1.5, Z.goose({ alarm: fl && Math.sin(t * 14) > 0 }));
      if (t > T.laerm) s += rings(925, 1690, t, '#fff', 3, 1.5, 140);
      if (t > T.bew) s += `<path d="M830,1700 q-20,-30 0,-60 M810,1710 q-30,-40 0,-80" stroke="#fff" stroke-width="6" fill="none" opacity="${.5 + .5 * Math.sin(t * 20)}"/>`;
    }
    const z = lerp(1, 1.08, prog(t, T.t1, T.t2));
    return cam(z, 540, 1300, s) + badge(t, T.t1, 1);
  });

  // 3 — Tip 2: check the well; 3 days
  scene(T.t2, T.t3, t => {
    let s = Z.bgFarm({ id: 'g2', fire: fire(t) }) + grass(t, 1400, 20, '#1f2a19', 6);
    const up = ease(prog(t, T.pruef, T.pruef + 1.2));
    s += at(470, 1560, 2.4, Z.well({ rope: lerp(70, 0, up), crank: up * 720, water: .9 + .1 * Math.sin(t * 3) }));
    s += at(830, 1720, 1.9, Z.farmer({ armR: [80 + Math.sin(up * 12) * 30, 30], armL: [60, 30], headTilt: -8 }));
    let out = cam(lerp(1, 1.1, prog(t, T.t2, T.t3)), 540, 1250, s);
    // 3 days drain
    const dp = prog(t, T.ohne, T.ohne + .4);
    if (dp > 0) {
      const drain = prog(t, T.drei + .2, T.t3);
      const lvl = 1 - drain;
      out += `<g transform="translate(540,560) scale(${back(dp)})">
        <clipPath id="dc"><path d="M0,-150 C60,-70 110,-10 110,50 A110,110 0 0 1 -110,50 C-110,-10 -60,-70 0,-150 Z"/></clipPath>
        <path d="M0,-150 C60,-70 110,-10 110,50 A110,110 0 0 1 -110,50 C-110,-10 -60,-70 0,-150 Z" fill="#0a0c12" stroke="#4aa3df" stroke-width="8"/>
        <rect x="-120" y="${160 - 320 * lvl}" width="240" height="320" fill="#4aa3df" clip-path="url(#dc)"/>
        ${t > T.drei ? `<text x="0" y="300" ${FONT} font-weight="900" font-size="120" text-anchor="middle" fill="${C.red}" stroke="#000" stroke-width="10" paint-order="stroke">${Math.max(1, 3 - Math.floor(drain * 3))} ${Math.max(1, 3 - Math.floor(drain * 3)) === 1 ? 'TAG' : 'TAGE'}</text>` : ''}
      </g>`;
    }
    return out + badge(t, T.t2, 2);
  });

  // 4 — Tip 3: split food into rations
  scene(T.t3, T.t4, t => {
    let s = Z.bgInterior();
    s += `<rect x="90" y="1290" width="900" height="40" rx="8" fill="#5a3f26"/><rect x="130" y="1330" width="30" height="300" fill="#3b2817"/><rect x="920" y="1330" width="30" height="300" fill="#3b2817"/>`;
    const sp = prog(t, T.teil + .1, T.teil + 1.6);
    s += at(540, 1290, 1.8, Z.foodPile(), `opacity="${1 - prog(sp, .1, .5)}"`);
    const N = 15;
    for (let i = 0; i < N; i++) {
      const p = ease(prog(sp, i / N * .6, i / N * .6 + .4)); if (p <= 0) continue;
      const tx = 210 + (i % 5) * 165, ty = 1150 - Math.floor(i / 5) * 90 + 140 - 140;
      const eat = t > T.auch + .2 && i >= N - Math.floor(prog(t, T.auch + .2, T.t4 - .2) * 11);
      if (eat) continue;
      s += Z.ration(lerp(540, tx, p), lerp(1230, ty + 120, p) - Math.sin(p * Math.PI) * 140, 1.7);
    }
    s += at(160, 1700, 1.7, Z.farmer({ armR: [100, 20], headTilt: -6 }));
    let out = s + vignette(.5);
    if (t > T.auch) {
      const day = 1 + Math.floor(prog(t, T.auch + .2, T.t4 - .2) * 29);
      out += `<g transform="translate(540,560)"><rect x="-200" y="-150" width="400" height="280" rx="20" fill="#e9e6dc"/><rect x="-200" y="-150" width="400" height="70" rx="20" fill="${C.red}"/>
        <text y="-95" ${FONT} font-weight="900" font-size="48" text-anchor="middle" fill="#fff">TAG</text>
        <text y="90" ${FONT} font-weight="900" font-size="170" text-anchor="middle" fill="#14151c">${day}</text></g>`;
    }
    return out + badge(t, T.t3, 3);
  });

  // 5 — Tip 4: fortify one house, board lower windows, sleep upstairs
  scene(T.t4, T.t5, t => {
    let s = Z.bgFarm({ id: 'g4', fire: fire(t) });
    const b = prog(t, T.vernagle, T.schlaf - .1);
    s += at(0, 1520, 1.1, Z.fence(1100));
    s += at(560, 1660, 1.55, Z.house({ boards: b }));
    s += grass(t, 1700, 30, '#1f2a19', 9);
    // highlight house
    const hp = prog(t, T.sichere, T.sichere + .4);
    if (hp > 0 && t < T.vernagle) s += `<rect x="260" y="880" width="600" height="800" rx="30" fill="none" stroke="${C.green}" stroke-width="12" opacity="${hp * (.7 + .3 * Math.sin(t * 8))}"/>
      <g transform="translate(860,880) scale(${back(hp)})"><circle r="60" fill="${C.green}"/><path d="M-26,0 l18,20 l34,-38" stroke="#0a0c12" stroke-width="14" fill="none" stroke-linecap="round"/></g>`;
    // not the yard
    const np = prog(t, T.nicht, T.nicht + .4);
    if (np > 0 && t < T.vernagle) s += `<g opacity="${np}"><rect x="30" y="1420" width="1020" height="440" rx="30" fill="${C.red}" opacity=".15" stroke="${C.red}" stroke-width="10" stroke-dasharray="40 20"/>
      <g transform="translate(150,1520) scale(${back(np)})"><circle r="60" fill="${C.red}"/><path d="M-24,-24 L24,24 M24,-24 L-24,24" stroke="#fff" stroke-width="14" stroke-linecap="round"/></g></g>`;
    // farmer hammering
    if (t > T.vernagle - .3 && t < T.schlaf) { const sw = Math.abs(Math.sin((t - T.vernagle) * 9)); s += at(200, 1870, 1.8, Z.farmer({ armR: [110 + sw * 50, 30], item: 'hammer', itemRot: -40 - sw * 40, headTilt: -12 }));
      if (sw > .95) s += `<text x="300" y="1440" ${FONT} font-weight="900" font-size="70" fill="#fff" opacity=".8">TOK!</text>`; }
    // sleep upstairs
    const zp = prog(t, T.schlaf, T.schlaf + .5);
    if (zp > 0) { s += `<g transform="translate(560,1240) scale(${back(zp)})"><path d="M0,60 V-60 M-40,-20 L0,-60 L40,-20" stroke="${C.accent}" stroke-width="18" fill="none" stroke-linecap="round"/></g>`;
      for (let i = 0; i < 3; i++) { const q = ((t - T.schlaf) * .8 + i / 3) % 1; s += `<text x="${400 + q * 60}" y="${1100 - q * 160}" ${FONT} font-weight="900" font-size="${50 + q * 30}" fill="#fff" opacity="${1 - q}">Z</text>`; } }
    const z = lerp(1, 1.05, prog(t, T.t4, T.t5));
    return cam(z, 540, 1300, s) + badge(t, T.t4, 4);
  });

  // 6 — Tip 5: no light, no generator at night; they see/hear for km
  scene(T.t5, T.t6, t => {
    if (t < T.licht2 - .1) {
      let s = Z.bgFarm({ id: 'g5', fire: fire(t) });
      const off = i => t > T.licht + .15 + i * .12;
      s += at(470, 1660, 1.55, Z.house({ boards: 1, lights: [!off(0), !off(1), !off(2), !off(3)] }));
      const gOn = t < T.gen + .25;
      s += at(900, 1720, 1.2, Z.generator({ on: gOn }));
      if (gOn) s += rings(900, 1640, t, '#fff', 3, 1.6, 150) + `<g transform="translate(${Math.sin(t * 60) * 3},0)"></g>`;
      s += grass(t, 1720, 30, '#1f2a19', 3);
      if (t > T.licht && t < T.licht + 1) s += `<rect width="1080" height="1920" fill="#000" opacity="${prog(t, T.licht, T.licht + .6) * .25}"/>`;
      if (!gOn) s += `<text x="900" y="1500" ${FONT} font-weight="900" font-size="64" text-anchor="middle" fill="${C.red}" opacity="${1 - prog(t, T.gen + .8, T.licht2)}">AUS</text>`;
      return cam(1, 540, 1300, s) + `<rect width="1080" height="1920" fill="#000" opacity="${off(3) ? .25 : 0}"/>` + badge(t, T.t5, 5);
    }
    // wide shot: a lit house attracts a crowd
    const lt = t - T.licht2, zp = ease(prog(lt, 0, 1.2));
    let s = Z.bgFarm({ id: 'g5b', fire: fire(t) });
    const hx = 700, hy = 1240;
    s += `<ellipse cx="${hx}" cy="${hy - 60}" rx="${120 + 20 * Math.sin(t * 5)}" ry="${100}" fill="${C.win}" opacity=".18"/>`;
    s += at(hx, hy, .38, Z.house({ lights: [1, 1, 1, 1] }));
    s += at(hx + 120, hy, .32, Z.generator({ on: true })) + rings(hx + 120, hy - 20, t, '#fff', 3, 1.5, 120);
    // crowd from horizon moving toward the light
    const mv = prog(lt, .6, 3);
    s += `<g transform="translate(${-200 + mv * 200},${1050 + mv * 90}) scale(${1 + mv * .3})">${Z.crowd(26, 700, 21, '#05070c', .28)}</g>`;
    s += `<path d="M${hx - 60},${hy - 60} L180,1030" stroke="${C.accent}" stroke-width="6" stroke-dasharray="20 14" opacity="${prog(lt, .3, .8)}"/>
      <text x="380" y="1100" ${FONT} font-weight="900" font-size="64" fill="${C.accent}" stroke="#000" stroke-width="8" paint-order="stroke" opacity="${prog(lt, .3, .8)}" transform="rotate(10 380 1100)">KM</text>`;
    return cam(lerp(1.6, 1.05, zp), lerp(hx, 540, zp), lerp(1180, 1100, zp), s) + badge(t, T.t5, 5);
  });

  // 7 — Tip 6: geese and dogs raise alarm
  scene(T.t6, T.tm, t => {
    let s = Z.bgFarm({ id: 'g6', fire: fire(t), dark: .2 });
    const eyes = prog(t, T.bevor + .2, T.bevor + .8);
    s += at(760, 1330, .7, Z.zombie({ phase: t * 1.5, reach: .6 }), `opacity="${eyes * .35}"`);
    if (eyes > 0) s += `<circle cx="765" cy="1203" r="6" fill="${C.zEye}" opacity="${eyes}"/><circle cx="757" cy="1203" r="5" fill="${C.zEye}" opacity="${eyes}"/>`;
    s += at(0, 1460, 1.3, Z.fence(1100));
    s += grass(t, 1500, 30, '#1f2a19', 5);
    const al = t > T.alarm, hiG = prog(t, T.gaense, T.gaense + .3), hiD = prog(t, T.hunde, T.hunde + .3);
    const gs = [[560, 1800], [740, 1830], [900, 1790]];
    gs.forEach(([x, y], i) => {
      const jit = al ? Math.sin(t * 30 + i) * 4 : 0;
      s += at(x + jit, y, 1.6 + hiG * .15 * (1 - prog(t, T.hunde, T.hunde + .3)), Z.goose({ alarm: al && Math.sin(t * 12 + i * 2) > -.3, peck: !al && Math.sin(t * 2 + i) > .4 }));
    });
    s += at(240, 1860, 1.8 + hiD * .15 * (1 - prog(t, T.alarm, T.alarm + .3)), Z.dog({ bark: al && Math.sin(t * 10) > 0, phase: t * 3, wag: !al }));
    if (al) s += rings(760, 1640, t, '#fff', 3, 1.8, 180) + rings(380, 1700, t + .3, '#fff', 3, 1.8, 150) +
      `<text x="560" y="1520" ${FONT} font-weight="900" font-size="${110 + Math.sin(t * 20) * 8}" fill="${C.accent}" stroke="#000" stroke-width="10" paint-order="stroke">!!!</text>`;
    const z = lerp(1, 1.1, prog(t, T.t6, T.tm));
    return cam(z, 540, 1400, s) + badge(t, T.t6, 6);
  });

  // 8 — Main rule: never open the gate; observe from afar; bitten ones ask for help
  scene(T.tm, T.du, t => {
    if (t < T.beob) {
      let s = Z.bgFarm({ id: 'g7', fire: fire(t) });
      const wave = Math.sin(t * 7) * 30;
      s += at(560, 1460, 1.55, stranger({ armR: [150 + wave, 20], armL: [-30, -20], mouthOpen: Math.sin(t * 9) > 0 }, 0) + bite(0));
      s += at(0, 1480, 1.4, Z.fence(1100, 120));
      s += at(540, 1500, 1.35, Z.gate(0, { locked: true }));
      const xp = prog(t, T.oeffne, T.oeffne + .35);
      if (xp > 0) s += `<g transform="translate(540,1330) scale(${back(xp)})"><circle r="150" fill="none" stroke="${C.red}" stroke-width="26"/><path d="M-106,106 L106,-106" stroke="${C.red}" stroke-width="26"/></g>`;
      s += grass(t, 1520, 30, '#1f2a19', 7);
      if (t > T.tm + .4) s += `<text x="560" y="1050" ${FONT} font-weight="900" font-size="90" text-anchor="middle" fill="#fff" stroke="#000" stroke-width="10" paint-order="stroke" opacity="${.6 + .4 * Math.sin(t * 6)}">HILFE!</text>`;
      return cam(1.05, 540, 1350, s) + badge(t, T.tm, '!');
    }
    // binocular view
    const lt = t - T.beob;
    const zoomArm = ease(prog(t, T.gebissen - .1, T.gebissen + .5));
    const infected = prog(t, T.hilfe, T.hilfe + .6);
    let inner = Z.bgFarm({ id: 'g7b', fire: fire(t) });
    const wave = Math.sin(t * 7) * 30;
    inner += at(540, 1460, 1.55, stranger({ armR: [150 + wave, 20], armL: [-30, -20], mouthOpen: Math.sin(t * 9) > 0 }, infected) + bite(t > T.gebissen + .4 ? 1 + Math.sin(t * 10) * .5 : 0));
    inner += at(0, 1480, 1.4, Z.fence(1100, 120)) + at(540, 1500, 1.35, Z.gate(0, { locked: true }));
    const sway = Math.sin(lt * 1.3) * 12;
    const cx = lerp(540, 540 - 39, zoomArm) + sway, cy = lerp(1230, 1460 - 177, zoomArm);
    const sc = lerp(2.2, 3.4, zoomArm) * (infected > 0 ? 1 + infected * .25 : 1);
    const fcx = infected > 0 ? lerp(cx, 540 + 10, infected) : cx, fcy = infected > 0 ? lerp(cy, 1460 - 290, infected) : cy;
    let out = `<defs><mask id="bino"><rect width="1080" height="1920" fill="#000"/><circle cx="350" cy="900" r="360" fill="#fff"/><circle cx="730" cy="900" r="360" fill="#fff"/></mask></defs>
      <rect width="1080" height="1920" fill="#000"/>
      <g mask="url(#bino)">${cam(sc, fcx, fcy, inner)}<rect width="1080" height="1920" fill="#3a6b4a" opacity=".12"/></g>
      <path d="M540,760 V1040 M400,900 H680" stroke="#fff" stroke-width="3" opacity=".35"/>`;
    // the farmer watching from upstairs (inset hint)
    out += `<text x="540" y="380" ${FONT} font-weight="900" font-size="58" text-anchor="middle" fill="#fff" opacity="${prog(lt, 0, .4)}" letter-spacing="4">AUS DER FERNE</text>`;
    return out;
  });

  // 9 — Months pass… then the geese scream… then silence
  scene(T.du, T.end + 5, t => {
    const months = prog(t, T.du, T.aber - .1);
    const darkness = prog(t, T.aber, T.aber + .8) * .45;
    let s = Z.bgFarm({ id: 'g8', fire: fire(t) * (1 - darkness), dark: darkness, crowdN: 0 });
    // moon phase cycling
    if (t < T.aber) { const ph = (months * 4) % 1; s += `<circle cx="${220 + Math.sin(months * 25) * 20}" cy="300" r="68" fill="#05070c"/><circle cx="${220 + Math.sin(months * 25) * 20 + Math.cos(ph * Math.PI * 2) * 130}" cy="300" r="70" fill="#0b0f1d"/>`; }
    s += at(820, 1262, .75, Z.house({ boards: 1 })) + at(230, 1240, .9, Z.barn());
    s += at(0, 1400, 1.2, Z.fence(1100)) + at(540, 1420, 1, Z.gate(0, { locked: true }));
    const scream = t > T.schreien && t < T.dann - .05;
    const silent = t >= T.dann - .05;
    // eyes in the darkness after silence
    if (silent) {
      const ep = prog(t, T.ploetz - .2, T.ploetz + .6);
      let q = 13; const r = () => (q = (q * 9301 + 49297) % 233280) / 233280;
      for (let i = 0; i < 14; i++) { const x = 80 + r() * 920, y = 1200 + r() * 180, o = clamp(ep * 3 - i * .15);
        if (o > 0) s += `<circle cx="${x}" cy="${y}" r="16" fill="${C.zEye}" opacity="${o * .15}"/><circle cx="${x}" cy="${y}" r="7" fill="${C.zEye}" opacity="${o}"/><circle cx="${x + 18}" cy="${y + 1}" r="6" fill="${C.zEye}" opacity="${o * .85}"/>`; }
    }
    s += grass(t, 1440, 30, '#1f2a19', 11);
    [[480, 1760], [660, 1800], [840, 1770]].forEach(([x, y], i) => {
      const jit = scream ? Math.sin(t * 34 + i) * 6 : 0;
      s += at(x + jit, y, 1.6, Z.goose({ alarm: scream && Math.sin(t * 14 + i * 2) > -.4, peck: !scream && !silent && Math.sin(t * 2 + i) > .4 }));
    });
    if (scream) s += rings(660, 1640, t, '#fff', 4, 2.2, 260) + `<text x="540" y="1460" ${FONT} font-weight="900" font-size="${130 + Math.sin(t * 25) * 10}" text-anchor="middle" fill="${C.accent}" stroke="#000" stroke-width="10" paint-order="stroke">!!!</text>`;
    // time-lapse counter
    let ov = '';
    if (t < T.aber) ov += `<text x="540" y="560" ${FONT} font-weight="900" font-size="120" text-anchor="middle" fill="#fff" stroke="#000" stroke-width="10" paint-order="stroke">TAG ${Math.floor(30 + eOut(months) * 150)}</text>`;
    const z = t < T.aber ? 1 : lerp(1, 1.25, ease(prog(t, T.aber, T.ploetz + .6)));
    let out = cam(z, 640, 1520, s);
    if (silent) out += `<rect width="1080" height="1920" fill="#000" opacity="${.35 + prog(t, T.ploetz + .5, T.end) * .65}"/>`;
    return out + ov;
  });

  // =================== SUBTITLES ===================
  const KEY = new Set(['Zombie-Apokalypse', 'Bauernhof', 'Stadt', 'Millionen', 'Wasser', 'Essen', 'Abstand', 'Tor', 'Tiere', 'Bewegung', 'Lärm', 'Brunnen', 'drei', 'Tage', 'Vorräte', 'Rationen', 'Haus', 'Hof', 'Fenster', 'oben', 'Licht', 'Generator', 'kilometerweit', 'Gänse', 'Hunde', 'Alarm', 'niemandem', 'Ferne', 'Monate', 'Nachts', 'schreien', 'verstummen']);
  const DANGER = new Set(['gefährlichsten', 'Infizierte', 'gebissen', 'Hilfe', 'plötzlich', 'kein']);
  const NUMW = new Set(['Erstens', 'Zweitens', 'Drittens', 'Viertens', 'Fünftens', 'Sechstens', 'Wichtigste']);
  const chunks = []; let cur = [];
  WORDS.forEach((w, i) => {
    if (w.w === '–') return;
    cur.push(w);
    const len = cur.map(x => x.w).join(' ').length;
    const nx = WORDS[i + 1];
    const brk = /[.,:…!?]$/.test(w.w) || len >= 13 || !nx || (nx && cur.map(x => x.w).join(' ').length + nx.w.length + 1 > 18) || (nx && nx.s - w.e > .45);
    if (brk) { chunks.push(cur); cur = []; }
  });
  function subtitles(t) {
    let ch = null;
    for (let i = 0; i < chunks.length; i++) { const c = chunks[i], st = c[0].s - .05, en = Math.min(chunks[i + 1] ? chunks[i + 1][0].s - .05 : 1e9, c[c.length - 1].e + .6); if (t >= st && t < en) { ch = c; break; } }
    if (!ch) return '';
    const txt = ch.map(w => w.w).join(' ');
    const fs = Math.min(104, 990 / (txt.length * .58));
    let sp = '';
    ch.forEach((w, i) => {
      const clean = w.w.replace(/[^\wäöüßÄÖÜ-]/g, '');
      const on = t >= w.s - .03, active = t >= w.s - .03 && t < w.e + .05;
      const col = DANGER.has(clean) ? C.red : KEY.has(clean) ? C.accent : NUMW.has(clean) ? C.accent : '#fff';
      sp += `<tspan fill="${col}" opacity="${on ? 1 : .0}" ${active ? `font-size="${fs * 1.1}"` : ''}>${(i ? ' ' : '') + w.w}</tspan>`;
    });
    const pop = back(prog(t, ch[0].s - .05, ch[0].s + .12));
    return `<g transform="translate(540,1560) scale(${.85 + .15 * pop})"><text x="0" y="0" ${FONT} font-weight="900" font-size="${fs}" text-anchor="middle" stroke="#000" stroke-width="${fs * .14}" stroke-linejoin="round" paint-order="stroke">${sp}</text></g>`;
  }

  window.frame = function (t) {
    let body = '';
    for (const sc of scenes) if (t >= sc.a && t < sc.b) { body = sc.fn(t);
      const fin = prog(t, sc.a, sc.a + .12); if (sc.a > 0 && fin < 1) body += `<rect width="1080" height="1920" fill="#000" opacity="${1 - fin}"/>`; break; }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><rect width="1080" height="1920" fill="#000"/>${body}${vignette(.55)}${subtitles(t)}</svg>`;
  };
})();
