import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateToLocalBasic = (timestampz: any) => {
  if (!timestampz) return 'N/A'; // Handle missing or invalid timestampz

  const date = new Date(timestampz); // Convert the timestampz to a Date object
  return date.toLocaleString(); // Format it to the user's local timezone and locale
};

export const formatDateToLocal = (timestampz: any) => {
  if (!timestampz) return 'N/A';

  const date = new Date(timestampz);
  return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
  });
};

export const formatTimeToLocalAMPM = (timestampz: any) => {
  if (!timestampz) return 'N/A'; // Handle missing or invalid timestampz

  const date = new Date(timestampz);
  if (isNaN(date.getTime())) return 'Invalid Date'; // Validate date conversion

  return date.toLocaleString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, // Ensures AM/PM formatting
  });
};

