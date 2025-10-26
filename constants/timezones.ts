

import { TimezoneOption } from '../types.ts';

export const TIMEZONES: TimezoneOption[] = [
  { value: 'local', label: 'Use My Current Timezone' },
  { value: 'Etc/GMT+12', label: 'International Date Line West (UTC-12)', offset: -12 },
  { value: 'Pacific/Midway', label: 'Midway Island, Samoa (UTC-11)', offset: -11 },
  { value: 'Pacific/Honolulu', label: 'Hawaii (UTC-10)', offset: -10 },
  { value: 'America/Anchorage', label: 'Alaska (UTC-9)', offset: -9 },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada) (PST) (UTC-8)', offset: -8 },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada) (MST) (UTC-7)', offset: -7 },
  { value: 'America/Chicago', label: 'Central Time (US & Canada) (CST) (UTC-6)', offset: -6 },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada) (EST) (UTC-5)', offset: -5 },
  { value: 'America/Caracas', label: 'Atlantic Time (Canada) (UTC-4)', offset: -4 },
  { value: 'America/Sao_Paulo', label: 'Brasilia, Buenos Aires (UTC-3)', offset: -3 },
  { value: 'Etc/GMT+2', label: 'Mid-Atlantic (UTC-2)', offset: -2 },
  { value: 'Atlantic/Cape_Verde', label: 'Cape Verde Is. (UTC-1)', offset: -1 },
  { value: 'Etc/GMT', label: 'Greenwich Mean Time (GMT) (UTC+0)', offset: 0 },
  { value: 'Europe/London', label: 'London, Dublin, Lisbon (BST) (UTC+1)', offset: 1 },
  { value: 'Europe/Paris', label: 'Brussels, Madrid, Paris (UTC+2)', offset: 2 },
  { value: 'Europe/Helsinki', label: 'Cairo, Helsinki, Kyiv (UTC+3)', offset: 3 },
  { value: 'Asia/Dubai', label: 'Abu Dhabi, Muscat, Dubai (UTC+4)', offset: 4 },
  { value: 'Asia/Karachi', label: 'Islamabad, Karachi, Tashkent (UTC+5)', offset: 5 },
  { value: 'Asia/Dhaka', label: 'Astana, Dhaka (UTC+6)', offset: 6 },
  { value: 'Asia/Bangkok', label: 'Bangkok, Hanoi, Jakarta (UTC+7)', offset: 7 },
  { value: 'Asia/Hong_Kong', label: 'Beijing, Hong Kong, Singapore (UTC+8)', offset: 8 },
  { value: 'Asia/Tokyo', label: 'Tokyo, Seoul, Osaka (UTC+9)', offset: 9 },
  { value: 'Australia/Sydney', label: 'Canberra, Melbourne, Sydney (UTC+10)', offset: 10 },
  { value: 'Pacific/Guadalcanal', label: 'Solomon Is., New Caledonia (UTC+11)', offset: 11 },
  { value: 'Pacific/Auckland', label: 'Auckland, Wellington (UTC+12)', offset: 12 },
];