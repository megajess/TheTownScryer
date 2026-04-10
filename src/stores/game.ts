import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { CardInstance, CounterType, ZoneType } from '@/types/card'

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

    function untapAll() {
        battlefield.value.forEach(card => card.tapped = false)
    }

    function setFaceDown(cardId: string, value: boolean) {
        const card = findCard(cardId)
        if (card) card.faceDown = value
    }

    function findCard(cardId: string): CardInstance | undefined {
        const allZones = [library, hand, battlefield, commandZone, graveyard, exile, reveal]

        for (const zone of allZones) {
            const card = zone.value.find((c) => c.id === cardId)

            if (card) return card
        }

        return undefined
    }

    function moveCard(cardId: string, fromZone: ZoneType, toZone: ZoneType, position?: number | 'top' | 'bottom') {
        const fromRef = getZoneRef(fromZone)
        const toRef = getZoneRef(toZone)
        const index = fromRef.value.findIndex((c) => c.id === cardId)

        if (index === -1) return

        const card = fromRef.value.splice(index, 1)[0]

        if (card) {
            card.zone = toZone

            if (toZone === 'library') {
                card.isScrying = false
            }

            if (position === 'top') {
                toRef.value.unshift(card)
            } else if (typeof position === 'number') {
                toRef.value.splice(position, 0, card)
            } else {
                toRef.value.push(card)
            }
        }
    }

    function scry(count: number = 1) {
        for (let i = 0; i < count; i++) {
            if (library.value.length === 0) break

            const card = library.value.shift()

            if (card) {
                card.zone = 'hand'
                card.isScrying = true
                hand.value.push(card)
            }
        }
    }

    function placeScryCard(cardId: string, position: 'top' | 'bottom') {
        moveCard(cardId, 'hand', 'library', position)
    }

    function removeCounter(cardId: string, type: CounterType) {
        const card = findCard(cardId)
        if (!card) return
        card.counters = card.counters.filter(c => c.type !== type)
    }

    function addCounter(cardId: string, type: CounterType, name?: string) {
        const card = findCard(cardId)
        if (!card) return

        if (type === 'plusOne' || type === 'minusOne') {
            const existing = card.counters.find(c => c.type === type)
            if (existing) {
                existing.count++
            } else {
                card.counters.push({ id: crypto.randomUUID(), type, count: 1 })
            }
        } else if (type === 'loyalty') {
            if (!card.counters.find(c => c.type === 'loyalty')) {
                card.counters.push({ id: crypto.randomUUID(), type, count: 1 })
            }
        } else {
            card.counters.push({ id: crypto.randomUUID(), type, count: 1, name })
        }
    }

    function incrementCounter(cardId: string, counterId: string) {
        const card = findCard(cardId)
        const counter = card?.counters.find(c => c.id === counterId)
        if (counter) counter.count++
    }

    function decrementCounter(cardId: string, counterId: string) {
        const card = findCard(cardId)
        if (!card) return
        const index = card.counters.findIndex(c => c.id === counterId)
        if (index === -1) return
        const counter = card.counters[index]!
        if (counter.count <= 1) {
            card.counters.splice(index, 1)
        } else {
            counter.count--
        }
    }

    function mill(count: number) {
        for (let i = 0; i < count; i++) {
            if (library.value.length === 0) break
            const card = library.value.shift()
            if (card) {
                card.zone = 'graveyard'
                graveyard.value.push(card)
            }
        }
    }

    function returnHandToLibrary() {
        const cards = hand.value.splice(0)
        for (const card of cards) {
            card.zone = 'library'
            library.value.push(card)
        }
    }

    function placeOnBattlefield(cardId: string, fromZone: ZoneType, x: number, y: number) {
        const card = findCard(cardId)
        if (!card) return
        card.x = x
        card.y = y
        moveCard(cardId, fromZone, 'battlefield')
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
        placeOnBattlefield,
        toggleTap,
        untapAll,
        setFaceDown,
        mill,
        addCounter,
        removeCounter,
        incrementCounter,
        decrementCounter,
        returnHandToLibrary,
        scry,
        placeScryCard,
    }
})