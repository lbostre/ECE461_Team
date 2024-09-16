import * as fs from 'fs';
import * as path from 'path';

// Helper function to evaluate the documentation
function evaluateDocumentation(repoPath: string): number {
	const readmePath = path.join(repoPath, 'README.md');
	if (!fs.existsSync(readmePath)) {
		console.error('README file not found.');
		return 0; // score 0 if README is missing
	}

	const content = fs.readFileSync(readmePath, 'utf8');

	// Define regex patterns for key sections
	const installationPattern = /installation/i;
	const usagePattern = /usage/i;
	const apiPattern = /api/i;

	// Check for presence of key sections
	const hasInstallation = installationPattern.test(content);
	const hasUsage = usagePattern.test(content);
	const hasAPI = apiPattern.test(content);

	// Count code examples (assuming code blocks use triple backticks)
	const codeExampleCount = (content.match(/```/g) || []).length / 2;

	// Scoring system
	let score = 0;
	if (hasInstallation) score += 0.3;
	if (hasUsage) score += 0.3;
	if (hasAPI) score += 0.2;
	score += Math.min(codeExampleCount * 0.1, 0.2); // max 0.2 points for examples

	// Normalize the score
	return Math.min(score, 1); // Ensure score is between 0 and 1
}

// Main function to calculate Ramp-Up Time
export async function calculateRampUp(repoPath: string): Promise<number> {
	try {
		// Evaluate the documentation and return the score
		const documentationScore = evaluateDocumentation(repoPath);
		return documentationScore;
  } catch (error) {
		console.error(`Error calculating ramp-up time: ${error}`);
		return 0; // Return 0 if there was an error
  }
}