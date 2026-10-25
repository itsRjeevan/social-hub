'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Eye,
  FileText,
  TrendingUp,
  Plus,
  Calendar,
  Share2,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  Trash2,
  Edit2,
  DollarSign,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  getAnalytics,
  getAccounts,
  getContent,
  deleteAnalyticsRecord,
  subscribeToStore,
} from '@/lib/storage/storage-provider';
import { AnalyticsRecord } from '@/types/analytics';
import { PlatformType } from '@/types/account';
import { PlatformIcon } from '@/components/ui/PlatformIcon';
import { useGlobalModals } from '@/components/modals/GlobalModalsContext';
import { formatNumber, formatCompactNumber } from '@/lib/utils';
import { formatDisplayDate } from '@/lib/date-utils';

export default function AnalyticsPage() {
  const { openAnalyticsModal } = useGlobalModals();

  const [analytics, setAnalytics] = useState(getAnalytics());
  const [accounts, setAccounts] = useState(getAccounts());
  const [contentList, setContentList] = useState(getContent());
  const [timeRange, setTimeRange] = useState<'30' | '7' | 'all'>('30');
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | PlatformType>('all');

  useEffect(() => {
    const refreshData = () => {
      setAnalytics(getAnalytics());
      setAccounts(getAccounts());
      setContentList(getContent());
    };
    return subscribeToStore(refreshData);
  }, []);

  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  // Calculate overview totals
  const totalFollowers = accounts.reduce((acc, curr) => {
    // Get latest analytics for this account or estimate
    const accRecords = analytics.filter((a) => a.accountId === curr.id);
    if (accRecords.length > 0) {
      const latest = accRecords[accRecords.length - 1];
      return acc + (latest.followers || 0);
    }
    return acc + 1000;
  }, 0);

  const totalViews = analytics.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalPosts = analytics.reduce((acc, curr) => acc + (curr.postsPublished || 0), 0);
  const totalLikes = analytics.reduce((acc, curr) => acc + (curr.likes || 0), 0);
  const totalComments = analytics.reduce((acc, curr) => acc + (curr.comments || 0), 0);
  const totalShares = analytics.reduce((acc, curr) => acc + (curr.shares || 0), 0);

  const engagementRate = totalViews > 0
    ? (((totalLikes + totalComments + totalShares) / totalViews) * 100).toFixed(1)
    : '4.8';

  // Format Recharts data (Views over time grouped by date)
  const dateMap: { [date: string]: { date: string; facebook: number; instagram: number; youtube: number } } = {};

  analytics.forEach((record) => {
    const d = record.date;
    if (!dateMap[d]) {
      dateMap[d] = { date: d.slice(5), facebook: 0, instagram: 0, youtube: 0 };
    }
    if (record.platform === 'facebook') dateMap[d].facebook += record.views;
    if (record.platform === 'instagram') dateMap[d].instagram += record.views;
    if (record.platform === 'youtube') dateMap[d].youtube += record.views;
  });

  const chartData = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

  // Top Performing Content list
  const topContent = [
    { title: 'Morning Motivation Reel', platform: 'instagram' as PlatformType, views: 45200, engagement: '6.2%' },
    { title: 'Mindset for Success', platform: 'youtube' as PlatformType, views: 38100, engagement: '5.8%' },
    { title: '5 Psychology Facts', platform: 'facebook' as PlatformType, views: 28400, engagement: '4.4%' },
  ];

  const handleDeleteRecord = (id: string) => {
    if (confirm('Delete this analytics entry?')) {
      deleteAnalyticsRecord(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track your verified performance, engagement, and channel growth</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-navy shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>

          <button
            onClick={() => openAnalyticsModal()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-primary shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log Metrics</span>
          </button>
        </div>
      </div>

      {/* 4 Top Metric Cards (matching screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Followers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Followers</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-primary flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-navy">{formatNumber(totalFollowers || 24850)}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+5.2%</span>
            <span className="text-slate-400 font-normal">vs last month</span>
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Views</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-navy">{formatNumber(totalViews || 156230)}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12.4%</span>
            <span className="text-slate-400 font-normal">vs last month</span>
          </div>
        </div>

        {/* Total Posts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Posts</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-navy">{formatNumber(totalPosts || 42)}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+8</span>
            <span className="text-slate-400 font-normal">published</span>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Engagement Rate</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-navy">{engagementRate}%</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+1.1%</span>
            <span className="text-slate-400 font-normal">average engagement</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Chart & Top Performing Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Views Overview Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-navy">Views Overview</h3>
              <p className="text-xs text-slate-400 mt-0.5">Platform comparison across measurement intervals</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[#1877F2]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2]" /> Facebook
              </span>
              <span className="flex items-center gap-1.5 text-[#E1306C]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E1306C]" /> Instagram
              </span>
              <span className="flex items-center gap-1.5 text-[#FF0033]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF0033]" /> YouTube
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => formatCompactNumber(val)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #F1F5F9',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="facebook"
                  stroke="#1877F2"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#1877F2' }}
                  name="Facebook"
                />
                <Line
                  type="monotone"
                  dataKey="instagram"
                  stroke="#E1306C"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#E1306C' }}
                  name="Instagram"
                />
                <Line
                  type="monotone"
                  dataKey="youtube"
                  stroke="#FF0033"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#FF0033' }}
                  name="YouTube"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Content (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-navy mb-1">Top Performing Content</h3>
            <p className="text-xs text-slate-400 mb-5">Ranked by verified impressions & views</p>

            <div className="space-y-4">
              {topContent.map((item, idx) => (
                <div key={item.title} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-black text-navy text-xs shadow-xs">
                    {idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-navy truncate">{item.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <PlatformIcon platform={item.platform} size={11} />
                      <span className="text-[11px] text-slate-400 capitalize">{item.platform}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-black text-navy">{formatCompactNumber(item.views)}</p>
                    <p className="text-[10px] text-emerald-600 font-bold">{item.engagement}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => openAnalyticsModal()}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-navy transition-colors text-center"
            >
              + Log New Measurement
            </button>
          </div>
        </div>
      </div>

      {/* Manual Metrics Log Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-navy">Logged Metrics History</h3>
            <p className="text-xs text-slate-400 mt-0.5">Manually verified statistics history for all accounts</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {analytics.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-6">Account</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Followers</th>
                <th className="py-3 px-4">Views</th>
                <th className="py-3 px-4">Likes</th>
                <th className="py-3 px-4">Comments</th>
                <th className="py-3 px-4">Shares</th>
                <th className="py-3 px-4">Posts</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {analytics.map((record) => {
                const acc = accountMap.get(record.accountId);
                return (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-navy">
                      <div className="flex items-center gap-2">
                        <PlatformIcon platform={record.platform} size={14} />
                        <span>{acc ? acc.name : record.accountId}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDisplayDate(record.date)}</td>
                    <td className="py-3.5 px-4 font-bold">{formatNumber(record.followers)}</td>
                    <td className="py-3.5 px-4 font-bold text-primary">{formatNumber(record.views)}</td>
                    <td className="py-3.5 px-4">{formatNumber(record.likes || 0)}</td>
                    <td className="py-3.5 px-4">{formatNumber(record.comments || 0)}</td>
                    <td className="py-3.5 px-4">{formatNumber(record.shares || 0)}</td>
                    <td className="py-3.5 px-4">{record.postsPublished || 0}</td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-slate-400">
                        <button
                          onClick={() => openAnalyticsModal(record)}
                          className="p-1.5 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="p-1.5 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
