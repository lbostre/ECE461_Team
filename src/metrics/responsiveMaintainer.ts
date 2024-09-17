import { getRepoIssues, getIssueComments } from '../API/githubAPI.js'; // Import API functions

// Thresholds for response and resolution times can be adjusted as needed
const RESPONSE_TIME_THRESH = 48; // 48 hours
const RESOLUTION_TIME_THRESH = 30 * 24; // 30 days

// Function to calculate number of responses with a response within RESPONSE_TIME_THRESH (hours)
// Return value is normalized to a scale of 0 to 1
async function calculateResponseTime(owner: string, repo: string): Promise<number> {
    try {
        const issues = await getRepoIssues(owner, repo);
        const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000);
        
        // Filter issues created in the last 3 months
        const recentIssues = issues.filter((issue: any) => new Date(issue.created_at) > threeMonthsAgo);
        
        // Calculate response times
        const responseTimes = await Promise.all(recentIssues.map(async (issue: any) => {
            const comments = await getIssueComments(owner, repo, issue.number);
            const firstResponse = comments.find((comment: any) => comment.user.login !== issue.user.login);
            return firstResponse ? (new Date(firstResponse.created_at).getTime() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60) : null;
        }));
        
        // Filter out null response times and calculate mean (for debugging)
        const validResponseTimes = responseTimes.filter(time => time !== null).sort((a, b) => a - b);
        const mean = validResponseTimes.length > 0 ? validResponseTimes.reduce((a, b) => a + b) / validResponseTimes.length : 0;
        // console.log('Mean response time:', mean.toFixed(2), 'hours');
        // Print the max and min response times for debugging
        // console.log('Max response time:', Math.max(...validResponseTimes).toFixed(2), 'hours');
        // console.log('Min response time:', Math.min(...validResponseTimes).toFixed(2), 'hours');
        // Calculate and return the percent of issues with responses in the last 48 hours
        const responsesIn48Hours = validResponseTimes.filter(time => time <= RESPONSE_TIME_THRESH).length;
        return responsesIn48Hours / validResponseTimes.length;

    } catch (error) {
        console.error(`Error calculating median response time for ${owner}/${repo}:`, error);
        return 0;
    }
}

// Function to calculate number of issues closed within RESOLUTION_TIME_THRESH (hours)
// Return value is normalized to a scale of 0 to 1
export async function calculateIssueResolutionTime(owner: string, repo: string): Promise<number> {
    try {
        const issues = await getRepoIssues(owner, repo);
        const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000);
        
        // Filter issues created in the last 3 months
        const recentIssues = issues.filter((issue: any) => new Date(issue.created_at) > threeMonthsAgo);
        
        // Calculate resolution times
        const resolutionTimes = await Promise.all(recentIssues.map(async (issue: any) => {
            if (issue.state === 'closed') {
                const closedAt = new Date(issue.closed_at).getTime();
                const createdAt = new Date(issue.created_at).getTime();
                return (closedAt - createdAt) / (1000 * 60 * 60); // Convert to hours
            }
            return null;
        }));
        
        // Filter out null resolution times and calculate mean (for debugging)
        const validResolutionTimes = resolutionTimes.filter(time => time !== null).sort((a, b) => a - b);
        const mean = validResolutionTimes.length > 0 ? validResolutionTimes.reduce((a, b) => a + b) / validResolutionTimes.length : 0;
        // console.log('Mean resolution time:', mean.toFixed(2), 'hours');
        // Print the max and min resolution times for debugging
        // console.log('Max resolution time:', Math.max(...validResolutionTimes).toFixed(2), 'hours');
        // console.log('Min resolution time:', Math.min(...validResolutionTimes).toFixed(2), 'hours');
        // Calculate and return the percent of issues resolved within the threshold
        const resolvedWithinThreshold = validResolutionTimes.filter(time => time <= RESOLUTION_TIME_THRESH).length;
        return resolvedWithinThreshold / validResolutionTimes.length;

    } catch (error) {
        console.error(`Error calculating issue resolution time for ${owner}/${repo}:`, error);
        return 0;
    }
}

// Function to calculate the responsive maintainer metric
export async function calculateResponsiveMaintainer(owner: string, repo: string): Promise<number> {
    try {
        const responseTimeScore = await calculateResponseTime(owner, repo);
        const resolutionTimeScore = await calculateIssueResolutionTime(owner, repo);

        // Ensure that we return a valid score and handle potential NaN
        return isNaN(responseTimeScore) || isNaN(resolutionTimeScore)
            ? 0
            : (responseTimeScore + resolutionTimeScore) / 2;
    } catch (error) {
        console.error(`Error calculating responsive maintainer metric: ${error}`);
        return 0;
    }
}