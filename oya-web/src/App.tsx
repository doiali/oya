import React from 'react';
import AdapterJalali from '@date-io/date-fns-jalali';
import { dequal } from 'dequal';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from './theme';
import { AlertServiceContainer } from './AlertService';
import MainRouter from './MainRouter';
import { LocalizationProvider } from '@mui/lab';

export default function App() {
  return (
    <React.StrictMode>
      <ThemeProvider>
        <BrowserRouter>
          <LocalizationProvider dateAdapter={AdapterJalali}>
            <CssBaseline />
            <AlertServiceContainer />
            <MainRouter />
          </LocalizationProvider>
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
}

declare global {
  interface Window {
    dequal: typeof dequal;
  }
}
window.dequal = dequal;
