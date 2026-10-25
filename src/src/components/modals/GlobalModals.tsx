'use client';

import React from 'react';
import { AccountModal } from './AccountModal';
import { TaskModal } from './TaskModal';
import { ContentModal } from './ContentModal';
import { ProjectModal } from './ProjectModal';
import { AnalyticsModal } from './AnalyticsModal';

export const GlobalModals: React.FC = () => {
  return (
    <>
      <AccountModal />
      <TaskModal />
      <ContentModal />
      <ProjectModal />
      <AnalyticsModal />
    </>
  );
};
