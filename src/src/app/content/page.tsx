'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Grid,
  List,
  Copy,
  Check,
  Calendar,
  Edit2,
  Trash2,
  ExternalLink,
  FileText,
  Video,
  Sparkles,
} from 'lucide-react';
import {
  getContent,
  getAccounts,
  deleteContentItem,
  subscribeToStore,
} from '@/lib/storage/storage-provider';
import { ContentItem, ContentType, ContentStatus } from '@/types/content';
import { PlatformType } from '@/types/account';
import { PlatformIcon } from '@/components/ui/PlatformIcon';
import { ContentStatusBadge } from '@/components/ui/Badge';
import { useGlobalModals } from '@/components/modals/GlobalModalsContext';
import { formatDisplayDate } from '@/lib/date-utils';
import { cn } from '@/lib/utils';

export default function ContentLibraryPage() {
  const { openContentModal } = useGlobalModals();

  const [contentList, setContentList] = useState(getContent());
  const [accounts, setAccounts] = useState(getAccounts());

  const [platformFilter, setPlatformFilter] = useState<'all' | PlatformType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ContentStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | ContentType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const refreshData = () => {
      setContentList(getContent());
      setAccounts(getAccounts());
    };
    return subscribeToStore(refreshData);
  }, []);

  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  const filteredItems = contentList.filter((item) => {
    if (platformFilter !== 'all' && item.platform !== platformFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (typeFilter !== 'all' && item.contentType !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.caption && item.caption.toLowerCase().includes(q)) ||
        (item.script && item.script.toLowerCase().includes(q)) ||
        (item.idea && item.idea.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCopyCaption = (item: ContentItem) => {
    const textToCopy = `${item.caption || ''}\n\n${item.hashtags || ''}`.trim();
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDelete = (item: ContentItem) => {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      deleteContentItem(item.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">Content Library</h1>
          <p className="text-sm text-slate-500 mt-0.5">Store and manage your video ideas, scripts, captions, and media assets</p>
        </div>

        <button
          onClick={() => openContentModal()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-primary shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Content</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-soft">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as any)}
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
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-navy focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Status</option>
            <option value="idea">Idea</option>
            <option value="research">Research</option>
            <option value="script_ready">Script Ready</option>
            <option value="editing">Editing</option>
            <option value="ready_to_publish">Ready to Publish</option>
            <option value="published">Published</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-navy focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Formats</option>
            <option value="reel">Reels</option>
            <option value="short">YouTube Shorts</option>
            <option value="video">Long Videos</option>
            <option value="carousel">Carousels</option>
            <option value="image">Image Posts</option>
          </select>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scripts, captions, topics..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* View Toggle */}
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

      {/* Grid or List View */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-navy text-base">No content items found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or click &ldquo;New Content&rdquo; to store your first idea.
          </p>
          <button
            onClick={() => openContentModal()}
            className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-primary shadow-indigo-500/25"
          >
            + Create New Content
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const acc = accountMap.get(item.accountId);
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail / Media Header */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={item.thumbnail || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop&q=80'}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Top Chips */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <PlatformIcon platform={item.platform} size={13} />
                      {acc && (
                        <span className="text-[11px] font-bold text-white bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full">
                          {acc.name}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <ContentStatusBadge status={item.status} />
                    </div>

                    {/* Bottom Format Chip */}
                    <div className="absolute bottom-3 left-3 text-white">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/90 px-2 py-0.5 rounded-md">
                        {item.contentType.replace('_', ' ')}
                      </span>
                    </div>

                    {item.plannedDate && (
                      <div className="absolute bottom-3 right-3 text-white text-[11px] font-semibold bg-black/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDisplayDate(item.plannedDate)}</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <h3 className="font-extrabold text-navy text-sm group-hover:text-primary transition-colors line-clamp-1">
                      {item.title}
                    </h3>

                    {/* Idea or Caption Preview */}
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.idea || item.caption || item.script || 'No script or caption draft yet.'}
                    </p>

                    {item.hashtags && (
                      <p className="text-[11px] font-medium text-primary line-clamp-1 truncate">
                        {item.hashtags}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {item.caption && (
                      <button
                        onClick={() => handleCopyCaption(item)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                        title="Copy Caption + Hashtags"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? 'Copied' : 'Caption'}</span>
                      </button>
                    )}

                    {item.assetUrl && (
                      <a
                        href={item.assetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-navy hover:bg-slate-100 rounded-lg transition-colors"
                        title="Open Video Asset"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      onClick={() => openContentModal(item)}
                      className="p-1.5 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Content"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Delete Content"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
          {filteredItems.map((item) => {
            const acc = accountMap.get(item.accountId);
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 hover:bg-slate-50/80 transition-colors gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <img
                    src={item.thumbnail || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop&q=80'}
                    alt={item.title}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-100 shrink-0"
                  />

                  <div className="min-w-0">
                    <h4 className="font-bold text-navy text-sm truncate">{item.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <PlatformIcon platform={item.platform} size={11} />
                      <span className="text-xs text-slate-400 font-medium">{acc ? acc.name : ''}</span>
                      <span className="text-xs text-slate-400 capitalize">• {item.contentType}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold">
                  <ContentStatusBadge status={item.status} />

                  {item.plannedDate && (
                    <span className="text-slate-400">{formatDisplayDate(item.plannedDate)}</span>
                  )}

                  <div className="flex items-center gap-2">
                    {item.caption && (
                      <button
                        onClick={() => handleCopyCaption(item)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                      >
                        {isCopied ? 'Copied!' : 'Copy'}
                      </button>
                    )}
                    <button
                      onClick={() => openContentModal(item)}
                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
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
    </div>
  );
}
