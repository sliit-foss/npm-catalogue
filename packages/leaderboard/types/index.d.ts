type LeaderboardRecord = {
  url: string;
  login: string;
  points: number;
};

/**
 * Initializes the necessary headers for API requests to the GitHub API using the Axios HTTP client.
 * This function should be called before fetching the leaderboards.
 *
 * @param {string} token - The token used for authorization. It should be a valid access token for the GitHub API.
 *                It is important to ensure that you have a valid access token with the required permissions
 *                to access the GitHub API before calling the `initialize` function.
 *
 * @example
 * ```typescript
 * import leaderboard from '@sliit-foss/leaderboard';
 *
 * leaderboard.initialize("GITHUB_ACCESS_TOKEN");
 *
 * // Now you can fetch the leaderboards
 * ```
 */
export function initialize(token: string): void;

/**
 * Fetches the leaderboard for one or more organizations.
 *
 * @param {object} options - Options for fetching the leaderboard.
 * @param {(string|string[])} options.orgs - The name(s) of the organization(s) to fetch the leaderboard for.
 * @param {object} [options.filters={}] - Additional filters to apply.
 * @param {string} [options.filters.between] - A date range in the format "start..end" to filter the pull requests.
 * @param {string} [options.filters.label] - A label to filter the pull requests.
 * @param {number} [options.filters.pageSize] - The number of results per page to retrieve.
 * @param {number} [options.filters.pageLimit] - The maximum number of pages to fetch.
 * @returns {Promise<LeaderboardRecord[]>} A promise that resolves to an array of leaderboard records.
 */
export function getOrganizationLeaderboard(options: {
  orgs: string | string[];
  filters?: {
    between?: string;
    label?: string;
    pageSize?: number;
    pageLimit?: number;
  };
}): Promise<LeaderboardRecord[]>;

/**
 * Fetches the leaderboard for a specific repository.
 *
 * @param {object} options - Options for fetching the leaderboard.
 * @param {string} options.owner - The owner of the repository.
 * @param {string} options.repository - The name of the repository.
 * @param {object} [options.filters={}] - Additional filters to apply.
 * @param {string} [options.filters.between] - A date range in the format "start..end" to filter the pull requests.
 * @param {string} [options.filters.label] - A label to filter the pull requests.
 * @param {number} [options.filters.pageSize] - The number of results per page to retrieve.
 * @param {number} [options.filters.pageLimit] - The maximum number of pages to fetch.
 * @returns {Promise<LeaderboardRecord[]>} A promise that resolves to an array of leaderboard records.
 */
export function getRepositoryLeaderboard(options: {
  owner: string;
  repository: string;
  filters?: {
    between?: string;
    label?: string;
    pageSize?: number;
    pageLimit?: number;
  };
}): Promise<LeaderboardRecord[]>;
