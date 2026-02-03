<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import type { CardInstance } from '@/types/card'

const game = useGameStore()

// Test code
const testCards: CardInstance[] = [
  { id: '1', cardId: 'sol-ring', name: 'Sol Ring', imageUrl: '', zone: 'library', tapped: false, faceDown: false, isCommander: false, isToken: false, counters: [], position: 0, isFlipped: false },
  { id: '2', cardId: 'cmd-tower', name: 'Command Tower', imageUrl: '', zone: 'library', tapped: false, faceDown: false, isCommander: false, isToken: false, counters: [], position: 1, isFlipped: false },
  { id: '3', cardId: 'path-to-exile', name: 'Path to Exile', imageUrl: '', zone: 'library', tapped: false, faceDown: false, isCommander: false, isToken: false, counters: [], position: 2, isFlipped: false },
]

function loadTestCards() {
  game.library = testCards
  game.shuffleLibrary()
}
// End test code
</script>

<template>
  <div>
    <h1>The Town Scryer</h1>

    <button @click="loadTestCards">Load test Cards</button>

    <router-link to="/game">Go to Game</router-link>
  </div>
</template>