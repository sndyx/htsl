import { editor, IDisposable, languages, MarkerSeverity, Position } from "monaco-editor";
import * as htsl from "htsl/src";

// --- inlay hints ---

export class InlayHintsAdapter implements languages.InlayHintsProvider {
    public provideInlayHints(
        model: editor.ITextModel,
        // range: Range,
        // token: CancellationToken
    ): languages.ProviderResult<languages.InlayHintList> {
        if (model.isDisposed()) return null;

        const htslHints = htsl.getInlayHints(model.getValue());
        const hints: languages.InlayHint[] = htslHints.map(hint => {
            return {
                kind: languages.InlayHintKind.Parameter,
                position: model.getPositionAt(hint.span.start),
                label: hint.label
            };
        });

        return { hints, dispose: () => {} };
    }
}

// --- rename ---

export class RenameAdapter implements languages.RenameProvider {
    public resolveRenameLocation(
        model: editor.ITextModel,
        position: Position,
        // token: CancellationToken
    ): languages.ProviderResult<languages.RenameLocation> {
        if (model.isDisposed()) return null;

        const location = htsl.resolveRename(model.getValue(), model.getOffsetAt(position));

        if (!location) return;

        const start = model.getPositionAt(location.span.start);
        const end = model.getPositionAt(location.span.end);

        return {
            range: {
                startLineNumber: start.lineNumber,
                startColumn: start.column,
                endLineNumber: end.lineNumber,
                endColumn: end.column
            },
            text: location.text
        }
    }

    provideRenameEdits(
        model: editor.ITextModel,
        position: Position,
        newName: string,
        // token: CancellationToken
    ): languages.ProviderResult<languages.WorkspaceEdit> {
        const htslEdits = htsl.getRenameLocations(model.getValue(), model.getOffsetAt(position), newName);
        if (!htslEdits) return;

        const edits = htslEdits.map(edit => {
            const start = model.getPositionAt(edit.span.start);
            const end = model.getPositionAt(edit.span.end);

            return {
                resource: model.uri,
                textEdit: {
                    range: {
                        startLineNumber: start.lineNumber,
                        startColumn: start.column,
                        endLineNumber: end.lineNumber,
                        endColumn: end.column
                    },
                    text: edit.text
                },
                versionId: model.getVersionId()
            };
        });

        return {
            edits
        };
    }
}

// --- diagnostics ---

export class DiagnosticsAdapter {
    private disposables: IDisposable[] = [];
    private listeners: { [uri: string]: IDisposable } = Object.create(null);

    constructor() {
        const onModelAdded = (model: editor.ITextModel) => {
            if (model.getLanguageId() !== "htsl") return;

            let handle: number;
            const changeSubscription = model.onDidChangeContent(() => {
                clearTimeout(handle);
                handle = window.setTimeout(() => this.validate(model), 500);
            });

            const visibleSubscription = model.onDidChangeAttached(() => {
                if (model.isAttachedToEditor()) {
                    this.validate(model);
                } else {
                    editor.setModelMarkers(model, "htsl", []);
                }
            });

            this.listeners[model.uri.toString()] = {
                dispose() {
                    changeSubscription.dispose();
                    visibleSubscription.dispose();
                    clearTimeout(handle);
                }
            }

            this.validate(model);
        }

        const onModelRemoved = (model: editor.ITextModel) => {
            editor.setModelMarkers(model, "htsl", []);
            const key = model.uri.toString();
            if (this.listeners[key]) {
                this.listeners[key].dispose();
                delete this.listeners[key];
            }
        }

        this.disposables.push(editor.onDidCreateModel(onModelAdded));
        this.disposables.push(editor.onWillDisposeModel(onModelRemoved));
        this.disposables.push(
            editor.onDidChangeModelLanguage(event => {
                onModelRemoved(event.model);
                onModelAdded(event.model);
            })
        );
        this.disposables.push({
            dispose() {
                for (const model of editor.getModels()) {
                    onModelRemoved(model);
                }
            }
        });

        editor.getModels().forEach(onModelAdded);
    }

    public dispose() {
        this.disposables.forEach(d => d && d.dispose());
        this.disposables = [];
    }

    private validate(model: editor.ITextModel) {
        const htslDiagnostics = htsl.getDiagnostics(model.getValue());

        const markers = htslDiagnostics.map(diagnostic => {
            const start = model.getPositionAt(diagnostic.span.start);
            const end = model.getPositionAt(diagnostic.span.end)

            return {
                message: diagnostic.message,
                severity: this.htslDiagnosticLevelToMarkerSeverity(diagnostic.level),
                startLineNumber: start.lineNumber,
                startColumn: start.column,
                endLineNumber: end.lineNumber,
                endColumn: end.column
            };
        });

        editor.setModelMarkers(model, "owner", markers);
    }

    private htslDiagnosticLevelToMarkerSeverity(severity: string): MarkerSeverity {
        severity.split("");
        return MarkerSeverity.Error;
    }
}