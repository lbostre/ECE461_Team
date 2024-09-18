import {expect, test} from "vitest"
import { calculateCorrectness } from '../metrics/correctness';

test("bus factor for yargs to equal .1333", async () => {
    expect(await calculateCorrectness("microsoft", "Typescript")).toBe(.1333)
}, 60000)
