import assert from "assert"

import { normalizeSemverRange } from "../../../lib/utils/semver"
import { Range } from "semver"

describe("normalizeSemverRange", () => {
    const testcases = [
        {
            input: [">=10"],
            output: ">=10.0.0",
        },
        {
            input: ["^10 || ^13", "^10.12", ">=12 <12.22", ">=12.10 <12.30"],
            output: "^10.0.0||>=12.10.0 <12.30.0-0||^13.0.0",
        },
        {
            input: ["*", "^13"],
            output: "*",
        },
        {
            input: ["~10.12", "^13"],
            output: "~10.12.0||^13.0.0",
        },
        {
            input: ["10.12 - 12", "^13"],
            output: ">=10.12.0 <13.0.0-0||^13.0.0",
        },
        {
            input: ["~1.2.3-beta.2"],
            output: "~1.2.3-beta.2",
        },
        {
            input: ["^1.2.3-beta.2"],
            output: "^1.2.3-beta.2",
        },
        {
            input: [""],
            output: "*",
        },
        {
            input: ["*"],
            output: "*",
        },
        {
            input: ["0.13.0"],
            output: "0.13.0",
        },
        {
            input: ["0.13.0", "=0.13.0"],
            output: "0.13.0",
        },
        {
            input: ["=0.13.0", "0.13.0"],
            output: "0.13.0",
        },
    ]
    for (const { input, output } of testcases) {
        it(`Normalizing [${input
            .map((s) => `"${s}"`)
            .join(", ")}] should result in "${output}".`, () => {
            assert.strictEqual(
                normalizeSemverRange(...input.map((i) => new Range(i)))?.raw,
                output,
            )
        })
    }
})
