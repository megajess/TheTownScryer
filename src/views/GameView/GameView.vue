<script setup lang="ts">
import { useGameView } from './GameView';
import CommanderIcon from '@/components/CommanderIcon.vue';
import LibraryIcon from '@/components/LibraryIcon.vue';
import GraveyardIcon from '@/components/GraveyardIcon.vue';

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
    zoomLevel,
    panX,
    panY,
    canvasSize,
    battlefieldRef,
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
    handleCardLeave,
    handleWheel,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
    resetView
} = useGameView()
</script>

<template>
    <div class="game-layout">
        <!-- Battlefield -->
        <div class="battlefield" ref="battlefieldRef" @wheel.prevent="handleWheel" @mousemove="handlePanMove"
            @mouseup="handlePanEnd" @mouseleave="handlePanEnd">
            <div class="battlefield-cards" @dragover="handleDragOver" @drop="handleDrop($event, 'battlefield')"
                :style="{ transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`, transformOrigin: '0 0', width: canvasSize, height: canvasSize }"
                @mousedown.self="handlePanStart">
                <div v-for="card in game.battlefield" :key="card.id" class="card battlefield-card"
                    :style="{ left: card.x + 'px', top: card.y + 'px' }" draggable="true"
                    @dragstart="handleDragStart($event, card.id)" @dragend="handleDragEnd"
                    @contextmenu="handleContextMenu($event, card.id)">
                    <img :src="card.imageUrl" :alt="card.name" loading="lazy" />
                </div>
            </div>

            <!-- Utility Zones -->
            <div class="overlay-zones">
                <div class="command-zone-group">
                    <div v-if="game.commanders.length === 0" class="overlay-zone command-zone">
                        <CommanderIcon class="zone-card-back" />
                        <span class="overlay-zone-label">Command Zone</span>
                    </div>

                    <div v-for="commander in game.commanders" :key="commander.id" class="overlay-zone command-zone"
                        :draggable="game.commandZone.length > 0"
                        @dragstart="commander && handleDragStart($event, commander.id)" @dragend="handleDragEnd"
                        @dragover="handleDragOver" @drop="handleDrop($event, 'commandZone')">
                        <CommanderIcon v-if="commander.zone !== 'commandZone'" class="zone-card-back" />
                        <img v-else :src="commander.imageUrl" alt="Command Zone" class="zone-card-back" />
                        <span v-if="commander.castCount && commander.castCount > 0" class="overlay-zone-count"
                            title="Times cast from command zone">{{
                                commander.castCount
                            }}</span>
                        <span class="overlay-zone-label">{{ commander.name }}</span>
                    </div>
                </div>

                <div class="overlay-zone library-zone">
                    <LibraryIcon v-if="game.library.length === 0" class="zone-card-back" />
                    <img v-else :src="CARD_BACK_URL" alt="Library" class="zone-card-back" />
                    <span v-if="game.library.length > 0" class="overlay-zone-count">{{ game.library.length }}</span>
                    <span class="overlay-zone-label">Library</span>
                </div>

                <div class="overlay-zone graveyard-zone" @dragover="handleDragOver"
                    @drop="handleDrop($event, 'graveyard')">
                    <GraveyardIcon v-if="game.graveyard.length === 0" class="zone-card-back" />
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
            <button @click="resetView" class="action-btn">Reset View</button>
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
                    @dragstart="handleDragStart($event, card.id)" @dragend="handleDragEnd"
                    @mouseenter="handleCardHover(card)" @mousemove="handleCardMove($event, card)"
                    @mouseleave="handleCardLeave">
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
                <button class="load-button" @click="loadTestCards(1)" :disabled="loading">
                    {{ loading ? 'Loading...' : 'Load Test Cards w/1 Commander' }}
                </button>
                <button class="load-button" @click="loadTestCards(2)" :disabled="loading">
                    {{ loading ? 'Loading...' : 'Load Test Cards w/2 Commanders' }}
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