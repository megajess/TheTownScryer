export interface ParsedDeckEntry {
    name: string
    quantity: number
    isCommander: boolean
}

export function parseDeckList(text: string): ParsedDeckEntry[] {
    const entries: ParsedDeckEntry[] = []
    let inCommanderSection = false

    for (const rawLine of text.split('\n')) {
        const line = rawLine.trim()
        if (!line) continue

        // Section headers
        if (/^\/\/\s*commander/i.test(line) || /^commander$/i.test(line)) {
            inCommanderSection = true
            continue
        }
        if (/^\/\/\s*(deck|mainboard|main)/i.test(line) || /^(deck|mainboard|main)$/i.test(line)) {
            inCommanderSection = false
            continue
        }
        if (line.startsWith('//')) continue

        // Card lines: "1 Sol Ring" or "1x Sol Ring" or "1 Sol Ring (CMR) 462"
        const match = line.match(/^(\d+)x?\s+(.+?)(?:\s+\([A-Za-z0-9]+\)\s+\S+.*)?$/)
        if (!match) continue

        const quantity = parseInt(match[1]!, 10)
        const name = match[2]!.trim()
        if (quantity > 0 && name) {
            entries.push({ name, quantity, isCommander: inCommanderSection })
        }
    }

    return entries
}
