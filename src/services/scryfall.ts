import type { ScryfallCard } from "@/types/scryfall"

const SCRYFALL_API = 'https://api.scryfall.com'

export const CARD_BACK_URL = 'https://cards.scryfall.io/back.png'


export async function fetchCardsByNames(names: string[]): Promise<Map<string, ScryfallCard>> {
    const result = new Map<string, ScryfallCard>()
    const BATCH_SIZE = 75

    for (let i = 0; i < names.length; i += BATCH_SIZE) {
        const batch = names.slice(i, i + BATCH_SIZE)

        try {
            const response = await fetch(`${SCRYFALL_API}/cards/collection`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifiers: batch.map(name => ({ name })) }),
            })

            if (!response.ok) {
                console.error('Scryfall collection fetch failed:', response.statusText)
                continue
            }

            const data: { data: ScryfallCard[], not_found: unknown[] } = await response.json()

            if (data.not_found?.length) {
                console.warn('Cards not found on Scryfall:', data.not_found)
            }

            for (const card of data.data) {
                result.set(card.name, card)
                // Also index by front face name for double-faced cards ("Front // Back")
                const frontName = card.name.split(' // ')[0]
                if (frontName && frontName !== card.name) {
                    result.set(frontName, card)
                }
            }
        } catch (error) {
            console.error('Error fetching card batch:', error)
        }
    }

    return result
}

export function getImageUrl(card: ScryfallCard): string {
    if (card.card_faces && card.card_faces[0]?.image_uris) {
        return card.card_faces[0].image_uris.normal
    }

    if (card.image_uris) {
        return card.image_uris.normal
    }

    return ''
}