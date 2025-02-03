export type Token = 
    | { kind: "comma" }

    | { kind: "bin_op", op: BinOp }
    | { kind: "bin_op_eq", op: BinOp }

    | { kind: "cmp_op", op: CmpOp }
    | { kind: "cmp_op_eq", op: CmpOp }

    | { kind: "open_delim", delim: Delimiter }
    | { kind: "close_delim", delim: Delimiter }
    
    | { kind: "str", value: string }
    | { kind: "i64", value: number }
    | { kind: "f64", value: number }

    | { kind: "ident", value: string }

    | { kind: "eol" }
    | { kind: "eof" };

export type Delimiter = "parenthesis" | "brace" | "bracket";

export type BinOp = "plus" | "minus" | "star" | "slash";

export type CmpOp = "gt" | "lt" | "eq";

export function token<K extends Token['kind']>(
    kind: K,
    props?: Omit<Extract<Token, { kind: K }>, 'kind'>
): Token {
    return { kind, ...props } as Token;
}