'use client';

import React, { createContext, useContext, useState } from 'react';
import { SocialAccount } from '@/types/account';
import { Task } from '@/types/task';
import { ContentItem } from '@/types/content';
import { Project } from '@/types/project';
import { AnalyticsRecord } from '@/types/analytics';

interface GlobalModalsContextType {
  openAccountModal: (account?: SocialAccount) => void;
  closeAccountModal: () => void;
  openTaskModal: (task?: Task, defaultAccountId?: string, defaultDueDate?: string) => void;
  closeTaskModal: () => void;
  openContentModal: (content?: ContentItem, defaultAccountId?: string, defaultPlannedDate?: string) => void;
  closeContentModal: () => void;
  openProjectModal: (project?: Project) => void;
  closeProjectModal: () => void;
  openAnalyticsModal: (record?: AnalyticsRecord, defaultAccountId?: string) => void;
  closeAnalyticsModal: () => void;
  editingAccount: SocialAccount | null;
  editingTask: Task | null;
  editingContent: ContentItem | null;
  editingProject: Project | null;
  editingAnalytics: AnalyticsRecord | null;
  isAccountModalOpen: boolean;
  isTaskModalOpen: boolean;
  isContentModalOpen: boolean;
  isProjectModalOpen: boolean;
  isAnalyticsModalOpen: boolean;
  defaultTaskAccount?: string;
  defaultTaskDueDate?: string;
  defaultContentAccount?: string;
  defaultContentDate?: string;
  defaultAnalyticsAccount?: string;
}

const GlobalModalsContext = createContext<GlobalModalsContextType | undefined>(undefined);

export const GlobalModalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SocialAccount | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultTaskAccount, setDefaultTaskAccount] = useState<string | undefined>(undefined);
  const [defaultTaskDueDate, setDefaultTaskDueDate] = useState<string | undefined>(undefined);

  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [defaultContentAccount, setDefaultContentAccount] = useState<string | undefined>(undefined);
  const [defaultContentDate, setDefaultContentDate] = useState<string | undefined>(undefined);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [editingAnalytics, setEditingAnalytics] = useState<AnalyticsRecord | null>(null);
  const [defaultAnalyticsAccount, setDefaultAnalyticsAccount] = useState<string | undefined>(undefined);

  const openAccountModal = (account?: SocialAccount) => {
    setEditingAccount(account || null);
    setIsAccountModalOpen(true);
  };
  const closeAccountModal = () => {
    setIsAccountModalOpen(false);
    setEditingAccount(null);
  };

  const openTaskModal = (task?: Task, defaultAccountId?: string, defaultDueDate?: string) => {
    setEditingTask(task || null);
    setDefaultTaskAccount(defaultAccountId);
    setDefaultTaskDueDate(defaultDueDate);
    setIsTaskModalOpen(true);
  };
  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setDefaultTaskAccount(undefined);
    setDefaultTaskDueDate(undefined);
  };

  const openContentModal = (content?: ContentItem, defaultAccountId?: string, defaultPlannedDate?: string) => {
    setEditingContent(content || null);
    setDefaultContentAccount(defaultAccountId);
    setDefaultContentDate(defaultPlannedDate);
    setIsContentModalOpen(true);
  };
  const closeContentModal = () => {
    setIsContentModalOpen(false);
    setEditingContent(null);
    setDefaultContentAccount(undefined);
    setDefaultContentDate(undefined);
  };

  const openProjectModal = (project?: Project) => {
    setEditingProject(project || null);
    setIsProjectModalOpen(true);
  };
  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
    setEditingProject(null);
  };

  const openAnalyticsModal = (record?: AnalyticsRecord, defaultAccountId?: string) => {
    setEditingAnalytics(record || null);
    setDefaultAnalyticsAccount(defaultAccountId);
    setIsAnalyticsModalOpen(true);
  };
  const closeAnalyticsModal = () => {
    setIsAnalyticsModalOpen(false);
    setEditingAnalytics(null);
    setDefaultAnalyticsAccount(undefined);
  };

  return (
    <GlobalModalsContext.Provider
      value={{
        openAccountModal,
        closeAccountModal,
        openTaskModal,
        closeTaskModal,
        openContentModal,
        closeContentModal,
        openProjectModal,
        closeProjectModal,
        openAnalyticsModal,
        closeAnalyticsModal,
        editingAccount,
        editingTask,
        editingContent,
        editingProject,
        editingAnalytics,
        isAccountModalOpen,
        isTaskModalOpen,
        isContentModalOpen,
        isProjectModalOpen,
        isAnalyticsModalOpen,
        defaultTaskAccount,
        defaultTaskDueDate,
        defaultContentAccount,
        defaultContentDate,
        defaultAnalyticsAccount,
      }}
    >
      {children}
    </GlobalModalsContext.Provider>
  );
};

export const useGlobalModals = () => {
  const context = useContext(GlobalModalsContext);
  if (!context) {
    throw new Error('useGlobalModals must be used within GlobalModalsProvider');
  }
  return context;
};
