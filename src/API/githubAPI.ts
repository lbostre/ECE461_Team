import { Octokit } from '@octokit/rest';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

dotenv.config();
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
		per_page: 100, // Fetch maximum of 100 issues
		});
		return data;
	} catch (error) {
		console.error(`Error fetching issues for ${owner}/${repo}:`, error);
		throw error;
	}
}

// Get repository issue comments
export async function getIssueComments(owner: string, repo: string, issueNumber: number) {
	try {
		const { data } = await octokit.rest.issues.listComments({
		owner,
		repo,
		issue_number: issueNumber,
		});
		return data;
	} catch (error) {
		console.error(`Error fetching comments for issue #${issueNumber} in ${owner}/${repo}:`, error);
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

export async function getUserContributionStats(owner: string, repo: string, contributorLogin: string) {
	const { data: commits } = await octokit.rest.repos.listCommits({
		owner,
		repo,
		author: contributorLogin,
		per_page: 100,
	});
	return commits.length;
}

// Get the list of workflow runs (CI pipelines) from GitHub Actions
export async function getCiStatus(owner: string, repo: string) {
	try {
		const { data } = await octokit.rest.actions.listWorkflowRunsForRepo({
		owner,
		repo,
		per_page: 100, // Fetch maximum of 100 workflow runs
		});

		// Only look at the recent CI runs (from the last 6 months)
		const recentRuns = data.workflow_runs.filter(
		(run: any) => new Date(run.created_at) > new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
		);

		return recentRuns.map((run: any) => ({
		conclusion: run.conclusion, // e.g., "success", "failure"
		}));
	} catch (error) {
		console.error(`Error fetching CI status: ${error}`);
		return [];
	}
}

// Helper function to clone the repository locally
export async function cloneRepository(owner: string, repo: string): Promise<string> {
	const repoPath = `./repos/${owner}/${repo}`; // Full path to the cloned repository
	
	try {
		console.log(`Cloning repository ${owner}/${repo}...`);
		await execAsync(`git clone https://github.com/${owner}/${repo}.git ${repoPath}`);
		console.log(`Repository cloned at: ${repoPath}`);
		return repoPath;
	} catch (error) {
		const err = error as Error;
		console.error(`Error cloning repository: ${err.message}`);
		throw new Error(`Failed to clone repository ${owner}/${repo}`);
	}
}
  
  // Helper function to delete the cloned repository after analysis
  export async function cleanUpRepository(repoPath: string): Promise<void> {
	try {
		console.log(`Deleting repository at: ${repoPath}`);
		await execAsync(`rm -rf ${repoPath}`);
		console.log('Repository deleted successfully.');
	} catch (error) {
		console.error(`Error deleting repository: ${error}`);
		throw new Error(`Failed to delete repository ${repoPath}`);
	}
}