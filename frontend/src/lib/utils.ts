import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseStringify = (value: unknown) =>
  JSON.parse(JSON.stringify(value));

export const formatDateTime = (isoString: string | null | undefined) => {
  if (!isoString) return '—';

  const date = new Date(isoString);

  // Get hours and adjust for 12-hour format
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'pm' : 'am';

  // Convert hours to 12-hour format
  hours = hours % 12 || 12;

  // Format the time and date parts
  const time = `${hours}:${minutes.toString().padStart(2, '0')}${period}`;
  const day = date.getDate();
  const monthNames = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];
  const month = monthNames[date.getMonth()];

  return `${time}, ${day} ${month}`;
};

export function formatBytes(bytes: number | string, decimals: number = 2) {
  const size = typeof bytes === 'string' ? parseInt(bytes) : bytes;
  if (!size || size === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(size) / Math.log(k));

  return `${parseFloat((size / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function translateRole(role: string): string {
  const translations: Record<string, string> = {
    basic: 'Básico',
    manager: 'Gerenciador',
    admin: 'Administrador',
  };

  return translations[role] ?? role;
}
