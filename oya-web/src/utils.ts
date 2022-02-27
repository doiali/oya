/* eslint-disable import/prefer-default-export */

import { useEffect, useRef } from 'react';

/**
 * show the difference between two datetimes
 * @param start start date
 * @param end end date
 * @returns delta string in format HH:mm
 */
export const getDeltaString = (start: string | Date, end: string | Date) => (
  getDeltaStringOfRange(getTimeDelta(start, end))
);

/**
 * return a string representing timeDelta
 * @param dm range in minutes
 * @returns delta string in format HH:mm
 */
export const getDeltaStringOfRange = (dm: number) => {
  // const days = Math.floor(dm / 60 / 24);
  const hours = Math.floor((dm /* % (60 * 24)*/) / 60);
  const minutes = Math.round(dm % 60);
  return (
    // (days ? `${days} days ` : '') +
    hours.toString().padStart(2, '0') +
    ':' +
    minutes.toString().padStart(2, '0')
  );
};

/**
 * calculate difference between two datetimes in minutes
 * @param start start date
 * @param end end date
 * @returns difference in minutes
 */
export function getTimeDelta(start: string | Date, end: string | Date) {
  const s = typeof start === 'string' ? new Date(start) : start;
  const e = typeof end === 'string' ? new Date(end) : end;
  const dm = Math.round((e.getTime() - s.getTime()) / 60000);
  return dm;
}

/**
 * calls the callback only one time when the trigger becomes true for the first time,
 * if the trigger is initially true, the callback is never called
 * @param trigger a boolean value
 */
export function useTrigger<T = any>(trigger: boolean, callback: () => T) {
  const done = useRef(trigger);
  useEffect(() => {
    if (trigger) {
      if (!done.current) {
        done.current = trigger;
        callback();
      }
    }
  }, [trigger, callback]);
}
