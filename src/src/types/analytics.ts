import { PlatformType } from './account';

export interface AnalyticsRecord {
  id: string;
  accountId: string;
  platform: PlatformType;
  date: string; // YYYY-MM-DD
  followers: number;
  views: number;
  reach?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  postsPublished?: number;
  earnings?: number;
  notes?: string;
  createdAt: string;
}
