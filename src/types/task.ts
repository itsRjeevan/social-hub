import { PlatformType } from './account';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export type RecurringSchedule = 'daily' | 'weekly' | 'custom_days';

export interface Task {
  id: string;
  title: string;
  description?: string;
  accountId: string;
  platform: PlatformType;
  category: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // e.g. "10:00 AM" or "14:00"
  priority: TaskPriority;
  status: TaskStatus;
  completedAt?: string;
  isRecurring?: boolean;
  recurringSchedule?: RecurringSchedule;
  recurringDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  relatedContentId?: string;
  projectId?: string;
  notes?: string;
  createdAt: string;
}
