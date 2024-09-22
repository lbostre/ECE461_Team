import * as fs from 'fs';
import * as path from 'path';
import { logInfo, logDebug, logError } from '../logger.js'; // Import the logger

// Helper function to evaluate the documentation
function evaluateDocumentation(repoPath: string): number {
    let readmePath = path.join(repoPath, 'README.md');
    logInfo(`Evaluating documentation for ${repoPath}`);
    if (!fs.existsSync(readmePath)) {
        logInfo(`Couldn't find README.me at ${repoPath}`);
        readmePath = path.join(repoPath, 'readme.markdown');
        if (!fs.existsSync(readmePath)) {
            console.error('README file not found.');
            return 0; // score 0 if README is missing
        }
    }

    const content = fs.readFileSync(readmePath, 'utf8');
    logDebug(`README content: ${content}`);

    // Define regex patterns for key sections
    const installationPattern = /installation/i;
    const usagePattern = /usage/i;
    const apiPattern = /api/i;
    const dependenciesPattern = /dependencies/i;

    // Check for presence of key sections
    const hasInstallation = installationPattern.test(content);
    const hasUsage = usagePattern.test(content);
    const hasAPI = apiPattern.test(content);
    const hasDependencies = dependenciesPattern.test(content);

    // Count code examples (assuming code blocks use triple backticks)
    const codeExampleCount = (content.match(/```/g) || []).length / 2;

    // Scoring system
    let score = 0;
    if (hasInstallation) score += 0.3;
    if (hasUsage) score += 0.3;
    if (hasAPI) score += 0.2;
    if (hasDependencies) += 0.1;
    score += Math.min(codeExampleCount * 0.1, 0.2); // max 0.2 points for examples

    // Normalize the score
    const finalScore = Math.min(score, 1); // Ensure score is between 0 and 1
    logInfo(`Documentation score for ${repoPath}: ${finalScore}`);

    return finalScore;
}

// Main function to calculate Ramp-Up Time
export async function calculateRampUp(repoPath: string): Promise<number> {
    try {
        logInfo(`Calculating Ramp-Up Time for repository: ${repoPath}`);
        const documentationScore = evaluateDocumentation(repoPath);
        return documentationScore;
    } catch (error) {
        logError(`Error calculating ramp-up time: ${error}`);
        return 0; // Return 0 if there was an error
    }
}
