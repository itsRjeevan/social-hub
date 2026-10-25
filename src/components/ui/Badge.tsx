import React from 'react';
import { cn } from '@/lib/utils';
import { TaskPriority, TaskStatus } from '@/types/task';
import { ContentStatus } from '@/types/content';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'purple' | 'info' | 'facebook' | 'instagram' | 'youtube' | 'outline';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 font-medium',
    success: 'bg-emerald-50 text-emerald-700 font-medium border border-emerald-200/60',
    warning: 'bg-amber-50 text-amber-700 font-medium border border-amber-200/60',
    danger: 'bg-rose-50 text-rose-700 font-medium border border-rose-200/60',
    purple: 'bg-indigo-50 text-indigo-700 font-medium border border-indigo-200/60',
    info: 'bg-sky-50 text-sky-700 font-medium border border-sky-200/60',
    facebook: 'bg-[#E7F3FF] text-[#1877F2] font-semibold border border-[#1877F2]/20',
    instagram: 'bg-[#FDF2F5] text-[#E1306C] font-semibold border border-[#E1306C]/20',
    youtube: 'bg-[#FFEAEF] text-[#FF0033] font-semibold border border-[#FF0033]/20',
    outline: 'border border-slate-200 text-slate-600 bg-white',
  };

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full font-medium', sizeClasses, variantClasses[variant], className)}>
      {children}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: TaskPriority; className?: string }> = ({ priority, className }) => {
  switch (priority) {
    case 'urgent':
      return <Badge variant="danger" className={cn('capitalize', className)}>Urgent</Badge>;
    case 'high':
      return <Badge variant="danger" className={cn('capitalize', className)}>High</Badge>;
    case 'medium':
      return <Badge variant="warning" className={cn('capitalize', className)}>Medium</Badge>;
    case 'low':
      return <Badge variant="success" className={cn('capitalize', className)}>Low</Badge>;
    default:
      return <Badge variant="default" className={cn('capitalize', className)}>{priority}</Badge>;
  }
};

export const StatusBadge: React.FC<{ status: TaskStatus; className?: string }> = ({ status, className }) => {
  switch (status) {
    case 'completed':
      return <Badge variant="success" className={className}>Completed</Badge>;
    case 'in_progress':
      return <Badge variant="purple" className={className}>In Progress</Badge>;
    case 'pending':
      return <Badge variant="warning" className={className}>Pending</Badge>;
    default:
      return <Badge variant="default" className={className}>{status}</Badge>;
  }
};

export const ContentStatusBadge: React.FC<{ status: ContentStatus; className?: string }> = ({ status, className }) => {
  switch (status) {
    case 'published':
      return <Badge variant="success" className={className}>Published</Badge>;
    case 'ready_to_publish':
      return <Badge variant="info" className={className}>Ready to Publish</Badge>;
    case 'editing':
      return <Badge variant="purple" className={className}>Editing</Badge>;
    case 'script_ready':
      return <Badge variant="warning" className={className}>Script Ready</Badge>;
    case 'research':
      return <Badge variant="default" className={className}>Research</Badge>;
    case 'idea':
      return <Badge variant="outline" className={className}>Idea</Badge>;
    default:
      return <Badge variant="default" className={className}>{status}</Badge>;
  }
};
