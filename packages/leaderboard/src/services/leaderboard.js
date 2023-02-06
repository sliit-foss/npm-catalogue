export const generateLeaderboardRecords = (pullRequests) => {
  const leaderboard = {};
  pullRequests.forEach((p) => {
    const _author = p.node.author.login;
    if (!Object.keys(leaderboard).includes(_author)) {
      leaderboard[_author] = {
        url: p.node.author.avatarUrl,
        login: p.node.author.login,
        points: 10,
      };
    } else {
      leaderboard[_author].points += 10;
    }
  });
  return Object.values(leaderboard).sort((a, b) => b.points - a.points);
};