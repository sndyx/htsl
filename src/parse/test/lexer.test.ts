import { describe, it, expect } from "vitest"
import { Lexer } from "../lexer.js";
import { readCases } from "./helpers.js";

describe("Lexer", () => {

    for (const test of readCases(__dirname + "/cases/lexer/")) {
        it(test.name, () => {
            const lexer = new Lexer(test.source);
            const result = [];
            while (lexer.hasNext()) result.push(lexer.advanceToken());

            expect(result).toMatchSnapshot();
        });
    }

});