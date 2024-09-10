import { getRepoContributors } from "./githubAPI.js";
const world = 'world!';
function hello(who = world) {
    return `Hello ${who}! `;
}
console.log(hello(world));
//test
getRepoContributors('lbostre', 'ECE461_Team').then((r) => console.log(r));
//# sourceMappingURL=index.js.map
