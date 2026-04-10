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
import HamburgerIcon from '@/components/HamburgerIcon.vue'


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
    showMillXModal,
    millXCount,
    millXInput,
    handleMillX,
    showFreeformModal,
    freeformText,
    freeformInput,
    addCounter,
    handleFreeformSubmit,
    deckText,
    loadError,
    isCommanderDeck,
    groupedEntries,
    filteredGroupedEntries,
    totalCardCount,
    needsCommanderSelection,
    selectedCommanderNames,
    confirmFilter,
    confirmFilterInput,
    toggleCommanderSelection,
    confirmLoadDeck,
    showMulliganButtons,
    keepHand,
    mulligan,
    scryTab,
    ellipsis,
    isSearching,
    searchTab,
    searchFilter,
    shuffleAfterSearch,
    isShuffling,
    shuffleWithLabel,
    isGraveyardSearching,
    graveyardTab,
    graveyardFilter,
    filteredGraveyardCards,
    showGraveyardMenu,
    graveyardMenuPosition,
    handleGraveyardContextMenu,
    closeGraveyardMenu,
    startGraveyardSearch,
    stopGraveyardSearch,
    filteredLibraryCards,
    showLibraryMenu,
    libraryMenuPosition,
    handleLibraryContextMenu,
    closeLibraryMenu,
    startSearch,
    stopSearch,
    contextMenuCard,
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
    markFaceDown,
    toggleTapCard,
    returnToCommandZone,
    moveToExile,
    returnToHand,
    moveToLibrary,
    isRevealing,
    isRevealMinimized,
    magnifiedCard,
    magnifyCard,
    isDeckLoaded,
    startNewGame,
    startReveal,
    revealAnother,
    moveToBattlefield,
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
                    <div class="menu-option" :class="{ 'menu-option--disabled': !isDeckLoaded }" @click.stop="isDeckLoaded && startNewGame()">New Game</div>
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
                    @mouseleave="handleCardLeave" @dragstart="handleDragStart($event, card.id)" @dragend="handleDragEnd">
                    <img :src="card.faceDown ? CARD_BACK_URL : (card.isFlipped && card.backImageUrl ? card.backImageUrl : card.imageUrl)" :alt="card.name" loading="lazy" />
                    <button class="card-menu-btn" @click.stop="handleContextMenu($event, card.id)"><HamburgerIcon /></button>
                    <div v-if="card.counters.length" class="counter-overlays">
                        <div class="counter-group counter-group--bottom-left">
                            <div v-for="c in card.counters.filter(c => c.type === 'plusOne')" :key="c.id"
                                class="counter counter--plus-one"
                                @click.stop="game.incrementCounter(card.id, c.id)"
                                @contextmenu.prevent.stop="game.decrementCounter(card.id, c.id)">
                                +{{ c.count }}/+{{ c.count }}
                            </div>
                            <div v-for="c in card.counters.filter(c => c.type === 'minusOne')" :key="c.id"
                                class="counter counter--minus-one"
                                @click.stop="game.incrementCounter(card.id, c.id)"
                                @contextmenu.prevent.stop="game.decrementCounter(card.id, c.id)">
                                -{{ c.count }}/-{{ c.count }}
                            </div>
                        </div>
                        <div class="counter-group counter-group--bottom-right">
                            <div v-for="c in card.counters.filter(c => c.type === 'loyalty')" :key="c.id"
                                class="counter counter--loyalty"
                                @click.stop="game.incrementCounter(card.id, c.id)"
                                @contextmenu.prevent.stop="game.decrementCounter(card.id, c.id)">
                                {{ c.count }}
                            </div>
                        </div>
                        <div class="counter-group counter-group--top-center">
                            <div v-for="c in card.counters.filter(c => c.type === 'generic')" :key="c.id"
                                class="counter counter--generic"
                                @click.stop="game.incrementCounter(card.id, c.id)"
                                @contextmenu.prevent.stop="game.decrementCounter(card.id, c.id)">
                                {{ c.count }}
                            </div>
                            <div v-for="c in card.counters.filter(c => c.type === 'freeform')" :key="c.id"
                                class="counter counter--freeform">
                                {{ c.name }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Reveal Area -->
            <div v-if="isRevealing" class="reveal-area" :class="{ 'is-minimized': isRevealMinimized }">
                <div class="reveal-header">
                    <span class="reveal-label">Revealed ({{ game.reveal.length }})</span>
                    <button v-if="!isRevealMinimized && game.library.length > 0" class="reveal-another-btn" @click="revealAnother">Reveal Another</button>
                    <button class="reveal-minimize-btn" @click="isRevealMinimized = !isRevealMinimized">
                        <CollapseIcon v-if="!isRevealMinimized" />
                        <ExpandIcon v-else />
                    </button>
                </div>
                <div v-if="!isRevealMinimized" class="reveal-cards">
                    <div v-for="card in game.reveal" :key="card.id" class="card reveal-card"
                        @mouseenter="handleCardHover(card)"
                        @mousemove="handleCardMove($event, card)"
                        @mouseleave="handleCardLeave">
                        <img :src="card.imageUrl" :alt="card.name" loading="lazy" />
                        <button class="card-menu-btn" @click.stop="handleContextMenu($event, card.id)"><HamburgerIcon /></button>
                    </div>
                </div>
            </div>

            <!-- Magnified Card Overlay -->
            <div v-if="magnifiedCard" class="magnified-card-overlay">
                <button class="magnified-card-close" @click="magnifiedCard = null">✕</button>
                <img :src="magnifiedCard.faceDown ? CARD_BACK_URL : magnifiedCard.imageUrl" :alt="magnifiedCard.name" />
            </div>

            <!-- Reveal Card Magnifier -->
            <div v-if="hoveredCard && isShiftPressed && hoveredCard.zone === 'reveal'" class="card-magnifier reveal-magnifier">
                <div class="magnifier-lens" :style="{
                    backgroundImage: `url(${hoveredCard.imageUrl})`,
                    backgroundPosition: `${magnifierPosition.x * 100}% ${magnifierPosition.y * 100}%`,
                    backgroundSize: '400px auto'
                }"></div>
            </div>

            <!-- Scrying Label -->
            <div v-if="game.hand.some(c => c.isScrying)" class="scrying-label">Scrying{{ ellipsis }}</div>

            <!-- Searching Label -->
            <div v-if="isSearching" class="scrying-label searching-label">Searching{{ ellipsis }}</div>

            <!-- Shuffling Label -->
            <div v-if="isShuffling" class="scrying-label shuffling-label">Shuffling{{ ellipsis }}</div>

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
                        <button class="zone-menu-btn" @click.stop="handleLibraryContextMenu($event)"><HamburgerIcon /></button>
                    </div>

                    <div class="overlay-zone graveyard-zone" @dragover="handleDragOver"
                        @drop="handleDrop($event, 'graveyard')">
                        <GraveyardIcon v-if="game.graveyard.length === 0" class="zone-card-back" />
                        <img v-else :src="game.graveyard[game.graveyard.length - 1]?.imageUrl" alt="Top of graveyard"
                            class="zone-card-back" />
                        <span v-if="game.graveyard.length > 0" class="overlay-zone-count">{{ game.graveyard.length
                        }}</span>
                        <span class="overlay-zone-label">Graveyard</span>
                        <button class="zone-menu-btn" @click.stop="handleGraveyardContextMenu($event)"><HamburgerIcon /></button>
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
            <span class="hand-count">{{ game.hand.filter(c => !c.isScrying).length }} cards</span>
            <!-- Mulligan Buttons -->
            <div v-if="showMulliganButtons" class="mulligan-bar">
                <button class="mulligan-btn mulligan-btn--keep" @click="keepHand">Keep</button>
                <button class="mulligan-btn mulligan-btn--mulligan" @click="mulligan">Mulligan</button>
            </div>

            <!-- Card Magnifier -->
            <div v-if="hoveredCard && isShiftPressed && hoveredCard.zone !== 'reveal'" class="card-magnifier">
                <div class="magnifier-lens" :style="{
                    backgroundImage: `url(${hoveredCard.imageUrl})`,
                    backgroundPosition: `${magnifierPosition.x * 100}% ${magnifierPosition.y * 100}%`,
                    backgroundSize: '400px auto'
                }">
                </div>
            </div>
            <!-- Scry Tab Bar -->
            <div v-if="game.hand.some(c => c.isScrying)" class="search-bar">
                <div class="search-tabs">
                    <button class="search-tab" :class="{ active: scryTab === 'hand' }" @click="scryTab = 'hand'">Hand</button>
                    <button class="search-tab" :class="{ active: scryTab === 'scry' }" @click="scryTab = 'scry'">Scry</button>
                </div>
            </div>

            <!-- Search Tab Bar -->
            <div v-else-if="isSearching" class="search-bar">
                <div class="search-tabs">
                    <button class="search-tab" :class="{ active: searchTab === 'hand' }" @click="searchTab = 'hand'">Hand</button>
                    <button class="search-tab" :class="{ active: searchTab === 'search' }" @click="searchTab = 'search'">Search</button>
                </div>
                <input v-if="searchTab === 'search'" v-model="searchFilter" type="text" placeholder="Filter library..." class="search-filter" autofocus />
                <label class="search-shuffle-check">
                    <input type="checkbox" v-model="shuffleAfterSearch" />
                    Shuffle
                </label>
                <button class="search-done-btn" @click="stopSearch">Done</button>
            </div>

            <!-- Graveyard Search Tab Bar -->
            <div v-else-if="isGraveyardSearching" class="search-bar">
                <div class="search-tabs">
                    <button class="search-tab" :class="{ active: graveyardTab === 'hand' }" @click="graveyardTab = 'hand'">Hand</button>
                    <button class="search-tab" :class="{ active: graveyardTab === 'graveyard' }" @click="graveyardTab = 'graveyard'">Graveyard</button>
                </div>
                <input v-if="graveyardTab === 'graveyard'" v-model="graveyardFilter" type="text" placeholder="Filter graveyard..." class="search-filter" autofocus />
                <button class="search-done-btn" @click="stopGraveyardSearch">Done</button>
            </div>

            <!-- Scry Cards -->
            <div v-if="game.hand.some(c => c.isScrying) && scryTab === 'scry'" class="hand-cards">
                <div v-for="card in game.hand.filter(c => c.isScrying)" :key="card.id" class="card is-scrying"
                    :class="{ dragging: draggedCardId === card.id }">
                    <img :src="card.imageUrl" :alt="card.name" loading="lazy" />
                    <div class="scry-buttons">
                        <button @click.stop="game.placeScryCard(card.id, 'top')">Top</button>
                        <button @click.stop="game.placeScryCard(card.id, 'bottom')">Bot</button>
                    </div>
                </div>
            </div>

            <!-- Library Search Results -->
            <div v-else-if="isSearching && searchTab === 'search'" class="hand-cards">
                <div v-for="card in filteredLibraryCards" :key="card.id" class="card"
                    :class="{ dragging: draggedCardId === card.id }"
                    draggable="true"
                    @dragstart="handleDragStart($event, card.id)" @dragend="handleDragEnd"
                    @mouseenter="handleCardHover(card)" @mousemove="handleCardMove($event, card)"
                    @mouseleave="handleCardLeave">
                    <img :src="card.imageUrl" :alt="card.name" loading="lazy" />
                    <button class="card-menu-btn" @click.stop="handleContextMenu($event, card.id)"><HamburgerIcon /></button>
                </div>
            </div>

            <!-- Graveyard Search Results -->
            <div v-else-if="isGraveyardSearching && graveyardTab === 'graveyard'" class="hand-cards">
                <div v-for="card in filteredGraveyardCards" :key="card.id" class="card"
                    :class="{ dragging: draggedCardId === card.id }"
                    draggable="true"
                    @dragstart="handleDragStart($event, card.id)" @dragend="handleDragEnd"
                    @mouseenter="handleCardHover(card)" @mousemove="handleCardMove($event, card)"
                    @mouseleave="handleCardLeave">
                    <img :src="card.imageUrl" :alt="card.name" loading="lazy" />
                    <button class="card-menu-btn" @click.stop="handleContextMenu($event, card.id)"><HamburgerIcon /></button>
                </div>
            </div>

            <!-- Hand -->
            <div v-else-if="!isGraveyardSearching || graveyardTab === 'hand'" class="hand-cards">
                <div v-for="card in game.hand.filter(c => !c.isScrying)" :key="card.id" class="card"
                    :class="{ dragging: draggedCardId === card.id }"
                    draggable="true"
                    @dragstart="handleDragStart($event, card.id)" @dragend="handleDragEnd"
                    @mouseenter="handleCardHover(card)" @mousemove="handleCardMove($event, card)"
                    @mouseleave="handleCardLeave">
                    <img :src="card.imageUrl" :alt="card.name" loading="lazy" />
                    <button class="card-menu-btn" @click.stop="handleContextMenu($event, card.id)"><HamburgerIcon /></button>
                    <span v-if="card.faceDown" class="facedown-label" @click.stop="game.setFaceDown(card.id, false)">Facedown</span>
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

        <!-- Mill X Modal -->
        <div v-if="showMillXModal" class="modal-overlay" @click.self="showMillXModal = false">
            <div class="modal-content">
                <p>Mill how many cards?</p>
                <input ref="millXInput" type="number" v-model="millXCount" min="1" @keyup.enter="handleMillX" />
                <div class="modal-buttons">
                    <button @click="showMillXModal = false">Cancel</button>
                    <button @click="handleMillX">Ok</button>
                </div>
            </div>
        </div>

        <!-- Freeform Counter Modal -->
        <div v-if="showFreeformModal" class="modal-overlay" @click.self="showFreeformModal = false">
            <div class="modal-content">
                <p>Counter label:</p>
                <input ref="freeformInput" type="text" v-model="freeformText" @keyup.enter="handleFreeformSubmit" />
                <div class="modal-buttons">
                    <button @click="showFreeformModal = false">Cancel</button>
                    <button @click="handleFreeformSubmit">Add</button>
                </div>
            </div>
        </div>

        <!-- Deck Loader Modal -->
        <div v-if="showLoadModal" class="modal-overlay" @click.self="!loading && (showLoadModal = false)">
            <div class="modal-content" @click.stop>
                <h2>Load Deck</h2>
                <p>Paste your deck list below.<br><small>In Moxfield: Export → Text or MTGO format</small></p>
                <textarea
                    v-model="deckText"
                    placeholder="// Commander&#10;1 Atraxa, Praetors' Voice&#10;&#10;// Deck&#10;1 Sol Ring&#10;..."
                    class="deck-input"
                />
                <label class="commander-check">
                    <input type="checkbox" v-model="isCommanderDeck" />
                    Commander deck
                </label>

                <!-- Inline card list, shown when commander deck is checked and text is pasted -->
                <template v-if="isCommanderDeck && groupedEntries.length > 0">
                    <div class="confirm-header">
                        <span class="card-count">{{ totalCardCount }} cards</span>
                        <p v-if="needsCommanderSelection" class="confirm-hint">
                            Select up to 2 commanders:
                        </p>
                    </div>
                    <input
                        ref="confirmFilterInput"
                        v-model="confirmFilter"
                        type="text"
                        placeholder="Filter cards..."
                        class="confirm-filter"
                    />
                    <div class="card-confirm-list">
                        <label v-for="entry in filteredGroupedEntries" :key="entry.name" class="card-confirm-item"
                            :class="{ 'is-commander': entry.isCommander || selectedCommanderNames.includes(entry.name) }">
                            <input
                                v-if="needsCommanderSelection && !entry.isCommander"
                                type="checkbox"
                                :checked="selectedCommanderNames.includes(entry.name)"
                                :disabled="!selectedCommanderNames.includes(entry.name) && selectedCommanderNames.length >= 2"
                                @change="toggleCommanderSelection(entry.name)"
                            />
                            <span v-else-if="entry.isCommander" class="commander-pip">★</span>
                            <span class="card-confirm-name">{{ entry.name }}</span>
                            <span v-if="entry.quantity > 1" class="card-confirm-qty">×{{ entry.quantity }}</span>
                        </label>
                    </div>
                </template>

                <p v-if="loadError" class="load-error">{{ loadError }}</p>
                <div class="modal-buttons">
                    <button @click="showLoadModal = false">Cancel</button>
                    <button @click="confirmLoadDeck" :disabled="loading || !deckText.trim()">
                        {{ loading ? 'Loading...' : 'Load Deck' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Context Menu -->
        <div v-if="showContextMenu" class="context-menu"
            :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }" @click.stop>
            <!-- Hand options -->
            <template v-if="game.findCard(contextMenuCard!)?.zone === 'hand'">
                <div v-if="!game.findCard(contextMenuCard!)?.faceDown" class="context-menu-item"
                    @click="markFaceDown">
                    Play Facedown
                </div>
                <div v-if="game.findCard(contextMenuCard!)?.faceDown" class="context-menu-item"
                    @click="game.setFaceDown(contextMenuCard!, false); closeContextMenu()">
                    Play Faceup
                </div>
                <div class="context-menu-item" @click="game.discard(contextMenuCard!); closeContextMenu()">
                    Move to Graveyard
                </div>
                <div class="context-menu-item" @click="moveToLibrary('top')">
                    Move to top of library
                </div>
                <div class="context-menu-item" @click="moveToLibrary('bottom')">
                    Move to bottom of library
                </div>
            </template>

            <!-- Graveyard options -->
            <template v-if="game.findCard(contextMenuCard!)?.zone === 'graveyard'">
                <div class="context-menu-item" @click="returnToHand">
                    Return to Hand
                </div>
                <div class="context-menu-item" @click="moveToLibrary('top')">
                    Move to top of library
                </div>
                <div class="context-menu-item" @click="moveToLibrary('bottom')">
                    Move to bottom of library
                </div>
                <div class="context-menu-item" @click="moveToExile">
                    Exile
                </div>
            </template>

            <!-- Reveal options -->
            <template v-if="game.findCard(contextMenuCard!)?.zone === 'reveal'">
                <div class="context-menu-item" @click="returnToHand">Move to Hand</div>
                <div class="context-menu-item" @click="moveToBattlefield">Move to Battlefield</div>
                <div class="context-menu-item" @click="moveToGraveyard">Move to Graveyard</div>
                <div class="context-menu-item" @click="moveToExile">Move to Exile</div>
                <div class="context-menu-item" @click="moveToLibrary('top')">Move to top of library</div>
                <div class="context-menu-item" @click="moveToLibrary('bottom')">Move to bottom of library</div>
            </template>

            <!-- Library search options -->
            <template v-if="game.findCard(contextMenuCard!)?.zone === 'library'">
                <div class="context-menu-item" @click="moveToGraveyard">
                    Move to Graveyard
                </div>
                <div class="context-menu-item" @click="moveToExile">
                    Exile
                </div>
                <div class="context-menu-item" @click="returnToHand">
                    Move to Hand
                </div>
                <div class="context-menu-item" @click="moveToLibrary('top')">
                    Move to top of library
                </div>
                <div class="context-menu-item" @click="moveToLibrary('bottom')">
                    Move to bottom of library
                </div>
            </template>

            <!-- Battlefield options -->
            <template v-if="game.findCard(contextMenuCard!)?.zone === 'battlefield'">
                <div class="context-menu-item" @click="magnifyCard">Magnify</div>
                <div v-if="game.findCard(contextMenuCard!)?.backImageUrl" class="context-menu-item"
                    @click="game.flipCard(contextMenuCard!); closeContextMenu()">
                    {{ game.findCard(contextMenuCard!)?.isFlipped ? 'Flip to Front' : 'Flip to Back' }}
                </div>
                <div class="context-menu-item" @click="toggleTapCard">
                    {{ game.findCard(contextMenuCard!)?.tapped ? 'Untap' : 'Tap' }}
                </div>
                <div v-if="game.findCard(contextMenuCard!)?.faceDown" class="context-menu-item"
                    @click="game.setFaceDown(contextMenuCard!, false); closeContextMenu()">
                    Turn Faceup
                </div>
                <div v-if="!game.findCard(contextMenuCard!)?.faceDown" class="context-menu-item"
                    @click="game.setFaceDown(contextMenuCard!, true); closeContextMenu()">
                    Turn Facedown
                </div>
                <div v-if="game.findCard(contextMenuCard!)?.startsInCommandZone" class="context-menu-item"
                    @click="returnToCommandZone">
                    Return to Command Zone
                </div>
                <div class="context-menu-item has-submenu">
                    Counters <span class="submenu-arrow">▶</span>
                    <div class="context-submenu">
                        <div class="context-menu-item" @click="addCounter('plusOne')">+1/+1</div>
                        <div class="context-menu-item" @click="addCounter('minusOne')">-1/-1</div>
                        <div class="context-menu-item" @click="addCounter('loyalty')">Loyalty</div>
                        <div class="context-menu-item" @click="addCounter('generic')">Generic</div>
                        <div class="context-menu-item" @click="addCounter('freeform')">Freeform</div>
                    </div>
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

        <!-- Graveyard Context Menu -->
        <div v-if="showGraveyardMenu" class="context-menu"
            :style="{ left: graveyardMenuPosition.x + 'px', top: graveyardMenuPosition.y + 'px' }" @click.stop>
            <div class="context-menu-item" @click="startGraveyardSearch">Search</div>
        </div>
        <div v-if="showGraveyardMenu" class="context-menu-overlay" @click="closeGraveyardMenu"></div>

        <!-- Library Context Menu -->
        <div v-if="showLibraryMenu" class="context-menu"
            :style="{ left: libraryMenuPosition.x + 'px', top: libraryMenuPosition.y + 'px' }" @click.stop>
            <div class="context-menu-item" @click="startReveal">Reveal</div>
            <div class="context-menu-item" @click="startSearch">Search</div>
            <div class="context-menu-item" @click="shuffleWithLabel(); closeLibraryMenu()">Shuffle</div>
            <div class="context-menu-item has-submenu">
                Mill <span class="submenu-arrow">▶</span>
                <div class="context-submenu">
                    <div class="context-menu-item" @click="game.mill(1); closeLibraryMenu()">Mill 1</div>
                    <div class="context-menu-item" @click="game.mill(3); closeLibraryMenu()">Mill 3</div>
                    <div class="context-menu-item" @click="showMillXModal = true; closeLibraryMenu()">Mill X</div>
                </div>
            </div>
        </div>
        <div v-if="showLibraryMenu" class="context-menu-overlay" @click="closeLibraryMenu"></div>
    </div>
</template>

<style scoped src="./GameView.css"></style>
