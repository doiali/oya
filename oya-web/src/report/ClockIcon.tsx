import { useTheme } from '@mui/material';

const polarToCartesian = (ox: number, oy: number, r: number, a: number) => {
  const x = r * Math.sin(a) + ox;
  const y = - r * Math.cos(a) + oy;
  return [x, y] as const;
};

export default function ClockIcon({ className = '' }) {
  const PI = Math.PI;
  const theme = useTheme();
  const l = 40;
  const R = 300;
  const ox = 500;
  const oy = 500;
  const r1 = R - l;
  const r2 = R + l;
  const getArc = (a1: number, a2: number, isOuter = false, isLight = false) => {
    const r = isOuter ? (r2 + R) / 2 + 1 : (r1 + R) / 2 - 1;
    const [x1, y1] = polarToCartesian(ox, oy, r, a1);
    const [x2, y2] = polarToCartesian(ox, oy, r, a2);
    const isLarge = a2 - a1 > Math.PI ? 1 : 0;
    return (
      <g
        stroke={isLight ? theme.palette.success.light : theme.palette.success.dark}
        strokeWidth={l} fill="none"
      >
        {
          (a1 === 0 || a1 === 2 * PI) && a2 - a1 >= 2 * PI
            ? <circle r={r} cx={ox} cy={oy} />
            : <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${isLarge} 1 ${x2} ${y2}`} />
        }
      </g>
    );
  };
  const drawLine = (a: number, long = false) => {
    const ri = long ? r1 - 20 : r1 - 10;
    const ro = long ? r2 + 20 : r2 + 10;
    const [x1, y1] = polarToCartesian(ox, oy, ri, a);
    const [x2, y2] = polarToCartesian(ox, oy, ro, a);
    return (
      <line {...{ x1, x2, y1, y2 }} key={a} stroke={theme.palette.text.primary} strokeWidth={1} />
    );
  };
  const drawClock = () => (
    <g stroke={theme.palette.text.primary} strokeWidth={1} fill="none">
      <circle r={R} cx={ox} cy={oy} />
      {[...Array(12)].map((v, i) => (
        drawLine(i * Math.PI / 6, i % 3 === 0)
      ))}
    </g>
  );
  const drawArcs = (a1: number, a2: number, isLight = false) => {
    let a2_ = a2;
    if (a2_ <= a1) return null;
    if (a1 >= 4 * PI) return null;
    if (a2_ >= 4 * PI) a2_ = 4 * PI;
    if (a2_ <= 2 * PI || a1 >= 2 * PI) return getArc(a1, a2_);
    return (
      <>
        {getArc(a1, 2 * PI, false, isLight)}
        {getArc(2 * PI, a2_, true, isLight)}
      </>
    );
  };
  return (
    <svg className={className} width={500} viewBox='0 0 1000 1000'>
      {drawArcs(0.5 * PI, 5 * PI)}
      {drawClock()}
    </svg>
  );
}
