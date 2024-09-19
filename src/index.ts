import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import path from 'path';
import yargs from 'yargs';
import fs from 'fs';


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
// const repositories = [
//     { owner: 'nullivex', repo: 'nodist', repoURL: 'https://github.com/nullivex/nodist' },
//     { owner: 'browserify', repo: 'browserify', repoURL: 'https://www.npmjs.com/package/browserify' },
//     { owner: 'cloudinary', repo: 'cloudinary_npm', repoURL: 'https://github.com/cloudinary/cloudinary_npm' },
//     { owner: 'lodash', repo: 'lodash', repoURL: 'https://github.com/lodash/lodash' },
//     { owner: 'expressjs', repo: 'express', repoURL: 'https://www.npmjs.com/package/express' },
// ];

// Main function to run metrics for each repository
async function runMetricsForAllRepos(repositories: { owner: string; repo: string; repoURL: string }[]) {
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

// Helper function to validate the file path
function validateFilePath(filePath: string): boolean {
    try {
        // Check if the file exists
        fs.accessSync(filePath as string, fs.constants.F_OK);
        
        // Check if the file is a valid text file
        const fileStats = fs.statSync(filePath as string);
        if (!fileStats.isFile() || !(filePath as string).endsWith('.txt')) {
            return false;
        }
        
        return true;
    } catch (error) {
        return false;
    }
}

// Main CLI logic
const argv = yargs(process.argv.slice(2))
    .command('install', 'Install dependencies', () => {}, (argv) => {
        console.log('Installing dependencies...');
        // Logic to install dependencies goes here
    })
    .command('test', 'Run tests', () => {}, (argv) => {
        console.log('Running tests...');
        // Logic to run tests goes here
    })
    .demandCommand(0, 1, 'You need to provide a command or a file path')
    .check((argv) => {
        // Print the filepath if provided
        if (argv._.length === 1) {
            const filePath = argv._[0] as string;
            if (!validateFilePath(filePath)) {
                throw new Error('Invalid file path provided');
            }
        }
        // Open the text file and read the URLs

        const repositoriesFromFile = getRepositoriesFromFile(argv._[0] as string);
        console.log(repositoriesFromFile);
        runMetricsForAllRepos(repositoriesFromFile);
        return true;
    })
    .argv;

    export function getRepositoriesFromFile(filePath: string): { owner: string; repo: string; repoURL: string }[] {
        const content = fs.readFileSync(filePath, 'utf-8');
        const urls = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
        const repositories = urls.map(url => {
            const githubMatch = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)/.exec(url);
            const npmMatch = /https:\/\/www\.npmjs\.com\/package\/([^\/]+)/.exec(url);
            
            if (githubMatch) {
                const owner = githubMatch[1];
                const repo = githubMatch[2];
                return { owner, repo, repoURL: url };
            } else if (npmMatch) {
                const owner = npmMatch[1];
                const repo = owner; // For npm, we assume the package name is the same as the owner
                return { owner, repo, repoURL: url };
            }
            
            return null; // Return null for unsupported URLs
        }).filter((repo): repo is { owner: string; repo: string; repoURL: string } => repo !== null); // Filter out null values
    
        return repositories;
    }