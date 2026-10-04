import Svg, { G, Line } from 'react-native-svg';

interface Props {
  color: string;
  size?: number;
}

// The 4pt stroke is twice the standard 2pt icon weight used elsewhere, making
// this session-ending control easy to find without reducing its 44pt hit area.
export function CloseIcon({ color, size = 24 }: Props) {
  return (
    <Svg testID="run-close-icon" width={size} height={size} viewBox="0 0 24 24">
      <G stroke={color} strokeLinecap="round" strokeWidth={4}>
        <Line x1={6.5} y1={6.5} x2={17.5} y2={17.5} />
        <Line x1={17.5} y1={6.5} x2={6.5} y2={17.5} />
      </G>
    </Svg>
  );
}
