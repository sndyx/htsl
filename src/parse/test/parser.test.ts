import { describe, expect, it } from "vitest";
import { readCases } from "./helpers.js";
import { parse } from "../index";

describe("Parser", () => {

    for (const test of readCases(__dirname + "/cases/parser/")) {
        it("parse " + test.name, () => {
            const result = parse(test.source);

            expect(result).toMatchSnapshot();
        });
    }

    for (const test of readCases(__dirname + "/cases/parser/failing/")) {
        it("error " + test.name, () => {
            const result = parse(test.source);

            const diagnosticData = result.diagnostics.map(it => {
                return {
                    level: it.level,
                    message: it.message,
                    span: it.range,
                }
            });

            expect(diagnosticData.length).toBeGreaterThan(0);
            expect(diagnosticData).toMatchSnapshot();
        });
    }

});