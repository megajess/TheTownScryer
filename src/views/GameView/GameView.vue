<script setup lang="ts">
import { useGameView } from './GameView';

const {
    game,
    loading,
    showLoadModal,
    draggedCardId,
    contextMenuPosition,
    showContextMenu,
    hoveredCard,
    magnifierPosition,
    loadTestCards,
    handleDragStart,
    handleDrop,
    handleDragEnd,
    handleDragOver,
    handleContextMenu,
    moveToGraveyard,
    closeContextMenu,
    handleCardHover,
    handleCardMove,
    handleCardLeave
} = useGameView()
</script>

<template>
    <div class="game-layout">
        <!-- Battlefield -->
        <div class="battlefield" @dragover="handleDragOver" @drop="handleDrop('battlefield')">
            <h3>Battlefield</h3>
            <div class="battlefield-cards">
                <div v-for="card in game.battlefield" :key="card.id" class="card"
                    @contextmenu="handleContextMenu($event, card.id)">
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
            <button @click="showLoadModal = true" class="action-btn">Load Deck</button>
        </div>

        <!-- Hand -->
        <div class="hand-zone">
            <h3>Hand</h3>
            <!-- Card Magnifier -->
            <div v-if="hoveredCard" class="card-magnifier">
                <div class="magnifier-lens" :style="{
                    backgroundImage: `url(${hoveredCard.imageUrl})`,
                    backgroundPosition: `${magnifierPosition.x * 100}% ${magnifierPosition.y * 100}%`,
                    backgroundSize: '400px auto'
                }">
                </div>
            </div>
            <div class="hand-cards">
                <div v-for="card in game.hand" :key="card.id" class="card"
                    :class="{ dragging: draggedCardId === card.id }" draggable="true"
                    @dragstart="handleDragStart(card.id)" @dragend="handleDragEnd" @mouseenter="handleCardHover(card)"
                    @mousemove="handleCardMove($event, card)" @mouseleave="handleCardLeave">
                    <img :src="card.imageUrl" :alt="card.name" loading="lazy" />
                    <button @click="game.discard(card.id)" class="discard-btn">Discard</button>
                </div>
                <p v-if="game.hand.length === 0" class="empty">No cards in hand</p>
            </div>
        </div>

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

        <!-- Context Menu -->
        <div v-if="showContextMenu" class="context-menu"
            :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }" @click.stop>
            <div class="context-menu-item" @click="moveToGraveyard">
                Move to Graveyard
            </div>
        </div>

        <!-- Click outside to close context menu -->
        <div v-if="showContextMenu" class="context-menu-overlay" @click="closeContextMenu"></div>
    </div>
</template>

<style scoped src="./GameView.css"></style>