'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Layers,
  Calendar,
  CheckSquare,
  FileText,
  Users,
  Edit2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import {
  getProjects,
  getTasks,
  getContent,
  getAccounts,
  deleteProject,
  subscribeToStore,
} from '@/lib/storage/storage-provider';
import { Project, ProjectStatus } from '@/types/project';
import { PlatformIcon } from '@/components/ui/PlatformIcon';
import { useGlobalModals } from '@/components/modals/GlobalModalsContext';
import { formatDisplayDate } from '@/lib/date-utils';
import { cn } from '@/lib/utils';

export default function ProjectsPage() {
  const { openProjectModal, openTaskModal, openContentModal } = useGlobalModals();

  const [projects, setProjects] = useState(getProjects());
  const [tasks, setTasks] = useState(getTasks());
  const [contentList, setContentList] = useState(getContent());
  const [accounts, setAccounts] = useState(getAccounts());

  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');

  useEffect(() => {
    const refreshData = () => {
      setProjects(getProjects());
      setTasks(getTasks());
      setContentList(getContent());
      setAccounts(getAccounts());
    };
    return subscribeToStore(refreshData);
  }, []);

  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  const filteredProjects = projects.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  const handleDelete = (project: Project) => {
    if (confirm(`Delete project "${project.name}"? Tasks and content will remain but will be unlinked.`)) {
      deleteProject(project.id);
    }
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">Active</span>;
      case 'on_hold':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">On Hold</span>;
      case 'completed':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-50 text-primary border border-indigo-200/60">Completed</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">Projects & Campaigns</h1>
          <p className="text-sm text-slate-500 mt-0.5">Group your social accounts, tasks, and content into unified production pipelines</p>
        </div>

        <button
          onClick={() => openProjectModal()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-primary shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-soft w-fit text-xs font-bold">
        {(['all', 'active', 'on_hold', 'completed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'px-4 py-1.5 rounded-xl capitalize transition-all',
              statusFilter === s ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-navy'
            )}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Project Cards Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-navy text-base">No projects found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Create a project or campaign to coordinate daily tasks, content pipelines, and multi-channel strategies.
          </p>
          <button
            onClick={() => openProjectModal()}
            className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-primary shadow-indigo-500/25"
          >
            + Create New Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.map((project) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id);
            const projectContent = contentList.filter((c) => c.projectId === project.id);
            const completedTasks = projectTasks.filter((t) => t.status === 'completed');

            const progress = projectTasks.length > 0
              ? Math.round((completedTasks.length / projectTasks.length) * 100)
              : project.status === 'completed'
              ? 100
              : 50;

            return (
              <div
                key={project.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all p-6 flex flex-col justify-between group"
              >
                <div>
                  {/* Top: Name & Status */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-navy text-base group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                          <span>{project.accountIds.length} {project.accountIds.length === 1 ? 'account' : 'accounts'}</span>
                          <span>•</span>
                          <span>{projectTasks.length} tasks</span>
                          <span>•</span>
                          <span>{projectContent.length} content</span>
                        </div>
                      </div>
                    </div>

                    {getStatusBadge(project.status)}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-2 my-3 leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>

                  {/* Account Icons participating */}
                  {project.accountIds.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-4">
                      {project.accountIds.map((accId) => {
                        const acc = accountMap.get(accId);
                        if (!acc) return null;
                        return (
                          <div
                            key={accId}
                            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold"
                          >
                            <PlatformIcon platform={acc.platform} size={11} />
                            <span>{acc.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Progress Bar & Percentage */}
                  <div className="space-y-1.5 my-3">
                    <div className="flex justify-between text-xs font-bold text-navy">
                      <span className="text-slate-500">Progress</span>
                      <span className="text-primary font-black">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Started {formatDisplayDate(project.startDate)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openTaskModal()}
                      className="px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary-light rounded-lg transition-colors"
                    >
                      + Task
                    </button>
                    <button
                      onClick={() => openProjectModal(project)}
                      className="p-1.5 text-slate-400 hover:text-navy hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(project)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
