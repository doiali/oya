import { ResponsiveSunburst } from '@nivo/sunburst';
import { Box, Button } from '@mui/material';
import { useReportContext } from './ReportProvider';
import { generateTreeDataNivo } from './chartUtils';
import { useEffect, useMemo, useState } from 'react';

export default function SunburstNivo() {
  const { atrm, activities } = useReportContext();
  const originalData = useMemo(() => generateTreeDataNivo(atrm, activities), [atrm, activities]);
  const [data, setData] = useState(originalData);
  useEffect(() => {
    setData(originalData);
  }, [originalData]);

  return (
    <Box sx={{ width: '100%', height: 700, maxWidth: 1700 }}>
      <Button disabled={originalData === data} onClick={() => setData(originalData)}>
        reset
      </Button>
      <ResponsiveSunburst
        onClick={(datum) => {
          setData(datum.data);
        }}
        data={data}
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        id="name"
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
