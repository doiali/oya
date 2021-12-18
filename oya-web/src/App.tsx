import { CssBaseline } from '@mui/material';
import { Box } from '@mui/system';
import { AlertServiceContainer } from './AlertService';
import Layout from './Layout';
import { Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';

function App() {
  return (
    <Box>
      <CssBaseline />
      <AlertServiceContainer />
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<HomePage />} />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;
