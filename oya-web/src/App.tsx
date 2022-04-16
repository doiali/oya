import React from 'react';
import AdapterJalali from '@date-io/date-fns-jalali';
import * as jutils from 'date-fns-jalali';
import * as utils from 'date-fns';
import { dequal } from 'dequal';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from './theme';
import { AlertServiceContainer } from './AlertService';
import MainRouter from './MainRouter';
import AuthProvider from './AuthProvider';
import 'simplebar/dist/simplebar.min.css';
import { DateProvider } from './DateProvider';

export default function App() {
  return (
    <React.StrictMode>
      <ThemeProvider>
        <BrowserRouter>
          <DateProvider>
            <AuthProvider>
              <CssBaseline />
              <AlertServiceContainer />
              <MainRouter />
            </AuthProvider>
          </DateProvider>
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
}

const jau = new AdapterJalali();
declare global {
  interface Window {
    dequal: typeof dequal;
    jau: typeof jau;
    ju: typeof jutils;
    u: typeof utils;
  }
}

window.dequal = dequal;
window.jau = jau;
window.ju = jutils;
window.u = utils;
