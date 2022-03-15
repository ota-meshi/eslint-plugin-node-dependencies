/**
 * Convert to regexp
 */
export function toRegExp(str: string): { test(s: string): boolean } {
    const regexp = parseRegExp(str)
    if (regexp) {
        return regexp
    }
    return { test: (s) => s === str }
}

/**
 * Parse regexp string
 */
function parseRegExp(str: string) {
    if (!str.startsWith("/")) {
        return null
    }
    const lastSlashIndex = str.lastIndexOf("/")
    if (lastSlashIndex <= 1) {
        return null
    }
    return new RegExp(
        str.slice(1, lastSlashIndex),
        str.slice(lastSlashIndex + 1),
    )
}
