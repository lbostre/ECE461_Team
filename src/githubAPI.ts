import { Octokit } from '@octokit/rest';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
  baseUrl: 'https://api.github.com',
  log: {
    debug: (message: string) => console.debug(message),
    info: (message: string) => console.info(message),
    warn: (message: string) => console.warn(message),
    error: (message: string) => console.error(message),
  },
});

// Get repository contributors
export async function getRepoContributors(owner: string, repo: string) {
  try {
    const { data } = await octokit.rest.repos.listContributors({
      owner,
      repo,
    });
    return data;
  } catch (error) {
    console.error(`Error fetching contributors for ${owner}/${repo}:`, error);
    throw error;
  }
}

// Get repository issues
export async function getRepoIssues(owner: string, repo: string) {
  try {
    const { data } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'all', // Fetch both open and closed issues
    });
    return data;
  } catch (error) {
    console.error(`Error fetching issues for ${owner}/${repo}:`, error);
    throw error;
  }
}

// Get repository pull requests
export async function getRepoPullRequests(owner: string, repo: string) {
  try {
    const { data } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: 'all', // Fetch both open and closed PRs
    });
    return data;
  } catch (error) {
    console.error(`Error fetching pull requests for ${owner}/${repo}:`, error);
    throw error;
  }
}

// Get repository license
export async function getRepoLicense(owner: string, repo: string) {
  try {
    const { data } = await octokit.rest.licenses.getForRepo({
      owner,
      repo,
    });
    return data;
  } catch (error) {
    console.error(`Error fetching license for ${owner}/${repo}:`, error);
    throw error;
  }
}