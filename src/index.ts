import { getRepoContributors, getRepoPullRequests } from "./API/githubAPI.js";
import { calculateCorrectness } from './metrics/correctness.js';

const world = 'world!';

function hello(who: string = world): string {
    return `Hello ${who}! `;
}

console.log(hello(world))

//test
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