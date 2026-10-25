'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useGlobalModals } from './GlobalModalsContext';
import { PlatformType, AccountStatus, SocialAccount } from '@/types/account';
import { saveAccount } from '@/lib/storage/storage-provider';
import { PlatformIcon } from '@/components/ui/PlatformIcon';
import { Upload, Image as ImageIcon } from 'lucide-react';

const CATEGORIES = [
  'Lifestyle',
  'Education',
  'Self Help',
  'Health & Fitness',
  'Entertainment',
  'Technology',
  'Business',
  'Gaming',
  'Finance',
  'Fashion',
  'Food & Cooking',
  'Other',
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const AccountModal: React.FC = () => {
  const { isAccountModalOpen, closeAccountModal, editingAccount } = useGlobalModals();

  const [platform, setPlatform] = useState<PlatformType>('instagram');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [category, setCategory] = useState('Lifestyle');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [postingGoal, setPostingGoal] = useState('');
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<AccountStatus>('active');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingAccount) {
      setPlatform(editingAccount.platform);
      setName(editingAccount.name);
      setHandle(editingAccount.handle);
      setProfileUrl(editingAccount.profileUrl || '');
      setAvatarUrl(editingAccount.avatarUrl || '');
      setCategory(editingAccount.category || 'Lifestyle');
      setDescription(editingAccount.description || '');
      setTargetAudience(editingAccount.targetAudience || '');
      setPostingGoal(editingAccount.postingGoal || '');
      setPreferredDays(editingAccount.preferredDays || []);
      setNotes(editingAccount.notes || '');
      setStatus(editingAccount.status);
    } else {
      setPlatform('instagram');
      setName('');
      setHandle('');
      setProfileUrl('');
      setAvatarUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80');
      setCategory('Lifestyle');
      setDescription('');
      setTargetAudience('');
      setPostingGoal('');
      setPreferredDays(['Monday', 'Wednesday', 'Friday']);
      setNotes('');
      setStatus('active');
    }
    setError('');
  }, [editingAccount, isAccountModalOpen]);

  const handleToggleDay = (day: string) => {
    if (preferredDays.includes(day)) {
      setPreferredDays(preferredDays.filter((d) => d !== day));
    } else {
      setPreferredDays([...preferredDays, day]);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Account name is required.');
      return;
    }
    if (!handle.trim()) {
      setError('Username / handle is required.');
      return;
    }

    const formattedHandle = handle.startsWith('@') ? handle : `@${handle}`;

    const newOrUpdatedAccount: SocialAccount = {
      id: editingAccount ? editingAccount.id : `acc-${Date.now()}`,
      name: name.trim(),
      handle: formattedHandle.trim(),
      platform,
      avatarUrl: avatarUrl.trim() || undefined,
      profileUrl: profileUrl.trim() || undefined,
      category,
      description: description.trim() || undefined,
      targetAudience: targetAudience.trim() || undefined,
      postingGoal: postingGoal.trim() || undefined,
      preferredDays,
      notes: notes.trim() || undefined,
      status,
      createdAt: editingAccount ? editingAccount.createdAt : new Date().toISOString(),
      lastPostedAt: editingAccount?.lastPostedAt,
    };

    saveAccount(newOrUpdatedAccount);
    closeAccountModal();
  };

  return (
    <Modal
      isOpen={isAccountModalOpen}
      onClose={closeAccountModal}
      title={editingAccount ? 'Edit Account' : 'Add New Account'}
      subtitle="Connect and organize your Facebook page, Instagram account, or YouTube channel"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2 Cols: Form Inputs */}
          <div className="md:col-span-2 space-y-4">
            {/* Platform Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Platform <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['facebook', 'instagram', 'youtube'] as PlatformType[]).map((p) => {
                  const isSelected = platform === p;
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-semibold capitalize transition-all ${
                        isSelected
                          ? 'border-primary bg-primary-light/50 text-primary shadow-sm ring-1 ring-primary'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <PlatformIcon platform={p} size={16} />
                      <span>{p}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mindset Gallery"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
                required
              />
            </div>

            {/* Username / Handle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username / Handle <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@mindset.gallery"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
                required
              />
            </div>

            {/* Profile URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Profile URL</label>
              <input
                type="url"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="https://instagram.com/mindset.gallery"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category / Niche</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right 1 Col: Profile Picture & Status */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Profile Picture
              </label>
              <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center">
                {avatarUrl ? (
                  <div className="relative group mb-3">
                    <img
                      src={avatarUrl}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-md"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}

                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-navy hover:bg-slate-50 shadow-sm transition-all">
                  <Upload className="w-3.5 h-3.5 text-primary" />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-2">PNG, JPG up to 5MB</p>
              </div>
            </div>

            {/* Account Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AccountStatus)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Posting Goal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Posting Goal</label>
              <input
                type="text"
                value={postingGoal}
                onChange={(e) => setPostingGoal(e.target.value)}
                placeholder="e.g. 2 reels / day"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Description / Bio</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Motivational quotes, life lessons, and mindset tips."
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
          />
        </div>

        {/* Target Audience & Preferred Posting Days */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience (Optional)</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Young professionals, students"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Posting Days</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = preferredDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => handleToggleDay(day)}
                    className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors ${
                      isSelected
                        ? 'bg-primary text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Account Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Account Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Best posting times, visual guidelines, tone of voice..."
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={closeAccountModal}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-navy hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-primary shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {editingAccount ? 'Save Changes' : 'Save Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
