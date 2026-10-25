'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useGlobalModals } from './GlobalModalsContext';
import { Task, TaskPriority, TaskStatus, RecurringSchedule } from '@/types/task';
import { PlatformType } from '@/types/account';
import { getAccounts, saveTask, getContent, getProjects } from '@/lib/storage/storage-provider';
import { getTodayDateString } from '@/lib/date-utils';
import { PlatformIcon } from '@/components/ui/PlatformIcon';
import { Repeat } from 'lucide-react';

const TASK_CATEGORIES = [
  'Content Creation',
  'Editing',
  'Copywriting',
  'Design',
  'Community',
  'Research',
  'Analytics',
  'Publishing',
  'Administrative',
  'Other',
];

export const TaskModal: React.FC = () => {
  const { isTaskModalOpen, closeTaskModal, editingTask, defaultTaskAccount, defaultTaskDueDate } = useGlobalModals();
  const [accounts, setAccounts] = useState(getAccounts());
  const [contentList, setContentList] = useState(getContent());
  const [projects, setProjects] = useState(getProjects());

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [accountId, setAccountId] = useState('');
  const [platform, setPlatform] = useState<PlatformType>('instagram');
  const [category, setCategory] = useState('Content Creation');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [dueTime, setDueTime] = useState('10:00 AM');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringSchedule, setRecurringSchedule] = useState<RecurringSchedule>('daily');
  const [relatedContentId, setRelatedContentId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadedAccounts = getAccounts();
    setAccounts(loadedAccounts);
    setContentList(getContent());
    setProjects(getProjects());

    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setAccountId(editingTask.accountId);
      setPlatform(editingTask.platform);
      setCategory(editingTask.category);
      setDueDate(editingTask.dueDate);
      setDueTime(editingTask.dueTime || '');
      setPriority(editingTask.priority);
      setStatus(editingTask.status);
      setIsRecurring(editingTask.isRecurring || false);
      setRecurringSchedule(editingTask.recurringSchedule || 'daily');
      setRelatedContentId(editingTask.relatedContentId || '');
      setProjectId(editingTask.projectId || '');
      setNotes(editingTask.notes || '');
    } else {
      const initialAcc = defaultTaskAccount
        ? loadedAccounts.find((a) => a.id === defaultTaskAccount)
        : loadedAccounts[0];

      setTitle('');
      setDescription('');
      setAccountId(initialAcc ? initialAcc.id : '');
      setPlatform(initialAcc ? initialAcc.platform : 'instagram');
      setCategory('Content Creation');
      setDueDate(defaultTaskDueDate || getTodayDateString());
      setDueTime('10:00 AM');
      setPriority('medium');
      setStatus('pending');
      setIsRecurring(false);
      setRecurringSchedule('daily');
      setRelatedContentId('');
      setProjectId('');
      setNotes('');
    }
    setError('');
  }, [editingTask, isTaskModalOpen, defaultTaskAccount, defaultTaskDueDate]);

  const handleAccountChange = (id: string) => {
    setAccountId(id);
    const selected = accounts.find((a) => a.id === id);
    if (selected) {
      setPlatform(selected.platform);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }
    if (!accountId) {
      setError('Please select an account for this task.');
      return;
    }

    const newTask: Task = {
      id: editingTask ? editingTask.id : `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      accountId,
      platform,
      category,
      dueDate,
      dueTime: dueTime.trim() || undefined,
      priority,
      status,
      completedAt: status === 'completed' ? editingTask?.completedAt || new Date().toISOString() : undefined,
      isRecurring,
      recurringSchedule: isRecurring ? recurringSchedule : undefined,
      relatedContentId: relatedContentId || undefined,
      projectId: projectId || undefined,
      notes: notes.trim() || undefined,
      createdAt: editingTask ? editingTask.createdAt : new Date().toISOString(),
    };

    saveTask(newTask);
    closeTaskModal();
  };

  return (
    <Modal
      isOpen={isTaskModalOpen}
      onClose={closeTaskModal}
      title={editingTask ? 'Edit Task' : 'Create Daily Task'}
      subtitle="Organize deadlines, reminders, and daily social media activities"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        {/* Task Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Task Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Create Instagram Reel, Edit YouTube Short..."
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
            required
          />
        </div>

        {/* Account and Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Associated Account <span className="text-rose-500">*</span>
            </label>
            <select
              value={accountId}
              onChange={(e) => handleAccountChange(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
              required
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.handle}) - {acc.platform}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
            >
              {TASK_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date and Due Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Due Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Due Time (Optional)</label>
            <input
              type="text"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              placeholder="e.g. 10:00 AM or 14:00"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
            />
          </div>
        </div>

        {/* Priority & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((p) => {
                const isSelected = priority === p;
                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg capitalize border transition-all ${
                      isSelected
                        ? p === 'urgent' || p === 'high'
                          ? 'bg-rose-500 text-white border-rose-500'
                          : p === 'medium'
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Recurring Task Options */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-navy">Recurring Task</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {isRecurring && (
            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">Schedule:</span>
              <div className="flex gap-2">
                {(['daily', 'weekly'] as RecurringSchedule[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRecurringSchedule(s)}
                    className={`px-3 py-1 text-xs rounded-lg font-semibold capitalize transition-all ${
                      recurringSchedule === s
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Project & Related Content Linking */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Project / Campaign (Optional)</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
            >
              <option value="">None (Independent Task)</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Attach Content Idea (Optional)</label>
            <select
              value={relatedContentId}
              onChange={(e) => setRelatedContentId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
            >
              <option value="">None</option>
              {contentList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.contentType})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description & Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Add relevant instructions, links, or guidelines for this task..."
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={closeTaskModal}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-navy hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-primary shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {editingTask ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
