<script setup lang="ts">
import { useGameStore } from '@/stores/game'

const game = useGameStore()
</script>

<template>
    <div>
        <h2>Game</h2>

        <button @click="game.draw()">Draw</button>
        <router-link to="/">Back to Import</router-link>

        <p>Library: {{ game.library.length }} cards</p>
        <p>Hand: {{ game.hand.length }} cards</p>
        <p>Graveyard: {{ game.graveyard.length }} cards</p>

        <ul>
            <li v-for="card in game.hand" :key="card.id">
                {{ card.name }}
                <button @click="game.discard(card.id)">Discard</button>
            </li>
        </ul>
    </div>
</template>