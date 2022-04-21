import { Box } from '@mui/material';
import Widget from '../Widget';
import ClockIcon from './ClockIcon';

export default function ClockPage() {
  return (
    <Box>
      <Widget title="clocks">
        <ClockIcon />
      </Widget>
    </Box>
  );
}
