'use client';

import { SocialAccount } from '@/types/account';
import { Task } from '@/types/task';
import { ContentItem } from '@/types/content';
import { Project } from '@/types/project';
import { AnalyticsRecord } from '@/types/analytics';
import { UserSettings } from '@/types/settings';
import {
  INITIAL_ACCOUNTS,
  INITIAL_TASKS,
  INITIAL_CONTENT,
  INITIAL_PROJECTS,
  INITIAL_ANALYTICS,
  INITIAL_SETTINGS,
} from './mock-data';

export interface StorageData {
  accounts: SocialAccount[];
  tasks: Task[];
  content: ContentItem[];
  projects: Project[];
  analytics: AnalyticsRecord[];
  settings: UserSettings;
  version: string;
}

const STORAGE_KEY = 'social_hub_store_v1';

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error('Storage listener error:', err);
    }
  });
}

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getInitialData(): StorageData {
  return {
    accounts: INITIAL_ACCOUNTS,
    tasks: INITIAL_TASKS,
    content: INITIAL_CONTENT,
    projects: INITIAL_PROJECTS,
    analytics: INITIAL_ANALYTICS,
    settings: INITIAL_SETTINGS,
    version: '1.0.0',
  };
}

export function loadData(): StorageData {
  if (typeof window === 'undefined') {
    return getInitialData();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialData();
      saveData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as StorageData;
    // ensure all collections exist
    return {
      accounts: parsed.accounts || INITIAL_ACCOUNTS,
      tasks: parsed.tasks || INITIAL_TASKS,
      content: parsed.content || INITIAL_CONTENT,
      projects: parsed.projects || INITIAL_PROJECTS,
      analytics: parsed.analytics || INITIAL_ANALYTICS,
      settings: parsed.settings || INITIAL_SETTINGS,
      version: parsed.version || '1.0.0',
    };
  } catch (error) {
    console.warn('Failed to parse localStorage data, restoring initial data:', error);
    const initial = getInitialData();
    saveData(initial);
    return initial;
  }
}

export function saveData(data: StorageData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    notifyListeners();
  } catch (err) {
    console.error('Failed to save data to localStorage:', err);
  }
}

// ----------------- Account Operations -----------------
export function getAccounts(): SocialAccount[] {
  return loadData().accounts;
}

export function saveAccount(account: SocialAccount): void {
  const data = loadData();
  const index = data.accounts.findIndex((a) => a.id === account.id);
  if (index >= 0) {
    data.accounts[index] = account;
  } else {
    data.accounts.unshift(account);
  }
  saveData(data);
}

export function deleteAccount(accountId: string): void {
  const data = loadData();
  data.accounts = data.accounts.filter((a) => a.id !== accountId);
  // Also clean up associated tasks or unlink
  data.tasks = data.tasks.filter((t) => t.accountId !== accountId);
  data.content = data.content.filter((c) => c.accountId !== accountId);
  data.analytics = data.analytics.filter((an) => an.accountId !== accountId);
  saveData(data);
}

export function toggleArchiveAccount(accountId: string): void {
  const data = loadData();
  const acc = data.accounts.find((a) => a.id === accountId);
  if (acc) {
    acc.status = acc.status === 'active' ? 'archived' : 'active';
    saveData(data);
  }
}

// ----------------- Task Operations -----------------
export function getTasks(): Task[] {
  return loadData().tasks;
}

export function saveTask(task: Task): void {
  const data = loadData();
  const index = data.tasks.findIndex((t) => t.id === task.id);
  if (index >= 0) {
    data.tasks[index] = task;
  } else {
    data.tasks.unshift(task);
  }
  saveData(data);
}

export function toggleTaskStatus(taskId: string): void {
  const data = loadData();
  const task = data.tasks.find((t) => t.id === taskId);
  if (task) {
    if (task.status === 'completed') {
      task.status = 'pending';
      task.completedAt = undefined;
    } else {
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
    }
    saveData(data);
  }
}

export function deleteTask(taskId: string): void {
  const data = loadData();
  data.tasks = data.tasks.filter((t) => t.id !== taskId);
  saveData(data);
}

export function bulkCompleteTasks(taskIds: string[]): void {
  const data = loadData();
  const now = new Date().toISOString();
  data.tasks = data.tasks.map((task) => {
    if (taskIds.includes(task.id)) {
      return { ...task, status: 'completed', completedAt: now };
    }
    return task;
  });
  saveData(data);
}

export function bulkDeleteTasks(taskIds: string[]): void {
  const data = loadData();
  data.tasks = data.tasks.filter((task) => !taskIds.includes(task.id));
  saveData(data);
}

// ----------------- Content Operations -----------------
export function getContent(): ContentItem[] {
  return loadData().content;
}

export function saveContentItem(item: ContentItem): void {
  const data = loadData();
  const index = data.content.findIndex((c) => c.id === item.id);
  if (index >= 0) {
    data.content[index] = item;
  } else {
    data.content.unshift(item);
  }
  saveData(data);
}

export function deleteContentItem(contentId: string): void {
  const data = loadData();
  data.content = data.content.filter((c) => c.id !== contentId);
  saveData(data);
}

// ----------------- Project Operations -----------------
export function getProjects(): Project[] {
  return loadData().projects;
}

export function saveProject(project: Project): void {
  const data = loadData();
  const index = data.projects.findIndex((p) => p.id === project.id);
  if (index >= 0) {
    data.projects[index] = project;
  } else {
    data.projects.unshift(project);
  }
  saveData(data);
}

export function deleteProject(projectId: string): void {
  const data = loadData();
  data.projects = data.projects.filter((p) => p.id !== projectId);
  // Unlink tasks and content
  data.tasks = data.tasks.map((t) => (t.projectId === projectId ? { ...t, projectId: undefined } : t));
  data.content = data.content.map((c) => (c.projectId === projectId ? { ...c, projectId: undefined } : c));
  saveData(data);
}

// ----------------- Analytics Operations -----------------
export function getAnalytics(): AnalyticsRecord[] {
  return loadData().analytics;
}

export function saveAnalyticsRecord(record: AnalyticsRecord): void {
  const data = loadData();
  const index = data.analytics.findIndex((a) => a.id === record.id);
  if (index >= 0) {
    data.analytics[index] = record;
  } else {
    data.analytics.unshift(record);
  }
  saveData(data);
}

export function deleteAnalyticsRecord(id: string): void {
  const data = loadData();
  data.analytics = data.analytics.filter((a) => a.id !== id);
  saveData(data);
}

// ----------------- Settings Operations -----------------
export function getSettings(): UserSettings {
  return loadData().settings;
}

export function saveSettings(settings: UserSettings): void {
  const data = loadData();
  data.settings = settings;
  saveData(data);
}

// ----------------- Export & Import -----------------
export function exportWorkspaceJson(): string {
  const data = loadData();
  return JSON.stringify(data, null, 2);
}

export function exportTasksToCsv(): string {
  const tasks = getTasks();
  const accounts = getAccounts();
  const accountMap = new Map(accounts.map((a) => [a.id, a.name]));

  const headers = ['ID', 'Title', 'Platform', 'Account', 'Priority', 'Status', 'Due Date', 'Due Time', 'Category', 'Completed At'];
  const rows = tasks.map((t) => [
    `"${t.id}"`,
    `"${t.title.replace(/"/g, '""')}"`,
    `"${t.platform}"`,
    `"${(accountMap.get(t.accountId) || t.accountId).replace(/"/g, '""')}"`,
    `"${t.priority}"`,
    `"${t.status}"`,
    `"${t.dueDate}"`,
    `"${t.dueTime || ''}"`,
    `"${t.category.replace(/"/g, '""')}"`,
    `"${t.completedAt || ''}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function importWorkspaceJson(jsonString: string): { success: boolean; error?: string } {
  try {
    const parsed = JSON.parse(jsonString) as StorageData;
    if (!parsed || !Array.isArray(parsed.accounts) || !Array.isArray(parsed.tasks)) {
      return { success: false, error: 'Invalid JSON format: missing accounts or tasks array.' };
    }
    saveData({
      accounts: parsed.accounts,
      tasks: parsed.tasks,
      content: parsed.content || [],
      projects: parsed.projects || [],
      analytics: parsed.analytics || [],
      settings: parsed.settings || INITIAL_SETTINGS,
      version: parsed.version || '1.0.0',
    });
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || 'Failed to parse JSON string.' };
  }
}

export function resetToDefaults(): void {
  const initial = getInitialData();
  saveData(initial);
}
