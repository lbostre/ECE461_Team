import {expect, test} from "vitest"
import { calculateLicenseCompatibility } from '../metrics/license';

test("license score for Wat4hjs to be 1", async () => {
    const result = await calculateLicenseCompatibility("https://github.com/browserify/browserify")
    expect(result).toBe(1)
}, 60000)

test("license score for 3js to be 1", async () => {
    expect(await calculateLicenseCompatibility("https://github.com/mrdoob/three.js/")).toBe(1)
}, 60000)

test("license score for SocketIO to be 1", async () => {
    const result = await calculateLicenseCompatibility("https://github.com/socketio/socket.io")
    expect(result).toBe(1)
}, 60000)

test("license score for libvlc to be 1", async () => {
    expect(await calculateLicenseCompatibility("https://github.com/prathameshnetake/libvlc")).toBe(1)
}, 60000)

test("license score for ReactJs to be 1", async () => {
    expect(await calculateLicenseCompatibility("https://github.com/facebook/react")).toBe(1)
}, 60000)

test("license score for unlicensed to be 0", async () => {
    expect(await calculateLicenseCompatibility("https://github.com/ryanve/unlicensed")).toBe(0)
}, 60000)