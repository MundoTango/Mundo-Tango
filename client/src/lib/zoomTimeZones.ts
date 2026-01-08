/**
 * Dynamic timezone converter for weekly Zoom call times
 * Base time: California 9:00 AM on Thursdays
 * Automatically adjusts for DST changes
 */

interface TimeZoneInfo {
  flag: string;
  label: string;
  timezone: string;
  isNextDay?: boolean;
}

const TIMEZONES: TimeZoneInfo[] = [
  { flag: '🇺🇸', label: 'CA/NY', timezone: 'America/Los_Angeles' },
  { flag: '🇦🇷', label: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires' },
  { flag: '🇬🇧', label: 'London', timezone: 'Europe/London' },
  { flag: '🇫🇷', label: 'Paris', timezone: 'Europe/Paris' },
  { flag: '🇺🇦', label: 'Kyiv', timezone: 'Europe/Kyiv' },
  { flag: '🇨🇳', label: 'Beijing', timezone: 'Asia/Shanghai' },
  { flag: '🇰🇷', label: 'Seoul', timezone: 'Asia/Seoul' },
  { flag: '🇦🇺', label: 'Sydney', timezone: 'Australia/Sydney' },
];

function getNextThursday(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilThursday = (4 - dayOfWeek + 7) % 7 || 7;
  const nextThursday = new Date(now);
  nextThursday.setDate(now.getDate() + daysUntilThursday);
  nextThursday.setHours(0, 0, 0, 0);
  return nextThursday;
}

function getBaseTime(): Date {
  const thursday = getNextThursday();
  const baseDate = new Date(thursday.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  baseDate.setHours(9, 0, 0, 0);
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(thursday);
  const year = parseInt(parts.find(p => p.type === 'year')?.value || '2024');
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '1') - 1;
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');
  
  return new Date(Date.UTC(year, month, day, 17, 0, 0));
}

export interface ZoomTimeDisplay {
  flag: string;
  time: string;
  isHighlighted?: boolean;
}

export function getZoomCallTimes(): ZoomTimeDisplay[] {
  const baseTime = getBaseTime();
  
  return TIMEZONES.map((tz) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz.timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    
    const dayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz.timezone,
      weekday: 'short',
    });
    
    const baseDayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      weekday: 'short',
    });
    
    const localTime = formatter.format(baseTime);
    const localDay = dayFormatter.format(baseTime);
    const baseDay = baseDayFormatter.format(baseTime);
    
    const isNextDay = localDay !== baseDay;
    
    if (tz.timezone === 'America/Los_Angeles') {
      const nyFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      const nyTime = nyFormatter.format(baseTime);
      const caTime = localTime.replace(':00', '').replace(' ', '');
      const nyTimeShort = nyTime.replace(':00', '').replace(' ', '');
      return {
        flag: tz.flag,
        time: `CA ${caTime} / NY ${nyTimeShort}`,
      };
    }
    
    const timeStr = localTime.replace(':00', '').replace(' ', '');
    return {
      flag: tz.flag,
      time: isNextDay ? `${timeStr} (+1)` : timeStr,
      isHighlighted: tz.timezone === 'Europe/London',
    };
  });
}
