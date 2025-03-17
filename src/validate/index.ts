import type { ParseResult } from "../ir";
import { checkLimits } from "./limits";
import { checkContext } from "./context";
import { checkNesting } from "./nesting";

export function validate(result: ParseResult) {
    checkLimits(result);
    checkContext(result);
    checkNesting(result);
}