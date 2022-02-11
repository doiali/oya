import React from 'react';
import { dequal } from 'dequal';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from './theme';
import { AlertServiceContainer } from './AlertService';
import MainRouter from './MainRouter';

export default function App() {
  return (
    <React.StrictMode>
      <ThemeProvider>
        <BrowserRouter>
          <CssBaseline />
          <AlertServiceContainer />
          <MainRouter />
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
