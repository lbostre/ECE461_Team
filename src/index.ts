import { cloneRepository, cleanUpRepository } from './API/githubAPI.js';
import { calculateBusFactor } from "./metrics/busFactor.js";
import { calculateCorrectness } from './metrics/correctness.js';
import { calculateResponsiveMaintainer } from "./metrics/responsiveMaintainer.js";
import { calculateRampUp } from "./metrics/rampUp.js";
import { calculateLicenseCompatibility } from "./metrics/license.js";

interface PackageMetrics {
    URL: string;
    NetScore: number;
    NetScore_Latency: number;
    RampUp: number;
    RampUp_Latency: number;
    Correctness: number;
    Correctness_Latency: number;
    BusFactor: number;
    BusFactor_Latency: number;
    ResponsiveMaintainer: number;
    ResponsiveMaintainer_Latency: number;
    License: number;
    License_Latency: number;
}

// Helper function to calculate time taken for metric execution
async function calculateWithLatency<T>(calculationFn: () => Promise<T>): Promise<{ value: T; latency: number }> {
    const start = process.hrtime();
    const value = await calculationFn();
    const latency = process.hrtime(start);
    const latencyInSeconds = latency[0] + latency[1] / 1e9; // Convert to seconds
    return { value, latency: latencyInSeconds };
}

// Main function to calculate metrics and produce the final output
async function runMetrics(owner: string, repo: string, repoURL: string): Promise<PackageMetrics> {
    const repoPath = await cloneRepository(owner, repo);

    try {
        // Calculate Bus Factor and Latency
        const { value: busFactor, latency: busFactorLatency } = await calculateWithLatency(() =>
            calculateBusFactor(owner, repo)
        );

        // Calculate Correctness and Latency
        const { value: correctness, latency: correctnessLatency } = await calculateWithLatency(() =>
            calculateCorrectness(repoPath, owner, repo)
        );

        // Calculate Ramp-Up Time and Latency
        const { value: rampUp, latency: rampUpLatency } = await calculateWithLatency(() =>
            calculateRampUp(repoPath)
        );

        // Calculate Responsive Maintainer and Latency
        const { value: responsiveMaintainer, latency: responsiveMaintainerLatency } = await calculateWithLatency(() =>
            calculateResponsiveMaintainer(owner, repo)
        );

        // Calculate License Compatibility and Latency
        const { value: license, latency: licenseLatency } = await calculateWithLatency(() =>
            calculateLicenseCompatibility(repoPath)
        );

        // Compute the final NetScore
        const netScore = 0.25 * busFactor + 0.20 * correctness + 0.20 * rampUp + 0.25 * responsiveMaintainer + 0.10 * license;

        // Compute total latency
        const netScoreLatency =
        busFactorLatency +
        correctnessLatency +
        rampUpLatency +
        responsiveMaintainerLatency +
        licenseLatency;

        return {
            URL: repoURL,
            NetScore: netScore,
            NetScore_Latency: netScoreLatency,
            RampUp: rampUp,
            RampUp_Latency: rampUpLatency,
            Correctness: correctness,
            Correctness_Latency: correctnessLatency,
            BusFactor: busFactor,
            BusFactor_Latency: busFactorLatency,
            ResponsiveMaintainer: responsiveMaintainer,
            ResponsiveMaintainer_Latency: responsiveMaintainerLatency,
            License: license,
            License_Latency: licenseLatency,
        };
    } finally {
        await cleanUpRepository(repoPath); // Clean up the repository after analysis
    }
}

// List of repositories to analyze
const repositories = [
  { owner: 'nullivex', repo: 'nodist', repoURL: 'https://github.com/nullivex/nodist' },
  { owner: 'browserify', repo: 'browserify', repoURL: 'https://www.npmjs.com/package/browserify' },
  { owner: 'cloudinary', repo: 'cloudinary_npm', repoURL: 'https://github.com/cloudinary/cloudinary_npm' },
  { owner: 'lodash', repo: 'lodash', repoURL: 'https://github.com/lodash/lodash' },
  { owner: 'expressjs', repo: 'express', repoURL: 'https://www.npmjs.com/package/express' },
];

// Run metrics for each repository
(async () => {
    for (const { owner, repo, repoURL } of repositories) {
        try {
            const metrics = await runMetrics(owner, repo, repoURL);
            console.log(JSON.stringify(metrics, null, 2)); // Output the result in JSON format
        } catch (error) {
            console.error(`Failed to process ${repoURL}:`, error);
        }
    }
})();