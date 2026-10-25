'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Share2,
  FileText,
  Check,
  Edit2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import {
  getAccounts,
  getTasks,
  getContent,
  getSettings,
  toggleTaskStatus,
  subscribeToStore,
} from '@/lib/storage/storage-provider';
import { isTaskDueToday, isTaskOverdue, getGreeting, formatHeaderDate, formatDisplayDate } from '@/lib/date-utils';
import { PlatformIcon } from '@/components/ui/PlatformIcon';
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import { useGlobalModals } from '@/components/modals/GlobalModalsContext';
import { fireSuccessConfetti } from '@/lib/confetti';
import { cn } from '@/lib/utils';
import { Task } from '@/types/task';

export default function DashboardPage() {
  const { openAccountModal, openTaskModal, openContentModal } = useGlobalModals();

  const [accounts, setAccounts] = useState(getAccounts());
  const [tasks, setTasks] = useState(getTasks());
  const [contentList, setContentList] = useState(getContent());
  const [settings, setSettings] = useState(getSettings());
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');

  useEffect(() => {
    const refreshData = () => {
      setAccounts(getAccounts());
      setTasks(getTasks());
      setContentList(getContent());
      setSettings(getSettings());
    };
    return subscribeToStore(refreshData);
  }, []);

  // Filter accounts by platform
  const facebookAccounts = accounts.filter((a) => a.platform === 'facebook');
  const instagramAccounts = accounts.filter((a) => a.platform === 'instagram');
  const youtubeAccounts = accounts.filter((a) => a.platform === 'youtube');

  // Today's tasks calculations
  const todayTasks = tasks.filter((t) => isTaskDueToday(t.dueDate));
  const completedTodayTasks = todayTasks.filter((t) => t.status === 'completed');
  const pendingTasks = tasks.filter((t) => t.status !== 'completed' && !isTaskOverdue(t.dueDate, t.status));
  const overdueTasks = tasks.filter((t) => isTaskOverdue(t.dueDate, t.status));

  // Progress metrics
  const totalTasksTodayCount = todayTasks.length;
  const completedTasksTodayCount = completedTodayTasks.length;
  const progressPercent = totalTasksTodayCount > 0 ? Math.round((completedTasksTodayCount / totalTasksTodayCount) * 100) : 100;

  // Filter today's tasks list based on active tab
  const filteredTodayTasks = todayTasks.filter((t) => {
    if (taskFilter === 'pending') return t.status !== 'completed';
    if (taskFilter === 'completed') return t.status === 'completed';
    if (taskFilter === 'overdue') return isTaskOverdue(t.dueDate, t.status);
    return true;
  });

  const handleToggleTask = (task: Task) => {
    const willBeCompleted = task.status !== 'completed';
    toggleTaskStatus(task.id);
    if (willBeCompleted) {
      fireSuccessConfetti();
    }
  };

  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  return (
    <div className="space-y-7">
      {/* 1. Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-card">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight flex items-center gap-2">
            <span>{getGreeting()}, {settings.name.split(' ')[0]}!</span>
            <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Let&apos;s grow your social media today.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-600">
            {formatHeaderDate()}
          </div>
          <div className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/60 shadow-sm">
            <span>💡</span>
            <span>Small steps create big results!</span>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
        {/* Total Accounts */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft hover:shadow-card transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-navy">{accounts.length}</p>
          <span className="text-[11px] text-slate-400 font-medium">Accounts</span>
        </div>

        {/* Facebook Accounts */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft hover:shadow-card transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">FB</span>
            <PlatformIcon platform="facebook" size={14} />
          </div>
          <p className="text-2xl font-black text-[#1877F2]">{facebookAccounts.length}</p>
          <span className="text-[11px] text-slate-400 font-medium">Facebook</span>
        </div>

        {/* Instagram Accounts */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft hover:shadow-card transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">IG</span>
            <PlatformIcon platform="instagram" size={14} />
          </div>
          <p className="text-2xl font-black text-[#E1306C]">{instagramAccounts.length}</p>
          <span className="text-[11px] text-slate-400 font-medium">Instagram</span>
        </div>

        {/* YouTube Accounts */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft hover:shadow-card transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">YT</span>
            <PlatformIcon platform="youtube" size={14} />
          </div>
          <p className="text-2xl font-black text-[#FF0033]">{youtubeAccounts.length}</p>
          <span className="text-[11px] text-slate-400 font-medium">YouTube</span>
        </div>

        {/* Tasks Due Today */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft hover:shadow-card transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-navy">{totalTasksTodayCount}</p>
          <span className="text-[11px] text-slate-400 font-medium">Tasks Due</span>
        </div>

        {/* Completed Today */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft hover:shadow-card transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Done</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{completedTasksTodayCount}</p>
          <span className="text-[11px] text-slate-400 font-medium">Completed</span>
        </div>

        {/* Pending */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft hover:shadow-card transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending</span>
            <CheckSquare className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-indigo-600">{pendingTasks.length}</p>
          <span className="text-[11px] text-slate-400 font-medium">In Queue</span>
        </div>

        {/* Overdue */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft hover:shadow-card transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Overdue</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600">{overdueTasks.length}</p>
          <span className="text-[11px] text-slate-400 font-medium">Action Needed</span>
        </div>
      </div>

      {/* 3. Middle Section: Today's Progress & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Progress Card (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-navy">Today&apos;s Progress</h3>
              <p className="text-xs text-slate-400 mt-0.5">Stay consistent to reach your channel targets</p>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-primary-light text-primary">
              {progressPercent}% Complete
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 my-2">
            {/* Circular Progress Ring */}
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="46"
                  stroke="#F1F5F9"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="46"
                  stroke="#5856E9"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={289}
                  strokeDashoffset={289 - (289 * progressPercent) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-navy">{progressPercent}%</span>
              </div>
            </div>

            {/* Progress description */}
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div>
                <p className="text-sm font-bold text-navy">
                  {completedTasksTodayCount} of {totalTasksTodayCount} tasks completed
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {totalTasksTodayCount - completedTasksTodayCount === 0
                    ? '🎉 Incredible! All daily tasks are finished!'
                    : `${totalTasksTodayCount - completedTasksTodayCount} tasks remaining today.`}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-indigo-400 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> {completedTasksTodayCount} Done
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> {totalTasksTodayCount - completedTasksTodayCount} Remaining
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-navy mb-1">Quick Actions</h3>
            <p className="text-xs text-slate-400 mb-4">Fast shortcuts to build content and manage workflow</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => openAccountModal()}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 text-[#1877F2] font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] border border-blue-100"
            >
              <div className="w-7 h-7 rounded-lg bg-[#1877F2] text-white flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-left">Add Account</span>
            </button>

            <button
              onClick={() => openTaskModal()}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-50/80 hover:bg-indigo-100/80 text-primary font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] border border-indigo-100"
            >
              <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                <CheckSquare className="w-4 h-4" />
              </div>
              <span className="text-left">Create Task</span>
            </button>

            <button
              onClick={() => openContentModal()}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-700 font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] border border-emerald-100"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-left">Add Content</span>
            </button>

            <Link
              href="/calendar"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-50/80 hover:bg-purple-100/80 text-purple-700 font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] border border-purple-100"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-left">Open Calendar</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Today's Tasks Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-base font-bold text-navy flex items-center gap-2">
              <span>Today&apos;s Tasks</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                {todayTasks.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Click any task checkbox to instantly update daily progress</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Pills */}
            <div className="flex items-center bg-slate-100/80 p-1 rounded-xl text-xs font-semibold">
              {(['all', 'pending', 'completed'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTaskFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    taskFilter === filter ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-navy'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <Link
              href="/tasks"
              className="text-xs font-bold text-primary hover:text-primary-hover px-2 py-1 flex items-center gap-1 transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Task List Items */}
        <div className="divide-y divide-slate-100">
          {filteredTodayTasks.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto mb-2" />
              <p className="text-sm font-bold text-navy">No tasks found for this filter</p>
              <p className="text-xs text-slate-400 mt-1">
                {taskFilter === 'completed'
                  ? 'Complete your first task above!'
                  : 'All tasks completed or none scheduled for today.'}
              </p>
            </div>
          ) : (
            filteredTodayTasks.map((task) => {
              const acc = accountMap.get(task.accountId);
              const isDone = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  className={cn(
                    'flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 hover:bg-slate-50/70 transition-colors gap-3',
                    isDone && 'bg-slate-50/40 opacity-70'
                  )}
                >
                  {/* Left: Checkbox + Title */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <button
                      onClick={() => handleToggleTask(task)}
                      className={cn(
                        'w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all',
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 hover:border-primary bg-white'
                      )}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0">
                      <p
                        className={cn(
                          'text-sm font-bold text-navy truncate',
                          isDone && 'line-through text-slate-400'
                        )}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-400 font-medium">{task.category}</span>
                        {task.dueTime && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            • <Clock className="w-3 h-3" /> {task.dueTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle & Right: Account badge, Priority, Status, Edit */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {acc && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-navy text-xs font-semibold">
                        <PlatformIcon platform={acc.platform} size={13} />
                        <span className="truncate max-w-[120px]">{acc.name}</span>
                      </div>
                    )}

                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />

                    <button
                      onClick={() => openTaskModal(task)}
                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 5. Accounts Overview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-navy">Connected Accounts</h3>
            <p className="text-xs text-slate-400">View and manage posting operations per channel</p>
          </div>
          <Link
            href="/accounts"
            className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
          >
            <span>Manage Accounts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.slice(0, 6).map((acc) => {
            const accTasksToday = tasks.filter((t) => t.accountId === acc.id && isTaskDueToday(t.dueDate));
            return (
              <div
                key={acc.id}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft hover:shadow-card transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={acc.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={acc.name}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100"
                        />
                        <div className="absolute -bottom-1 -right-1">
                          <PlatformIcon platform={acc.platform} size={12} />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-navy text-sm group-hover:text-primary transition-colors">
                          {acc.name}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium">{acc.handle}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {acc.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                    {acc.description || 'No description added.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    {accTasksToday.length} {accTasksToday.length === 1 ? 'task' : 'tasks'} today
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openTaskModal(undefined, acc.id)}
                      className="px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary-light rounded-lg transition-colors"
                    >
                      + Task
                    </button>
                    <Link
                      href={`/accounts`}
                      className="px-2.5 py-1 text-xs font-semibold text-navy bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
