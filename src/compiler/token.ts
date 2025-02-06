import type { Span } from "../span.js";

export type Token = TokenType & { span: Span };

export type TokenType =
    | { kind: "comma" }

    | { kind: "bin_op", op: BinOp }
    | { kind: "bin_op_eq", op: BinOp }

    | { kind: "cmp_op", op: CmpOp }
    | { kind: "cmp_op_eq", op: CmpOp }

    | { kind: "open_delim", delim: Delimiter }
    | { kind: "close_delim", delim: Delimiter }

    | { kind: "str", value: string }
    | { kind: "i64", value: string }
    | { kind: "f64", value: string }

    | { kind: "ident", value: string }

    | { kind: "eol" }
    | { kind: "eof" };

export type Delimiter = "parenthesis" | "brace" | "bracket";

export type BinOp = "plus" | "minus" | "star" | "slash" | "star_star";

export type CmpOp = "greater_than" | "less_than" | "equal";

export function token<K extends Token["kind"]>(
    kind: K,
    span: Span,
    props?: Omit<Extract<Token, { kind: K }>, "kind" | "span">
): Token {
    return { kind, span, ...props } as Token;
}