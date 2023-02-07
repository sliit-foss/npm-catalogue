export const getPaginatedResults = async (
  queryFunction,
  organizations,
  filters,
  owner,
  repository
) => {
  const finalResults = [];
  const results = await queryFunction(
    organizations,
    filters,
    "",
    owner,
    repository
  );
  finalResults.push(...results.data.data.search.edges);
  let lastPage = !results.data.data.search.pageInfo.hasNextPage;
  let cursor = results.data.data.search.pageInfo.endCursor;
  let pages = 1;
  const pageLimit = filters.pageLimit ?? 50;
  while (!lastPage && pages < pageLimit) {
    const nextPageResults = await queryFunction(
      organizations,
      filters,
      cursor,
      owner,
      repository
    );
    finalResults.push(...nextPageResults.data.data.search.edges);
    lastPage = !nextPageResults.data.data.search.pageInfo.hasNextPage;
    cursor = nextPageResults.data.data.search.pageInfo.endCursor;
    pages++;
  }
  return finalResults;
};
