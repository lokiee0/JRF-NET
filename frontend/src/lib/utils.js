import clsx from 'clsx';
import { EXAM_DATE } from './constants';

/**
 * Merge class names conditionally
 */
export function cn(...inputs) {
  return clsx(inputs);
}

/**
 * Format a number with commas
 */
export function formatNumber(num) {
  return new Intl.NumberFormat().format(num);
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Generate a greeting based on time of day
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/**
 * Returns the number of days remaining until the exam date.
 * Returns 0 if the exam date is in the past.
 */
export function getDaysUntilExam() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(EXAM_DATE);
  exam.setHours(0, 0, 0, 0);
  const diff = Math.ceil((exam - today) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

/**
 * Formats duration in minutes to a readable string.
 * e.g. 90 -> "1h 30m", 45 -> "45m"
 */
export function formatDuration(minutes) {
  if (!minutes) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}
