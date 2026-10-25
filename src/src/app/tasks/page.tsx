'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Check,
  CheckSquare,
  Clock,
  Calendar,
  AlertCircle,
  Copy,
  Edit2,
  Trash2,
  Repeat,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import {
  getTasks,
  getAccounts,
  saveTask,
  deleteTask,
  toggleTaskStatus,
  bulkCompleteTasks,
  bulkDeleteTasks,
  subscribeToStore,
} from '@/lib/storage/storage-provider';
import { Task, TaskPriority, TaskStatus } from '@/types/task';
import { PlatformType } from '@/types/account';
import { PlatformIcon } from '@/components/ui/PlatformIcon';
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import { useGlobalModals } from '@/components/modals/GlobalModalsContext';
import { isTaskDueToday, isTaskDueTomorrow, isTaskOverdue, formatDisplayDate, formatHeaderDate } from '@/lib/date-utils';
import { fireSuccessConfetti } from '@/lib/confetti';
import { cn } from '@/lib/utils';

export default function DailyTasksPage() {
  const { openTaskModal } = useGlobalModals();

  const [tasks, setTasks] = useState(getTasks());
  const [accounts, setAccounts] = useState(getAccounts());

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'overdue'>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | PlatformType>('all');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority'>('deadline');

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  useEffect(() => {
    const refreshData = () => {
      setTasks(getTasks());
      setAccounts(getAccounts());
    };
    return subscribeToStore(refreshData);
  }, []);

  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  // Counts for tabs
  const pendingCount = tasks.filter((t) => t.status === 'pending' && !isTaskOverdue(t.dueDate, t.status)).length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const overdueCount = tasks.filter((t) => isTaskOverdue(t.dueDate, t.status)).length;

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    // Tab filtering
    if (activeTab === 'pending') {
      if (t.status !== 'pending' || isTaskOverdue(t.dueDate, t.status)) return false;
    } else if (activeTab === 'in_progress') {
      if (t.status !== 'in_progress') return false;
    } else if (activeTab === 'completed') {
      if (t.status !== 'completed') return false;
    } else if (activeTab === 'overdue') {
      if (!isTaskOverdue(t.dueDate, t.status)) return false;
    }

    // Platform filter
    if (selectedPlatform !== 'all' && t.platform !== selectedPlatform) return false;

    // Account filter
    if (selectedAccountId !== 'all' && t.accountId !== selectedAccountId) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        t.category.toLowerCase().includes(q)
      );
    }

    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'deadline') {
      return a.dueDate.localeCompare(b.dueDate);
    }
    const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  const handleToggle = (task: Task) => {
    const willBeCompleted = task.status !== 'completed';
    toggleTaskStatus(task.id);
    if (willBeCompleted) {
      fireSuccessConfetti();
    }
  };

  const handleDuplicate = (task: Task) => {
    const duplicated: Task = {
      ...task,
      id: `task-${Date.now()}`,
      title: `${task.title} (Copy)`,
      status: 'pending',
      completedAt: undefined,
      createdAt: new Date().toISOString(),
    };
    saveTask(duplicated);
  };

  const handleDelete = (task: Task) => {
    if (confirm(`Delete task "${task.title}"?`)) {
      deleteTask(task.id);
      setSelectedTaskIds((prev) => prev.filter((id) => id !== task.id));
    }
  };

  const toggleSelectAll = () => {
    if (selectedTaskIds.length === sortedTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(sortedTasks.map((t) => t.id));
    }
  };

  const toggleSelectTask = (id: string) => {
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter((tId) => tId !== id));
    } else {
      setSelectedTaskIds([...selectedTaskIds, id]);
    }
  };

  const handleBulkComplete = () => {
    bulkCompleteTasks(selectedTaskIds);
    fireSuccessConfetti();
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedTaskIds.length} tasks?`)) {
      bulkDeleteTasks(selectedTaskIds);
      setSelectedTaskIds([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">Daily Tasks</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage and track your daily social media tasks</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block px-3.5 py-2 rounded-xl bg-white border border-slate-100 text-xs font-bold text-slate-600 shadow-sm">
            {formatHeaderDate()}
          </div>
          <button
            onClick={() => openTaskModal()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-primary shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: 'all', label: 'All', count: tasks.length },
          { key: 'pending', label: 'Pending', count: pendingCount },
          { key: 'in_progress', label: 'In Progress', count: inProgressCount },
          { key: 'completed', label: 'Completed', count: completedCount },
          { key: 'overdue', label: 'Overdue', count: overdueCount },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all',
                isActive
                  ? 'bg-primary text-white shadow-primary shadow-indigo-500/25'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-full text-[10px]',
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-soft">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Account Filter */}
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-navy focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>

          {/* Platform Filter */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value as any)}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-navy focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
          </select>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search task titles, categories..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Sort selector & Bulk Actions */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          {selectedTaskIds.length > 0 && (
            <div className="flex items-center gap-2 mr-2">
              <span className="text-xs font-bold text-slate-500">{selectedTaskIds.length} selected</span>
              <button
                onClick={handleBulkComplete}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors"
              >
                Complete Selected
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors"
              >
                Delete Selected
              </button>
            </div>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-navy focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="deadline">Sort by Deadline</option>
            <option value="priority">Sort by Priority</option>
          </select>
        </div>
      </div>

      {/* Tasks Table / List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        {/* Table Header on Desktop */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <div className="col-span-5 flex items-center gap-3">
            <input
              type="checkbox"
              checked={sortedTasks.length > 0 && selectedTaskIds.length === sortedTasks.length}
              onChange={toggleSelectAll}
              className="rounded text-primary focus:ring-primary"
            />
            <span>Task Title</span>
          </div>
          <div className="col-span-2">Account</div>
          <div className="col-span-1">Priority</div>
          <div className="col-span-2">Due Date & Time</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* Task Rows */}
        <div className="divide-y divide-slate-100">
          {sortedTasks.length === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
              <h3 className="font-bold text-navy text-base">No tasks match your filter</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Create a new daily task or select another tab to view your schedule.
              </p>
              <button
                onClick={() => openTaskModal()}
                className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-primary shadow-indigo-500/25"
              >
                + Create Task
              </button>
            </div>
          ) : (
            sortedTasks.map((task) => {
              const acc = accountMap.get(task.accountId);
              const isDone = task.status === 'completed';
              const isOverdue = isTaskOverdue(task.dueDate, task.status);
              const isSelected = selectedTaskIds.includes(task.id);

              return (
                <div
                  key={task.id}
                  className={cn(
                    'grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 p-4 md:px-6 items-center hover:bg-slate-50/80 transition-colors',
                    isDone && 'bg-slate-50/40 opacity-70',
                    isSelected && 'bg-primary-light/30'
                  )}
                >
                  {/* Col 1-5: Checkbox & Title */}
                  <div className="col-span-1 md:col-span-5 flex items-start sm:items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectTask(task.id)}
                      className="rounded text-primary focus:ring-primary mt-1 sm:mt-0"
                    />

                    <button
                      onClick={() => handleToggle(task)}
                      className={cn(
                        'w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all mt-0.5 sm:mt-0',
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 hover:border-primary bg-white'
                      )}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0 flex-1">
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
                        {task.isRecurring && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-primary font-bold bg-primary-light px-1.5 py-0.2 rounded">
                            <Repeat className="w-2.5 h-2.5" />
                            {task.recurringSchedule}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Col 6-7: Account */}
                  <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                    {acc ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-navy">
                        <PlatformIcon platform={acc.platform} size={14} />
                        <span className="truncate">{acc.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Unassigned</span>
                    )}
                  </div>

                  {/* Col 8: Priority */}
                  <div className="col-span-1 md:col-span-1">
                    <PriorityBadge priority={task.priority} />
                  </div>

                  {/* Col 9-10: Due Date & Time */}
                  <div className="col-span-1 md:col-span-2 text-xs">
                    <div className="flex items-center gap-1 font-semibold text-navy">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className={cn(isOverdue && 'text-rose-600 font-bold')}>
                        {formatDisplayDate(task.dueDate)}
                      </span>
                    </div>
                    {task.dueTime && (
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.dueTime}
                      </p>
                    )}
                  </div>

                  {/* Col 11: Status */}
                  <div className="col-span-1 md:col-span-1">
                    {isOverdue ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200/60">
                        Overdue
                      </span>
                    ) : (
                      <StatusBadge status={task.status} />
                    )}
                  </div>

                  {/* Col 12: Actions */}
                  <div className="col-span-1 md:col-span-1 flex items-center justify-end gap-1 text-slate-400">
                    <button
                      onClick={() => handleDuplicate(task)}
                      className="p-1.5 hover:text-navy hover:bg-slate-100 rounded-lg transition-colors"
                      title="Duplicate Task"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openTaskModal(task)}
                      className="p-1.5 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(task)}
                      className="p-1.5 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
