
import { EventDetails, TimeLeft } from '../types.ts';
import { TIMEZONES } from '../constants/timezones.ts';

/**
 * Converts user input (date, time, timezone) into a precise UTC Date object.
 * This is the core logic for ensuring the countdown is accurate.
 */
export const getTargetDate = (details: EventDetails): Date => {
  const { date, time, timezone } = details;

  // Prevent errors from malformed event data.
  if (!date || !time) {
    return new Date('2999-12-31T23:59:59Z'); // Return a distant future date
  }

  const [year, month, day] = date.split('-').map(s => parseInt(s, 10));
  const [hour, minute] = time.split(':').map(s => parseInt(s, 10));

  // Further validation to ensure parsed numbers are valid.
  if ([year, month, day, hour, minute].some(isNaN)) {
    return new Date('2999-12-31T23:59:59Z');
  }

  const selectedTimezone = TIMEZONES.find(tz => tz.value === timezone);

  // If timezone is local, not found, or has no offset, interpret in user's local time.
  if (timezone === 'local' || !selectedTimezone || typeof selectedTimezone.offset === 'undefined') {
    return new Date(year, month - 1, day, hour, minute);
  }
  
  // For timezones with a fixed offset, calculate the correct UTC time.
  // 1. Create a timestamp assuming the user's input time was in UTC.
  const utcTimestamp = Date.UTC(year, month - 1, day, hour, minute);
  
  // 2. Subtract the timezone's offset to get the correct target UTC timestamp.
  // e.g., for 14:00 in UTC+2, the actual UTC time is 12:00, so we subtract the offset.
  const offsetInMs = selectedTimezone.offset * 3600 * 1000;
  const targetTimestamp = utcTimestamp - offsetInMs;

  return new Date(targetTimestamp);
};

/**
 * Calculates the remaining time until a target date.
 */
export const calculateTimeLeft = (targetDate: Date): { timeLeft: TimeLeft; isFinished: boolean } => {
    const difference = targetDate.getTime() - new Date().getTime();

    if (difference > 0) {
        return {
            timeLeft: {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            },
            isFinished: false,
        };
    }

    return {
        timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 },
        isFinished: true,
    };
};


// Helper to format a number with a leading zero if it's less than 10.
const pad = (n: number) => (n < 10 ? `0${n}` : n);

/**
 * Formats a Date object into a string suitable for Google Calendar URLs (YYYYMMDDTHHMMSSZ).
 */
const formatDateForGoogle = (date: Date): string => {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
};

/**
 * Formats a Date object into a string suitable for .ics files (YYYYMMDDTHHMMSSZ).
 */
const formatDateForIcs = formatDateForGoogle; // The format is identical.

export const generateGoogleCalendarUrl = (details: EventDetails): string => {
  const startDate = getTargetDate(details);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Assume 1-hour duration

  const googleDates = `${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`;
  const encodedTitle = encodeURIComponent(details.title);

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&dates=${googleDates}`;
};

export const generateIcsFileContent = (details: EventDetails): string => {
  const startDate = getTargetDate(details);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1-hour duration
  const now = new Date();

  const uid = `${now.getTime()}-countdown@app.com`;
  const stamp = formatDateForIcs(now);
  const start = formatDateForIcs(startDate);
  const end = formatDateForIcs(endDate);
  
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${stamp}
DTSTART:${start}
DTEND:${end}
SUMMARY:${details.title}
DESCRIPTION:Countdown event created by Countdown App.
END:VEVENT
END:VCALENDAR`;

  return icsContent;
};


export const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}