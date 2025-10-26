export interface EventDetails {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  timezone: string; // 'local' or IANA name
  backgroundImage?: string;
  category?: string;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface TimezoneOption {
  value: string; // 'local' or IANA name from 'value'
  label: string;
  offset?: number; // UTC offset in hours
}
