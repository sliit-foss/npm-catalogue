import { instance as axios } from "../libs/axios";

export const getOrganizationPRs = (orgs, filters, afterCursor) => {
  const queryOrgs = orgs.reduce((query, org) => (query += `user:${org} `), "");
  const query = `query { ${_searchQuery(queryOrgs, filters, afterCursor)} }`;
  return axios.post("", { query });
};

export const getRepositoryPRs = (_orgs, filters, afterCursor, owner, repository) => {
  const query = `query { ${_searchQuery(`repo:${owner}/${repository}`, filters, afterCursor)} }`;
  return axios.post("", { query });
};

const _searchQuery = (searchEntity, filters, afterCursor) => {
  const pageSize = filters.pageSize ?? 100;
  return `
  search(first: ${pageSize}, type: ISSUE, query: "${searchEntity} is:pr is:merged ${
    filters.between ? `created:${filters.between}` : ""
  } ${filters.label ? `label:${filters.label}` : ""}", ${afterCursor !== "" ? `after: "${afterCursor}"` : ""}) {
    issueCount
    edges {
      node {
        ... on PullRequest {
          title
          author {
            login
            avatarUrl
          }
        }
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }`;
};
