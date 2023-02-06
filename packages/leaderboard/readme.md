# @sliit-foss/leaderboard

### A utility package for fetching a list of contributor scores to a GitHub organization or repository

<br/>

## Installation

```js
# using npm
npm install @sliit-foss/leaderboard

# using yarn
yarn add @sliit-foss/leaderboard
```

## Usage

```js
# using require
const leaderboard = require('@sliit-foss/leaderboard').default;

# using import
import leaderboard from '@sliit-foss/leaderboard';
```

## Example

```js
leaderboard.initialize('GITHUB_ACCESS_TOKEN')

// Fetch organization leaderboard
leaderboard.getOrganizationLeaderboard({
  orgs: 'sliit-foss',
  filters: {
      between: '2021-10-14..2021-10-31',
      label: 'hacktoberfest-accepted'
  },
}).then((results) => console.log(results));


// Fetch repository leaderboard
leaderboard.getRepositoryLeaderboard({
  owner: 'sliit-foss',
  repository: 'sliitfoss',
  filters: {
      between: '2021-10-14..2021-10-31',
      label: 'hacktoberfest-accepted'
  },
}).then((results) => console.log(results));


// With Page Size and Page Limit
leaderboard.getOrganizationLeaderboard({
  orgs: 'sliit-foss',
  filters: {
      pageSize: 10,
      pageLimit: 2,
  },
}).then((results) => console.log(results)); //returns 20 results

```