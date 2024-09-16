import * as fs from 'fs';
import * as path from 'path';
import { Clone, Repository } from 'nodegit';

const REPO_URL = 'https://github.com/your-repo.git'; // replace with actual repo URL
const LOCAL_PATH = './local-repo';

async function cloneRepo() {
  try {
    await Clone.clone(REPO_URL, LOCAL_PATH);
    console.log('Repository cloned successfully.');
  } catch (error) {
    console.error('Error cloning repository:', error);
  }
}

function evaluateDocumentation() {
  const readmePath = path.join(LOCAL_PATH, 'README.md');
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

  // Scoring system (example)
  let score = 0;
  if (hasInstallation) score += 0.3;
  if (hasUsage) score += 0.3;
  if (hasAPI) score += 0.2;
  score += Math.min(codeExampleCount * 0.1, 0.2); // max 0.2 points for examples

  // Normalizing the score
  return Math.min(score, 1); // Ensure score is between 0 and 1
}

async function main() {
  await cloneRepo();
  const documentationScore = evaluateDocumentation();
  console.log('Documentation Quality Score:', documentationScore);
}

main().catch(error => console.error(error));

