import { Search } from '@mui/icons-material';
import { Box, InputAdornment, TextField } from '@mui/material';
import { memo } from 'react';
import { Activity } from './apiService';

export type ActivityFilters = {
  searchVal: string,
  treeView: boolean,
  hideSubActivities: boolean,
  orderBychildrenLength: boolean,
  order: 'id' | 'name',
  orderType: 'desc' | 'asc',
};

export const filterActivities = (activities: Activity[], filters: ActivityFilters): Activity[] => {
  const { searchVal, treeView, hideSubActivities, order, orderType, orderBychildrenLength } = filters;
  const matches = (a: Activity) => a.name.trim().toLowerCase().includes(searchVal.toLowerCase().trim());
  return [...activities].filter(a => {
    if (treeView && hideSubActivities && a.parents.length > 0) return false;
    if (!searchVal) return true;
    if (treeView) {
      if (
        a.allChildren.some(matches) ||
        (!hideSubActivities && a.allParents.some(matches))
      ) return true;
    } else {
      if (a.allParents.some(matches)) return true;
    }
    return false;
  }).sort((a, b) => {
    if (orderBychildrenLength) {
      const la = a.allChildIds.length;
      const lb = b.allChildIds.length;
      if (la !== lb) return lb - la;
    }
    let diff = 0;
    if (a[order] < b[order]) diff = 1;
    if (a[order] > b[order]) diff = -1;
    return orderType === 'desc' ? diff : - diff;
  });
};

export type ActivityFilterProps = {
  value: ActivityFilters;
  onChange<T extends keyof ActivityFilters>(name: T, value: ActivityFilters[T]): void;
};

const ActivityFilter = memo(function ActivityFilter({ value, onChange }: ActivityFilterProps) {
  return (
    <Box>
      <TextField
        sx={{ mb: 2 }}
        variant='outlined'
        label='search'
        fullWidth
        value={value.searchVal}
        onChange={(e) => onChange('searchVal', e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <Search />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
});

export default ActivityFilter;
