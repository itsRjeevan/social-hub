'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useGlobalModals } from './GlobalModalsContext';
import { Project, ProjectStatus } from '@/types/project';
import { getAccounts, saveProject } from '@/lib/storage/storage-provider';
import { getTodayDateString } from '@/lib/date-utils';
import { PlatformIcon } from '@/components/ui/PlatformIcon';

export const ProjectModal: React.FC = () => {
  const { isProjectModalOpen, closeProjectModal, editingProject } = useGlobalModals();
  const [accounts, setAccounts] = useState(getAccounts());

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setAccounts(getAccounts());
    if (editingProject) {
      setName(editingProject.name);
      setDescription(editingProject.description);
      setSelectedAccountIds(editingProject.accountIds || []);
      setStartDate(editingProject.startDate);
      setEndDate(editingProject.endDate || '');
      setStatus(editingProject.status);
      setNotes(editingProject.notes || '');
    } else {
      setName('');
      setDescription('');
      setSelectedAccountIds([]);
      setStartDate(getTodayDateString());
      setEndDate('');
      setStatus('active');
      setNotes('');
    }
    setError('');
  }, [editingProject, isProjectModalOpen]);

  const toggleAccountSelection = (id: string) => {
    if (selectedAccountIds.includes(id)) {
      setSelectedAccountIds(selectedAccountIds.filter((accId) => accId !== id));
    } else {
      setSelectedAccountIds([...selectedAccountIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }

    const newProject: Project = {
      id: editingProject ? editingProject.id : `proj-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      accountIds: selectedAccountIds,
      startDate,
      endDate: endDate || undefined,
      status,
      notes: notes.trim() || undefined,
      createdAt: editingProject ? editingProject.createdAt : new Date().toISOString(),
    };

    saveProject(newProject);
    closeProjectModal();
  };

  return (
    <Modal
      isOpen={isProjectModalOpen}
      onClose={closeProjectModal}
      title={editingProject ? 'Edit Project / Campaign' : 'New Project / Campaign'}
      subtitle="Group related social accounts, tasks, and content pipelines"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Project / Campaign Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Psychology Shorts, Manga Recap Channel, Q4 Growth Sprint"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="What is the goal and scope of this campaign?"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Participating Accounts
          </label>
          <div className="space-y-1.5 max-h-40 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50">
            {accounts.map((acc) => {
              const isChecked = selectedAccountIds.includes(acc.id);
              return (
                <label
                  key={acc.id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    isChecked ? 'bg-primary-light/50 border border-primary/30' : 'hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleAccountSelection(acc.id)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <PlatformIcon platform={acc.platform} size={14} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-navy truncate">{acc.name}</p>
                    <p className="text-[11px] text-slate-400">{acc.handle}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">End Date (Optional)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
          >
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={closeProjectModal}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-navy hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-primary shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {editingProject ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
