import { Lexer } from "./compiler/lexer.js";

const lexer = new Lexer(`
goto function "Hello, world!"

stat x = 5
stat y += 6
`);

let token;
do {
    token = lexer.advanceToken();
    console.log(token);
} while (token.kind != "eof");

