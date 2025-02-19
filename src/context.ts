import type { Diagnostic } from "./parse/index.js";

export class CompileCtx {

    diagnostics: Array<Diagnostic>

    constructor() {
        this.diagnostics = [];
    }

    emit(diagnostic: Diagnostic) {
        this.diagnostics.push(diagnostic);
    }

}
