import { getRepoContributors, getUserContributionStats } from '../API/githubAPI.js';

// normalized value is bus_factor/total_contributors
// 0 -> project is entirely dependent on one person
// 1 -> project has evenly distributed contributions across many contributors

export async function calculateBusFactor(owner: string, repo: string) {
    const contributors = await getRepoContributors(owner, repo);

    const contributions: { login: string, contributionCount: number }[] = [];

    // Fetch contribution counts for each contributor
    for (const contributor of contributors) {
        if(contributor.login) {
            const contributionCount = await getUserContributionStats(owner, repo, contributor.login);
            contributions.push({ login: contributor.login, contributionCount });
        }
    }

    // Sort by contribution count (highest first)
    contributions.sort((a, b) => b.contributionCount - a.contributionCount);

    // Calculate the total number of contributions
    const totalContributions = contributions.reduce((sum, c) => sum + c.contributionCount, 0);

    let accumulatedContributions = 0;
    let busFactor = 0;

    // Identify the smallest number of contributors that account for >50% of contributions
    for (const contribution of contributions) {
        accumulatedContributions += contribution.contributionCount;
        busFactor += 1;
        if (accumulatedContributions >= totalContributions / 2) {
            break;
        }
    }

    return busFactor / contributors.length
}