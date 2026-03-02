<script setup lang="ts">
import { useGameView } from './GameView';
import CommanderIcon from '@/components/CommanderIcon.vue';
import LibraryIcon from '@/components/LibraryIcon.vue';
import GraveyardIcon from '@/components/GraveyardIcon.vue';
import ExileIcon from '@/components/ExileIcon.vue';
import CollapseIcon from '@/components/CollapseIcon.vue';
import ExpandIcon from '@/components/ExpandIcon.vue';
import GitHubIcon from '@/components/GitHubIcon.vue'
import ExternalLinkIcon from '@/components/ExternalLinkIcon.vue'
import ControlButton from '@/components/ControlButton.vue'


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
    openMenu,
    isZoneCollapsed,
    viewportWidth,
    battlefieldHeight,
    isHoveringLibrary,
    showDrawXModal,
    drawXCount,
    drawXInput,
    showScryXModal,
    scryXCount,
    scryXInput,
    contextMenuCard,
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
    resetView,
    toggleMenu,
    handleDrawX,
    handleScryX,
    toggleTapCard,
    returnToCommandZone,
    moveToExile,
    returnToHand,
    moveToLibrary,
} = useGameView()
</script>

<template>
    <div class="game-layout">
        <!-- Menu -->
        <div class="menu-bar">
            <div class="menu-item" @click.stop="toggleMenu('game')">
                Game
                <div v-if="openMenu === 'game'" class="menu-dropdown">
                    <div class="menu-option" @click.stop="game.draw(); openMenu = null">Draw</div>
                    <div class="menu-option" @click.stop="showLoadModal = true; openMenu = null">Load Deck</div>
                    <div class="menu-option" @click.stop="resetView(); openMenu = null">Reset View</div>
                </div>
            </div>

            <div class="menu-item" @click.stop="toggleMenu('about')">
                About
                <div v-if="openMenu === 'about'" class="menu-dropdown">
                    <div class="menu-option">Instructions</div>
                    <a class="menu-option menu-option--link" href="https://github.com/megajess/TheTownScryer"
                        target="_blank" rel="noopener noreferrer" @click.stop="openMenu = null">
                        <GitHubIcon class="menu-link-icon" />
                        <span>Source Code</span>
                        <ExternalLinkIcon class="menu-link-external" />
                    </a>
                    <a class="menu-option menu-option--link" href="/license.html" target="_blank"
                        @click.stop="openMenu = null">
                        <span>License</span>
                        <ExternalLinkIcon class="menu-link-external" />
                    </a>
                </div>
            </div>

            <div class="menu-option menu-option--info">
                Broadcast Area: {{ viewportWidth }} × {{ battlefieldHeight }}
            </div>
        </div>
        <div v-if="openMenu" class="menu-overlay" @click="openMenu = null"></div>

        <!-- Battlefield -->
        <div class="battlefield" ref="battlefieldRef" @wheel.prevent="handleWheel" @mousemove="handlePanMove"
            @mouseup="handlePanEnd" @mouseleave="handlePanEnd">

            <!-- Playable Area -->
            <div class="battlefield-cards" @dragover="handleDragOver" @drop="handleDrop($event, 'battlefield')"
                :style="{ transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`, transformOrigin: '0 0', width: canvasSize, height: canvasSize }"
                @mousedown.self="handlePanStart">

                <!-- Cards On Battlefield -->
                <div v-for="card in game.battlefield" :key="card.id" class="card battlefield-card"
                    :class="{ 'is-tapped': card.tapped }" :style="{ left: card.x + 'px', top: card.y + 'px' }"
                    draggable="true" @mouseenter="handleCardHover(card)" @mousemove="handleCardMove($event, card)"
                    @mouseleave="handleCardLeave" @dragstart="handleDragStart($event, card.id)" @dragend="handleDragEnd"
                    @contextmenu="handleContextMenu($event, card.id)">
                    <img :src="card.imageUrl" :alt="card.name" loading="lazy" />
                </div>
            </div>

            <!-- Controls Overlay -->
            <div class="controls-overlay">
                <button @click="game.untapAll()">Untap</button>

                <ControlButton
                    label="Draw"
                    hoveredLabel="Draw 1"
                    :extra-buttons="[
                        { label: 'Draw X', onClick: () => showDrawXModal = true },
                        { label: 'Draw 7', onClick: () => game.draw(7) },
                    ]"
                    :on-primary="() => game.draw(1)"
                />

                <ControlButton
                    label="Scry"
                    hoveredLabel="Scry 1"
                    :extra-buttons="[
                        { label: 'Scry X', onClick: () => showScryXModal = true },
                    ]"
                    :on-primary="() => game.scry(1)"
                />
            </div>

            <!-- Overlay Zones -->
            <div class="overlay-zones" :class="{ 'is-collapsed': isZoneCollapsed }">
                <button class="zones-toggle-btn" @click="isZoneCollapsed = !isZoneCollapsed">
                    <CollapseIcon v-if="!isZoneCollapsed" />
                    <ExpandIcon v-else />
                </button>

                <div v-show="!isZoneCollapsed" class="zones-content">
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

                    <div class="overlay-zone library-zone" @click="game.draw()" @mouseenter="isHoveringLibrary = true"
                        @mouseleave="isHoveringLibrary = false">
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
                        <span v-if="game.graveyard.length > 0" class="overlay-zone-count">{{ game.graveyard.length
                        }}</span>
                        <span class="overlay-zone-label">Graveyard</span>
                    </div>

                    <div class="overlay-zone exile-zone" @dragover="handleDragOver" @drop="handleDrop($event, 'exile')">
                        <ExileIcon v-if="game.exile.length === 0" class="zone-card-back" />
                        <img v-else :src="game.exile[game.exile.length - 1]?.imageUrl" alt="Top of exile"
                            class="zone-card-back" />
                        <span v-if="game.exile.length > 0" class="overlay-zone-count">{{ game.exile.length }}</span>
                        <span class="overlay-zone-label">Exile</span>
                    </div>
                </div>
            </div>
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
                    :class="{ dragging: draggedCardId === card.id, 'is-scrying': card.isScrying }"
                    :draggable="!card.isScrying"
                    @dragstart="handleDragStart($event, card.id)" @dragend="handleDragEnd"
                    @mouseenter="handleCardHover(card)" @mousemove="handleCardMove($event, card)"
                    @mouseleave="handleCardLeave"
                    @contextmenu="!card.isScrying && handleContextMenu($event, card.id)">
                    <img :src="card.imageUrl" :alt="card.name" loading="lazy" />
                    <div v-if="card.isScrying" class="scry-buttons">
                        <button @click.stop="game.placeScryCard(card.id, 'top')">Top</button>
                        <button @click.stop="game.placeScryCard(card.id, 'bottom')">Bot</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Draw X Modal -->
        <div v-if="showDrawXModal" class="modal-overlay" @click.self="showDrawXModal = false">
            <div class="modal-content">
                <p>Draw how many cards?</p>
                <input ref="drawXInput" type="number" v-model="drawXCount" min="1" @keyup.enter="handleDrawX" />
                <div class="modal-buttons">
                    <button @click="showDrawXModal = false">Cancel</button>
                    <button @click="handleDrawX">Ok</button>
                </div>
            </div>
        </div>

        <!-- Scry X Modal -->
        <div v-if="showScryXModal" class="modal-overlay" @click.self="showScryXModal = false">
            <div class="modal-content">
                <p>Scry how many cards?</p>
                <input ref="scryXInput" type="number" v-model="scryXCount" min="1" @keyup.enter="handleScryX" />
                <div class="modal-buttons">
                    <button @click="showScryXModal = false">Cancel</button>
                    <button @click="handleScryX">Ok</button>
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
            <!-- Hand options -->
            <div v-if="game.findCard(contextMenuCard!)?.zone === 'hand'" class="context-menu-item"
                @click="game.discard(contextMenuCard!); closeContextMenu()">
                Discard
            </div>

            <!-- Battlefield options -->
            <template v-if="game.findCard(contextMenuCard!)?.zone === 'battlefield'">
                <div class="context-menu-item" @click="toggleTapCard">
                    {{ game.findCard(contextMenuCard!)?.tapped ? 'Untap' : 'Tap' }}
                </div>
                <div v-if="game.findCard(contextMenuCard!)?.startsInCommandZone" class="context-menu-item"
                    @click="returnToCommandZone">
                    Return to Command Zone
                </div>
                <div class="context-menu-item" @click="moveToGraveyard">
                    Move to Graveyard
                </div>

                <div class="context-menu-item" @click="moveToExile">
                    Exile
                </div>

                <div class="context-menu-item" @click="returnToHand">
                    Return to Hand
                </div>

                <div class="context-menu-item" @click="moveToLibrary('top')">
                    Move to top of library
                </div>

                <div class="context-menu-item" @click="moveToLibrary('bottom')">
                    Move to bottom of library
                </div>
            </template>
        </div>

        <!-- Click outside to close context menu -->
        <div v-if="showContextMenu" class="context-menu-overlay" @click="closeContextMenu"></div>
    </div>
</template>

<style scoped src="./GameView.css"></style>
