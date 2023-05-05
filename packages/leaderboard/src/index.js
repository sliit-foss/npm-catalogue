import { instance, setHeaders } from "./libs/axios";
import { getOrganizationPRs, getRepositoryPRs } from "./services/github";
import { generateLeaderboardRecords } from "./services/leaderboard";
import { getPaginatedResults } from "./utils";

export const initialize = (token) => {
  setHeaders({
    ...instance.defaults.headers,
    Authorization: `Bearer ${token}`
  });
};

export const getOrganizationLeaderboard = async ({ orgs, filters = {} }) => {
  if (typeof orgs === "string") orgs = orgs.split(",").map((org) => org.trim());
  const contributions = await getPaginatedResults(getOrganizationPRs, orgs, filters);
  return generateLeaderboardRecords(contributions);
};

export const getRepositoryLeaderboard = async ({ owner, repository, filters = {} }) => {
  const contributions = await getPaginatedResults(getRepositoryPRs, [], filters, owner, repository);
  return generateLeaderboardRecords(contributions);
};

export default {
  initialize,
  getOrganizationLeaderboard,
  getRepositoryLeaderboard
};
