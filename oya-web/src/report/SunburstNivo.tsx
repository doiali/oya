import { ResponsiveSunburst, SunburstCustomLayerProps } from '@nivo/sunburst';
import { Box, Button, useTheme, Link as MuiLink } from '@mui/material';
import { useReportContext } from './ReportProvider';
import { generateTreeDataNivo, TreeDataNivo } from './chartUtils';
import { useEffect, useMemo, useState } from 'react';
import TooltipNivo from './TooltipNivo';
import { getDeltaStringOfRange as ts } from '../utils';
import { Link } from 'react-router-dom';
import Widget from '../Widget';

const CenteredMetric = ({
  centerX, centerY, data,
}: SunburstCustomLayerProps<TreeDataNivo> & { data: TreeDataNivo; }) => {
  const { activity, report, path, nodeId } = data;
  const theme = useTheme();
  if (!activity || !report) return null;
  const renderRow = (name: string, value: string | number) => (
    <tspan x={centerX} dy={22}>
      {name}: <tspan style={{ fontWeight: 'bold' }}>{value}</tspan>
    </tspan>
  );
  const dy = 22;
  return (
    <text
      x={centerX}
      y={centerY - 85}
      textAnchor="middle"
      dominantBaseline="central"
      fill={theme.palette.text.primary}
    >
      <tspan x={centerX} dy={0} style={{ fontSize: 32, fontWeight: 'bold' }}>{activity.name}</tspan>
      <tspan x={centerX} dy={dy}> </tspan>
      {renderRow('days', `${report.days} of ${report.allDays}`)}
      {renderRow('total time', ts(report.time))}
      {renderRow('avg per all days', ts(report.avgPerAllDays))}
      {renderRow('avg per days', ts(report.avgPerDays))}
      {renderRow('occurance', report.occurance.toString())}
      <tspan x={centerX} dy={dy}>{path.map(a => a.name).join(' > ') ?? ''}</tspan>
      <MuiLink component={Link} to={`/activities/${nodeId}/times`}>
        <tspan fill={theme.palette.primary.main} x={centerX} dy={dy}>view chart</tspan>
      </MuiLink>
    </text>
  );
};

const Legends = ({
  nodes,
}: SunburstCustomLayerProps<TreeDataNivo>) => {
  const data = nodes.filter(n => n.depth === 1).map(n => (
    { ...n, label: n.data.activity?.name ?? '' }
  ));
  const theme = useTheme();
  const l = 25;
  let y = -l; // centerY - (data.length) * l - l * 1.5;
  return (
    <g fontSize={theme.typography.fontSize} fill={theme.palette.text.primary}>
      {data.map(d => {
        y = y + l + 10;
        return (
          <g key={d.id}>
            <rect x={0} y={y} width={l} height={l} fill={d.color} />
            <text x={l + 10} y={y + l / 2 + 4}>
              {d.label}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export default function SunburstNivo() {
  const { tATRM, activities } = useReportContext();
  const originalData = useMemo(() => generateTreeDataNivo(tATRM, activities), [tATRM, activities]);
  const [data, setData] = useState(originalData);
  useEffect(() => {
    setData(originalData);
  }, [originalData]);
  const [isTop, setIsTop] = useState(false);
  const [isLeft, setIsLeft] = useState(true);
  return (
    <Widget title="Overall report">
      <Box sx={{ width: '100%', height: 700, maxWidth: 1700 }}>
        <Button disabled={originalData === data} onClick={() => setData(originalData)}>
          reset
        </Button>
        <ResponsiveSunburst
          layers={[
            'arcs', 'arcLabels',
            (props) => <CenteredMetric {...props} data={data} />,
            (props) => <Legends {...props} />,
          ]}
          onClick={(datum) => {
            setData(datum.data);
          }}
          onMouseMove={(props, e) => {
            if (e.clientY > window.innerHeight / 2 && isTop) setIsTop(false);
            if (e.clientY < window.innerHeight / 2 && !isTop) setIsTop(true);
            if (e.clientX > window.innerWidth / 2 && isLeft) setIsLeft(false);
            if (e.clientX < window.innerWidth / 2 && !isLeft) setIsLeft(true);
          }}
          tooltip={(props) => <TooltipNivo {...props} {...{ isTop, isLeft }} />}
          data={data}
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          id="nodeId"
          value="value"
          cornerRadius={2}
          borderColor={{
            from: 'color', modifiers: [[
              'darker',
              1.5,
            ]],
          }}
          colors={{ scheme: 'nivo' }}
          childColor={{
            from: 'color',
            modifiers: [
              [
                'brighter',
                0.2,
              ],
            ],
          }}
          enableArcLabels={true}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{
            from: 'color',
            modifiers: [
              [
                'darker',
                3,
              ],
            ],
          }}
        />
      </Box>
    </Widget>
  );
}
