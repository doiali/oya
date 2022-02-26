import { Box } from '@mui/material';
import { useReportContext } from './ReportProvider';
import { ResponsiveTreeMap } from '@nivo/treemap';
import { generateTreeDataNivo } from './chartUtils';

export default function TreemapNivo() {
  const { tATRM, activities } = useReportContext();
  const data = generateTreeDataNivo(tATRM, activities);
  return (
    <Box sx={{ width: '100%', height: 700, maxWidth: 1700 }}>
      <ResponsiveTreeMap
        theme={{
          fontSize: 14,
          tooltip: {
            container: {
              fontSize: 14,
            },
          },
        }}
        data={data}
        identity="nodeId"
        value="value"
        label={(node) => {
          return `${node.data.activity?.name ?? ''}`;
        }}
        enableParentLabel={false}
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        labelSkipSize={80}
        labelTextColor={{
          from: 'color',
          modifiers: [
            [
              'darker',
              3,
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
              1.5,
            ],
          ],
        }}
      />
    </Box>
  );
}
