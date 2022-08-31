import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { adapters, useDateContext, UtilsSetName } from './DateProvider';

export default function CalenderSelector() {
  const { utilsSetKey, changeUtilsSet } = useDateContext();
  return (
    <FormControl>
      <InputLabel>Calendar</InputLabel>
      <Select
        sx={{ mx: 1, minWidth: 125 }}
        label="Calendar"
        value={utilsSetKey}
        onChange={(e) => changeUtilsSet(e.target.value as UtilsSetName)}
      >
        {(Object.keys(adapters) as UtilsSetName[]).map((key) => (
          <MenuItem key={key} value={key}>{key}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
