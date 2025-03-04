import { parse, unwrap } from "./parse";
import { print } from "./roundtrip/printer";

export * from "./analysis/providers.js";

const result = parse(`
stat x = 5
stat y = stat y

if (stat x == 10) {
    chat "Hello, world!"
}

goto function "AnotherFunction"

chat "Goodbye"
`).holders;

const holders = result.map(it => unwrap(it));

console.log(print(holders));