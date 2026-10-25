'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  Plus,
  Menu,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Share2,
  FileText,
  UserPlus,
  CheckSquare,
  Sparkles,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useGlobalModals } from '@/components/modals/GlobalModalsContext';
import { getTasks, getAccounts, getContent, getProjects, getSettings } from '@/lib/storage/storage-provider';
import { isTaskOverdue, isTaskDueToday, formatDisplayDate } from '@/lib/date-utils';
import { PlatformIcon } from '@/components/ui/PlatformIcon';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const { openAccountModal, openTaskModal, openContentModal } = useGlobalModals();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const [tasks, setTasks] = useState(getTasks());
  const [accounts, setAccounts] = useState(getAccounts());
  const [contentList, setContentList] = useState(getContent());
  const [projects, setProjects] = useState(getProjects());
  const [settings, setSettings] = useState(getSettings());

  const quickAddRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleStorageChange = () => {
      setTasks(getTasks());
      setAccounts(getAccounts());
      setContentList(getContent());
      setProjects(getProjects());
      setSettings(getSettings());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (quickAddRef.current && !quickAddRef.current.contains(e.target as Node)) {
        setIsQuickAddOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const overdueTasks = tasks.filter((t) => isTaskOverdue(t.dueDate, t.status));
  const dueTodayTasks = tasks.filter((t) => isTaskDueToday(t.dueDate) && t.status !== 'completed');
  const notificationCount = overdueTasks.length + dueTodayTasks.length;

  // Search filtering
  const filteredAccounts = searchQuery.trim()
    ? accounts.filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.handle.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  const filteredTasks = searchQuery.trim()
    ? tasks.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  const filteredContent = searchQuery.trim()
    ? contentList.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.idea?.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  const hasSearchResults = filteredAccounts.length > 0 || filteredTasks.length > 0 || filteredContent.length > 0;

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-100 bg-white/80 px-4 sm:px-8 backdrop-blur-md">
      {/* Left side: Hamburger and Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-lg">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-navy hover:bg-slate-100 transition-colors"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div ref={searchRef} className="relative flex-1">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search accounts, tasks, content..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isSearchOpen && searchQuery.trim() && (
            <div className="absolute left-0 mt-2 w-full max-w-md rounded-2xl bg-white p-3 shadow-xl border border-slate-100 z-50 max-h-96 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
              {!hasSearchResults ? (
                <div className="p-4 text-center text-sm text-slate-400">
                  No results found for &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAccounts.length > 0 && (
                    <div>
                      <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Accounts</p>
                      {filteredAccounts.slice(0, 3).map((acc) => (
                        <Link
                          key={acc.id}
                          href={`/accounts`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <PlatformIcon platform={acc.platform} size={16} />
                          <div>
                            <p className="text-sm font-semibold text-navy">{acc.name}</p>
                            <p className="text-xs text-slate-400">{acc.handle}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {filteredTasks.length > 0 && (
                    <div>
                      <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Tasks</p>
                      {filteredTasks.slice(0, 3).map((task) => (
                        <Link
                          key={task.id}
                          href="/tasks"
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <PlatformIcon platform={task.platform} size={14} />
                            <span className="text-sm text-navy truncate font-medium">{task.title}</span>
                          </div>
                          <span className="text-xs text-slate-400 shrink-0">{task.dueDate}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {filteredContent.length > 0 && (
                    <div>
                      <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Content</p>
                      {filteredContent.slice(0, 3).map((item) => (
                        <Link
                          key={item.id}
                          href="/content"
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <span className="text-sm text-navy truncate font-medium">{item.title}</span>
                          <span className="text-xs capitalize text-primary font-medium">{item.status.replace('_', ' ')}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-2.5 rounded-xl text-slate-500 hover:text-navy hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {notificationCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white p-4 shadow-xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <h4 className="font-bold text-navy text-sm">Notifications</h4>
                <span className="text-xs text-slate-400 font-medium">{notificationCount} pending</span>
              </div>

              {notificationCount === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-semibold text-navy">All caught up!</p>
                  <p className="text-xs text-slate-400 mt-1">No overdue or pending tasks today.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {overdueTasks.map((t) => (
                    <div key={t.id} className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100/60">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-rose-900 truncate">{t.title}</p>
                          <p className="text-[11px] text-rose-700/80">Overdue (Due {formatDisplayDate(t.dueDate)})</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {dueTodayTasks.map((t) => (
                    <div key={t.id} className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100/60">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-amber-900 truncate">{t.title}</p>
                          <p className="text-[11px] text-amber-700/80">Due today at {t.dueTime || 'end of day'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick-Add Button with Dropdown */}
        <div ref={quickAddRef} className="relative">
          <button
            onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-primary shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Quick Add</span>
          </button>

          {isQuickAddOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  setIsQuickAddOpen(false);
                  openAccountModal();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-navy hover:bg-slate-50 rounded-xl transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <span>Add Account</span>
              </button>

              <button
                onClick={() => {
                  setIsQuickAddOpen(false);
                  openTaskModal();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-navy hover:bg-slate-50 rounded-xl transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <span>Create Task</span>
              </button>

              <button
                onClick={() => {
                  setIsQuickAddOpen(false);
                  openContentModal();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-navy hover:bg-slate-50 rounded-xl transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <span>Add Content Idea</span>
              </button>

              <Link
                href="/calendar"
                onClick={() => setIsQuickAddOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-navy hover:bg-slate-50 rounded-xl transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <span>Schedule Content</span>
              </Link>
            </div>
          )}
        </div>

        {/* User Profile Avatar Link */}
        <Link href="/settings" className="relative group">
          <img
            src={settings.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={settings.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary transition-all"
          />
        </Link>
      </div>
    </header>
  );
};
