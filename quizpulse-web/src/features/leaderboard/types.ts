export type LeaderboardEntry = {
  userId: string;
  name: string;
  avatarUrl?: string;
  totalScore: number;
  wins?: number;
  gamesPlayed?: number;
};
