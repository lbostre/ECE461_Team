import { Octokit } from '@octokit/rest';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';
import { logInfo, logDebug, logError } from '../logger.js';  // Import logging functions

const execAsync = promisify(exec);

dotenv.config();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

const octokit = new Octokit({
	auth: GITHUB_TOKEN,
	baseUrl: 'https://api.github.com',
	log: {
		debug: (message: string) => logDebug(message),  
		info: (message: string) => logInfo(message),   
		warn: (message: string) => logError(message),   
		error: (message: string) => logError(message), 
	},
});

// Get repository contributors
export async function getRepoContributors(owner: string, repo: string) {
	try {
		logInfo(`Fetching contributors for ${owner}/${repo}`);
		const { data } = await octokit.rest.repos.listContributors({
			owner,
			repo,
		});
		return data;
	} catch (error) {
		logError(`Error fetching contributors for ${owner}/${repo}: ${error}`);
		throw error;
	}
}

// Get repository issues
export async function getRepoIssues(owner: string, repo: string) {
	try {
		logInfo(`Fetching issues for ${owner}/${repo}`);
		const { data } = await octokit.rest.issues.listForRepo({
			owner,
			repo,
			state: 'all', // Fetch both open and closed issues
			per_page: 100, // Fetch maximum of 100 issues
		});
		return data;
	} catch (error) {
		logError(`Error fetching issues for ${owner}/${repo}: ${error}`);
		throw error;
	}
}

// Get repository issue comments
export async function getIssueComments(owner: string, repo: string, issueNumber: number) {
	try {
		logInfo(`Fetching comments for issue #${issueNumber} in ${owner}/${repo}`);
		const { data } = await octokit.rest.issues.listComments({
			owner,
			repo,
			issue_number: issueNumber,
		});
		return data;
	} catch (error) {
		logError(`Error fetching comments for issue #${issueNumber} in ${owner}/${repo}: ${error}`);
		throw error;
	}
}

// Get repository pull requests
export async function getRepoPullRequests(owner: string, repo: string) {
	try {
		logInfo(`Fetching pull requests for ${owner}/${repo}`);
		const { data } = await octokit.rest.pulls.list({
			owner,
			repo,
			state: 'all', // Fetch both open and closed PRs
		});
		return data;
	} catch (error) {
		logError(`Error fetching pull requests for ${owner}/${repo}: ${error}`);
		throw error;
	}
}

// Get repository license
export async function getRepoLicense(owner: string, repo: string) {
	try {
		logInfo(`Fetching license for ${owner}/${repo}`);
		const { data } = await octokit.rest.licenses.getForRepo({
			owner,
			repo,
		});
		return data;
	} catch (error) {
		logError(`Error fetching license for ${owner}/${repo}: ${error}`);
		throw error;
	}
}

export async function getUserContributionStats(owner: string, repo: string, contributorLogin: string) {
	try {
		logInfo(`Fetching contribution stats for ${contributorLogin} in ${owner}/${repo}`);
		const { data: commits } = await octokit.rest.repos.listCommits({
			owner,
			repo,
			author: contributorLogin,
			per_page: 100,
		});
		return commits.length;
	} catch (error) {
		logError(`Error fetching contribution stats for ${contributorLogin} in ${owner}/${repo}: ${error}`);
		throw error;
	}
}

// Get the list of workflow runs (CI pipelines) from GitHub Actions
export async function getCiStatus(owner: string, repo: string) {
	try {
		logInfo(`Fetching CI status for ${owner}/${repo}`);
		const { data } = await octokit.rest.actions.listWorkflowRunsForRepo({
			owner,
			repo,
			per_page: 100, // Fetch maximum of 100 workflow runs
		});

		const recentRuns = data.workflow_runs.filter(
			(run: any) => new Date(run.created_at) > new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) // Last 6 months
		);

		return recentRuns.map((run: any) => ({
			conclusion: run.conclusion, // e.g., "success", "failure"
		}));
	} catch (error) {
		logError(`Error fetching CI status for ${owner}/${repo}: ${error}`);
		return [];
	}
}

// Helper function to clone the repository locally
export async function cloneRepository(owner: string, repo: string): Promise<string> {
	const repoPath = `./repos/${repo}`; // Full path to the cloned repository
	
	try {
		logInfo(`Cloning repository /${repo}...`);
		await execAsync(`git clone https://github.com/${owner}/${repo}.git ${repoPath}`);
		logInfo(`Repository cloned at: ${repoPath}`);
		return repoPath;
	} catch (error) {
		const err = error as Error;
		logError(`Error cloning repository ${owner}/${repo}: ${err.message}`);
		throw new Error(`Failed to clone repository ${owner}/${repo}`);
	}
}

// Helper function to delete the cloned repository after analysis
export async function cleanUpRepository(repoPath: string): Promise<void> {
	try {
		logInfo(`Deleting repository at: ${repoPath}`);
		await execAsync(`rm -rf ${repoPath}`);
		logInfo(`Repository deleted successfully.`);
	} catch (error) {
		logError(`Error deleting repository at ${repoPath}: ${error}`);
		throw new Error(`Failed to delete repository ${repoPath}`);
	}
}