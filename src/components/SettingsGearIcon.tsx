import Svg, { Circle, Path } from 'react-native-svg';

interface Props {
  color: string;
  size?: number;
}

const TEETH = 12;
const CENTER = 16;

// Broad, squared teeth match the largest gear in the supplied reference.
// Six points per tooth keep the tip flat instead of producing a star shape.
function makeGearPath(tipRadius: number, rootRadius: number) {
  const pitch = (Math.PI * 2) / TEETH;
  const offsets = [-0.5, -0.32, -0.26, 0.26, 0.32, 0.5];
  const radii = [rootRadius, rootRadius, tipRadius, tipRadius, rootRadius, rootRadius];
  const points: [number, number][] = [];

  for (let tooth = 0; tooth < TEETH; tooth += 1) {
    const toothCenter = -Math.PI / 2 + tooth * pitch;
    offsets.forEach((offset, index) => {
      const angle = toothCenter + offset * pitch;
      const radius = radii[index]!;
      points.push([
        CENTER + Math.cos(angle) * radius,
        CENTER + Math.sin(angle) * radius,
      ]);
    });
  }

  return points
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(' ') + ' Z';
}

const GEAR_PATH = makeGearPath(13.7, 11.15);
const HOLE_RADIUS = 7.25;
const HOLE_PATH = [
  `M ${CENTER + HOLE_RADIUS} ${CENTER}`,
  `A ${HOLE_RADIUS} ${HOLE_RADIUS} 0 1 0 ${CENTER - HOLE_RADIUS} ${CENTER}`,
  `A ${HOLE_RADIUS} ${HOLE_RADIUS} 0 1 0 ${CENTER + HOLE_RADIUS} ${CENTER}`,
  'Z',
].join(' ');

/** Single solid gear based on the largest gear in the user's reference. */
export function SettingsGearIcon({ color, size = 33.6 }: Props) {
  return (
    <Svg testID="settings-gear-icon" width={size} height={size} viewBox="0 0 32 32">
      <Path
        clipRule="evenodd"
        d={`${GEAR_PATH} ${HOLE_PATH}`}
        fill={color}
        fillRule="evenodd"
      />
      <Circle
        cx={CENTER}
        cy={CENTER}
        r={HOLE_RADIUS - 0.7}
        fill="none"
        stroke={color}
        strokeWidth={1.05}
      />
    </Svg>
  );
}
