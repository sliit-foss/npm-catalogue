import exec from '../src'

describe("test actions-exec-wrapper", () => {
    test("test promise resolve", async () => {
        await expect(exec('node --version')).resolves.toMatch(/v[0-9]+\.[0-9]+\.[0-9]+/);
    });
    test("test promise reject", async () => {
        await expect(exec('blah -v')).rejects.toBeInstanceOf(Error);
    });
});