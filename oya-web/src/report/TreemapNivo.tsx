import { Box } from '@mui/material';
import { ActivityTotalReport } from './reportUtils';
import { Activity } from '../apiService';
import { useReportContext } from './ReportProvider';
import { ResponsiveTreeMap } from '@nivo/treemap';

type TreeDataNivo = {
  name: string;
  prefix?: string;
  activity?: Activity;
  value?: number;
  children?: TreeDataNivo[];
};

export const generateTreeDataNivo = (atrm: ActivityTotalReport, activities: Activity[]) => {
  const data: TreeDataNivo = {
    name: 'report',
    children: [],
  };
  const f = (a: Activity, s: string): TreeDataNivo => {
    const ss = s + ' > ' + a.name;
    const data: TreeDataNivo = {
      activity: a,
      name: a.name,
      prefix: ss,
      value: atrm[a.id]?.timePure ?? 0,
    };
    if (a.childIds.length > 0) {
      data.children = a.children.filter(c => atrm[c.id]).map(c => f(c, ss));
      // data.children.push({ activity: a, prefix: ss, name: '', value: atrm[a.id]?.timePure ?? 0 });
    }
    return data;
  };
  activities.forEach(a => {
    if (a.parentIds.length !== 0) return;
    const r = atrm[a.id];
    if (r && r.time && data.children)
      data.children.push(f(a, ''));
  });
  return data;
};

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
