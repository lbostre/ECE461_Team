import { parentPort, workerData } from 'worker_threads';
import { cloneRepository, cleanUpRepository } from './API/githubAPI.js';
import { calculateBusFactor } from './metrics/busFactor.js';
import { calculateCorrectness } from './metrics/correctness.js';
import { calculateResponsiveMaintainer } from './metrics/responsiveMaintainer.js';
import { calculateRampUp } from './metrics/rampUp.js';
import { calculateLicenseCompatibility } from './metrics/license.js';

// Extract workerData (owner, repo, repoURL)
const { owner, repo, repoURL } = workerData;

// Helper function to calculate time taken for metric execution
async function calculateWithLatency<T>(calculationFn: () => Promise<T>): Promise<{ value: T; latency: number }> {
    const start = process.hrtime();
    const value = await calculationFn();
    const latency = process.hrtime(start);
    const latencyInSeconds = latency[0] + latency[1] / 1e9; // Convert to seconds
    return { value, latency: latencyInSeconds };
}

// Main function to calculate metrics for a single repository
(async () => {
    const repoPath = await cloneRepository(owner, repo);

    try {
        const [busFactorResult, correctnessResult, rampUpResult, responsiveMaintainerResult, licenseResult] = await Promise.all([
            calculateWithLatency(() => calculateBusFactor(owner, repo)),
            calculateWithLatency(() => calculateCorrectness(repoPath, owner, repo)),
            calculateWithLatency(() => calculateRampUp(repoPath)),
            calculateWithLatency(() => calculateResponsiveMaintainer(owner, repo)),
            calculateWithLatency(() => calculateLicenseCompatibility(repoPath)),
        ]);

        const netScore = 0.25 * busFactorResult.value + 
                        0.20 * correctnessResult.value + 
                        0.20 * rampUpResult.value + 
                        0.25 * responsiveMaintainerResult.value + 
                        0.10 * licenseResult.value;

        const result = {
            URL: repoURL,
            NetScore: netScore,
            NetScore_Latency: busFactorResult.latency + correctnessResult.latency + rampUpResult.latency + responsiveMaintainerResult.latency + licenseResult.latency,
            RampUp: rampUpResult.value,
            RampUp_Latency: rampUpResult.latency,
            Correctness: correctnessResult.value,
            Correctness_Latency: correctnessResult.latency,
            BusFactor: busFactorResult.value,
            BusFactor_Latency: busFactorResult.latency,
            ResponsiveMaintainer: responsiveMaintainerResult.value,
            ResponsiveMaintainer_Latency: responsiveMaintainerResult.latency,
            License: licenseResult.value,
            License_Latency: licenseResult.latency,
        };

        // Return result to main thread
        parentPort?.postMessage(result);
    } catch (error) {
        parentPort?.postMessage({ error });
    } finally {
        await cleanUpRepository(repoPath);
    }
})();
