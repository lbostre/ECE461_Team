import { getRepoContributors, getRepoPullRequests } from "./githubAPI.js";

const world = 'world!';

function hello(who: string = world): string {
    return `Hello ${who}! `;
}

console.log(hello(world))

//test
getRepoContributors('lbostre', 'ECE461_Team').then((r) => console.log(r));