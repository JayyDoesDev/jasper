export function truncateForTextDisplay(text: string, max = 4000): string {
    if (typeof text !== 'string') return '';
    if (text.length <= max) return text;
    // Reserve 3 chars for ellipsis
    const sliceLen = Math.max(0, max - 3);
    return text.slice(0, sliceLen) + '...';
}
