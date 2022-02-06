import { ResponsiveSunburst } from '@nivo/sunburst';
import { Box, Button } from '@mui/material';
import { useReportContext } from './ReportProvider';
import { generateTreeDataNivo } from './chartUtils';
import { useEffect, useMemo, useState } from 'react';
import TooltipNivo from './TooltipNivo';

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
