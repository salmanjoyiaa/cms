export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  platformUrl?: string;
  error?: string;
}

export interface AnalyticsResult {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  watchTimeSeconds: number;
  ctr?: number;
}

export interface PublishingService {
  platform: string;
  validateConnection(): Promise<boolean>;
  createDraft(metadata: Record<string, unknown>): Promise<PublishResult>;
  publishNow(metadata: Record<string, unknown>): Promise<PublishResult>;
  schedulePost(metadata: Record<string, unknown>, scheduledAt: Date): Promise<PublishResult>;
  getAnalytics(postId: string): Promise<AnalyticsResult>;
  refreshToken?(): Promise<boolean>;
}

function createStubService(platform: string, oauthRequired = true): PublishingService {
  return {
    platform,
    async validateConnection() {
      return false;
    },
    async createDraft() {
      return {
        success: false,
        error: oauthRequired
          ? `${platform}: OAuth not connected. Connect in Settings > Integrations. App review may be required for production API access.`
          : `${platform}: Integration not configured.`,
      };
    },
    async publishNow() {
      return {
        success: false,
        error: `${platform}: Publishing requires OAuth connection and platform API approval.`,
      };
    },
    async schedulePost() {
      return {
        success: false,
        error: `${platform}: Scheduled publishing requires OAuth connection.`,
      };
    },
    async getAnalytics() {
      return { views: 0, likes: 0, comments: 0, shares: 0, saves: 0, watchTimeSeconds: 0 };
    },
    async refreshToken() {
      return false;
    },
  };
}

export const youtubeService = createStubService('youtube');
export const instagramService = createStubService('instagram');
export const facebookService = createStubService('facebook');
export const tiktokService = createStubService('tiktok');
export const linkedinService = createStubService('linkedin');
export const pinterestService = createStubService('pinterest');
