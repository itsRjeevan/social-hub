'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useGlobalModals } from './GlobalModalsContext';
import { AnalyticsRecord } from '@/types/analytics';
import { PlatformType } from '@/types/account';
import { getAccounts, saveAnalyticsRecord } from '@/lib/storage/storage-provider';
import { getTodayDateString } from '@/lib/date-utils';

export const AnalyticsModal: React.FC = () => {
  const { isAnalyticsModalOpen, closeAnalyticsModal, editingAnalytics, defaultAnalyticsAccount } = useGlobalModals();
  const [accounts, setAccounts] = useState(getAccounts());

  const [accountId, setAccountId] = useState('');
  const [platform, setPlatform] = useState<PlatformType>('instagram');
  const [date, setDate] = useState(getTodayDateString());
  const [followers, setFollowers] = useState<number>(1000);
  const [views, setViews] = useState<number>(5000);
  const [reach, setReach] = useState<number>(7500);
  const [likes, setLikes] = useState<number>(450);
  const [comments, setComments] = useState<number>(35);
  const [shares, setShares] = useState<number>(20);
  const [saves, setSaves] = useState<number>(15);
  const [postsPublished, setPostsPublished] = useState<number>(1);
  const [earnings, setEarnings] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadedAccounts = getAccounts();
    setAccounts(loadedAccounts);

    if (editingAnalytics) {
      setAccountId(editingAnalytics.accountId);
      setPlatform(editingAnalytics.platform);
      setDate(editingAnalytics.date);
      setFollowers(editingAnalytics.followers);
      setViews(editingAnalytics.views);
      setReach(editingAnalytics.reach || 0);
      setLikes(editingAnalytics.likes || 0);
      setComments(editingAnalytics.comments || 0);
      setShares(editingAnalytics.shares || 0);
      setSaves(editingAnalytics.saves || 0);
      setPostsPublished(editingAnalytics.postsPublished || 1);
      setEarnings(editingAnalytics.earnings || 0);
      setNotes(editingAnalytics.notes || '');
    } else {
      const initialAcc = defaultAnalyticsAccount
        ? loadedAccounts.find((a) => a.id === defaultAnalyticsAccount)
        : loadedAccounts[0];

      setAccountId(initialAcc ? initialAcc.id : '');
      setPlatform(initialAcc ? initialAcc.platform : 'instagram');
      setDate(getTodayDateString());
      setFollowers(1000);
      setViews(5000);
      setReach(7500);
      setLikes(450);
      setComments(35);
      setShares(20);
      setSaves(15);
      setPostsPublished(1);
      setEarnings(0);
      setNotes('');
    }
    setError('');
  }, [editingAnalytics, isAnalyticsModalOpen, defaultAnalyticsAccount]);

  const handleAccountChange = (id: string) => {
    setAccountId(id);
    const selected = accounts.find((a) => a.id === id);
    if (selected) {
      setPlatform(selected.platform);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) {
      setError('Please select an account.');
      return;
    }

    const record: AnalyticsRecord = {
      id: editingAnalytics ? editingAnalytics.id : `ana-${Date.now()}`,
      accountId,
      platform,
      date,
      followers: Number(followers) || 0,
      views: Number(views) || 0,
      reach: Number(reach) || 0,
      likes: Number(likes) || 0,
      comments: Number(comments) || 0,
      shares: Number(shares) || 0,
      saves: Number(saves) || 0,
      postsPublished: Number(postsPublished) || 0,
      earnings: Number(earnings) || 0,
      notes: notes.trim() || undefined,
      createdAt: editingAnalytics ? editingAnalytics.createdAt : new Date().toISOString(),
    };

    saveAnalyticsRecord(record);
    closeAnalyticsModal();
  };

  return (
    <Modal
      isOpen={isAnalyticsModalOpen}
      onClose={closeAnalyticsModal}
      title={editingAnalytics ? 'Edit Analytics Entry' : 'Log Performance Metrics'}
      subtitle="Enter your verified stats manually to monitor growth over time"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Account</label>
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Measurement Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Followers / Subs</label>
            <input
              type="number"
              value={followers}
              onChange={(e) => setFollowers(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
              min={0}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Total Views</label>
            <input
              type="number"
              value={views}
              onChange={(e) => setViews(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
              min={0}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reach / Impressions</label>
            <input
              type="number"
              value={reach}
              onChange={(e) => setReach(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
              min={0}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Likes</label>
            <input
              type="number"
              value={likes}
              onChange={(e) => setLikes(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
              min={0}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Comments</label>
            <input
              type="number"
              value={comments}
              onChange={(e) => setComments(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
              min={0}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Shares</label>
            <input
              type="number"
              value={shares}
              onChange={(e) => setShares(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
              min={0}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Posts Published</label>
            <input
              type="number"
              value={postsPublished}
              onChange={(e) => setPostsPublished(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
              min={0}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Earnings ($ USD, Optional)</label>
            <input
              type="number"
              value={earnings}
              onChange={(e) => setEarnings(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
              min={0}
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Campaign Observations</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Viral audio boosted reach by 40%"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={closeAnalyticsModal}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-navy hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-primary shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {editingAnalytics ? 'Save Changes' : 'Save Metric Entry'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
