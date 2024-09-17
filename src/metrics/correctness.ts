import { getCiStatus, getRepoIssues } from '../API/githubAPI.js'; // Import API functions
import * as esprima from 'esprima'; // For static analysis
import { promises as fs } from 'fs';
import * as path from 'path';

// Helper function to calculate the issue resolution rate
async function getIssueResolutionRate(owner: string, repo: string): Promise<number> {
    try {
        const issues = await getRepoIssues(owner, repo);

        // Filter issues from the last 6 months
        const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
        const recentIssues = issues.filter((issue: any) => new Date(issue.created_at) > sixMonthsAgo);

        const totalIssues = recentIssues.length;
        const closedIssues = recentIssues.filter((issue: any) => issue.state === 'closed').length;

        return totalIssues > 0 ? closedIssues / totalIssues : 1;
    } catch (error) {
        console.error(`Error fetching issue data: ${error}`);
        return 0;
    }
}

// Helper function to find JavaScript files
async function findJavaScriptFiles(dir: string): Promise<string[]> {
    let jsFiles: string[] = [];

    try {
        const files = await fs.readdir(dir, { withFileTypes: true });

        for (const file of files) {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory()) {
                const nestedFiles = await findJavaScriptFiles(fullPath);
                jsFiles = jsFiles.concat(nestedFiles);
            } else if (file.isFile() && file.name.endsWith('.js')) {
                jsFiles.push(fullPath);
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dir}: ${error}`);
    }

    return jsFiles;
}

// Helper function to perform static analysis using Esprima
async function performStaticAnalysis(repoPath: string): Promise<number> {
    try {
        const jsFiles = await findJavaScriptFiles(repoPath);
        
        if (jsFiles.length === 0) {
            return 1; // No JS files means no issues, return 1 (full score)
        }
    
        let issueCount = 0;
        let totalCount = jsFiles.length;
    
        for (const file of jsFiles) {
            const code = await fs.readFile(file, 'utf-8');
            try {
                esprima.parseScript(code, { tolerant: true });
            } catch (error) {
                issueCount += 1;
            }
        }

        return totalCount > 0 ? 1 - issueCount / totalCount : 1;
    } catch (error) {
        console.error(`Error during static analysis: ${error}`);
        return 0;
    }
}

// Combine everything to calculate correctness
export async function calculateCorrectness(repoPath: string, owner: string, repo: string): Promise<number> {
    try {
        const ciStatus = await getCiStatus(owner, repo);
        
        // If no workflow runs are found, set success rate to 0
        const successRate = ciStatus.length > 0
            ? ciStatus.filter(run => run.conclusion === 'success').length / ciStatus.length
            : 0;

        const issueResolutionRate = await getIssueResolutionRate(owner, repo);
        const staticAnalysisScore = await performStaticAnalysis(repoPath);

        // Correctness score calculation
        const correctnessScore = (0.4 * successRate) + (0.4 * issueResolutionRate) + (0.2 * staticAnalysisScore);

        return correctnessScore;
    } catch (error) {
        console.error(`Error calculating correctness: ${error}`);
        return 0;
    }
}