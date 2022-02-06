import { ResponsiveSunburst, SunburstCustomLayerProps } from '@nivo/sunburst';
import { Box, Button } from '@mui/material';
import { useReportContext } from './ReportProvider';
import { generateTreeDataNivo, TreeDataNivo } from './chartUtils';
import { useEffect, useMemo, useState } from 'react';
import TooltipNivo from './TooltipNivo';
import { getDeltaStringOfRange as ts } from '../utils';

const CenteredMetric = ({
  centerX, centerY, data,
}: SunburstCustomLayerProps<TreeDataNivo> & { data: TreeDataNivo; }) => {
  const { activity, report, prefix } = data;
  if (!activity || !report) return null;
  const renderRow = (name: string, value: string | number) => (
    <tspan x={centerX} dy={22}>
      {name}: <tspan style={{ fontWeight: 'bold' }}>{value}</tspan>
    </tspan>
  );
  return (
    <text
      x={centerX}
      y={centerY - 75}
      textAnchor="middle"
      dominantBaseline="central"
    >
      <tspan x={centerX} dy={0} style={{ fontSize: 32, fontWeight: 'bold' }}>{activity.name}</tspan>
      <tspan x={centerX} dy={22}> </tspan>
      {renderRow('days', `${report.days} of ${report.allDays}`)}
      {renderRow('total time', ts(report.time))}
      {renderRow('avg per all days', ts(report.avgPerAllDays))}
      {renderRow('avg per days', ts(report.avgPerDays))}
      {renderRow('occurance', report.occurance.toString())}
      <tspan x={centerX} dy={22}>{prefix ?? ''}</tspan>
    </text>
  );
};

export default function SunburstNivo() {
  const { atrm, activities } = useReportContext();
  const originalData = useMemo(() => generateTreeDataNivo(atrm, activities), [atrm, activities]);
  const [data, setData] = useState(originalData);
  useEffect(() => {
    setData(originalData);
  }, [originalData]);
  const [isTop, setIsTop] = useState(false);
  const [isLeft, setIsLeft] = useState(true);
  return (
    <Box sx={{ width: '100%', height: 700, maxWidth: 1700 }}>
      <Button disabled={originalData === data} onClick={() => setData(originalData)}>
        reset
      </Button>
      <ResponsiveSunburst
        layers={['arcs', 'arcLabels', (props) => <CenteredMetric {...props} data={data} />]}
        onClick={(datum) => {
          if (datum.data.children?.length)
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
        id="prefix"
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
  );
}
