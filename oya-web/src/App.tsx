import { CssBaseline } from '@mui/material';
import { AlertServiceContainer } from './AlertService';
import Layout from './Layout';
import { Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';

function App() {
  return (
    <>
      <CssBaseline />
      <AlertServiceContainer />
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<HomePage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
