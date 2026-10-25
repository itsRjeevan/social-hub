import { PlatformType } from './account';

export type ContentType = 
  | 'reel' 
  | 'short' 
  | 'video' 
  | 'facebook_video' 
  | 'image' 
  | 'carousel' 
  | 'story' 
  | 'text';

export type ContentStatus = 
  | 'idea' 
  | 'research' 
  | 'script_ready' 
  | 'editing' 
  | 'ready_to_publish' 
  | 'published';

export interface ContentItem {
  id: string;
  title: string;
  platform: PlatformType;
  accountId: string;
  contentType: ContentType;
  status: ContentStatus;
  idea?: string;
  script?: string;
  caption?: string;
  hashtags?: string;
  cta?: string;
  thumbnail?: string; // image url or placeholder
  assetUrl?: string; // external video/asset link
  plannedDate?: string; // YYYY-MM-DD
  projectId?: string;
  notes?: string;
  createdAt: string;
}
