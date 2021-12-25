import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { alpha, TextField, TextFieldProps, Typography, useTheme } from '@mui/material';
import { marked } from 'marked';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  html?: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box minHeight={120} pt={2}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function MarkdownBox(props: TextFieldProps) {
  const [value, setValue] = React.useState(0);
  const theme = useTheme();
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const htmlEl = (typeof (props.value) === 'string' && props.value)
    ? <div dangerouslySetInnerHTML={{ __html: marked.parse(props.value) }} />
    : null;

  return (
    <Box sx={{ width: '100%', p: 2, backgroundColor: alpha(theme.palette.primary.light, 0.1) }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Write" />
          <Tab label="Preview" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <TextField
          multiline
          fullWidth
          minRows={3}
          variant="outlined"
          {...props}
        />
      </TabPanel>
      <TabPanel value={value} index={1}>
        {htmlEl || <Typography variant="subtitle1">nothing to preview</Typography>}
      </TabPanel>
    </Box>
  );
}
