function validDate(value: Date | string): Date {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new RangeError('วันที่ไม่ถูกต้อง');
  return date;
}

/** timeZone is supplied from central settings. There is no hidden default timezone. */
export function formatThaiBuddhistDate(value: Date | string, timeZone: string): string {
  return new Intl.DateTimeFormat('th-TH-u-ca-buddhist-nu-latn', {
    timeZone, day: 'numeric', month: 'long', year: 'numeric',
  }).format(validDate(value));
}

/** Fiscal year runs from 1 October through 30 September in the configured timezone. */
export function fiscalYearBE(value: Date | string, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US-u-ca-gregory-nu-latn', { timeZone, year: 'numeric', month: 'numeric' }).formatToParts(validDate(value));
  const year = Number(parts.find(part => part.type === 'year')?.value);
  const month = Number(parts.find(part => part.type === 'month')?.value);
  return year + (month >= 10 ? 1 : 0) + 543;
}
