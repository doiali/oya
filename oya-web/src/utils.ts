/* eslint-disable import/prefer-default-export */
export function getDeltaString(start: string | Date, end: string | Date) {
  const s = typeof start === 'string' ? new Date(start) : start;
  const e = typeof end === 'string' ? new Date(end) : end;
  const dm = Math.round((e.getTime() - s.getTime()) / 60000);
  const result = (
    Math.floor(dm / 60).toString().padStart(2, '0') +
    ':' +
    (dm % 60).toString().padStart(2, '0')
  );
  return result;
}
