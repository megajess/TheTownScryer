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
    <div class="gmae-layout">
        <!-- Battlefield -->
        <div class="battlefield">
            <h3>Battlefield</h3>
            <div class="battlefield-cards">
                <div v-for="card in game.battlefield" :key="card.id" class="card">
                    <img :src="card.imageUrl" :alt="card.name" loading="lazy" />
                </div>

                <p v-if="game.battlefield.length === 0" class="empty">No cards on battlefield</p>
            </div>
        </div>

        <!-- Utility Zones (stacked in corner) -->
        <div class="utility-zones">
            <div class="zone-stack">
                <div class="mini-zone">
                    <span class="zone-label">Command Zone</span>
                    <span class="zone-count">{{ game.commandZone.length }}</span>
                </div>
                <div class="mini-zone">
                    <span class="zone-label">Library</span>
                    <span class="zone-count">{{ game.library.length }}</span>
                </div>
                <div class="mini-zone">
                    <span class="zone-label">Graveyard</span>
                    <span class="zone-count">{{ game.graveyard.length }}</span>
                </div>
                <div class="mini-zone">
                    <span class="zone-label">Exile</span>
                    <span class="zone-count">{{ game.exile.length }}</span>
                </div>
            </div>
            <button @click="game.draw()" class="action-btn">Draw</button>
        </div>

        <!-- Hand -->
        <div class="hand-zone">
            <h3>Hand</h3>
            <div class="hand-cards">
                <div v-for="card in game.hand" :key="card.id" class="card">
                    <img :src="card.imageUrl" :alt="card.name" loading="lazy" />
                    <button @click="game.discard(card.id)" class="discard-btn">Discard</button>
                </div>
                <p v-if="game.hand.length === 0" class="empty">No cards in hand</p>
            </div>
        </div>

        <!-- Load Deck Button (floating) -->
        <button @click="showLoadModal = true" class="load-deck-btn">Load Deck</button>

        <!-- Deck Loader Modal -->
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
.game-layout {
    height: 100vh;
    display: grid;
    grid-template-columns: 1fr 250px;
    grid-template-rows: 2fr 1fr;
    grid-template-areas:
        "battlefield utility"
        "hand hand";
    gap: 0.5rem;
    padding: 0.5rem;
    background: #0a0a0a;
    color: #e0e0e0;
}

.battlefield {
    grid-area: battlefield;
    background: linear-gradient(135deg, #2a1a1a 0%, #1a1a2a 100%);
    border: 2px solid #00d4ff;
    border-radius: 8px;
    padding: 1rem;
    overflow-y: auto;
}

.battlefield h3 {
    margin: 0 0 1rem 0;
    color: #00d4ff;
    font-size: 1.2rem;
}

.battlefield-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.utility-zones {
    grid-area: utility;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.zone-stack {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.mini-zone {
    background: rgba(30, 30, 50, 0.8);
    border: 1px solid #00d4ff;
    border-radius: 4px;
    padding: 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.zone-label {
    font-size: 0.9rem;
    color: #b0b0b0;
}

.zone-count {
    font-size: 1.1rem;
    font-weight: bold;
    color: #00d4ff;
}

.action-btn {
    padding: 0.75rem;
    background: #00d4ff;
    color: #000;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
}

.action-btn:hover {
    background: #00b8e6;
    transform: translateY(-2px);
}

.hand-zone {
    grid-area: hand;
    background: linear-gradient(135deg, #1a2a1a 0%, #1a1a2a 100%);
    border: 2px solid #00ff88;
    border-radius: 8px;
    padding: 1rem;
    overflow-x: auto;
}

.hand-zone h3 {
    margin: 0 0 0.5rem 0;
    color: #00ff88;
    font-size: 1.2rem;
}

.hand-cards {
    display: flex;
    gap: 0.5rem;
}

.card {
    position: relative;
    width: 150px;
    flex-shrink: 0;
}

.card img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
    transition: transform 0.2s;
}

.card:hover img {
    transform: scale(1.05);
}

.discard-btn {
    position: absolute;
    bottom: 0.5rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 0, 0, 0.9);
    color: white;
    border: none;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
}

.card:hover .discard-btn {
    opacity: 1;
}

.empty {
    color: #666;
    font-style: italic;
}

.load-deck-btn {
    position: fixed;
    top: 1rem;
    right: 1rem;
    padding: 0.75rem 1.5rem;
    background: rgba(0, 212, 255, 0.2);
    border: 2px solid #00d4ff;
    color: #00d4ff;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    z-index: 100;
    transition: all 0.2s;
}

.load-deck-btn:hover {
    background: rgba(0, 212, 255, 0.4);
}

/* Modal styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: #1a1a2a;
    color: #e0e0e0;
    padding: 2rem;
    border-radius: 8px;
    border: 2px solid #00d4ff;
    max-width: 500px;
    width: 90%;
}

.modal-content h2 {
    color: #00d4ff;
    margin-bottom: 1rem;
}

.modal-content button {
    margin-right: 0.5rem;
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.2s;
}

.modal-content button:first-of-type {
    background: #00d4ff;
    color: #000;
}

.modal-content button:first-of-type:hover {
    background: #00b8e6;
}

.modal-content button:last-of-type {
    background: #333;
    color: #e0e0e0;
}

.modal-content button:last-of-type:hover {
    background: #444;
}

.modal-content button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>