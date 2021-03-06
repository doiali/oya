import { TreemapPoint } from 'react-vis';
import { Activity } from '../apiService';
import { ActivityTotalReport, ActivityTotalReportMap } from './reportUtils';

export type TreeDataNivo = {
  nodeId: string;
  path: Activity[],
  activity?: Activity;
  report?: ActivityTotalReport;
  value?: number;
  children?: TreeDataNivo[];
};

export const generateTreeDataNivo = (atrm: ActivityTotalReportMap, activities: Activity[]) => {
  const data: TreeDataNivo = {
    nodeId: '',
    path: [],
    children: [],
  };
  const f = (a: Activity, s: string, p: Activity[]): TreeDataNivo => {
    const id = s ? s + '-' + a.id : a.id.toString();
    const path = [...p, a];
    const report = atrm[a.id];
    const data: TreeDataNivo = {
      nodeId: id,
      path,
      activity: a,
      report,
      value: report?.timePure ?? 0,
    };
    if (a.childIds.length > 0) {
      data.children = a.children.filter(c => atrm[c.id]).map(c => f(c, id, path));
    }
    return data;
  };
  activities.forEach(a => {
    if (a.parentIds.length !== 0) return;
    const r = atrm[a.id];
    if (r && r.time && data.children)
      data.children.push(f(a, '', []));
  });
  return data;
};

export interface TreeDataReactVis extends TreemapPoint {
  activity?: Activity;
}

export const generateTreeDataReactVis = (atrm: ActivityTotalReportMap, activities: Activity[]) => {
  const c = (o = 1) => {
    const [r, g, b] = [...Array(3)].map(() => Math.random() * 128 + 20);
    return `rgba(${r},${g},${b},${o / 1.5})`;
  };
  const total = Object.values(atrm).reduce((a, r) => a + (r?.timePure ?? 0), 0);
  const data: TreeDataReactVis = {
    title: 'report',
    children: [],
    opacity: 1,
    // color: c(0),
  };
  const f = (a: Activity, o = 1): TreeDataReactVis => {
    const time = atrm[a.id]?.time ?? 0;
    const data: TreeDataReactVis = {
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

export type DataRe = {
  name: string;
  activity?: Activity;
  value: number;
};

export const generateDataRe = (atrm: ActivityTotalReportMap, activities: Activity[]) => {
  const data: DataRe[] = [];
  activities.forEach(a => {
    if (a.parentIds.length !== 0) return;
    const r = atrm[a.id];
    if (r && r.time)
      data.push({
        activity: a,
        name: a.name,
        value: r.avgPerAllDays,
      });
  });
  return data.sort((a, b) => b.value - a.value);
};

type TreeDataRe = {
  name: string;
  prefix: string;
  activity?: Activity;
  size?: number;
  children?: TreeDataRe[];
};

export const generateTreeDataRe = (atrm: ActivityTotalReportMap, activities: Activity[]) => {
  const total = Object.values(atrm).reduce((a, r) => a + (r?.timePure ?? 0), 0);
  const data: TreeDataRe[] = [];
  const f = (a: Activity, s: string): TreeDataRe => {
    const ss = s + ' > ' + a.name;
    const data: TreeDataRe = {
      activity: a,
      name: a.name,
      prefix: ss,
      size: atrm[a.id]?.timePure ?? 0,
    };
    if (a.childIds.length > 0) {
      data.children = a.children.filter(c => atrm[c.id]).map(c => f(c, ss));
      data.children.push({ activity: a, prefix: ss, name: '', size: atrm[a.id]?.timePure ?? 0 });
    }
    return data;
  };
  activities.filter(a => a.parentIds.length === 0 && (atrm[a.id]?.time ?? 0) / total > 0).forEach(a => {
    data.push(f(a, ''));
  });
  return data;
};
