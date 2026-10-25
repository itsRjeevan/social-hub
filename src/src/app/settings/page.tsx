'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Bell,
  Palette,
  CheckSquare,
  Calendar,
  Database,
  Shield,
  Download,
  Upload,
  RefreshCw,
  Save,
  Check,
  AlertTriangle,
} from 'lucide-react';
import {
  getSettings,
  saveSettings,
  exportWorkspaceJson,
  exportTasksToCsv,
  importWorkspaceJson,
  resetToDefaults,
  subscribeToStore,
} from '@/lib/storage/storage-provider';
import { UserSettings } from '@/types/settings';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'task' | 'backup'>('profile');
  const [settings, setSettings] = useState<UserSettings>(getSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<{ message: string; isError: boolean } | null>(null);

  useEffect(() => {
    const refreshData = () => {
      setSettings(getSettings());
    };
    return subscribeToStore(refreshData);
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportJson = () => {
    const jsonStr = exportWorkspaceJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `social-hub-workspace-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const csvStr = exportTasksToCsv();
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `social-hub-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (confirm('Importing this file will replace current workspace data. Continue?')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const res = importWorkspaceJson(content);
          if (res.success) {
            setImportStatus({ message: 'Workspace imported successfully!', isError: false });
          } else {
            setImportStatus({ message: res.error || 'Failed to import workspace.', isError: true });
          }
        };
        reader.readAsText(file);
      }
    }
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to restore the default sample social accounts, tasks, and data?')) {
      resetToDefaults();
      setImportStatus({ message: 'Default demo data restored successfully!', isError: false });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-navy tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Customize your personal workspace, notifications, and data backups</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Navigation Sidebar */}
        <div className="md:col-span-4 bg-white p-2.5 rounded-2xl border border-slate-100 shadow-soft space-y-1">
          {[
            { key: 'profile', label: 'Profile Information', icon: User },
            { key: 'notifications', label: 'Notifications', icon: Bell },
            { key: 'task', label: 'Task & Workflow Preferences', icon: CheckSquare },
            { key: 'backup', label: 'Data & Backup', icon: Database },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key as any)}
                className={cn(
                  'w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-left transition-colors',
                  isActive
                    ? 'bg-primary text-white shadow-primary shadow-indigo-500/25'
                    : 'text-slate-600 hover:text-navy hover:bg-slate-50'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="md:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-card">
          {/* Tab 1: Profile */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-navy">Profile Information</h3>
                <p className="text-xs text-slate-400 mt-0.5">Update your display name, contact email, and active timezone</p>
              </div>

              {savedSuccess && (
                <div className="flex items-center gap-2 p-3 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Profile changes saved successfully!</span>
                </div>
              )}

              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <img
                  src={settings.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={settings.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/20"
                />
                <div>
                  <h4 className="font-bold text-navy text-sm">{settings.name}</h4>
                  <p className="text-xs text-slate-400">{settings.plan}</p>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
                  required
                />
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Timezone</label>
                <select
                  value={settings.timeZone}
                  onChange={(e) => setSettings({ ...settings, timeZone: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
                >
                  <option value="(GMT+05:30) Asia/Kolkata">(GMT+05:30) Asia/Kolkata (IST)</option>
                  <option value="(GMT-08:00) Pacific Time">(GMT-08:00) Pacific Time (US & Canada)</option>
                  <option value="(GMT-05:00) Eastern Time">(GMT-05:00) Eastern Time (US & Canada)</option>
                  <option value="(GMT+00:00) UTC / London">(GMT+00:00) UTC / London</option>
                  <option value="(GMT+08:00) Singapore">(GMT+08:00) Singapore / Perth</option>
                </select>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-primary shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-navy">Notification Preferences</h3>
                <p className="text-xs text-slate-400 mt-0.5">Control how and when you receive task deadline reminders</p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-navy">Overdue & Upcoming Task Alerts</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Show notifications badge for tasks due today or overdue</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notificationsEnabled}
                    onChange={(e) => {
                      const updated = { ...settings, notificationsEnabled: e.target.checked };
                      setSettings(updated);
                      saveSettings(updated);
                    }}
                    className="rounded text-primary focus:ring-primary w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-navy">Celebration Animation (Confetti)</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Fire confetti effect whenever a task is marked completed</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => {
                      const updated = { ...settings, soundEnabled: e.target.checked };
                      setSettings(updated);
                      saveSettings(updated);
                    }}
                    className="rounded text-primary focus:ring-primary w-4 h-4"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Tab 3: Task Settings */}
          {activeTab === 'task' && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-navy">Task & Workflow Settings</h3>
                <p className="text-xs text-slate-400 mt-0.5">Configure defaults for task creation and calendar display</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Week Start Day</label>
                <select
                  value={settings.weekStartDay}
                  onChange={(e) => {
                    const updated = { ...settings, weekStartDay: e.target.value as any };
                    setSettings(updated);
                    saveSettings(updated);
                  }}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-navy"
                >
                  <option value="monday">Monday (Recommended)</option>
                  <option value="sunday">Sunday</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Default Task Priority</label>
                <select
                  value={settings.defaultTaskPriority}
                  onChange={(e) => {
                    const updated = { ...settings, defaultTaskPriority: e.target.value as any };
                    setSettings(updated);
                    saveSettings(updated);
                  }}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-navy"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          )}

          {/* Tab 4: Data & Backup */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-navy">Data Storage & Backup</h3>
                <p className="text-xs text-slate-400 mt-0.5">Export, import, and backup your complete social media workspace</p>
              </div>

              {/* Persistent Browser Storage Notice */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 leading-relaxed">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <Database className="w-4 h-4 text-[#1877F2]" />
                  <span>Local Persistent Workspace Active</span>
                </p>
                All your accounts, tasks, content ideas, and analytics are saved locally and persistently in this browser on your device. Export a JSON backup periodically to keep a copy or transfer across devices.
              </div>

              {importStatus && (
                <div
                  className={cn(
                    'p-3 rounded-xl text-xs font-bold border flex items-center gap-2',
                    importStatus.isError
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  )}
                >
                  {importStatus.isError ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  <span>{importStatus.message}</span>
                </div>
              )}

              {/* Export Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <h4 className="text-xs font-bold text-navy">Export Workspace (JSON)</h4>
                  <p className="text-[11px] text-slate-500">
                    Download full backup of accounts, daily tasks, content, projects, and analytics.
                  </p>
                  <button
                    onClick={handleExportJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON Backup</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <h4 className="text-xs font-bold text-navy">Export Tasks (CSV)</h4>
                  <p className="text-[11px] text-slate-500">
                    Export your tasks table for viewing in Microsoft Excel or Google Sheets.
                  </p>
                  <button
                    onClick={handleExportCsv}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Tasks CSV</span>
                  </button>
                </div>
              </div>

              {/* Import Section */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <h4 className="text-xs font-bold text-navy">Import Workspace Backup</h4>
                <p className="text-[11px] text-slate-500">
                  Restore workspace data from a previously downloaded Social Hub JSON file.
                </p>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy hover:bg-slate-100 transition-colors shadow-sm">
                  <Upload className="w-3.5 h-3.5 text-primary" />
                  <span>Choose JSON File to Import</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Reset to Sample Data */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-navy">Restore Sample Data</h4>
                  <p className="text-[11px] text-slate-400">Reset accounts, tasks, and content back to default demo data</p>
                </div>
                <button
                  onClick={handleResetData}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restore Defaults</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
