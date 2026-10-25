export type PlatformType = 'facebook' | 'instagram' | 'youtube';

export type AccountStatus = 'active' | 'archived';

export interface SocialAccount {
  id: string;
  name: string;
  handle: string;
  platform: PlatformType;
  avatarUrl?: string;
  profileUrl?: string;
  category: string;
  description?: string;
  targetAudience?: string;
  postingGoal?: string;
  preferredDays?: string[];
  notes?: string;
  status: AccountStatus;
  createdAt: string;
  lastPostedAt?: string;
}
