import { alpha, useTheme } from '@mui/material';
import React from 'react';

const polarToCartesian = (ox: number, oy: number, r: number, a: number) => {
  const x = r * Math.sin(a) + ox;
  const y = - r * Math.cos(a) + oy;
  return [x, y] as const;
};

export type ClockIconProps = {
  className?: string;
  data: {
    a1: number,
    a2: number,
    isLight?: boolean,
  }[];
  renderText?: ({ x, y }: { x: number, y: number; }) => React.ReactNode;
};

export default function ClockIcon({ className = '', data, renderText }: ClockIconProps) {
  const PI = Math.PI;
  const theme = useTheme();
  const l = 100;
  const R = 600;
  const ox = 800;
  const oy = 800;
  const r1 = R - l;
  const r2 = R + l;
  const getArc = (a1: number, a2: number, isOuter = false, isLight = false) => {
    const r = isOuter ? (r2 + R) / 2 + 1 : (r1 + R) / 2 - 1;
    const [x1, y1] = polarToCartesian(ox, oy, r, a1);
    const [x2, y2] = polarToCartesian(ox, oy, r, a2);
    const isLarge = a2 - a1 > Math.PI ? 1 : 0;
    return (
      <g
        stroke={isLight ? alpha(theme.palette.success.light, 0.2) : theme.palette.success.main}
        strokeWidth={l} fill="none"
        key={`a1${a1}-a2${a2}-${isOuter}-${isLight}`}
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
    const ri = long ? r1 - l / 2 : r1 - l / 3;
    const ro = long ? r2 + l / 2 : r2 + l / 3;
    const [x1, y1] = polarToCartesian(ox, oy, ri, a);
    const [x2, y2] = polarToCartesian(ox, oy, ro, a);
    return (
      <line {...{ x1, x2, y1, y2 }} key={a} stroke={theme.palette.text.primary} strokeWidth={3} />
    );
  };
  const drawClock = () => (
    <g stroke={theme.palette.text.primary} strokeWidth={3} fill="none">
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
    if (a2_ <= 2 * PI) return getArc(a1, a2_, false, isLight);
    if (a1 >= 2 * PI) return getArc(a1, a2_, true, isLight);
    return (
      <>
        {getArc(a1, 2 * PI, false, isLight)}
        {getArc(2 * PI, a2_, true, isLight)}
      </>
    );
  };
  return (
    <svg className={className} width={250} viewBox='0 0 1600 1600'>
      {data.map(({ a1, a2, isLight }) => drawArcs(a1, a2, isLight))}
      {drawClock()}
      <g
        x={ox}
        textAnchor="middle"
        dominantBaseline="central"
        fill={theme.palette.text.primary}
        style={{ fontSize: 100 }}
      >
        {renderText?.({ x: ox, y: oy })}
      </g>
    </svg>
  );
}
