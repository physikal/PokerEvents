import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz';

export const formatToPacific = (date: string | Date) => {
  return formatToUserTimezone(date, 'America/Los_Angeles');
};

export const formatToUserTimezone = (date: string | Date, timezone: string = 'America/Los_Angeles') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const zonedDate = utcToZonedTime(dateObj, timezone);
  return format(zonedDate, 'PPP p', { timeZone: timezone });
};

export const nowInPacific = () => {
  return nowInTimezone('America/Los_Angeles');
};

export const nowInTimezone = (timezone: string = 'America/Los_Angeles') => {
  return utcToZonedTime(new Date(), timezone);
};

export const toPacificISOString = (date: Date) => {
  return toTimezoneISOString(date, 'America/Los_Angeles');
};

export const toTimezoneISOString = (date: Date, timezone: string = 'America/Los_Angeles') => {
  return zonedTimeToUtc(date, timezone).toISOString();
};