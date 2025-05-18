import type { WrittenStyle } from './style';

export function error(message: string): string {
    return `/* error: ${message} */`
}

export function hint(message: string): string {
    return `/* ${message} */`
}

export function concat(elements: string[], sep: string): string {
    let res = elements[0] ?? "";

    for (let i = 1; i < elements.length; i++) {
        res = res.concat(sep, elements[i]);
    }

    return res;
}

export function maybeQuote(name: string): string {
    if (name.includes(' ')) return `"${name}"`;
    return name;
}

export function withWrittenStyle(
    name: string,
    style: WrittenStyle,
): string {
    let capitalizedName;
    if (style.capitalization === 'lowercase') {
        capitalizedName = name.toLowerCase();
    } else if (style.capitalization === 'uppercase') {
        capitalizedName = name.toUpperCase();
    } else {
        capitalizedName = name.toLowerCase().split(' ').map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    }

    if (style.quoted || name.includes(' ')) {
        return `"${capitalizedName}"`;
    } else return capitalizedName;
}