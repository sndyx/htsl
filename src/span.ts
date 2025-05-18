export class Span {
    start: number;
    end: number;

    constructor(start: number, end: number) {
        this.start = start;
        this.end = end;
    }

    static single(pos: number): Span {
        return new Span(pos, pos);
    }
}