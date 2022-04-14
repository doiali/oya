import { useTheme } from '@mui/material';

/**
 * time should be in minutes
 */
export default function PieIcon({ time = 0, className = '' }) {
  const theme = useTheme();
  const a1 = time / 360 * Math.PI;
  const a2 = a1 > 2 * Math.PI ? a1 - 2 * Math.PI : 0;
  const R = 125;
  const ox = 160;
  const oy = 160;
  const getArc = (a: number, isBold = false) => {
    if (!a) return null;
    const x = R * Math.sin(a) + ox;
    const y = - R * Math.cos(a) + oy;
    const isLarge = a > Math.PI ? 1 : 0;
    return (
      <g
        stroke={isBold ? theme.palette.success.dark : theme.palette.success.light}
        strokeWidth={50} fill="none"
      >
        {(a < 2 * Math.PI)
          ? <path d={`M ${ox} ${oy - R} A ${R} ${R} 0 ${isLarge} 1 ${x} ${y}`} />
          : <circle r={R} cx={ox} cy={oy} />
        }
      </g>
    );
  };
  return (
    <svg className={className} width={50} viewBox='0 0 320 320'>
      {getArc(a1, false)}
      {getArc(a2, true)}
    </svg>
  );
}
