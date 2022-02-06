import { ResponsiveSunburst } from '@nivo/sunburst';
import { Box } from '@mui/material';
import { useReportContext } from './ReportProvider';
import { generateTreeDataNivo } from './chartUtils';

export default function SunburstNivo() {
  const { atrm, activities } = useReportContext();
  const data = generateTreeDataNivo(atrm, activities);
  return (
    <Box sx={{ width: '100%', height: 700, maxWidth: 1700 }}>
      <ResponsiveSunburst
        data={data}
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        id="name"
        value="value"
        cornerRadius={2}
        borderColor={{ theme: 'background' }}
        colors={{ scheme: 'nivo' }}
        childColor={{
          from: 'color',
          modifiers: [
            [
              'brighter',
              0.1,
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
              1.4,
            ],
          ],
        }}
      />
    </Box>
  );
}
