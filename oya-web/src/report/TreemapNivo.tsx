import { Box } from '@mui/material';
import { useReportContext } from './ReportProvider';
import { ResponsiveTreeMap } from '@nivo/treemap';
import { generateTreeDataNivo } from './chartUtils';

export default function TreemapNivo() {
  const { atrm, activities } = useReportContext();
  const data = generateTreeDataNivo(atrm, activities);
  return (
    <Box sx={{ width: '100%', height: 700, maxWidth: 1700 }}>
      <ResponsiveTreeMap
        data={data}
        identity="name"
        value="value"
        label={(node) => {
          return `${node.id}`;
        }}
        enableParentLabel={false}
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        labelSkipSize={12}
        labelTextColor={{
          from: 'color',
          modifiers: [
            [
              'darker',
              1.2,
            ],
          ],
        }}
        parentLabelPosition="left"
        parentLabelTextColor={{
          from: 'color',
          modifiers: [
            [
              'darker',
              2,
            ],
          ],
        }}
        borderColor={{
          from: 'color',
          modifiers: [
            [
              'darker',
              0.1,
            ],
          ],
        }}
      />
    </Box>
  );
}
