/**
 * Mapping
 */
const ukrainianLatinLookalikesMapping: { [key: string]: string } = {
    'А': 'A',
    'В': 'B',
    'Е': 'E',
    'И': 'Y',
    'І': 'I',
    'К': 'K',
    'М': 'M',
    'Н': 'H',
    'О': 'O',
    'Р': 'P',
    'С': 'C',
    'Т': 'T',
    'У': 'Y',
    'Х': 'X',
};

export function toEngConverter(text: string): string {
    return Array
        .from(text)
        .map((char: string) => (ukrainianLatinLookalikesMapping[char] || char))
        .join('')
        .toUpperCase();
}


export function escapeMarkdown(text: string) {
    const specialChars = [ '_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!' ];

    return text
        .split('')
        .map(char => specialChars.includes(char) ? `\\${ char }` : char)
        .join('');
}
