import { Box } from '@mui/material';
import { Treemap } from 'react-vis';
import { useReportContext } from './ReportProvider';
import { generateTreeDataReactVis } from './chartUtils';

export default function TreemapReportReactVis() {
  const { atrm, activities } = useReportContext();
  const data = generateTreeDataReactVis(atrm, activities);
  return (
    <Box
      sx={{
        '& .rv-treemap': {
          position: 'relative',
          '& .rv-treemap__leaf': {
            position: 'absolute',
            border: '1px solid red',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '& .rv-treemap__leaf__content': {
            },
          },
        },
      }}
    >
      <Treemap
        hideRootNode
        mode="squarify"
        title="report"
        width={1500}
        height={700}
        // sortFunction={(a, b) => a?.activity?.name > b?.activity?.name ? 1 : -1}
        data={data}
      />
    </Box>
  );
}
