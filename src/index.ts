import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import path from 'path';

// Simulate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Worker script for running metrics calculations in parallel
const WORKER_SCRIPT_PATH = path.resolve(__dirname, 'metricsWorker.js');

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

// Helper function to run a worker thread
function runWorker(workerData: any): Promise<PackageMetrics> {
    return new Promise((resolve, reject) => {
        const worker = new Worker(WORKER_SCRIPT_PATH, { workerData });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

// List of repositories to analyze
const repositories = [
    { owner: 'nullivex', repo: 'nodist', repoURL: 'https://github.com/nullivex/nodist' },
    { owner: 'browserify', repo: 'browserify', repoURL: 'https://www.npmjs.com/package/browserify' },
    { owner: 'cloudinary', repo: 'cloudinary_npm', repoURL: 'https://github.com/cloudinary/cloudinary_npm' },
    { owner: 'lodash', repo: 'lodash', repoURL: 'https://github.com/lodash/lodash' },
    { owner: 'expressjs', repo: 'express', repoURL: 'https://www.npmjs.com/package/express' },
];

// Main function to run metrics for each repository
async function runMetricsForAllRepos() {
    const results: PackageMetrics[] = [];

    const tasks = repositories.map(({ owner, repo, repoURL }) => {
        return runWorker({ owner, repo, repoURL });
    });

    try {
        // Run all tasks concurrently using worker threads
        const metricsResults = await Promise.all(tasks);
        results.push(...metricsResults);
        results.forEach(result => console.log(JSON.stringify(result, null, 2)));
    } catch (error) {
        console.error('Error running metrics in worker threads:', error);
    }
}

// Run the metric calculations
runMetricsForAllRepos();
