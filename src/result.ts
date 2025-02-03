type Result<T, E> =
    | { ok: true, value: T }
    | { ok: false, error: E };

function ok<T>(value: T): Result<T, never> {
    return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
    return { ok: false, error };
}