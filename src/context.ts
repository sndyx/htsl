import type { Diagnostic } from "./types/diagnostic.js";

export class CompileCtx {

    diagnostics: Array<Diagnostic>

    constructor() {
        this.diagnostics = [];
    }

    emit(diagnostic: Diagnostic) {
        this.diagnostics.push(diagnostic);
    }

}
