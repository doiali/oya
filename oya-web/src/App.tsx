import { Container, CssBaseline } from '@mui/material';
import { AlertServiceContainer } from './AlertService';
import Layout from './Layout';
import { Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import { dequal } from 'dequal';
import ReportPage from './report/ReportPage';
import ActivityPage from './ActivityPage';
import ActivitiesHomeWidget from './ActivitiesHomeWidget';

declare global {
  interface Window {
    dequal: typeof dequal;
  }
}
window.dequal = dequal;

const ActivitiesWidgetPage = () => (
  <Container maxWidth="md">
    <ActivitiesHomeWidget />
  </Container>
);

function App() {
  return (
    <>
      <CssBaseline />
      <AlertServiceContainer />
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path='reports/*' element={<ReportPage />} />
          <Route path="activities" element={<ActivityPage />} />
          <Route path="activities-widget" element={<ActivitiesWidgetPage />} />
          <Route path="*" element="404 not found" />
        </Route>
      </Routes>
    </>
  );
}

export default App;
