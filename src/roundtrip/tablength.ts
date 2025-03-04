export function tablength(hintSrc: string): string {
    const table: {
        [key: string]: number
    } = {};

    const lines = hintSrc.split("\n");

    for (const line of lines) {

        let i = 0;
        while (i++ < line.length) {
            if (/\W/.test(line[i])) break;
        }

        const tab = line.substring(0, i);
        table[tab]++;
    }

    return Object.entries(table)
        .reduce((a, b) => a[1] > b[1] ? a : b)
        [0];
}