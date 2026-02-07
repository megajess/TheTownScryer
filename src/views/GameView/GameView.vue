<script setup lang="ts">
import { useGameView } from './GameView';

const {
    CARD_BACK_URL,
    game,
    loading,
    showLoadModal,
    draggedCardId,
    contextMenuPosition,
    showContextMenu,
    hoveredCard,
    magnifierPosition,
    isShiftPressed,
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
            <div class="battlefield-cards">
                <div v-for="card in game.battlefield" :key="card.id" class="card"
                    @contextmenu="handleContextMenu($event, card.id)">
                    <img :src="card.imageUrl" :alt="card.name" loading="lazy" />
                </div>
            </div>

            <!-- Utility Zones -->
            <div class="overlay-zones">
                <div class="overlay-zone library-zone">
                    <svg v-if="game.library.length === 0" class="zone-card-back" viewbox="0 0 100 140"
                        xmlns="http://www.w3.org/2000/svg">
                        <rect x="20" y="30" width="60" height="80" fill="#95d5b2" rx="4" />
                        <rect x="25" y="35" width="50" height="70" fill="none" stroke="#1b4332" stroke-width="2" />
                        <line x1="30" y1="45" x2="70" y2="45" stroke="#1b4332" stroke-width="1.5" />
                        <line x1="30" y1="55" x2="70" y2="55" stroke="#1b4332" stroke-width="1.5" />
                        <line x1="30" y1="65" x2="70" y2="65" stroke="#1b4332" stroke-width="1.5" />
                    </svg>
                    <img v-else :src="CARD_BACK_URL" alt="Library" class="zone-card-back" />
                    <span v-if="game.library.length > 0" class="overlay-zone-count">{{ game.library.length }}</span>
                    <span class="overlay-zone-label">Library</span>
                </div>

                <div class="overlay-zone graveyard-zone">
                    <svg v-if="game.graveyard.length === 0" class="zone-card-back" viewBox="0 0 100 140"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M 50 20 Q 30 20 30 40 L 30 100 L 70 100 L 70 40 Q 70 20 50 20 Z" fill="#95d5b2" />
                        <text x="50" y="75" text-anchor="middle" fill="#1b4332" font-size="24">RIP</text>
                    </svg>
                    <img v-else :src="game.graveyard[game.graveyard.length - 1]?.imageUrl" alt="Top of graveyard"
                        class="zone-card-back" />
                    <span v-if="game.graveyard.length > 0" class="overlay-zone-count">{{ game.graveyard.length }}</span>
                    <span class="overlay-zone-label">Graveyard</span>
                </div>
            </div>
        </div>

        <!-- Dev Utility Zones (stacked in corner) -->
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
            <!-- Card Magnifier -->
            <div v-if="hoveredCard && isShiftPressed" class="card-magnifier">
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