// Pixel-art sprites defined as character grids. Each character maps to a color in the
// sprite's palette ('.' is transparent). initSprites() bakes every frame into an offscreen
// canvas once, plus an all-white "flash" copy used when an enemy is hit.
// All frames of one sprite must share the same width/height. Sprites face right by default.

const K = '#1a1c2c'; // outline

const PLAYER_PAL = { K, H: '#8f563b', S: '#f4c49c', B: '#3b5dc9', D: '#29366f', b: '#333c57' };
const PLAYER_TOP = [
  '...KKKK...',
  '..KHHHHK..',
  '.KHHHHHSK.',
  '.KHHSSKSK.',
  '.KHSSSSSK.',
  '..KKSSKK..',
  '.KBBBBBBK.',
  'KSBBBBBBSK',
  '.KBBBBBBK.',
];
const LEGS_IDLE = ['..KDDDDK..', '..KD..DK..', '..Kb..bK..'];
const LEGS_APART = ['..KDDDDK..', '.KD....DK.', '.Kb....bK.'];
const LEGS_TOGETHER = ['..KDDDDK..', '...KDDK...', '...KbbK...'];

const GRUNT_PAL = { K, G: '#38b764', g: '#257179', L: '#a7f070', W: '#f4f4f4' };
const RUNNER_PAL = { K, R: '#b13e53', r: '#5d275d', E: '#ffcd75' };
const TANK_PAL = { K, P: '#8b4fc0', p: '#4a2470', L: '#c08ae8', E: '#ff004d' };
const SHOOTER_PAL = { K, Y: '#ffcd75', y: '#ef7d57', E: '#73eff7' };
const SHOOTER_TOP = [
  '..KKKKKK..',
  '.KYYYYYYK.',
  'KYYKKKKYYK',
  'KYKEEEEKYK',
  'KYYKKKKYYK',
  '.KYYYYYYK.',
  '.KyyyyyyK.',
];
const TANK_TOP = [
  '....KKKKKK....',
  '..KKPPPPPPKK..',
  '.KPLLPPPPPPPK.',
  '.KPLPPPPPPPPK.',
  'KPPPKKPPKKPPPK',
  'KPPPKEPPKEPPPK',
  'KPPPPPPPPPPPPK',
  'KPPPKKKKKKPPPK',
  'KpPPPPPPPPPPpK',
  'KppPPPPPPPPppK',
  '.KppppppppppK.',
  '..KKppppppKK..',
];

const HEART = ['.RR.RR.', 'RWRRRRR', 'RRRRRRR', '.RRRRR.', '..RRR..', '...R...'];

const DEFS = {
  playerIdle: { pal: PLAYER_PAL, frames: [[...PLAYER_TOP, ...LEGS_IDLE]] },
  playerWalk: {
    pal: PLAYER_PAL,
    frames: [
      [...PLAYER_TOP, ...LEGS_APART],
      [...PLAYER_TOP, ...LEGS_IDLE],
      [...PLAYER_TOP, ...LEGS_TOGETHER],
      [...PLAYER_TOP, ...LEGS_IDLE],
    ],
  },
  // Pivot (grip) is at pixel (2, 2); muzzle ~8px along the barrel.
  gun: {
    pal: { K, L: '#94b0c2', G: '#566c86' },
    frames: [['.KKKKKKKK', 'KLLLLLLLK', 'KGGKKKKKK', 'KGGK.....', '.KK......']],
  },
  grunt: {
    pal: GRUNT_PAL,
    frames: [
      [
        '...KKKK...',
        '..KLLGGK..',
        '.KLGGGGGK.',
        'KGGWKGWKGK',
        'KGGWKGWKGK',
        'KGGGGGGGGK',
        'KgGGGGGGgK',
        '.KggggggK.',
        '..KKKKKK..',
      ],
      [
        '..........',
        '...KKKK...',
        '.KKLLGGKK.',
        'KLGGGGGGGK',
        'KGGWKGWKGK',
        'KGGWKGWKGK',
        'KgGGGGGGgK',
        'KggggggggK',
        '.KKKKKKKK.',
      ],
    ],
  },
  runner: {
    pal: RUNNER_PAL,
    frames: [
      ['..K..K..', '.KRKKRK.', 'KRRRRRRK', 'KRERRERK', 'KRRRRRRK', '.KrrrrK.', 'K.K..K.K', '........'],
      ['..K..K..', '.KRKKRK.', 'KRRRRRRK', 'KRERRERK', 'KRRRRRRK', '.KrrrrK.', '.K.KK.K.', '........'],
    ],
  },
  tank: {
    pal: TANK_PAL,
    frames: [
      [...TANK_TOP, '..KpK....KpK..', '..KKK....KKK..'],
      [...TANK_TOP, '...KpK..KpK...', '...KKK..KKK...'],
    ],
  },
  shooter: {
    pal: SHOOTER_PAL,
    frames: [
      [...SHOOTER_TOP, '..KyKKyK..', '..KK..KK..', '..........'],
      [...SHOOTER_TOP, '..KyKKyK..', '.KyK..KyK.', '.KK....KK.'],
    ],
  },
  heart: { pal: { R: '#e43b44', W: '#f4f4f4' }, frames: [HEART] },
  heartEmpty: { pal: { R: '#333c57', W: '#566c86' }, frames: [HEART] },
  bolt: {
    pal: { Y: '#ffcd75' },
    frames: [['..YY.', '.YY..', 'YYYY.', '..YY.', '.YY..', 'YY...']],
  },
};

const SPRITES = {};

function bake(rows, pal, flash) {
  const c = document.createElement('canvas');
  c.width = rows[0].length;
  c.height = rows.length;
  const g = c.getContext('2d');
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.') continue;
      g.fillStyle = flash ? '#f4f4f4' : pal[ch];
      g.fillRect(x, y, 1, 1);
    }
  });
  return c;
}

export function initSprites() {
  for (const [name, def] of Object.entries(DEFS)) {
    SPRITES[name] = {
      w: def.frames[0][0].length,
      h: def.frames[0].length,
      frames: def.frames.map((f) => bake(f, def.pal, false)),
      flash: def.frames.map((f) => bake(f, def.pal, true)),
    };
  }
}

export const getSprite = (name) => SPRITES[name];

// Draws frame `frame` (wraps around) centered on (x, y).
export function drawSprite(ctx, name, frame, x, y, { flipX = false, flash = false, scale = 1 } = {}) {
  const s = SPRITES[name];
  const list = flash ? s.flash : s.frames;
  const img = list[Math.abs(frame) % list.length];
  const w = s.w * scale;
  const h = s.h * scale;
  const dx = Math.round(x - w / 2);
  const dy = Math.round(y - h / 2);
  if (flipX) {
    ctx.save();
    ctx.translate(dx + w, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, w, h);
    ctx.restore();
  } else {
    ctx.drawImage(img, dx, dy, w, h);
  }
}

// Pixel-style oval shadow centered at (x, y) with half-width rw.
export function drawShadow(ctx, x, y, rw) {
  x = Math.round(x);
  y = Math.round(y);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(x - rw + 1, y - 1, rw * 2 - 2, 1);
  ctx.fillRect(x - rw, y, rw * 2, 1);
  ctx.fillRect(x - rw + 1, y + 1, rw * 2 - 2, 1);
}
