import { getRepoContributors, getRepoPullRequests } from "./API/githubAPI.js";
import { calculateBusFactor } from "./metrics/busFactor.js";
import { calculateCorrectness } from './metrics/correctness.js';
import { calculateResponsiveMaintainer } from "./metrics/responsiveMaintainer.js";

const world = 'world!';

function hello(who: string = world): string {
    return `Hello ${who}! `;
}

console.log(hello(world))

// test
//getRepoContributors('lbostre', 'ECE461_Team').then((r) => console.log(r));

// Function to run a test for the correctness metric
/*async function testCorrectnessMetric(owner: string, repo: string) {
    try {
        console.log(`Testing correctness for repository: ${owner}/${repo}...`);
  
        // Calculate correctness score for the given repository
        const correctnessScore = await calculateCorrectness(owner, repo);
    
        // Log the result
        console.log(`Correctness score for ${owner}/${repo}: ${correctnessScore}`);
    } catch (error) {
        console.error(`Error testing correctness for ${owner}/${repo}: ${error}`);
    }
}
  
// Example usage: Replace 'ownerName' and 'repoName' with the actual GitHub repository owner and name
(async () => {
    const owner = 'microsoft'; // Example owner
    const repo = 'TypeScript'; // Example repository name

    // Call the test function with the owner and repository name
    await testCorrectnessMetric(owner, repo);
})();*/

// Function to run a test for the responsive maintainer metric
/*async function testResponsiveMaintainerMetric(owner: string, repo: string) {
    try {
        console.log(`Testing responsive maintainer metric for repository: ${owner}/${repo}...`);
        let medianResponseTime = await calculateResponsiveMaintainer(owner, repo);
        // Convert median response time to hours for better readability
        console.log(`Responsive maintainer score for ${owner}/${repo}: ${medianResponseTime.toFixed(2)}`);
    } catch (error) {
        console.error(`Error testing responsive maintainer metric for ${owner}/${repo}: ${error}`);
    }
}

// Example usage: Replace 'ownerName' and 'repoName' with the actual GitHub repository owner and name
(async () => {
    const owner = 'microsoft'; // Example owner
    const repo = 'TypeScript'; // Example repository name

    // Call the test function with the owner and repository name
    await testResponsiveMaintainerMetric(owner, repo);
})();*/

// Function to run a test for the correctness metric
/*async function testBusFactorMetric(owner: string, repo: string) {
    try {
        console.log(`Testing bus factor for repository: ${owner}/${repo}...`);
  
        // Calculate correctness score for the given repository
        const busFactor = await calculateBusFactor(owner, repo);
    
        // Log the result
        console.log(`Bus Factor score for ${owner}/${repo}: ${busFactor}`);
    } catch (error) {
        console.error(`Error testing bus factor score for ${owner}/${repo}: ${error}`);
    }
}
  
// Example usage: Replace 'ownerName' and 'repoName' with the actual GitHub repository owner and name
(async () => {
    const owner = 'yargs'; // Example owner
    const repo = 'yargs'; // Example repository name

    // Call the test function with the owner and repository name
    await testBusFactorMetric(owner, repo);
})();*/
