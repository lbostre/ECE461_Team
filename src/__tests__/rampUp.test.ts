import {expect, test} from "vitest"
import { calculateRampUp } from '../metrics/rampUp';

test("ramp up time for Wat4hjs to be medium (in between .33 and .67)", async () => {
    const result = await calculateRampUp("https://github.com/hasansultan92/watch.js")
    expect(result).toBeGreaterThanOrEqual(.33)
    expect(result).toBeLessThanOrEqual(.67)
}, 60000)

test("ramp up time for 3js to be low (less than or equal .33)", async () => {
    expect(await calculateRampUp("https://github.com/mrdoob/three.js/")).toBeLessThanOrEqual(.33)
}, 60000)

test("ramp up time for SocketIO to be low (in between .33 and .67)", async () => {
    const result = await calculateRampUp("https://github.com/socketio/socket.io")
    expect(result).toBeLessThanOrEqual(.33)
}, 60000)

test("ramp up time for libvlc to be high (greater than or equal to .67)", async () => {
    expect(await calculateRampUp("https://github.com/prathameshnetake/libvlc")).toBeGreaterThanOrEqual(.67)
}, 60000)

test("ramp up time for ReactJs to be low (less than or equal .33)", async () => {
    expect(await calculateRampUp("https://github.com/facebook/react")).toBeLessThanOrEqual(.33)
}, 60000)

test("ramp up time for unlicensed to be low (less than or equal .33)", async () => {
    expect(await calculateRampUp("https://github.com/ryanve/unlicensed")).toBeLessThanOrEqual(.33)
}, 60000)