'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Grid,
  List,
  ExternalLink,
  Edit2,
  Trash2,
  Archive,
  RefreshCw,
  Calendar,
  CheckSquare,
  FileText,
  BarChart2,
  MoreVertical,
  CheckCircle2,
} from 'lucide-react';
import {
  getAccounts,
  getTasks,
  getContent,
  getAnalytics,
  deleteAccount,
  toggleArchiveAccount,
  subscribeToStore,
} from '@/lib/storage/storage-provider';
import { SocialAccount, PlatformType } from '@/types/account';
import { PlatformIcon } from '@/components/ui/PlatformIcon';
import { Badge } from '@/components/ui/Badge';
import { useGlobalModals } from '@/components/modals/GlobalModalsContext';
import { Modal } from '@/components/ui/Modal';
import { isTaskDueToday, formatDisplayDate } from '@/lib/date-utils';
import { cn } from '@/lib/utils';

export default function AccountsPage() {
  const { openAccountModal, openTaskModal, openContentModal, openAnalyticsModal } = useGlobalModals();

  const [accounts, setAccounts] = useState(getAccounts());
  const [tasks, setTasks] = useState(getTasks());
  const [contentList, setContentList] = useState(getContent());
  const [analytics, setAnalytics] = useState(getAnalytics());

  const [platformFilter, setPlatformFilter] = useState<'all' | PlatformType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Account Detail View modal state
  const [selectedAccount, setSelectedAccount] = useState<SocialAccount | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'tasks' | 'content' | 'stats'>('overview');

  useEffect(() => {
    const refreshData = () => {
      setAccounts(getAccounts());
      setTasks(getTasks());
      setContentList(getContent());
      setAnalytics(getAnalytics());
    };
    return subscribeToStore(refreshData);
  }, []);

  // Filter accounts
  const filteredAccounts = accounts.filter((acc) => {
    if (platformFilter !== 'all' && acc.platform !== platformFilter) return false;
    if (statusFilter !== 'all' && acc.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return acc.name.toLowerCase().includes(q) || acc.handle.toLowerCase().includes(q) || acc.category.toLowerCase().includes(q);
    }
    return true;
  });

  const handleDeleteAccount = (acc: SocialAccount) => {
    if (confirm(`Are you sure you want to delete "${acc.name}"? This will also remove associated tasks and content.`)) {
      deleteAccount(acc.id);
      if (selectedAccount?.id === acc.id) setSelectedAccount(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">My Accounts</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage and monitor all your connected social pages and channels</p>
        </div>

        <button
          onClick={() => openAccountModal()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-primary shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-soft">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as 'all' | PlatformType)}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-navy focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'archived')}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-navy focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="archived">Archived</option>
          </select>

          {/* Search Field */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search accounts by name, handle, niche..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 self-end md:self-auto bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              viewMode === 'grid' ? 'bg-white text-navy shadow-sm' : 'text-slate-400 hover:text-navy'
            )}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              viewMode === 'list' ? 'bg-white text-navy shadow-sm' : 'text-slate-400 hover:text-navy'
            )}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Account Cards Grid or List */}
      {filteredAccounts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-navy text-base">No accounts found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your filters or click &ldquo;Add Account&rdquo; to connect a new page or channel.
          </p>
          <button
            onClick={() => openAccountModal()}
            className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-primary shadow-indigo-500/25"
          >
            + Add New Account
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAccounts.map((acc) => {
            const accTasksToday = tasks.filter((t) => t.accountId === acc.id && isTaskDueToday(t.dueDate));
            return (
              <div
                key={acc.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={acc.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={acc.name}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100"
                        />
                        <div className="absolute -bottom-1 -right-1">
                          <PlatformIcon platform={acc.platform} size={14} />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-navy text-sm group-hover:text-primary transition-colors flex items-center gap-1.5">
                          <span>{acc.name}</span>
                          {acc.profileUrl && (
                            <a
                              href={acc.profileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-300 hover:text-primary transition-colors"
                              title="Open External URL"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">{acc.handle}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={acc.status === 'active' ? 'success' : 'default'} size="sm">
                        {acc.status}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-semibold">{acc.category}</span>
                    </div>
                  </div>

                  {/* Description / Bio */}
                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {acc.description || 'No description provided.'}
                  </p>

                  {/* Quick stats in card */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-4">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Today&apos;s Tasks</p>
                      <p className="font-bold text-navy mt-0.5">{accTasksToday.length} due</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Last Posted</p>
                      <p className="font-bold text-navy mt-0.5">{formatDisplayDate(acc.lastPostedAt) || 'None'}</p>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedAccount(acc);
                        setDetailTab('overview');
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-navy bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openAccountModal(acc)}
                      className="px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary-light rounded-xl transition-colors"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      onClick={() => openTaskModal(undefined, acc.id)}
                      className="p-1.5 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                      title="Create Task"
                    >
                      <CheckSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openContentModal(undefined, acc.id)}
                      className="p-1.5 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Add Content"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleArchiveAccount(acc.id)}
                      className="p-1.5 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title={acc.status === 'active' ? 'Archive Account' : 'Restore Account'}
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(acc)}
                      className="p-1.5 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Delete Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden divide-y divide-slate-100">
          {filteredAccounts.map((acc) => {
            const accTasksToday = tasks.filter((t) => t.accountId === acc.id && isTaskDueToday(t.dueDate));
            return (
              <div
                key={acc.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 hover:bg-slate-50/70 transition-colors gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="relative">
                    <img
                      src={acc.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={acc.name}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100"
                    />
                    <div className="absolute -bottom-1 -right-1">
                      <PlatformIcon platform={acc.platform} size={12} />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-navy text-sm truncate">{acc.name}</h4>
                    <p className="text-xs text-slate-400 font-medium">{acc.handle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                    {acc.category}
                  </span>
                  <span>{accTasksToday.length} tasks today</span>
                  <Badge variant={acc.status === 'active' ? 'success' : 'default'} size="sm">
                    {acc.status}
                  </Badge>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedAccount(acc);
                        setDetailTab('overview');
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-navy bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openAccountModal(acc)}
                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(acc)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
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

      {/* Account Details Modal */}
      {selectedAccount && (
        <Modal
          isOpen={!!selectedAccount}
          onClose={() => setSelectedAccount(null)}
          title={selectedAccount.name}
          subtitle={`${selectedAccount.handle} • ${selectedAccount.platform.toUpperCase()}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex border-b border-slate-100 text-xs font-bold text-slate-500 gap-4 pb-2">
              <button
                onClick={() => setDetailTab('overview')}
                className={cn('pb-2 transition-colors relative', detailTab === 'overview' && 'text-primary font-black')}
              >
                Overview
                {detailTab === 'overview' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
              <button
                onClick={() => setDetailTab('tasks')}
                className={cn('pb-2 transition-colors relative', detailTab === 'tasks' && 'text-primary font-black')}
              >
                Tasks ({tasks.filter((t) => t.accountId === selectedAccount.id).length})
                {detailTab === 'tasks' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
              <button
                onClick={() => setDetailTab('content')}
                className={cn('pb-2 transition-colors relative', detailTab === 'content' && 'text-primary font-black')}
              >
                Content ({contentList.filter((c) => c.accountId === selectedAccount.id).length})
                {detailTab === 'content' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
              <button
                onClick={() => setDetailTab('stats')}
                className={cn('pb-2 transition-colors relative', detailTab === 'stats' && 'text-primary font-black')}
              >
                Statistics
                {detailTab === 'stats' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
            </div>

            {/* Tab 1: Overview */}
            {detailTab === 'overview' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <img
                    src={selectedAccount.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={selectedAccount.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow-sm"
                  />
                  <div>
                    <h4 className="font-bold text-navy text-sm">{selectedAccount.name}</h4>
                    <p className="text-slate-400 font-medium">{selectedAccount.handle}</p>
                    <p className="text-slate-500 mt-1">{selectedAccount.category}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Posting Goal</span>
                    <p className="font-bold text-navy mt-0.5">{selectedAccount.postingGoal || 'Not set'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Target Audience</span>
                    <p className="font-bold text-navy mt-0.5">{selectedAccount.targetAudience || 'Not specified'}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Bio / Description</span>
                  <p className="text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedAccount.description || 'No description provided.'}
                  </p>
                </div>

                {selectedAccount.notes && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Strategy Notes</span>
                    <p className="text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {selectedAccount.notes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Account Tasks */}
            {detailTab === 'tasks' && (
              <div className="space-y-2">
                <div className="flex justify-end">
                  <button
                    onClick={() => openTaskModal(undefined, selectedAccount.id)}
                    className="px-3 py-1.5 text-xs font-bold text-primary bg-primary-light rounded-lg"
                  >
                    + Add Task For This Account
                  </button>
                </div>
                {tasks.filter((t) => t.accountId === selectedAccount.id).length === 0 ? (
                  <p className="text-center py-8 text-slate-400 text-xs">No tasks currently assigned to this account.</p>
                ) : (
                  tasks
                    .filter((t) => t.accountId === selectedAccount.id)
                    .map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                      >
                        <span className="font-bold text-navy">{t.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">{t.dueDate}</span>
                          <span className="capitalize px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                            {t.status}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}

            {/* Tab 3: Account Content */}
            {detailTab === 'content' && (
              <div className="space-y-2">
                <div className="flex justify-end">
                  <button
                    onClick={() => openContentModal(undefined, selectedAccount.id)}
                    className="px-3 py-1.5 text-xs font-bold text-primary bg-primary-light rounded-lg"
                  >
                    + New Content Idea
                  </button>
                </div>
                {contentList.filter((c) => c.accountId === selectedAccount.id).length === 0 ? (
                  <p className="text-center py-8 text-slate-400 text-xs">No content items stored for this account.</p>
                ) : (
                  contentList
                    .filter((c) => c.accountId === selectedAccount.id)
                    .map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                      >
                        <div>
                          <p className="font-bold text-navy">{c.title}</p>
                          <p className="text-[11px] text-slate-400 capitalize">{c.contentType}</p>
                        </div>
                        <span className="capitalize px-2 py-0.5 rounded-full bg-indigo-50 text-primary text-[10px] font-bold">
                          {c.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))
                )}
              </div>
            )}

            {/* Tab 4: Statistics */}
            {detailTab === 'stats' && (
              <div className="space-y-3">
                <div className="flex justify-end">
                  <button
                    onClick={() => openAnalyticsModal(undefined, selectedAccount.id)}
                    className="px-3 py-1.5 text-xs font-bold text-primary bg-primary-light rounded-lg"
                  >
                    + Log Verified Metrics
                  </button>
                </div>
                {analytics.filter((a) => a.accountId === selectedAccount.id).length === 0 ? (
                  <p className="text-center py-8 text-slate-400 text-xs">No metrics logged for this account yet.</p>
                ) : (
                  analytics
                    .filter((a) => a.accountId === selectedAccount.id)
                    .map((an) => (
                      <div
                        key={an.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                      >
                        <div className="flex justify-between font-bold text-navy">
                          <span>{an.date}</span>
                          <span className="text-primary font-black">{an.followers.toLocaleString()} Followers</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-slate-500 text-[11px]">
                          <span>Views: {an.views.toLocaleString()}</span>
                          <span>Likes: {an.likes || 0}</span>
                          <span>Comments: {an.comments || 0}</span>
                          <span>Posts: {an.postsPublished || 0}</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
