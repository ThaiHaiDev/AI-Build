export interface HomeStats {
  agents: number;
  agentsDelta: number;
  runs: number;
  runsDelta: number;
  docs: number;
  docsDelta: number;
  tokens: string;
  tokensDelta: number;
}

export interface HomeProject {
  id: string;
  name: string;
  description: string;
  runs: number;
  updatedAt: string;
  isOwner: boolean;
}

export interface RecentRun {
  id: string;
  agentName: string;
  status: 'running' | 'succeeded' | 'failed';
  user: string;
  relativeTime: string;
  tokens: number | null;
}

const stats: HomeStats = {
  agents: 12, agentsDelta: 3,
  runs: 47, runsDelta: 8,
  docs: 284, docsDelta: -2,
  tokens: '1.2M', tokensDelta: 15,
};

const projects: HomeProject[] = [
  { id: '1', name: 'Alpha Project', description: 'Tự động hóa pipeline tổng hợp dữ liệu', runs: 24, updatedAt: '2h trước', isOwner: true },
  { id: '2', name: 'Docs Indexer', description: 'Index tài liệu nội bộ hàng tuần', runs: 12, updatedAt: '1d trước', isOwner: false },
  { id: '3', name: 'Support Bot', description: 'Trả lời câu hỏi từ Slack', runs: 58, updatedAt: '3d trước', isOwner: true },
];

const recentRuns: RecentRun[] = [
  { id: '1', agentName: 'my-summarizer', status: 'succeeded', user: 'Nhi', relativeTime: '2m trước', tokens: 3421 },
  { id: '2', agentName: 'data-extractor', status: 'failed', user: 'Tuấn', relativeTime: '15m trước', tokens: null },
  { id: '3', agentName: 'docs-indexer', status: 'running', user: 'Hà', relativeTime: '30m trước', tokens: null },
  { id: '4', agentName: 'support-bot', status: 'succeeded', user: 'Bảo', relativeTime: '1h trước', tokens: 1892 },
];

export const homeService = {
  getStats: async (): Promise<HomeStats> => {
    await new Promise((r) => setTimeout(r, 200));
    return stats;
  },
  getProjects: async (limit = 3): Promise<HomeProject[]> => {
    await new Promise((r) => setTimeout(r, 200));
    return projects.slice(0, limit);
  },
  getRecentRuns: async (limit = 4): Promise<RecentRun[]> => {
    await new Promise((r) => setTimeout(r, 200));
    return recentRuns.slice(0, limit);
  },
};
