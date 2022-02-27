import {
  Box, Grid,
  MenuItem,
  Select,
  SxProps,
  TextField,
  Theme,
} from '@mui/material';
import { memo } from 'react';
import { DatePicker } from '@mui/lab';
import { rangeOptions, ReportContext, ReportContextState } from './ReportProvider';

type RangeSelectorFormProps = {
  state: ReportContextState,
  onChange: ReportContext['onChange'],
  sx?: SxProps<Theme>;
};

export default memo(function RangeSelectorForm({
  state, onChange, sx,
}: RangeSelectorFormProps) {
  return (
    <Box sx={sx}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Grid item container spacing={2}>
          {(['start', 'end'] as const).map((type) => (
            <Grid key={type} item>
              <DatePicker
                disabled={state.period.value !== 'custom'}
                disableMaskedInput
                value={state[type]}
                onChange={(newValue) => onChange(type, newValue)}
                label={type}
                renderInput={(params) => <TextField {...params} />}
                minDate={type === 'end' ? state.start : undefined}
              />
            </Grid>
          ))}
        </Grid>
        <Select
          value={state.period.value}
          onChange={({ target: { value } }) => {
            const period = rangeOptions.find(o => o.value === value);
            if (period)
              onChange('period', period);
          }}
        >
          {rangeOptions.map(({ value, label }) => (
            <MenuItem key={value} value={value}>{label}</MenuItem>
          ))}
        </Select>
      </Box>
    </Box>
  );
});
