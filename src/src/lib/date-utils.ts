import { format, parseISO, isBefore, startOfDay, addDays, isSameDay } from 'date-fns';

export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = parseISO(dateStr);
    return format(d, 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatHeaderDate(date: Date = new Date()): string {
  try {
    return format(date, 'EEE, MMM d, yyyy');
  } catch {
    return '';
  }
}

export function isTaskOverdue(dueDate: string, status: string): boolean {
  if (status === 'completed') return false;
  try {
    const today = startOfDay(new Date());
    const due = startOfDay(parseISO(dueDate));
    return isBefore(due, today);
  } catch {
    return false;
  }
}

export function isTaskDueToday(dueDate: string): boolean {
  try {
    return isSameDay(parseISO(dueDate), new Date());
  } catch {
    return false;
  }
}

export function isTaskDueTomorrow(dueDate: string): boolean {
  try {
    const tomorrow = addDays(new Date(), 1);
    return isSameDay(parseISO(dueDate), tomorrow);
  } catch {
    return false;
  }
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
