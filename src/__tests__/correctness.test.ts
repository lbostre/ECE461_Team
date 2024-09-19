import {expect, test} from "vitest"
import { calculateCorrectness } from '../metrics/correctness';

test("correctness for Wat4hjs to be low (less than or equal .33)", async () => {
    expect(await calculateCorrectness("https://www.npmjs.com/package/browserify", "hasansultan92", "watch.js")).toBeLessThanOrEqual(.7)
}, 60000)

