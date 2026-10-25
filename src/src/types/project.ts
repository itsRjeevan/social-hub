export type ProjectStatus = 'active' | 'on_hold' | 'completed';

export interface Project {
  id: string;
  name: string;
  description: string;
  accountIds: string[];
  startDate: string;
  endDate?: string;
  status: ProjectStatus;
  notes?: string;
  createdAt: string;
}
