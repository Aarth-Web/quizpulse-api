const RedisKeys = {
  sessionStatus: (sessionId: string) => `session:${sessionId}:status`,

  sessionScores: (sessionId: string) => `session:${sessionId}:scores`,

  sessionFinishTimes: (sessionId: string) => `session:${sessionId}:finish_times`,

  sessionAnswered: (sessionId: string, userId: string) =>
    `session:${sessionId}:answered:${userId}`,

  refreshToken: (userId: string, tokenId: string) => `refresh:${userId}:${tokenId}`,

  leaderboardCache: () => `leaderboard:top`,
}

export default RedisKeys
