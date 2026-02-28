import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { CardInstance, ZoneType } from '@/types/card'

export const useGameStore = defineStore('game', () => {
    const library = ref<CardInstance[]>([])
    const hand = ref<CardInstance[]>([])
    const battlefield = ref<CardInstance[]>([])
    const commandZone = ref<CardInstance[]>([])
    const graveyard = ref<CardInstance[]>([])
    const exile = ref<CardInstance[]>([])
    const reveal = ref<CardInstance[]>([])
    const commanderIds = ref<string[]>([])

    const commanders = computed(() =>
        commanderIds.value
            .map(id => findCard(id))
            .filter((c): c is CardInstance => c !== undefined)
    )

    function draw(count: number = 1) {
        for (let i = 0; i < count; i++) {
            if (library.value.length === 0) break

            const card = library.value.shift()

            if (card) {
                card.zone = 'hand'
                hand.value.push(card)
            }
        }
    }

    function shuffleLibrary() {
        for (let i = library.value.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            const temp = library.value[i]

            if (temp && library.value[j]) {
                library.value[i] = library.value[j]
                library.value[j] = temp
            }
        }
    }

    function discard(cardId: string) {
        const index = hand.value.findIndex((c) => c.id === cardId)

        if (index === -1) return

        const card = hand.value.splice(index, 1)[0]

        if (card) {
            card.zone = 'graveyard'
            graveyard.value.push(card)
        }
    }

    function loadLibrary(cards: CardInstance[]) {
        library.value.splice(0, library.value.length, ...cards)
    }

    function loadCommandZone(cards: CardInstance[]) {
        commandZone.value.splice(0, commandZone.value.length, ...cards)
        commanderIds.value = cards.map(c => c.id)
    }

    function getZoneRef(zone: ZoneType) {
        const zoneMap = {
            library,
            hand,
            battlefield,
            commandZone,
            graveyard,
            exile,
            reveal,
        }

        return zoneMap[zone]
    }

    function toggleTap(cardId: string) {
        const card = findCard(cardId)

        if (!card) return

        card.tapped = !card.tapped
    }

    function findCard(cardId: string): CardInstance | undefined {
        const allZones = [library, hand, battlefield, commandZone, graveyard, exile, reveal]

        for (const zone of allZones) {
            const card = zone.value.find((c) => c.id === cardId)

            if (card) return card
        }

        return undefined
    }

    function moveCard(cardId: string, fromZone: ZoneType, toZone: ZoneType, x?: number, y?: number) {
        const fromRef = getZoneRef(fromZone)
        const toRef = getZoneRef(toZone)
        const index = fromRef.value.findIndex((c) => c.id === cardId)

        if (index === -1) return

        const card = fromRef.value.splice(index, 1)[0]

        if (card) {
            card.zone = toZone

            if (x !== undefined) card.x = x
            if (y !== undefined) card.y = y

            toRef.value.push(card)
        }
    }

    return {
        library,
        hand,
        battlefield,
        commandZone,
        graveyard,
        exile,
        reveal,
        commanders,
        draw,
        shuffleLibrary,
        discard,
        loadLibrary,
        loadCommandZone,
        findCard,
        moveCard,
        toggleTap,
    }
})