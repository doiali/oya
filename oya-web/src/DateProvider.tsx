import AdapterJalaliLib from '@date-io/date-fns-jalali';
import { IUtils } from '@date-io/core/IUtils';
import AdapterGregorian from '@date-io/date-fns';
import React from 'react';
import { LocalizationProvider } from '@mui/lab';

class AdapterJalali extends AdapterJalaliLib {
  constructor(args?: any) {
    super(args);
    this.getWeekdays = () => ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  }
}

export const adapters = { Gregorian: AdapterGregorian, Jalali: AdapterJalali } as const;

export type UtilsSetName = keyof typeof adapters;

const initialValue = {
  utilsSetKey: 'Gregorian' as UtilsSetName,
  Adapter: AdapterGregorian as new (...args: any) => IUtils<Date>,
  utils: new AdapterGregorian() as IUtils<Date>,
  changeUtilsSet(utilsSetName: UtilsSetName) { window.localStorage.setItem('user-date', utilsSetName); },
};

const DateContext = React.createContext(initialValue);

export function DateProvider({ children }: { children: React.ReactNode; }) {
  const [utilsSetKey, setUtilsSetKey] = React.useState(() => {
    const initialAdapter = window.localStorage.getItem('user-date');
    return ((initialAdapter && Object.keys(adapters).includes(initialAdapter))
      ? initialAdapter : Object.keys(adapters)[0]) as UtilsSetName;
  });
  const changeUtilsSet = React.useCallback((utilsSetName: UtilsSetName) => {
    window.localStorage.setItem('user-date', utilsSetName);
    setUtilsSetKey(utilsSetName);
  }, []);
  const value = React.useMemo(() => ({
    utilsSetKey, Adapter: adapters[utilsSetKey], utils: new adapters[utilsSetKey](), changeUtilsSet,
  }), [utilsSetKey, changeUtilsSet]);
  return (
    <DateContext.Provider value={value}>
      <LocalizationProvider dateAdapter={value.Adapter}>
        {children}
      </LocalizationProvider>
    </DateContext.Provider>
  );
}

export const useDateContext = () => {
  const context = React.useContext(DateContext);
  return context;
};

const dateUtils = new AdapterGregorian();
export { dateUtils };
