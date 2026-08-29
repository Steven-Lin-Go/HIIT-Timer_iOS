import Svg, { Circle, G, Line } from 'react-native-svg';

import type { Tab } from '../stores/navStore';

// Tab bar icons drawn as SVG rather than Unicode symbols.
//
// The glyphs these replace (◷ ≣ ▦) render at wildly different visual weights at
// the same font size: one is a hairline circle, one three short rules, one a
// filled block. No font size setting can even that out, because the difference
// is in the characters themselves.
//
// Drawn here they share a stroke width, a cap style, and an optical box, so the
// three read as one set. The stroke is given in viewBox units, so it scales
// with the icon and the weight holds at any size.

interface Props {
  name: Tab;
  color: string;
  size: number;
}

export function TabIcon({ name, color, size }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {name === 'timer' ? <Stopwatch /> : name === 'workouts' ? <Dumbbell /> : <Bars />}
      </G>
    </Svg>
  );
}

// Stopwatch: dial, crown, and a hand at twelve.
function Stopwatch() {
  return (
    <G>
      <Circle cx={12} cy={13.5} r={7.5} />
      <Line x1={12} y1={6} x2={12} y2={3.5} />
      <Line x1={9.5} y1={3} x2={14.5} y2={3} />
      <Line x1={12} y1={13.5} x2={12} y2={9} />
    </G>
  );
}

// Dumbbell: bar with an inner and an outer plate at each end.
function Dumbbell() {
  return (
    <G>
      <Line x1={8} y1={12} x2={16} y2={12} />
      <Line x1={8} y1={6} x2={8} y2={18} />
      <Line x1={16} y1={6} x2={16} y2={18} />
      <Line x1={4.5} y1={8.5} x2={4.5} y2={15.5} />
      <Line x1={19.5} y1={8.5} x2={19.5} y2={15.5} />
    </G>
  );
}

// Bar chart: three columns on a baseline.
function Bars() {
  return (
    <G>
      <Line x1={4} y1={20} x2={20} y2={20} />
      <Line x1={7.5} y1={20} x2={7.5} y2={13} />
      <Line x1={12} y1={20} x2={12} y2={5.5} />
      <Line x1={16.5} y1={20} x2={16.5} y2={9.5} />
    </G>
  );
}
