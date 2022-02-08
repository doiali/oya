import { CssBaseline } from '@mui/material';
import { AlertServiceContainer } from './AlertService';
import Layout from './Layout';
import { Routes, Route } from 'react-router-dom';
import HomePage, { HomePageOld } from './HomePage';
import { dequal } from 'dequal';
import ReportPage, { reportRoutes } from './report/ReportPage';
import ActivityPage from './ActivityPage';

declare global {
  interface Window {
    dequal: typeof dequal;
  }
}
window.dequal = dequal;

function App() {
  return (
    <>
      <CssBaseline />
      <AlertServiceContainer />
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path='reports' element={<ReportPage />}>
            {reportRoutes.map(r => <Route key={r.link} path={r.link} element={r.element} />)}
            <Route path="*" element="404 not found" />
          </Route>
          <Route path="activities/*" element={<ActivityPage />} />
          <Route path="home-old" element={<HomePageOld />} />
          <Route path="*" element="404 not found" />
        </Route>
      </Routes>
    </>
  );
}

export default App;
