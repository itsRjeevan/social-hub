'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useGlobalModals } from './GlobalModalsContext';
import { ContentItem, ContentType, ContentStatus } from '@/types/content';
import { PlatformType } from '@/types/account';
import { getAccounts, saveContentItem, getProjects } from '@/lib/storage/storage-provider';
import { getTodayDateString } from '@/lib/date-utils';
import { Upload, Sparkles } from 'lucide-react';

const CONTENT_TYPES: { label: string; value: ContentType }[] = [
  { label: 'Reel', value: 'reel' },
  { label: 'YouTube Short', value: 'short' },
  { label: 'Long Video', value: 'video' },
  { label: 'Facebook Video', value: 'facebook_video' },
  { label: 'Carousel Post', value: 'carousel' },
  { label: 'Image Post', value: 'image' },
  { label: 'Story', value: 'story' },
  { label: 'Text Post', value: 'text' },
];

const CONTENT_STATUSES: { label: string; value: ContentStatus }[] = [
  { label: 'Idea', value: 'idea' },
  { label: 'Research', value: 'research' },
  { label: 'Script Ready', value: 'script_ready' },
  { label: 'Editing', value: 'editing' },
  { label: 'Ready to Publish', value: 'ready_to_publish' },
  { label: 'Published', value: 'published' },
];

export const ContentModal: React.FC = () => {
  const { isContentModalOpen, closeContentModal, editingContent, defaultContentAccount, defaultContentDate } = useGlobalModals();
  const [accounts, setAccounts] = useState(getAccounts());
  const [projects, setProjects] = useState(getProjects());

  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<PlatformType>('instagram');
  const [accountId, setAccountId] = useState('');
  const [contentType, setContentType] = useState<ContentType>('reel');
  const [status, setStatus] = useState<ContentStatus>('idea');
  const [idea, setIdea] = useState('');
  const [script, setScript] = useState('');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [cta, setCta] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [assetUrl, setAssetUrl] = useState('');
  const [plannedDate, setPlannedDate] = useState(getTodayDateString());
  const [projectId, setProjectId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadedAccounts = getAccounts();
    setAccounts(loadedAccounts);
    setProjects(getProjects());

    if (editingContent) {
      setTitle(editingContent.title);
      setPlatform(editingContent.platform);
      setAccountId(editingContent.accountId);
      setContentType(editingContent.contentType);
      setStatus(editingContent.status);
      setIdea(editingContent.idea || '');
      setScript(editingContent.script || '');
      setCaption(editingContent.caption || '');
      setHashtags(editingContent.hashtags || '');
      setCta(editingContent.cta || '');
      setThumbnail(editingContent.thumbnail || '');
      setAssetUrl(editingContent.assetUrl || '');
      setPlannedDate(editingContent.plannedDate || getTodayDateString());
      setProjectId(editingContent.projectId || '');
      setNotes(editingContent.notes || '');
    } else {
      const initialAcc = defaultContentAccount
        ? loadedAccounts.find((a) => a.id === defaultContentAccount)
        : loadedAccounts[0];

      setTitle('');
      setAccountId(initialAcc ? initialAcc.id : '');
      setPlatform(initialAcc ? initialAcc.platform : 'instagram');
      setContentType('reel');
      setStatus('idea');
      setIdea('');
      setScript('');
      setCaption('');
      setHashtags('');
      setCta('');
      setThumbnail('https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop&q=80');
      setAssetUrl('');
      setPlannedDate(defaultContentDate || getTodayDateString());
      setProjectId('');
      setNotes('');
    }
    setError('');
  }, [editingContent, isContentModalOpen, defaultContentAccount, defaultContentDate]);

  const handleAccountChange = (id: string) => {
    setAccountId(id);
    const selected = accounts.find((a) => a.id === id);
    if (selected) {
      setPlatform(selected.platform);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Thumbnail image must be under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Content title is required.');
      return;
    }
    if (!accountId) {
      setError('Please select a target account.');
      return;
    }

    const newItem: ContentItem = {
      id: editingContent ? editingContent.id : `content-${Date.now()}`,
      title: title.trim(),
      platform,
      accountId,
      contentType,
      status,
      idea: idea.trim() || undefined,
      script: script.trim() || undefined,
      caption: caption.trim() || undefined,
      hashtags: hashtags.trim() || undefined,
      cta: cta.trim() || undefined,
      thumbnail: thumbnail.trim() || undefined,
      assetUrl: assetUrl.trim() || undefined,
      plannedDate: plannedDate || undefined,
      projectId: projectId || undefined,
      notes: notes.trim() || undefined,
      createdAt: editingContent ? editingContent.createdAt : new Date().toISOString(),
    };

    saveContentItem(newItem);
    closeContentModal();
  };

  return (
    <Modal
      isOpen={isContentModalOpen}
      onClose={closeContentModal}
      title={editingContent ? 'Edit Content Item' : 'New Content Idea'}
      subtitle="Store scripts, captions, hashtags, and schedule posts across platforms"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Content Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 5 Habits That Changed My Life, Psychology Behind Procrastination..."
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
            required
          />
        </div>

        {/* Account & Format & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Account</label>
            <select
              value={accountId}
              onChange={(e) => handleAccountChange(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.platform})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Content Type</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
            >
              {CONTENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Workflow Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ContentStatus)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
            >
              {CONTENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Planned Date & Project */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Planned Publication Date</label>
            <input
              type="date"
              value={plannedDate}
              onChange={(e) => setPlannedDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Project / Campaign</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
            >
              <option value="">None</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Idea or Concept */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Idea / Hook / Concept</label>
          <input
            type="text"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Core angle, target emotion, or key takeaway..."
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
          />
        </div>

        {/* Script & Caption Tabs/Split */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Script / Teleprompter Notes</label>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              rows={4}
              placeholder="Hook (0-3s): ...&#10;Body: ...&#10;Call to action: ..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy font-mono text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Caption / Description</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              placeholder="Write the full post caption for your audience..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
            />
          </div>
        </div>

        {/* Hashtags & CTA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hashtags</label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#mindset #growth #psychology"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Call to Action (CTA)</label>
            <input
              type="text"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              placeholder="e.g. Save this reel for tomorrow morning!"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
            />
          </div>
        </div>

        {/* Media Assets (Thumbnail & Video Link) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Thumbnail Preview / Image</label>
            <div className="flex items-center gap-3">
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt="Thumbnail"
                  className="w-12 h-12 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                />
              )}
              <label className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
                <Upload className="w-3.5 h-3.5 text-primary" />
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">External Asset Link (Drive / Video)</label>
            <input
              type="url"
              value={assetUrl}
              onChange={(e) => setAssetUrl(e.target.value)}
              placeholder="https://drive.google.com/file/..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={closeContentModal}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-navy hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-primary shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {editingContent ? 'Save Changes' : 'Save Content Idea'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
