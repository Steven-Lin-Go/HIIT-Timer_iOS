import Svg, { G, Line, Polygon } from 'react-native-svg';

type TransportIconName = 'previous' | 'pause' | 'resume' | 'next';

interface Props {
  color: string;
  name: TransportIconName;
  size?: number;
}

// A single SVG family replaces mixed Unicode media symbols, which otherwise
// vary in weight, baseline and emoji rendering across iOS versions.
export function TransportIcon({ color, name, size = 26 }: Props) {
  return (
    <Svg testID={`transport-icon-${name}`} width={size} height={size} viewBox="0 0 24 24">
      {name === 'pause' ? (
        <G stroke={color} strokeLinecap="round" strokeWidth={2.4}>
          <Line x1={8.5} y1={6} x2={8.5} y2={18} />
          <Line x1={15.5} y1={6} x2={15.5} y2={18} />
        </G>
      ) : name === 'resume' ? (
        <Polygon points="8,5.5 19,12 8,18.5" fill={color} />
      ) : name === 'previous' ? (
        <G fill={color}>
          <Polygon points="11,6 4.5,12 11,18" />
          <Polygon points="19,6 12.5,12 19,18" />
        </G>
      ) : (
        <G fill={color}>
          <Polygon points="5,6 11.5,12 5,18" />
          <Polygon points="13,6 19.5,12 13,18" />
        </G>
      )}
    </Svg>
  );
}
