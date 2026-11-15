// Zombie-farm visual library: every asset is drawn as an SVG string.
// Local origin of figures = point between the feet (ground contact).
(function (root) {
  const C = {
    sky0: '#070a14', sky1: '#141a2e', sky2: '#2a1a24',
    glow: '#ff6a2b', glowSoft: '#c2410c', ember: '#ffb020',
    hill: '#10160f', field: '#1a2416', field2: '#222e1b', dirt: '#2b2419',
    wood: '#5a3f26', woodD: '#3b2817', woodL: '#7a5634',
    stone: '#4d5157', stoneD: '#33363b',
    skin: '#e0b48c', skinD: '#c08f66',
    denim: '#2c3e57', jacket: '#b5832f', jacketD: '#8a6122', cap: '#4a3420',
    zSkin: '#8fa37a', zSkinD: '#6c7d5b', zShirt: '#4a4f45', zPants: '#2f3330', zEye: '#e9ffb0',
    blood: '#7a1f1f', white: '#f2efe6', goose: '#e9e6dc', gooseD: '#bdb8aa', beak: '#e8892b',
    dog: '#5b3b24', dogD: '#3e2817', cow: '#d8d2c4', cowSpot: '#2a2622',
    win: '#ffcf6b', winOff: '#0d1220', accent: '#ffb020', red: '#ff4d3d', green: '#9be15d'
  };

  const limb = (x1, y1, x2, y2, w, col) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;

  // Two-segment limb from a joint with angles in degrees (0 = straight down)
  function arm(sx, sy, a1, a2, l1, l2, w, col, hand) {
    const r = Math.PI / 180;
    const ex = sx + Math.sin(a1 * r) * l1, ey = sy + Math.cos(a1 * r) * l1;
    const hx = ex + Math.sin((a1 + a2) * r) * l2, hy = ey + Math.cos((a1 + a2) * r) * l2;
    return { svg: limb(sx, sy, ex, ey, w, col) + limb(ex, ey, hx, hy, w * 0.92, col) +
      (hand ? `<circle cx="${hx}" cy="${hy}" r="${w * 0.55}" fill="${hand}"/>` : ''), hx, hy };
  }

  // ---------- Survivor (farmer) ----------
  // p: {armL:[a1,a2], armR:[a1,a2], legL, legR, headTilt, item:'hammer'|'lantern'|'bucket'|null, finger:bool, mouthOpen}
  function farmer(p = {}) {
    const aL = p.armL || [12, 8], aR = p.armR || [-12, -8];
    const lL = p.legL ?? 6, lR = p.legR ?? -6;
    const legL = arm(-9, -88, lL, -lL * 0.3, 46, 44, 15, C.denim);
    const legR = arm(9, -88, lR, -lR * 0.3, 46, 44, 15, C.denim);
    const boots = [legL, legR].map(l => `<ellipse cx="${l.hx + 4}" cy="${l.hy + 2}" rx="12" ry="6" fill="${C.woodD}"/>`).join('');
    const back = arm(-22, -150, aL[0], aL[1], 34, 32, 13, C.jacketD, C.skinD);
    const front = arm(22, -150, aR[0], aR[1], 34, 32, 13, C.jacket, C.skin);
    let item = '';
    if (p.item === 'hammer') item = `<g transform="translate(${front.hx},${front.hy}) rotate(${p.itemRot ?? -30})"><rect x="-3" y="-34" width="6" height="40" fill="${C.woodL}"/><rect x="-12" y="-42" width="24" height="11" rx="2" fill="#8d939b"/></g>`;
    if (p.item === 'bucket') item = `<g transform="translate(${front.hx},${front.hy})"><path d="M-14,4 L14,4 L10,30 L-10,30 Z" fill="#6d747c"/><path d="M-14,4 Q0,-14 14,4" fill="none" stroke="#9aa1a8" stroke-width="2"/></g>`;
    if (p.item === 'lantern') item = `<g transform="translate(${front.hx},${front.hy})"><circle cy="20" r="${p.lit ? 60 : 0}" fill="${C.win}" opacity=".15"/><rect x="-8" y="4" width="16" height="22" rx="3" fill="${p.lit ? C.win : '#3a3f47'}" stroke="#222" stroke-width="2"/></g>`;
    if (p.item === 'binoculars') item = '';
    const tilt = p.headTilt || 0;
    const mouth = p.mouthOpen ? `<ellipse cx="7" cy="-174" rx="4" ry="3" fill="#3a1f14"/>` : `<line x1="2" y1="-173" x2="11" y2="-173" stroke="#5a3424" stroke-width="2.5" stroke-linecap="round"/>`;
    const head = `<g transform="rotate(${tilt} 0 -165)">
      <rect x="-7" y="-168" width="14" height="14" fill="${C.skinD}"/>
      <circle cx="0" cy="-185" r="21" fill="${C.skin}"/>
      <path d="M-14,-178 Q-2,-162 16,-176 L16,-170 Q0,-158 -14,-172 Z" fill="#6b4a32" opacity=".55"/>
      <circle cx="9" cy="-188" r="2.6" fill="#1b1410"/>
      <path d="M3,-196 L14,-194" stroke="#3a2a1c" stroke-width="3" stroke-linecap="round"/>
      ${mouth}
      <path d="M-22,-192 Q-20,-214 2,-212 Q22,-210 22,-194 Z" fill="${C.cap}"/>
      <path d="M8,-196 L36,-193 L22,-199 Z" fill="${C.cap}"/>
      ${p.binoculars ? `<rect x="10" y="-196" width="18" height="12" rx="3" fill="#1f2328"/><rect x="10" y="-184" width="18" height="10" rx="3" fill="#1f2328"/>` : ''}
    </g>`;
    const torso = `<path d="M-25,-154 Q-27,-160 -18,-162 L18,-162 Q27,-160 25,-154 L23,-92 Q0,-84 -23,-92 Z" fill="${C.jacket}"/>
      <path d="M0,-160 L0,-90" stroke="${C.jacketD}" stroke-width="2"/>
      <rect x="-23" y="-100" width="46" height="9" fill="#3b2a1a"/>`;
    const finger = p.finger ? `<g><line x1="${front.hx}" y1="${front.hy}" x2="${front.hx}" y2="${front.hy - 12}" stroke="${C.skin}" stroke-width="5" stroke-linecap="round"/></g>` : '';
    return `<g class="farmer">${back.svg}${legL.svg}${legR.svg}${boots}${torso}${head}${front.svg}${finger}${item}</g>`;
  }

  // ---------- Infected ----------
  function zombie(p = {}) {
    const ph = p.phase || 0; // walk phase in radians
    const sw = Math.sin(ph) * 16;
    const legL = arm(-9, -86, sw, 6, 44, 42, 14, C.zPants);
    const legR = arm(9, -86, -sw, 6, 44, 42, 14, C.zPants);
    const reach = p.reach ?? 1;
    const aL = arm(-20, -146, 95 * reach + 10 * (1 - reach) + sw * 0.2, -10, 32, 32, 12, C.zSkinD, C.zSkinD);
    const aR = arm(20, -146, 85 * reach - 10 * (1 - reach) - sw * 0.2, 5, 32, 32, 12, C.zSkin, C.zSkin);
    const tilt = (p.headTilt ?? 18) + Math.sin(ph * 0.5) * 4;
    const head = `<g transform="rotate(${tilt} 0 -160)">
      <circle cx="0" cy="-180" r="20" fill="${C.zSkin}"/>
      <path d="M-18,-190 Q-8,-206 6,-200 Q14,-206 18,-192 Q8,-198 -4,-194 Z" fill="#2b2a24"/>
      <circle cx="7" cy="-182" r="3.4" fill="${C.zEye}"/><circle cx="-4" cy="-183" r="2.6" fill="${C.zEye}" opacity=".8"/>
      <path d="M-2,-168 L12,-170 L8,-164 Z" fill="#2a1414"/>
      <path d="M-12,-176 l6,3" stroke="${C.blood}" stroke-width="2"/>
    </g>`;
    const torso = `<path d="M-23,-150 Q-24,-158 -15,-159 L15,-159 Q24,-158 23,-150 L22,-96 L14,-90 L8,-97 L0,-88 L-8,-96 L-15,-89 L-22,-96 Z" fill="${C.zShirt}"/>
      <path d="M-8,-140 l6,10 l-4,8" stroke="${C.blood}" stroke-width="4" fill="none" opacity=".8"/>`;
    return `<g class="zombie">${aL.svg}${legL.svg}${legR.svg}${torso}${head}${aR.svg}</g>`;
  }

  // Distant infected silhouette crowd (for horizon), seeded
  function crowd(n, w, seed = 1, col = '#05070c', scale = 0.35) {
    let s = seed; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    let out = '';
    for (let i = 0; i < n; i++) {
      const x = rnd() * w, sc = scale * (0.7 + rnd() * 0.6), t = (rnd() - .5) * 30;
      out += `<g transform="translate(${x},${rnd() * 14}) scale(${sc})">
        <rect x="-14" y="-150" width="28" height="66" rx="8" fill="${col}"/>
        <circle cx="0" cy="-172" r="17" fill="${col}" transform="rotate(${t} 0 -150)"/>
        <line x1="-8" y1="-88" x2="-12" y2="0" stroke="${col}" stroke-width="12" stroke-linecap="round"/>
        <line x1="8" y1="-88" x2="12" y2="0" stroke="${col}" stroke-width="12" stroke-linecap="round"/>
        <line x1="10" y1="-142" x2="52" y2="-130" stroke="${col}" stroke-width="10" stroke-linecap="round"/>
        <line x1="-10" y1="-142" x2="38" y2="-124" stroke="${col}" stroke-width="10" stroke-linecap="round"/>
      </g>`;
    }
    return out;
  }

  // ---------- Animals ----------
  function goose(p = {}) {
    const neck = p.alarm ? -40 : (p.peck ? 60 : 0); // alarm = neck stretched up, peck = down
    const beakOpen = p.alarm ? 1 : 0;
    const wing = p.alarm ? -25 : 0;
    return `<g class="goose">
      <line x1="-6" y1="-18" x2="-8" y2="0" stroke="${C.beak}" stroke-width="4"/>
      <line x1="8" y1="-18" x2="10" y2="0" stroke="${C.beak}" stroke-width="4"/>
      <ellipse cx="0" cy="-32" rx="34" ry="20" fill="${C.goose}"/>
      <path d="M-34,-36 L-48,-46 L-40,-30 Z" fill="${C.goose}"/>
      <path d="M-14,-38 Q4,-${50 - wing} 24,-34 Q4,-22 -14,-38 Z" fill="${C.gooseD}" transform="rotate(${wing} -14 -38)"/>
      <g transform="rotate(${neck} 22 -40)">
        <path d="M18,-44 Q28,-64 24,-84 L36,-86 Q40,-62 30,-38 Z" fill="${C.goose}"/>
        <circle cx="30" cy="-88" r="10" fill="${C.goose}"/>
        <circle cx="33" cy="-91" r="2" fill="#111"/>
        <path d="M38,-${90 + beakOpen * 3} L54,-${88 + beakOpen * 4} L39,-86 Z" fill="${C.beak}"/>
        <path d="M38,-86 L52,-${84 - beakOpen * 4} L38,-82 Z" fill="#c76a1c"/>
      </g>
    </g>`;
  }

  function dog(p = {}) {
    const bark = p.bark ? 1 : 0, ph = p.phase || 0, sw = Math.sin(ph) * 14;
    const leg = (x, a) => arm(x, -40, a, 0, 20, 20, 9, C.dogD).svg;
    return `<g class="dog">
      ${leg(-30, sw)}${leg(26, -sw)}
      <path d="M-44,-50 Q-62,-70 -58,-84" stroke="${C.dog}" stroke-width="8" stroke-linecap="round" fill="none" transform="rotate(${p.wag ? Math.sin(ph * 3) * 15 : 0} -44 -50)"/>
      <ellipse cx="-6" cy="-52" rx="44" ry="18" fill="${C.dog}"/>
      ${leg(-24, -sw)}${leg(32, sw)}
      <g transform="rotate(${bark ? -12 : 0} 34 -60)">
        <path d="M28,-62 Q32,-88 52,-86 Q66,-84 76,-74 L74,${-66 + bark * 6} Q60,-62 46,-56 Z" fill="${C.dog}"/>
        ${bark ? `<path d="M60,-66 L76,-60 L60,-60 Z" fill="#2a1410"/>` : ''}
        <path d="M40,-86 L36,-104 L52,-90 Z" fill="${C.dogD}"/>
        <circle cx="56" cy="-78" r="2.6" fill="#111"/>
        <circle cx="76" cy="-73" r="3.6" fill="#111"/>
      </g>
    </g>`;
  }

  function cow(p = {}) {
    const ph = p.phase || 0, sw = Math.sin(ph) * 10;
    const leg = (x, a) => arm(x, -50, a, 0, 26, 24, 12, C.cow).svg;
    return `<g class="cow">
      ${leg(-44, sw)}${leg(38, -sw)}
      <rect x="-62" y="-104" width="118" height="58" rx="26" fill="${C.cow}"/>
      <path d="M-30,-104 Q-14,-80 -36,-62 Q-50,-76 -46,-100 Z" fill="${C.cowSpot}"/>
      <path d="M18,-98 Q36,-90 26,-70 Q10,-76 8,-94 Z" fill="${C.cowSpot}"/>
      ${leg(-34, -sw)}${leg(46, sw)}
      <path d="M-62,-96 Q-76,-80 -70,-60" stroke="${C.cow}" stroke-width="5" fill="none"/>
      <g transform="translate(60,-96)">
        <rect x="-6" y="-14" width="40" height="34" rx="12" fill="${C.cow}"/>
        <rect x="16" y="2" width="22" height="20" rx="8" fill="#d79a8c"/>
        <path d="M0,-14 L-8,-26 M22,-14 L28,-26" stroke="#cfc6a8" stroke-width="5" stroke-linecap="round"/>
        <circle cx="16" cy="-4" r="2.6" fill="#111"/>
      </g>
    </g>`;
  }

  // ---------- Objects ----------
  // Gate: open 0 (closed) .. 1 (fully open). Origin at ground center, width ~320
  function gate(open = 0, p = {}) {
    const panel = (dir) => {
      const sx = 1 - open * 0.85; // perspective squash to fake swing
      const bars = [0, 1, 2, 3, 4].map(i => `<rect x="${dir < 0 ? -150 + i * 30 : 6 + i * 30}" y="-150" width="22" height="150" fill="${i % 2 ? C.wood : C.woodL}"/>`).join('');
      const brace = dir < 0 ? `<path d="M-148,-20 L-10,-130" stroke="${C.woodD}" stroke-width="12"/>` : `<path d="M10,-130 L148,-20" stroke="${C.woodD}" stroke-width="12"/>`;
      return `<g transform="translate(${dir * 156},0) scale(${sx},1) translate(${-dir * 156},0)">${bars}
        <rect x="${dir < 0 ? -152 : 4}" y="-128" width="148" height="12" fill="${C.woodD}"/>
        <rect x="${dir < 0 ? -152 : 4}" y="-40" width="148" height="12" fill="${C.woodD}"/>${brace}</g>`;
    };
    const lock = open === 0 && p.locked ? `<rect x="-10" y="-96" width="20" height="24" rx="3" fill="#8d939b"/><path d="M-6,-96 Q0,-110 6,-96" fill="none" stroke="#8d939b" stroke-width="4"/>` : '';
    return `<g class="gate">
      <rect x="-172" y="-200" width="18" height="200" fill="${C.woodD}"/>
      <rect x="154" y="-200" width="18" height="200" fill="${C.woodD}"/>
      ${panel(-1)}${panel(1)}${lock}
    </g>`;
  }

  function fence(w, h = 110) {
    let s = '';
    for (let x = 0; x < w; x += 56) s += `<rect x="${x}" y="${-h}" width="12" height="${h}" fill="${C.woodD}"/>`;
    s += `<rect x="0" y="${-h + 18}" width="${w}" height="10" fill="${C.wood}"/><rect x="0" y="${-h + 62}" width="${w}" height="10" fill="${C.wood}"/>`;
    return `<g class="fence">${s}</g>`;
  }

  function well(p = {}) {
    const crank = p.crank || 0;
    return `<g class="well">
      <rect x="-80" y="-200" width="12" height="130" fill="${C.woodD}"/>
      <rect x="68" y="-200" width="12" height="130" fill="${C.woodD}"/>
      <path d="M-104,-196 L0,-250 L104,-196 Z" fill="#4a2a1e"/><path d="M-104,-196 L104,-196 L96,-186 L-96,-186 Z" fill="#33201a"/>
      <rect x="-70" y="-160" width="140" height="8" fill="${C.wood}"/>
      <line x1="0" y1="-156" x2="0" y2="${-120 + (p.rope ?? 0)}" stroke="#bfa98a" stroke-width="2"/>
      <path d="M-12,${-120 + (p.rope ?? 0)} L12,${-120 + (p.rope ?? 0)} L9,${-100 + (p.rope ?? 0)} L-9,${-100 + (p.rope ?? 0)} Z" fill="#6d747c"/>
      <g transform="translate(80,-156) rotate(${crank})"><line x1="0" y1="0" x2="0" y2="22" stroke="#8d939b" stroke-width="5"/><line x1="0" y1="22" x2="14" y2="22" stroke="#8d939b" stroke-width="5"/></g>
      <path d="M-86,-84 L86,-84 L80,0 L-80,0 Z" fill="${C.stone}"/>
      ${[0, 1, 2].map(r => [0, 1, 2, 3, 4].map(c => `<rect x="${-80 + c * 34 + (r % 2) * 16}" y="${-80 + r * 26}" width="30" height="22" rx="4" fill="${C.stoneD}" opacity=".7"/>`).join('')).join('')}
      <ellipse cx="0" cy="-84" rx="86" ry="12" fill="${C.stoneD}"/><ellipse cx="0" cy="-84" rx="70" ry="8" fill="#05070c"/>
      ${p.water ? `<ellipse cx="0" cy="-84" rx="${60 * p.water}" ry="${6 * p.water}" fill="#3e7fb0" opacity=".7"/>` : ''}
    </g>`;
  }

  // House: 2 floors. p.lights: [ul,ur,dl,dr] booleans; p.boards: 0..1 lower windows boarded
  function house(p = {}) {
    const L = p.lights || [0, 0, 0, 0], b = p.boards ?? 0;
    const win = (x, y, on) => `<rect x="${x}" y="${y}" width="70" height="80" fill="${on ? C.win : C.winOff}"/>
      ${on ? `<rect x="${x - 30}" y="${y - 30}" width="130" height="140" fill="${C.win}" opacity=".08"/>` : ''}
      <path d="M${x + 35},${y} V${y + 80} M${x},${y + 40} H${x + 70}" stroke="#2a1d14" stroke-width="5"/>
      <rect x="${x}" y="${y}" width="70" height="80" fill="none" stroke="#2a1d14" stroke-width="6"/>`;
    const boards = (x, y) => {
      let s = '';
      const k = Math.ceil(b * 3);
      for (let i = 0; i < k; i++) {
        const prog = Math.min(1, b * 3 - i);
        s += `<g opacity="${prog}"><rect x="${x - 12}" y="${y + 8 + i * 26}" width="94" height="18" fill="${C.woodL}" stroke="${C.woodD}" stroke-width="2" transform="rotate(${i % 2 ? 6 : -6} ${x + 35} ${y + 17 + i * 26})"/>
          <circle cx="${x - 2}" cy="${y + 17 + i * 26}" r="2.5" fill="#222"/><circle cx="${x + 72}" cy="${y + 17 + i * 26}" r="2.5" fill="#222"/></g>`;
      }
      return s;
    };
    return `<g class="house">
      <rect x="40" y="-470" width="40" height="80" fill="#3a2a22"/>
      <path d="M-200,-330 L0,-480 L200,-330 Z" fill="#2c1c1a"/>
      <path d="M-216,-326 L0,-490 L216,-326 L200,-326 L0,-470 L-200,-326 Z" fill="#45261f"/>
      <rect x="-180" y="-330" width="360" height="330" fill="#5b4636"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => `<line x1="-180" y1="${-320 + i * 30}" x2="180" y2="${-320 + i * 30}" stroke="#4a382b" stroke-width="3"/>`).join('')}
      <rect x="-180" y="-178" width="360" height="10" fill="#3e2e22"/>
      ${win(-130, -300, L[0])}${win(60, -300, L[1])}
      ${win(-130, -140, L[2])}${win(60, -140, L[3])}
      ${boards(-130, -140)}${boards(60, -140)}
      <rect x="-30" y="-120" width="60" height="120" fill="#2a1d14"/>
      ${b > 0.5 ? `<rect x="-38" y="-90" width="76" height="16" fill="${C.woodL}" transform="rotate(-8 0 -82)"/><rect x="-38" y="-50" width="76" height="16" fill="${C.woodL}" transform="rotate(7 0 -42)"/>` : ''}
    </g>`;
  }

  function barn() {
    return `<g class="barn">
      <path d="M-170,-220 L-120,-300 L120,-300 L170,-220 L170,0 L-170,0 Z" fill="#4a1d18"/>
      <path d="M-170,-220 L-120,-300 L120,-300 L170,-220 Z" fill="#2e1412"/>
      <rect x="-70" y="-170" width="140" height="170" fill="#3a1512"/>
      <path d="M-70,-170 L70,0 M70,-170 L-70,0" stroke="#5e2a22" stroke-width="10"/>
      <rect x="-70" y="-170" width="140" height="170" fill="none" stroke="#5e2a22" stroke-width="10"/>
    </g>`;
  }

  function generator(p = {}) {
    const on = p.on;
    return `<g class="generator">
      <rect x="-70" y="-90" width="140" height="80" rx="8" fill="#a8432b"/>
      <rect x="-56" y="-76" width="70" height="52" rx="4" fill="#2b2f35"/>
      ${[0, 1, 2, 3].map(i => `<rect x="-50" y="${-70 + i * 12}" width="58" height="6" fill="#40464e"/>`).join('')}
      <circle cx="40" cy="-50" r="12" fill="#2b2f35"/><circle cx="40" cy="-50" r="5" fill="${on ? C.green : C.red}"/>
      <rect x="-76" y="-14" width="152" height="10" rx="3" fill="#2b2f35"/>
      <rect x="-64" y="-4" width="14" height="6" fill="#111"/><rect x="50" y="-4" width="14" height="6" fill="#111"/>
      ${on ? `<path d="M-70,-90 q-10,-20 0,-40 q10,-20 0,-40" stroke="#888" stroke-width="5" fill="none" opacity=".4"/>` : ''}
    </g>`;
  }

  function foodPile(p = {}) {
    return `<g class="food">
      <rect x="-120" y="-70" width="110" height="70" fill="${C.woodL}" stroke="${C.woodD}" stroke-width="4"/>
      <path d="M-120,-35 H-10" stroke="${C.woodD}" stroke-width="4"/>
      <path d="M0,0 Q-6,-80 30,-90 Q66,-80 60,0 Z" fill="#b59b6a"/><path d="M18,-88 Q30,-102 42,-88" stroke="#7a6640" stroke-width="5" fill="none"/>
      ${[0, 1, 2].map(i => `<g transform="translate(${80 + i * 34},0)"><rect x="-13" y="-48" width="26" height="48" rx="5" fill="#d9e3ea" opacity=".85"/><rect x="-13" y="-30" width="26" height="22" fill="${['#c0392b', '#d98e04', '#6a994e'][i]}"/><rect x="-14" y="-54" width="28" height="9" rx="2" fill="#8d939b"/></g>`).join('')}
      ${[0, 1].map(i => `<g transform="translate(${-90 + i * 40},-70)"><rect x="-14" y="-34" width="28" height="34" rx="3" fill="#8d939b"/><rect x="-14" y="-24" width="28" height="12" fill="#c75b39"/></g>`).join('')}
    </g>`;
  }

  // one ration package
  function ration(x, y, s = 1) {
    return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-30" y="-36" width="60" height="36" rx="4" fill="#9c8455" stroke="#5a4a2a" stroke-width="3"/><path d="M-30,-18 H30 M0,-36 V0" stroke="#5a4a2a" stroke-width="3"/></g>`;
  }

  // ---------- Backgrounds (1080x1920) ----------
  function skyDefs(id = 'b') {
    return `<defs>
      <linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${C.sky0}"/><stop offset=".55" stop-color="${C.sky1}"/><stop offset="1" stop-color="${C.sky2}"/></linearGradient>
      <radialGradient id="${id}glow" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="${C.glow}" stop-opacity=".85"/><stop offset=".35" stop-color="${C.glowSoft}" stop-opacity=".35"/><stop offset="1" stop-color="${C.glowSoft}" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}moon" cx=".5" cy=".5" r=".5"><stop offset=".6" stop-color="#e7e2cf"/><stop offset="1" stop-color="#e7e2cf" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.field2}"/><stop offset="1" stop-color="#0b0f0a"/></linearGradient>
      <radialGradient id="${id}vig" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient>
    </defs>`;
  }

  function stars(n, seed = 3) {
    let s = seed; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    let o = ''; for (let i = 0; i < n; i++) o += `<circle cx="${rnd() * 1080}" cy="${rnd() * 700}" r="${0.8 + rnd() * 1.8}" fill="#cfd6ff" opacity="${0.2 + rnd() * 0.6}"/>`;
    return o;
  }

  // City skyline at horizon, glowing; `fire` 0..1 flicker
  function skyline(y, fire = 0.5, seed = 7) {
    let s = seed; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    let o = '', x = 520;
    while (x < 1080) { const w = 24 + rnd() * 50, h = 30 + rnd() * 120; o += `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="#0c0a10"/>`;
      if (rnd() > .6) o += `<rect x="${x + w * .3}" y="${y - h + 10}" width="5" height="5" fill="${C.ember}" opacity=".7"/>`; x += w + 2; }
    o += `<path d="M640,${y - 120} q-30,-80 20,-160 q40,-60 0,-140" stroke="#1d1418" stroke-width="60" fill="none" opacity=".55" stroke-linecap="round"/>`;
    o += `<path d="M900,${y - 100} q40,-90 -10,-170 q-30,-60 20,-130" stroke="#1d1418" stroke-width="50" fill="none" opacity=".45" stroke-linecap="round"/>`;
    o += `<ellipse cx="780" cy="${y}" rx="260" ry="${30 + fire * 16}" fill="${C.glow}" opacity="${0.25 + fire * 0.2}"/>`;
    return o;
  }

  function bgFarm(p = {}) {
    const id = p.id || 'f', fire = p.fire ?? .5, night = p.dark ?? 0;
    return `${skyDefs(id)}
      <rect width="1080" height="1920" fill="url(#${id}sky)"/>
      ${stars(120)}
      <circle cx="220" cy="300" r="70" fill="url(#${id}moon)" opacity=".85"/>
      <ellipse cx="780" cy="1000" rx="700" ry="380" fill="url(#${id}glow)" opacity="${0.6 + fire * 0.4}"/>
      ${skyline(1000, fire)}
      <path d="M0,980 Q260,930 520,990 T1080,975 L1080,1060 L0,1060 Z" fill="${C.hill}"/>
      <g transform="translate(0,1040)">${crowd(p.crowdN ?? 0, 1080, 11, '#06080b', 0.22)}</g>
      <rect x="0" y="1040" width="1080" height="880" fill="url(#${id}ground)"/>
      ${[0, 1, 2, 3, 4, 5].map(i => `<path d="M0,${1080 + i * i * 22} L1080,${1070 + i * i * 22}" stroke="#2a3622" stroke-width="${2 + i}" opacity=".5"/>`).join('')}
      <path d="M380,1920 Q520,1300 560,1060 L600,1060 Q640,1300 820,1920 Z" fill="${C.dirt}" opacity=".7"/>
      ${night ? `<rect width="1080" height="1920" fill="#000" opacity="${night}"/>` : ''}
    `;
  }

  function bgCity(p = {}) {
    const id = p.id || 'c', fire = p.fire ?? .7;
    let s = 5; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    let b = '', x = -20;
    while (x < 1100) { const w = 90 + rnd() * 120, h = 500 + rnd() * 700; b += `<rect x="${x}" y="${1300 - h}" width="${w}" height="${h + 700}" fill="#0b0b12"/>`;
      for (let wy = 1300 - h + 30; wy < 1260; wy += 60) for (let wx = x + 14; wx < x + w - 20; wx += 34) if (rnd() > .8) b += `<rect x="${wx}" y="${wy}" width="14" height="22" fill="${rnd() > .5 ? C.ember : '#ff6a2b'}" opacity="${.3 + rnd() * .5}"/>`;
      x += w + 6; }
    return `${skyDefs(id)}
      <rect width="1080" height="1920" fill="#120a0e"/>
      <ellipse cx="540" cy="1300" rx="900" ry="900" fill="url(#${id}glow)"/>
      <path d="M200,900 q-80,-200 40,-400 q100,-200 -20,-450" stroke="#1d1418" stroke-width="140" fill="none" opacity=".6" stroke-linecap="round"/>
      <path d="M820,800 q90,-220 -30,-420 q-80,-160 40,-380" stroke="#1d1418" stroke-width="120" fill="none" opacity=".55" stroke-linecap="round"/>
      ${b}
      <rect x="0" y="1300" width="1080" height="620" fill="#0a0809"/>
      <g transform="translate(0,1560)">${crowd(40, 1080, 4, '#000', 0.6)}</g>
      <g transform="translate(0,1760)">${crowd(26, 1080, 9, '#000', 0.9)}</g>
    `;
  }

  // Interior at night (attic / upstairs room)
  function bgInterior(p = {}) {
    return `<rect width="1080" height="1920" fill="#120f0d"/>
      <path d="M0,0 L540,-200 L1080,0 L1080,1920 L0,1920 Z" fill="#1d1712"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => `<line x1="${i * 98}" y1="0" x2="${i * 98}" y2="1400" stroke="#17120e" stroke-width="6"/>`).join('')}
      <rect x="0" y="1400" width="1080" height="520" fill="#2a2018"/>
      ${[0, 1, 2, 3, 4].map(i => `<line x1="0" y1="${1420 + i * 100}" x2="1080" y2="${1420 + i * 100}" stroke="#1d1611" stroke-width="5"/>`).join('')}
      <g transform="translate(700,500)"><rect width="260" height="320" fill="#0b1020"/>
        <circle cx="200" cy="80" r="26" fill="#e7e2cf" opacity=".6"/>
        <rect y="290" width="260" height="30" fill="${C.glow}" opacity=".25"/>
        <path d="M130,0 V320 M0,160 H260" stroke="#2a1d14" stroke-width="12"/><rect width="260" height="320" fill="none" stroke="#2a1d14" stroke-width="16"/></g>
      <rect x="0" y="0" width="1080" height="1920" fill="url(#ivig)"/>
      <defs><radialGradient id="ivig" cx=".5" cy=".55" r=".7"><stop offset=".4" stop-opacity="0"/><stop offset="1" stop-opacity=".8"/></radialGradient></defs>`;
  }

  root.ZF = { C, farmer, zombie, crowd, goose, dog, cow, gate, fence, well, house, barn, generator, foodPile, ration, bgFarm, bgCity, bgInterior, skyDefs, stars };
})(typeof window !== 'undefined' ? window : globalThis);
