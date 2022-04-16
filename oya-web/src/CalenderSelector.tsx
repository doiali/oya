import { MenuItem, Select } from '@mui/material';
import { adapters, useDateContext, UtilsSetName } from './DateProvider';

export default function CalenderSelector() {
  const { utilsSetKey, changeUtilsSet } = useDateContext();
  return (
    <Select
      sx={{ mx: 1 }}
      value={utilsSetKey}
      onChange={(e) => changeUtilsSet(e.target.value as UtilsSetName)}
    >
      {(Object.keys(adapters) as UtilsSetName[]).map((key) => (
        <MenuItem key={key} value={key}>{key}</MenuItem>
      ))}
    </Select>
  );
}
