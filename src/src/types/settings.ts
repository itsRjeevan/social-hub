import { TaskPriority } from './task';

export interface UserSettings {
  name: string;
  email: string;
  avatarUrl: string;
  plan: string;
  timeZone: string;
  weekStartDay: 'sunday' | 'monday';
  defaultTaskPriority: TaskPriority;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}
