import { Box } from '@mui/material';
import { ActivityTotalReport } from './reportUtils';
import { Treemap, TreemapPoint } from 'react-vis';
import { useReport } from './ReportPage';
import { Activity } from './apiService';

interface ReportTreemap extends TreemapPoint {
  activity?: Activity;
}
const c = (o = 1) => {
  const [r, g, b] = [...Array(3)].map(() => Math.random() * 128 + 20);
  return `rgba(${r},${g},${b},${o / 1.5})`;
};
export const generateReactVisTreeData = (atrm: ActivityTotalReport, activities: Activity[]) => {
  const total = Object.values(atrm).reduce((a, r) => a + (r?.timePure ?? 0), 0);
  const data: ReportTreemap = {
    title: 'report',
    children: [],
    opacity: 1,
    // color: c(0),
  };
  const f = (a: Activity, o = 1): ReportTreemap => {
    const time = atrm[a.id]?.time ?? 0;
    const data: ReportTreemap = {
      activity: a,
      title: (time / total > 0.0) ? a.name : '',
      size: atrm[a.id]?.timePure ?? 0,
      // color: 'rgb(255,100,100)',
      style: { backgroundColor: c(o) },
      opacity: o,
    };
    // data.size = atrm[a.id]?.timePure ?? 0;
    if (a.childIds.length > 0) {
      data.children = a.children.filter(a => atrm[a.id]).map(a => f(a, o / 1.2));
    }
    return data;
  };
  activities.filter(a => a.parentIds.length === 0 && (atrm[a.id]?.time ?? 0) / total > 0).forEach(a => {
    data.children?.push(f(a, 1));
  });
  return data;
};

export default function TreemapReportReactVis() {
  const { atrm, activities } = useReport();

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
        data={generateReactVisTreeData(atrm, activities)}
      />
    </Box>
  );
}
