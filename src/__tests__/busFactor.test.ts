import {expect, test} from "vitest"
import { calculateBusFactor } from '../metrics/busFactor';

test("bus factor for yargs to equal .1333", async () => {
    expect(await calculateBusFactor("yargs", "yargs")).toBe(.1333)
}, 60000)
