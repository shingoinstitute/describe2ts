/**
 * Escapes a string `s` such that `JSON.parse(escapeString(s)) === s`
 *
 * includes surrounding quotes
 * @param s a string
 */
export const escapeString = (s: string) => JSON.stringify(s)
export const joinUnion = (s: string[]) => s.join(' | ')
