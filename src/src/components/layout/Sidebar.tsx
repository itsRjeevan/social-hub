'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  CalendarDays,
  FolderKanban,
  BarChart3,
  Layers,
  Settings,
  Sparkles,
  ChevronRight,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSettings } from '@/lib/storage/storage-provider';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'My Accounts', href: '/accounts', icon: Users },
  { name: 'Daily Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Content Calendar', href: '/calendar', icon: CalendarDays },
  { name: 'Content Library', href: '/content', icon: FolderKanban },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Projects', href: '/projects', icon: Layers },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const pathname = usePathname();
  const [settings, setSettings] = React.useState(getSettings());

  React.useEffect(() => {
    setSettings(getSettings());
  }, []);

  const content = (
    <div className="flex h-full flex-col justify-between bg-white border-r border-slate-100 shadow-[2px_0_12px_rgba(0,0,0,0.02)]">
      {/* Top Header & Logo */}
      <div>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5856E9] via-[#7B79FF] to-[#9998FF] flex items-center justify-center text-white shadow-primary shadow-indigo-500/25 transition-transform group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-navy">
                Social<span className="text-primary">Hub</span>
              </span>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">All-in-One Manager</p>
            </div>
          </Link>
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="px-4 py-5 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  'flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative',
                  isActive
                    ? 'bg-primary text-white shadow-primary shadow-indigo-500/30'
                    : 'text-slate-600 hover:text-primary hover:bg-primary-light/60'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 transition-transform duration-200 group-hover:scale-110',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'
                  )}
                />
                <span className="flex-1">{item.name}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-100">
        <Link
          href="/settings"
          onClick={onMobileClose}
          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
        >
          {/* Avatar with status indicator */}
          <div className="relative shrink-0">
            <img
              src={settings.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={settings.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-navy truncate group-hover:text-primary transition-colors">
              {settings.name}
            </p>
            <p className="text-xs text-slate-400 font-medium">{settings.plan}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen fixed top-0 left-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-navy/40 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
