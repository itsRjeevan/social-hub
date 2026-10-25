'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Filter,
} from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from 'date-fns';
import { getContent, getAccounts, subscribeToStore } from '@/lib/storage/storage-provider';
import { ContentItem } from '@/types/content';
import { PlatformType } from '@/types/account';
import { PlatformIcon } from '@/components/ui/PlatformIcon';
import { useGlobalModals } from '@/components/modals/GlobalModalsContext';
import { cn } from '@/lib/utils';

export default function ContentCalendarPage() {
  const { openContentModal } = useGlobalModals();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [contentList, setContentList] = useState(getContent());
  const [accounts, setAccounts] = useState(getAccounts());

  const [platformFilter, setPlatformFilter] = useState<'all' | PlatformType>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const refreshData = () => {
      setContentList(getContent());
      setAccounts(getAccounts());
    };
    return subscribeToStore(refreshData);
  }, []);

  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  // Month navigation
  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar days generation
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Filter content
  const filteredContent = contentList.filter((item) => {
    if (!item.plannedDate) return false;
    if (platformFilter !== 'all' && item.platform !== platformFilter) return false;
    if (accountFilter !== 'all' && item.accountId !== accountFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    return true;
  });

  const getPlatformChipColor = (platform: PlatformType) => {
    switch (platform) {
      case 'facebook':
        return 'bg-[#1877F2] text-white hover:bg-blue-700';
      case 'instagram':
        return 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white';
      case 'youtube':
        return 'bg-[#FF0033] text-white hover:bg-red-700';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">Content Calendar</h1>
          <p className="text-sm text-slate-500 mt-0.5">Plan and schedule your content across all platforms</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200/80 shadow-sm text-xs font-bold text-slate-600">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'px-3 py-1.5 rounded-lg capitalize transition-all',
                  viewMode === mode ? 'bg-primary text-white shadow-sm' : 'hover:text-navy'
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => openContentModal(undefined, undefined, format(currentDate, 'yyyy-MM-dd'))}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-primary shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Content</span>
          </button>
        </div>
      </div>

      {/* Navigation & Filters Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-soft">
        {/* Date Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-extrabold text-navy min-w-[170px]">
            {format(currentDate, 'MMMM yyyy')}
          </h2>

          <button
            onClick={handleToday}
            className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-navy focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
          </select>

          {/* Account Filter */}
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-navy focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-navy focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Status</option>
            <option value="idea">Idea</option>
            <option value="research">Research</option>
            <option value="script_ready">Script Ready</option>
            <option value="editing">Editing</option>
            <option value="ready_to_publish">Ready to Publish</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {/* Main Calendar Layout + Right Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid (9 or 10 cols) */}
        <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-100 shadow-card p-4 sm:p-6 overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 mb-2 border-b border-slate-100 pb-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 auto-rows-fr gap-1.5 sm:gap-2">
            {calendarDays.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDate = isToday(day);
              const dayContent = filteredContent.filter((c) => c.plannedDate === dateKey);

              return (
                <div
                  key={dateKey}
                  onClick={() => openContentModal(undefined, undefined, dateKey)}
                  className={cn(
                    'min-h-[90px] sm:min-h-[115px] p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group hover:border-primary/50 hover:bg-slate-50/50',
                    isCurrentMonth ? 'bg-white border-slate-100' : 'bg-slate-50/40 border-slate-100/50 opacity-40',
                    isTodayDate && 'border-primary ring-1 ring-primary bg-primary-light/20'
                  )}
                >
                  {/* Date number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        'text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center transition-colors',
                        isTodayDate ? 'bg-primary text-white' : 'text-slate-700 group-hover:text-primary'
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                    <Plus className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Content Chips */}
                  <div className="space-y-1 overflow-y-auto max-h-[75px] scrollbar-none">
                    {dayContent.map((item) => {
                      const acc = accountMap.get(item.accountId);
                      return (
                        <div
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openContentModal(item);
                          }}
                          className={cn(
                            'px-2 py-1 rounded-md text-[10px] font-semibold flex items-center justify-between gap-1 shadow-xs truncate cursor-pointer transition-transform hover:scale-[1.02]',
                            getPlatformChipColor(item.platform)
                          )}
                          title={`${item.title} (${item.contentType})`}
                        >
                          <span className="truncate flex-1">{item.title}</span>
                          <span className="text-[9px] uppercase tracking-wider opacity-90 px-1 bg-black/20 rounded">
                            {item.contentType.slice(0, 4)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Legend & Info Panel (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Legend Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-navy border-b border-slate-100 pb-2">Platforms</h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                <span className="w-3.5 h-3.5 rounded-full bg-[#1877F2]" />
                <span>Facebook</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]" />
                <span>Instagram</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                <span className="w-3.5 h-3.5 rounded-full bg-[#FF0033]" />
                <span>YouTube</span>
              </div>
            </div>

            <h3 className="text-sm font-bold text-navy border-b border-slate-100 pb-2 pt-2">Content Status</h3>
            <div className="space-y-2">
              {[
                { label: 'Idea', color: 'bg-slate-200 text-slate-700' },
                { label: 'Research', color: 'bg-sky-100 text-sky-700' },
                { label: 'Script Ready', color: 'bg-amber-100 text-amber-700' },
                { label: 'Editing', color: 'bg-purple-100 text-purple-700' },
                { label: 'Ready to Publish', color: 'bg-blue-100 text-blue-700' },
                { label: 'Published', color: 'bg-emerald-100 text-emerald-700' },
              ].map((st) => (
                <div key={st.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">{st.label}</span>
                  <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-bold', st.color)}>
                    Status
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tip Box */}
          <div className="bg-primary-light/40 border border-primary/20 rounded-2xl p-4 text-xs">
            <h4 className="font-bold text-primary mb-1 flex items-center gap-1.5">
              <span>💡</span>
              <span>Pro Scheduling Tip</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Click any calendar day to immediately create and schedule a post, reel, or YouTube video for that exact date!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
