<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '@/stores/game'
import type { CardInstance } from '@/types/card'
import { fetchCardByName, getImageUrl } from '@/services/scryfall'
import { getCachedCard, cacheCard } from '@/services/cache'

const game = useGameStore()
const loading = ref(false)
const showLoadModal = ref(true)

// const testCards: CardInstance[] = [
//     { id: '1', cardId: 'sol-ring',      name: 'Sol Ring',      imageUrl: '', zone: 'library', tapped: false, faceDown: false, isCommander: false, isToken: false, counters: [], position: 0, isFlipped: false },
//     { id: '2', cardId: 'cmd-tower',     name: 'Command Tower', imageUrl: '', zone: 'library', tapped: false, faceDown: false, isCommander: false, isToken: false, counters: [], position: 1, isFlipped: false },
//     { id: '3', cardId: 'path-to-exile', name: 'Path to Exile', imageUrl: '', zone: 'library', tapped: false, faceDown: false, isCommander: false, isToken: false, counters: [], position: 2, isFlipped: false },
// ]

async function loadTestCards() {
    loading.value = true
    const cardNames = ['Sol Ring', 'Command Tower', 'Path to Exile']
    const loadedCards: CardInstance[] = []

    for (const name of cardNames) {
        let scryfallCard = await getCachedCard(name)

        if (!scryfallCard) {
            scryfallCard = await fetchCardByName(name)

            if (scryfallCard) {
                await cacheCard(scryfallCard)
            }
        }

        if (scryfallCard) {
            const cardInstance: CardInstance = {
                id: crypto.randomUUID(),
                cardId: scryfallCard.id,
                name: scryfallCard.name,
                imageUrl: getImageUrl(scryfallCard),
                zone: 'library',
                tapped: false,
                faceDown: false,
                isCommander: false,
                isToken: false,
                counters: [],
                position: loadedCards.length,
                isFlipped: false,
            }
            loadedCards.push(cardInstance)
        }
    }

    game.library = loadedCards
    game.shuffleLibrary()
    loading.value = false
    showLoadModal.value = false
}

async function testFetchCard() {
    const card = await fetchCardByName('Sol Ring')

    if (card) {
        console.log('Fetched card:', card)
        console.log('Image URL:', getImageUrl(card))
    }
}
</script>

<template>
    <div>
        <h2>The Town Scryer</h2>

        <button @click="showLoadModal = true">Load Deck</button>
        <button @click="game.draw()">Draw</button>

        <p>Library: {{ game.library.length }} cards</p>
        <p>Hand: {{ game.hand.length }} cards</p>
        <p>Graveyard: {{ game.graveyard.length }} cards</p>

        <ul>
            <li v-for="card in game.hand" :key="card.id">
                {{ card.name }}
                <button @click="game.discard(card.id)">Discard</button>
            </li>
        </ul>

        <!-- Deck Loader modal overlay -->
         <div v-if="showLoadModal" class="modal-overlay" @click="showLoadModal = false">
            <div class="modal-content" @click.stop>
                <h2>Load Deck</h2>
                <p v-if="loading">Loading cards...</p>
                <p v-else>Load test cards to start the game</p>
                <button @click="loadTestCards" :disabled="loading">
                    {{ loading ? 'Loading...' : 'Load Test Cards' }}
                </button>
                <button @click="showLoadModal = false">Cancel</button>
            </div>
         </div>
    </div>
</template>
<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
}

.modal-content button {
    margin-right: 0.5rem;
    margin-top: 1rem;
}
</style>