import { describe, expect, it } from 'vitest';
import { readCases } from './helpers.js';
import { parseFromString } from '../src/parse';

describe('Parser', () => {
    for (const test of readCases(__dirname + '/cases/actions/')) {
        it('parse ' + test.name, () => {
            const result = parseFromString(test.source);

            expect(result).toMatchSnapshot();
        });
    }

    for (const test of readCases(__dirname + '/cases/actions/failing/')) {
        it('error ' + test.name, () => {
            const result = parseFromString(test.source);

            const diagnosticData = result.diagnostics.map((it) => {
                return {
                    level: it.level,
                    message: it.message,
                    span: it.span,
                };
            });

            expect(diagnosticData.length).toBeGreaterThan(0);
            expect(diagnosticData).toMatchSnapshot();
        });
    }
});
