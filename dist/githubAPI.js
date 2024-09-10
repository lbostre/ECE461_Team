var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Octokit } from '@octokit/rest';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const octokit = new Octokit({
    auth: GITHUB_TOKEN,
    baseUrl: 'https://api.github.com',
    log: {
        debug: (message) => console.debug(message),
        info: (message) => console.info(message),
        warn: (message) => console.warn(message),
        error: (message) => console.error(message),
    },
});
// Get repository contributors
export function getRepoContributors(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data } = yield octokit.rest.repos.listContributors({
                owner,
                repo,
            });
            return data;
        }
        catch (error) {
            console.error(`Error fetching contributors for ${owner}/${repo}:`, error);
            throw error;
        }
    });
}
// Get repository issues
export function getRepoIssues(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data } = yield octokit.rest.issues.listForRepo({
                owner,
                repo,
                state: 'all', // Fetch both open and closed issues
            });
            return data;
        }
        catch (error) {
            console.error(`Error fetching issues for ${owner}/${repo}:`, error);
            throw error;
        }
    });
}
// Get repository pull requests
export function getRepoPullRequests(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data } = yield octokit.rest.pulls.list({
                owner,
                repo,
                state: 'all', // Fetch both open and closed PRs
            });
            return data;
        }
        catch (error) {
            console.error(`Error fetching pull requests for ${owner}/${repo}:`, error);
            throw error;
        }
    });
}
// Get repository license
export function getRepoLicense(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data } = yield octokit.rest.licenses.getForRepo({
                owner,
                repo,
            });
            return data;
        }
        catch (error) {
            console.error(`Error fetching license for ${owner}/${repo}:`, error);
            throw error;
        }
    });
}
//# sourceMappingURL=githubAPI.js.map
