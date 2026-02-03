import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { CardInstance } from '@/types/card'

export const useGameStore = defineStore('game', () => {
    const library = ref<CardInstance[]>([])
    const hand = ref<CardInstance[]>([])
    const battlefield = ref<CardInstance[]>([])
    const commandZone = ref<CardInstance[]>([])
    const graveyard = ref<CardInstance[]>([])
    const exile = ref<CardInstance[]>([])
    const reveal = ref<CardInstance[]>([])

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

    return {
        library,
        hand,
        battlefield,
        commandZone,
        graveyard,
        exile,
        reveal,
        draw,
        shuffleLibrary,
        discard,
    }
})