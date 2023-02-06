import { initialize, getOrganizationLeaderboard, getRepositoryLeaderboard } from "../src";

initialize(process.env.GITHUB_ACCESS_TOKEN)

describe('organization-leaderboard', () => {
    it('should fetch first 100 prs', async () => {
        await expect(getOrganizationLeaderboard({ orgs: ['sliit-foss'], filters: { pageSize: 100, pageLimit: 1 } })
            .then(records => records.reduce((sum, record) => sum + record.points, 0))).resolves.toBe(1000);
    });
    it('should fetch first 200 prs', async () => {
        await expect(getOrganizationLeaderboard({ orgs: ['sliit-foss'], filters: { pageSize: 100, pageLimit: 2 } })
            .then(records => records.reduce((sum, record) => sum + record.points, 0))).resolves.toBe(2000);
    });
    it('should fetch a list of prs for multiple organizations', async () => {
        await expect(getOrganizationLeaderboard({ orgs: ['sliit-foss', 'fosslk'], filters: { pageSize: 10, pageLimit: 2 } })
            .then(records => records.reduce((sum, record) => sum + record.points, 0))).resolves.toBe(200);
    });
    it('should fetch a list of prs for multiple organizations with a label filter', async () => {
        await expect(getOrganizationLeaderboard({ orgs: 'sliit-foss, fosslk', filters: { pageSize: 10, pageLimit: 2, label: 'hacktoberfest-accepted' } })
            .then(records => records.reduce((sum, record) => sum + record.points, 0))).resolves.toBe(200);
    });
});

describe('repository-leaderboard', () => {
    it('should fetch a list of repository contributors', async () => {
        await expect(getRepositoryLeaderboard({
            owner: 'sliit-foss',
            repository: 'sliitfoss',
            filters: { between: '2021-10-14..2021-10-31', label: 'hacktoberfest-accepted' }
        }).then(records => records.length)).resolves.toBeGreaterThan(0);
    });
});