import { describe, expect, it } from "vitest";
import { readCases } from "./helpers.js";
import { Lexer } from "../lexer.js";
import { Parser } from "../parser.js";
import { CompileCtx } from "../../context.js";

describe("Parser", () => {

    for (const test of readCases(__dirname + "/cases/parser/")) {
        it("parse " + test.name, () => {
            const ctx = new CompileCtx();
            const lexer = new Lexer(test.source);
            const parser = new Parser(ctx, lexer);
            const result = parser.parseCompletely();

            expect(result).toMatchSnapshot();
        });
    }

    for (const test of readCases(__dirname + "/cases/parser/failing/")) {
        it("error " + test.name, () => {
            const ctx = new CompileCtx();
            const lexer = new Lexer(test.source);
            const parser = new Parser(ctx, lexer);
            parser.parseCompletely();

            const diagnosticData = ctx.diagnostics.map(it => {
                return {
                    level: it.level,
                    message: it.message,
                    span: it.span,
                }
            });

            expect(diagnosticData.length).toBeGreaterThan(0);
            expect(diagnosticData).toMatchSnapshot();
        })
    }

});