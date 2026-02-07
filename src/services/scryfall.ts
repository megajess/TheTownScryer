import type { ScryfallCard } from "@/types/scryfall"

const SCRYFALL_API = 'https://api.scryfall.com'

export const CARD_BACK_URL = 'https://cards.scryfall.io/back.png'

export async function fetchCardByName(name: string): Promise<ScryfallCard | null> {
    try {
        const response = await fetch(`${SCRYFALL_API}/cards/named?exact=${encodeURIComponent(name)}`)

        if (!response.ok) {
            console.error(`Failed to fetch "${name}":`, response.statusText)

            return null
        }

        const card: ScryfallCard = await response.json()

        return card
    } catch (error) {
        console.error(`Error fetching "${name}":`, error)

        return null
    }
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