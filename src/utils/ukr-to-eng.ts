/**
 * Converter the Ukrainian text to English by same-looking matrix
 * @param text Text to convert
 * @param placeholder Placeholder to use in case if letter has no equivalent
 */
export function ukrToEng(text: string, placeholder = ''): string {
    /**
     * Eng chars
     */
    const regex = /^[a-zA-Z0-9]$/;
    /**
     * Same-looking characters converter
     */
    const mapping: { [key: string]: string } = {
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

    return Array
        .from(text.toUpperCase())
        .map((char: string) => regex.test(char) ? char : (mapping[char] || placeholder))
        .map((char: string) => char.trim())
        .join('')
        .toUpperCase();
}
