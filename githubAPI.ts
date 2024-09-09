const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

// Helper function to set headers
const defaultHeaders = {
  'Authorization': `Bearer ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
};

// Function to handle GitHub API requests
async function makeGitHubRequest(endpoint: string) {
  const url = `${GITHUB_API_URL}${endpoint}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: defaultHeaders,
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return await response.json();
}

// Get repository contributors
export async function getRepoContributors(owner: string, repo: string) {
  const endpoint = `/repos/${owner}/${repo}/contributors`;
  return makeGitHubRequest(endpoint);
}

// Get repository issues
export async function getRepoIssues(owner: string, repo: string) {
  const endpoint = `/repos/${owner}/${repo}/issues?state=all`;
  return makeGitHubRequest(endpoint);
}

// Get repository pull requests
export async function getRepoPullRequests(owner: string, repo: string) {
  const endpoint = `/repos/${owner}/${repo}/pulls?state=all`;
  return makeGitHubRequest(endpoint);
}

// Get repository license
export async function getRepoLicense(owner: string, repo: string) {
  const endpoint = `/repos/${owner}/${repo}/license`;
  return makeGitHubRequest(endpoint);
}