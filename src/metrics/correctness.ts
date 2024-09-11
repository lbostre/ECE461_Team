import { cloneRepository, cleanUpRepository, getCiStatus, getRepoIssues } from '../API/githubAPI.js'; // Import API functions
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

async function findJavaScriptFiles(dir: string): Promise<string[]> {
    let jsFiles: string[] = [];
  
    // Read the contents of the directory
    const files = await fs.readdir(dir, { withFileTypes: true });
  
    // Loop through each file or directory
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
    
        if (file.isDirectory()) {
            // If it's a directory, recursively search for JavaScript files
            const nestedFiles = await findJavaScriptFiles(fullPath);
            jsFiles = jsFiles.concat(nestedFiles);
        } else if (file.isFile() && file.name.endsWith('.js')) {
            // If it's a JavaScript file, add it to the list
            jsFiles.push(fullPath);
        }
    }
  
    return jsFiles;
}

// Helper function to perform static analysis using Esprima
async function performStaticAnalysis(repoPath: string): Promise<number> {
    try {
        // Use Node's fs module to find all JavaScript files in the repo
        const jsFiles = await findJavaScriptFiles(repoPath);
        
        if (jsFiles.length === 0) {
            console.log('No JavaScript files found.');
            return 1; // No JS files means no issues, so return 1 (full score)
        }
    
        let issueCount = 0;
        let totalCount = jsFiles.length;
    
        for (const file of jsFiles) {
            const code = await fs.readFile(file, 'utf-8');
            try {
                // Parse the file using Esprima, catch parsing errors manually
                esprima.parseScript(code, { tolerant: true });
            } catch (error) {
                issueCount += 1; // Increment issue count for syntax errors
            }
        }
    
        // Normalize the issue count (e.g., the more issues, the lower the score)
        return totalCount > 0 ? 1 - issueCount / totalCount : 1;
    } catch (error) {
        const err = error as Error;
        console.error(`Error during static analysis: ${err.message}`);
        return 0;
    }
}

// Combine everything to calculate correctness and clean up afterward
export async function calculateCorrectness(owner: string, repo: string): Promise<number> {
    try {
        const ciStatus = await getCiStatus(owner, repo);
        const successRate = ciStatus.filter(run => run.conclusion === 'success').length / ciStatus.length;
        console.log(successRate);
    
        const issueResolutionRate = await getIssueResolutionRate(owner, repo);
        console.log(issueResolutionRate);
        const repoPath = await cloneRepository(owner, repo);
        const staticAnalysisScore = await performStaticAnalysis(repoPath);
        console.log(staticAnalysisScore);
        const correctnessScore = (0.4 * successRate) + (0.4 * issueResolutionRate) + (0.2 * staticAnalysisScore);
        return correctnessScore;
    } catch (error) {
        console.error(`Error calculating correctness: ${error}`);
        return 0;
    }
}