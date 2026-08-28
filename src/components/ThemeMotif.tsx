import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import { useSettingsStore } from '../stores/settingsStore';
import { PALETTES, type ThemeName } from '../theme/palettes';

// Decorative vector artwork that gives each theme its character beyond color:
// the gym-energy diagonals of Fitness, the sun and fronds of Bohemia, the ink
// landscape of Zen, and the Scandinavian plants of Natural. Drawn in SVG rather
// than shipped as bitmaps so the artwork re-colors with the palette and costs
// nothing in bundle size.
//
// `hero` fills the lower band of the timer screens; `corner` is a small
// ornament for the denser list/settings screens. Both are purely decorative --
// they render behind content, never on top of it.

type Variant = 'hero' | 'corner';

interface Props {
  variant?: Variant;
  /** Overrides the active theme; used by the settings-screen previews. */
  theme?: ThemeName;
  /** Multiplies the palette motifOpacity, e.g. to dim it under a photo. */
  opacityScale?: number;
}

const HERO_W = 320;
const HERO_H = 220;
const CORNER_SIZE = 120;

// Almond leaf, stem at the origin, tip at (0, -40).
const LEAF = 'M0 0 C 13 -12, 15 -29, 0 -40 C -15 -29, -13 -12, 0 0 Z';
// Narrower bamboo blade.
const BLADE = 'M0 0 C 8 -15, 9 -31, 0 -44 C -9 -31, -8 -15, 0 0 Z';

export function ThemeMotif({ variant = 'hero', theme, opacityScale = 1 }: Props) {
  const active = useSettingsStore((s) => s.theme);
  const name = theme ?? active;
  const c = PALETTES[name] ?? PALETTES.fitness;
  const opacity = Math.max(0, Math.min(1, c.motifOpacity * opacityScale));

  const art = useMemo(() => {
    const hero = variant === 'hero';
    const w = hero ? HERO_W : CORNER_SIZE;
    const h = hero ? HERO_H : CORNER_SIZE;
    const draw = hero ? HERO[name] : CORNER_ART[name];
    return (
      <Svg
        width="100%"
        height="100%"
        viewBox={'0 0 ' + w + ' ' + h}
        preserveAspectRatio={hero ? 'xMidYMax slice' : 'xMaxYMin meet'}
      >
        {draw(c.motifInk, c.motifSoft)}
      </Svg>
    );
  }, [c.motifInk, c.motifSoft, name, variant]);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }]}>
      {art}
    </View>
  );
}

type Draw = (ink: string, soft: string) => React.ReactNode;

// --- Hero artwork -----------------------------------------------------------

const HERO: Record<ThemeName, Draw> = {
  // Gym floor: rack silhouettes, plate stacks, and diagonal speed lines.
  fitness: (ink, soft) => (
    <G>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <Line
          key={'d' + i}
          x1={-40 + i * 58}
          y1={HERO_H}
          x2={40 + i * 58}
          y2={HERO_H - 150}
          stroke={soft}
          strokeWidth={10}
          opacity={0.35}
        />
      ))}
      <Polygon points={'0,' + HERO_H + ' 0,150 34,138 34,' + HERO_H} fill={soft} />
      <Polygon points={'34,' + HERO_H + ' 34,116 46,116 46,' + HERO_H} fill={soft} />
      <Rect x={16} y={104} width={62} height={9} rx={4} fill={soft} />
      <Polygon points={'242,' + HERO_H + ' 242,128 276,120 276,' + HERO_H} fill={soft} />
      <Rect x={228} y={112} width={78} height={9} rx={4} fill={soft} />
      {[0, 1, 2].map((i) => (
        <Circle key={'p' + i} cx={104 + i * 26} cy={HERO_H - 26} r={22 - i * 3} fill={soft} opacity={0.9} />
      ))}
      <Path d="M188 124 l26 -46 -9 32 20 -4 -30 54 8 -36 z" fill={ink} opacity={0.85} />
      <Rect x={0} y={HERO_H - 6} width={HERO_W} height={6} fill={ink} opacity={0.5} />
    </G>
  ),

  // Sunset arch over hills, framed by fronds.
  bohemia: (ink, soft) => (
    <G>
      {[62, 48, 34].map((r, i) => (
        <Path
          key={'sun' + i}
          d={'M ' + (160 - r) + ' 132 A ' + r + ' ' + r + ' 0 0 1 ' + (160 + r) + ' 132'}
          fill="none"
          stroke={ink}
          strokeWidth={i === 0 ? 4 : 2.5}
          opacity={0.75 - i * 0.15}
        />
      ))}
      <Path
        d="M0 152 Q 70 108, 138 150 Q 190 178, 240 140 Q 288 108, 320 148 L320 220 L0 220 Z"
        fill={soft}
        opacity={0.55}
      />
      <Path
        d="M0 178 Q 88 148, 168 180 Q 250 210, 320 174 L320 220 L0 220 Z"
        fill={ink}
        opacity={0.35}
      />
      <G transform="translate(34 214) scale(1.15)">
        <Path d="M0 0 C -6 -34, -2 -62, 8 -86" fill="none" stroke={soft} strokeWidth={3} />
        {[0, 1, 2, 3].map((i) => (
          <G
            key={'lf' + i}
            transform={
              'translate(' + (1 - i * 1.6) + ' ' + (-16 - i * 19) + ') rotate(' + (-38 - i * 6) + ') scale(' + (0.62 - i * 0.07) + ')'
            }
          >
            <Path d={LEAF} fill={soft} />
          </G>
        ))}
        {[0, 1, 2].map((i) => (
          <G
            key={'rf' + i}
            transform={
              'translate(' + (3 + i * 1.4) + ' ' + (-24 - i * 20) + ') rotate(' + (34 + i * 7) + ') scale(' + (0.56 - i * 0.07) + ')'
            }
          >
            <Path d={LEAF} fill={ink} opacity={0.6} />
          </G>
        ))}
      </G>
      <G transform="translate(292 216) scale(1.05)">
        <Path d="M0 0 C 8 -30, 6 -58, -6 -80" fill="none" stroke={ink} strokeWidth={3} opacity={0.6} />
        {[0, 1, 2, 3].map((i) => (
          <G
            key={'rr' + i}
            transform={
              'translate(' + (1 + i * 1.2) + ' ' + (-15 - i * 18) + ') rotate(' + (40 - i * 5) + ') scale(' + (0.6 - i * 0.07) + ')'
            }
          >
            <Path d={LEAF} fill={soft} />
          </G>
        ))}
      </G>
    </G>
  ),

  // Ink-wash landscape: layered peaks, still water, stacked stones.
  zen: (ink, soft) => (
    <G>
      <Path d="M0 148 L52 96 L86 126 L124 74 L176 148 Z" fill={soft} opacity={0.45} />
      <Path d="M132 152 L188 88 L226 124 L262 92 L320 152 Z" fill={ink} opacity={0.3} />
      <Path d="M0 158 L44 128 L92 158 Z" fill={ink} opacity={0.22} />
      <Rect x={0} y={156} width={HERO_W} height={2} fill={ink} opacity={0.35} />
      {[0, 1, 2, 3].map((i) => (
        <Ellipse
          key={'w' + i}
          cx={196}
          cy={186}
          rx={30 + i * 26}
          ry={6 + i * 4}
          fill="none"
          stroke={ink}
          strokeWidth={1.4}
          opacity={0.34 - i * 0.06}
        />
      ))}
      <G transform="translate(74 196)">
        <Ellipse cx={0} cy={0} rx={30} ry={11} fill={ink} opacity={0.62} />
        <Ellipse cx={-2} cy={-17} rx={21} ry={9} fill={ink} opacity={0.72} />
        <Ellipse cx={1} cy={-31} rx={13} ry={7} fill={ink} opacity={0.82} />
      </G>
      <G transform="translate(288 34)">
        <Path d="M0 0 C -10 34, -14 66, -8 96" fill="none" stroke={ink} strokeWidth={2.4} opacity={0.6} />
        {[0, 1, 2, 3].map((i) => (
          <G
            key={'bl' + i}
            transform={
              'translate(' + (-2 - i * 2.4) + ' ' + (18 + i * 22) + ') rotate(' + (112 + i * 16) + ') scale(' + (0.5 - i * 0.05) + ')'
            }
          >
            <Path d={BLADE} fill={ink} opacity={0.55} />
          </G>
        ))}
      </G>
    </G>
  ),

  // Scandinavian corner: wood horizon, potted plants, soft shapes.
  ikea: (ink, soft) => (
    <G>
      <Rect x={0} y={162} width={HERO_W} height={HERO_H - 162} fill={soft} opacity={0.45} />
      <Line x1={0} y1={162} x2={HERO_W} y2={162} stroke={soft} strokeWidth={2.5} />
      {[0, 1, 2].map((i) => (
        <Line
          key={'fl' + i}
          x1={0}
          y1={180 + i * 16}
          x2={HERO_W}
          y2={180 + i * 16}
          stroke={soft}
          strokeWidth={1.2}
          opacity={0.5}
        />
      ))}
      <G transform="translate(52 162)">
        <Path d="M-20 0 L20 0 L15 38 L-15 38 Z" fill={soft} />
        <Path d="M0 0 C -4 -26, -2 -44, 2 -58" fill="none" stroke={ink} strokeWidth={2.4} />
        {[0, 1, 2].map((i) => (
          <G
            key={'pl' + i}
            transform={
              'translate(' + (-1 - i) + ' ' + (-14 - i * 16) + ') rotate(' + (-44 - i * 8) + ') scale(' + (0.6 - i * 0.09) + ')'
            }
          >
            <Path d={LEAF} fill={ink} opacity={0.75} />
          </G>
        ))}
        {[0, 1, 2].map((i) => (
          <G
            key={'pr' + i}
            transform={
              'translate(' + (1 + i) + ' ' + (-18 - i * 16) + ') rotate(' + (42 + i * 8) + ') scale(' + (0.58 - i * 0.09) + ')'
            }
          >
            <Path d={LEAF} fill={ink} opacity={0.6} />
          </G>
        ))}
      </G>
      <G transform="translate(268 162)">
        <Path d="M-16 0 L16 0 L12 30 L-12 30 Z" fill={soft} />
        <Path d="M0 0 C 4 -20, 3 -34, -1 -46" fill="none" stroke={ink} strokeWidth={2} opacity={0.8} />
        {[0, 1].map((i) => (
          <G
            key={'ql' + i}
            transform={
              'translate(' + (-1 - i) + ' ' + (-12 - i * 14) + ') rotate(' + (-40 - i * 10) + ') scale(' + (0.5 - i * 0.1) + ')'
            }
          >
            <Path d={LEAF} fill={ink} opacity={0.6} />
          </G>
        ))}
        {[0, 1].map((i) => (
          <G
            key={'qr' + i}
            transform={
              'translate(' + (1 + i) + ' ' + (-15 - i * 14) + ') rotate(' + (38 + i * 10) + ') scale(' + (0.48 - i * 0.1) + ')'
            }
          >
            <Path d={LEAF} fill={ink} opacity={0.5} />
          </G>
        ))}
      </G>
      <Circle cx={176} cy={112} r={30} fill={soft} opacity={0.35} />
    </G>
  ),
};

// --- Corner ornaments -------------------------------------------------------

const CORNER_ART: Record<ThemeName, Draw> = {
  fitness: (ink, soft) => (
    <G>
      {[0, 1, 2, 3].map((i) => (
        <Line key={i} x1={40 + i * 22} y1={0} x2={4 + i * 22} y2={72} stroke={soft} strokeWidth={7} opacity={0.5} />
      ))}
      <Path d="M84 14 l20 -12 -7 24 15 -3 -23 40 6 -27 -13 3 z" fill={ink} opacity={0.8} />
    </G>
  ),
  bohemia: (ink, soft) => (
    <G transform="translate(104 12)">
      {[40, 30, 20].map((r, i) => (
        <Path
          key={i}
          d={'M ' + -r + ' 34 A ' + r + ' ' + r + ' 0 0 1 ' + r + ' 34'}
          fill="none"
          stroke={i % 2 === 0 ? ink : soft}
          strokeWidth={2.4}
          opacity={0.7 - i * 0.12}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <G key={'l' + i} transform={'translate(' + (-30 + i * 30) + ' 56) rotate(' + (-24 + i * 24) + ') scale(0.42)'}>
          <Path d={LEAF} fill={soft} />
        </G>
      ))}
    </G>
  ),
  zen: (ink) => (
    <G transform="translate(96 8)">
      <Path d="M0 0 C -12 30, -16 62, -6 92" fill="none" stroke={ink} strokeWidth={2.2} opacity={0.55} />
      {[0, 1, 2].map((i) => (
        <G
          key={i}
          transform={
            'translate(' + (-3 - i * 3) + ' ' + (20 + i * 24) + ') rotate(' + (115 + i * 18) + ') scale(' + (0.46 - i * 0.06) + ')'
          }
        >
          <Path d={BLADE} fill={ink} opacity={0.5} />
        </G>
      ))}
    </G>
  ),
  ikea: (ink, soft) => (
    <G transform="translate(88 18)">
      <Circle cx={16} cy={20} r={26} fill={soft} opacity={0.4} />
      <Path d="M0 74 C -4 52, -2 34, 2 20" fill="none" stroke={ink} strokeWidth={2.2} opacity={0.75} />
      {[0, 1, 2].map((i) => (
        <G
          key={'a' + i}
          transform={'translate(' + (-1 - i) + ' ' + (56 - i * 16) + ') rotate(' + (-42 - i * 8) + ') scale(' + (0.5 - i * 0.08) + ')'}
        >
          <Path d={LEAF} fill={ink} opacity={0.6} />
        </G>
      ))}
      {[0, 1].map((i) => (
        <G
          key={'b' + i}
          transform={'translate(' + (1 + i) + ' ' + (50 - i * 16) + ') rotate(' + (40 + i * 8) + ') scale(' + (0.46 - i * 0.08) + ')'}
        >
          <Path d={LEAF} fill={ink} opacity={0.45} />
        </G>
      ))}
    </G>
  ),
};
