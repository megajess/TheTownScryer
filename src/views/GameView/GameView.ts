import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useGameStore } from '@/stores/game'
import type { CardInstance, CounterType, ZoneType } from '@/types/card'
import { fetchCardByName, getImageUrl } from '@/services/scryfall'
import { getCachedCard, cacheCard } from '@/services/cache'
import { CARD_BACK_URL } from '@/services/scryfall'

const _cardBackPreload = new Image()
_cardBackPreload.src = CARD_BACK_URL

export function useGameView() {
    const CANVAS_MULTIPLIER = 3.5
    const BATTLEFIELD_CARD_WIDTH = 150

    const game = useGameStore()
    const loading = ref(false)
    const showLoadModal = ref(true)
    const draggedCardId = ref<string | null>(null)
    const dragGrabOffset = ref({ x: 0, y: 0 })
    const contextMenuCard = ref<string | null>(null)
    const contextMenuPosition = ref(({ x: 0, y: 0 }))
    const showContextMenu = ref(false)
    const hoveredCard = ref<CardInstance | null>(null)
    const magnifierPosition = ref({ x: 0, y: 0 })
    const isShiftPressed = ref(false)
    const zoomLevel = ref(1.0)
    const battlefieldRef = ref<HTMLElement | null>(null)
    const panX = ref(0)
    const panY = ref(0)
    const isPanning = ref(false)
    const panStart = ref({ x: 0, y: 0 })
    const canvasSize = `${CANVAS_MULTIPLIER * 100}%`
    const openMenu = ref<string | null>(null)
    const isZoneCollapsed = ref(false)
    const viewportWidth = ref(window.innerWidth)
    const battlefieldHeight = ref(0)
    const isHoveringLibrary = ref(false)
    const showDrawXModal = ref(false)
    const drawXCount = ref<number | null>(null)
    const drawXInput = ref<HTMLInputElement | null>(null)
    const showScryXModal = ref(false)
    const scryXCount = ref<number | null>(null)
    const scryXInput = ref<HTMLInputElement | null>(null)
    const showFreeformModal = ref(false)
    const freeformText = ref('')
    const freeformInput = ref<HTMLInputElement | null>(null)
    const pendingFreeformCardId = ref<string | null>(null)

    watch(showDrawXModal, (val) => {
        if (val) {
            nextTick(() => drawXInput.value?.focus())
        }
    })

    watch(showScryXModal, (val) => {
        if (val) {
            nextTick(() => scryXInput.value?.focus())
        }
    })

    watch(showFreeformModal, (val) => {
        if (val) {
            nextTick(() => freeformInput.value?.focus())
        }
    })

    onMounted(async () => {
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        await nextTick()

        resetView()

        window.addEventListener('resize', updateDimensions)
        updateDimensions()
    })

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('keyup', handleKeyUp)
        window.removeEventListener('resize', updateDimensions)
    })

    function handleDrawX() {
        if (drawXCount.value && drawXCount.value > 0) {
            game.draw(drawXCount.value)
            showDrawXModal.value = false
            drawXCount.value = null
        }
    }

    function handleScryX() {
        if (scryXCount.value && scryXCount.value > 0) {
            game.scry(scryXCount.value)
            showScryXModal.value = false
            scryXCount.value = null
        }
    }

    function handleKeyDown(event: KeyboardEvent) {
        const key = event.key.toLowerCase()

        if (key === 'shift') {
            isShiftPressed.value = true

            return
        }

        if (isHoveringLibrary.value) {
            const num = parseInt(key)

            if (num >= 1 && num <= 9) {
                game.draw(num)
            }
        }

        if (key === 't') {
            const cardId = hoveredCard.value?.id

            if (!cardId) return

            game.toggleTap(cardId)
        }
    }

    function handleKeyUp(event: KeyboardEvent) {
        if (event.key === 'Shift') {
            isShiftPressed.value = false
        }
    }

    async function loadTestCards(numberOfCommanders: number) {
        loading.value = true
        const cardNames = ['Sol Ring', 'Command Tower', 'Path to Exile']
        const loadedCards: CardInstance[] = []
        const loadedCommanderCards: CardInstance[] = []

        if (numberOfCommanders > 0) {
            cardNames.push('The First Sliver')

            if (numberOfCommanders === 2) {
                cardNames.push('Cultist of the Absolute')
            }
        }

        for (const name of cardNames) {
            let scryfallCard = await getCachedCard(name)

            if (!scryfallCard) {
                scryfallCard = await fetchCardByName(name)

                if (scryfallCard) {
                    await cacheCard(scryfallCard)
                }
            }

            if (scryfallCard) {
                if (scryfallCard.name != 'The First Sliver' && scryfallCard.name != 'Cultist of the Absolute') {
                    const cardInstance: CardInstance = {
                        id: crypto.randomUUID(),
                        cardId: scryfallCard.id,
                        name: scryfallCard.name,
                        imageUrl: getImageUrl(scryfallCard),
                        zone: 'library',
                        tapped: false,
                        faceDown: false,
                        startsInCommandZone: false,
                        isToken: false,
                        counters: [],
                        isFlipped: false,
                    }

                    loadedCards.push(cardInstance)
                } else {
                    const commanderCardInstance: CardInstance = {
                        id: crypto.randomUUID(),
                        cardId: scryfallCard.id,
                        name: scryfallCard.name,
                        imageUrl: getImageUrl(scryfallCard),
                        zone: 'commandZone',
                        tapped: false,
                        faceDown: false,
                        startsInCommandZone: true,
                        isToken: false,
                        counters: [],
                        isFlipped: false,
                    }

                    loadedCommanderCards.push(commanderCardInstance)
                }
            }
        }

        game.loadLibrary(loadedCards)
        game.loadCommandZone(loadedCommanderCards)
        game.shuffleLibrary()
        loading.value = false
        showLoadModal.value = false

        await nextTick()

        resetView()
    }

    async function testFetchCard() {
        const card = await fetchCardByName('Sol Ring')

        if (card) {
            console.log('Fetched card:', card)
            console.log('Image URL:', getImageUrl(card))
        }
    }

    function updateDimensions() {
        viewportWidth.value = window.innerWidth

        if (battlefieldRef.value) {
            battlefieldHeight.value = battlefieldRef.value.offsetHeight
        }
    }

    function toggleMenu(name: string) {
        openMenu.value = openMenu.value === name ? null : name
    }

    function handleWheel(event: WheelEvent) {
        event.preventDefault()

        const battlefieldEl = event.currentTarget as HTMLElement
        const rect = battlefieldEl.getBoundingClientRect()
        const mouseX = event.clientX - rect.left
        const mouseY = event.clientY - rect.top
        const delta = event.deltaY > 0 ? -0.1 : 0.1
        const logicalX = (mouseX - panX.value) / zoomLevel.value
        const logicalY = (mouseY - panY.value) / zoomLevel.value
        const newZoom = Math.min(2.0, Math.max(0.3, zoomLevel.value + delta))

        panX.value = mouseX - logicalX * newZoom
        panY.value = mouseY - logicalY * newZoom
        zoomLevel.value = newZoom
    }

    function handlePanStart(event: MouseEvent) {
        isPanning.value = true

        panStart.value = {
            x: event.clientX - panX.value,
            y: event.clientY - panY.value
        }
    }

    function handlePanMove(event: MouseEvent) {
        if (!isPanning.value) return

        panX.value = event.clientX - panStart.value.x
        panY.value = event.clientY - panStart.value.y
    }

    function handlePanEnd() {
        isPanning.value = false
    }

    function handleDragStart(event: DragEvent, cardId: string) {
        const card = game.findCard(cardId)

        if (card?.isScrying) return

        draggedCardId.value = cardId

        const target = event.currentTarget as HTMLElement
        const rect = target.getBoundingClientRect()
        const dragWidth = BATTLEFIELD_CARD_WIDTH * zoomLevel.value
        const dragHeight = rect.height / rect.width * dragWidth
        const dragImg = createDragImage(target, dragWidth, dragHeight, card?.faceDown ? CARD_BACK_URL : undefined)

        if (!dragImg) return

        const scale = dragWidth / rect.width
        dragGrabOffset.value = {
            x: (event.clientX - rect.left) * scale,
            y: (event.clientY - rect.top) * scale
        }

        event.dataTransfer?.setDragImage(dragImg, dragGrabOffset.value.x, dragGrabOffset.value.y)
        setTimeout(() => document.body.removeChild(dragImg), 0)
    }

    function createDragImage(target: HTMLElement, scaledWidth: number, scaledHeight: number, overrideUrl?: string): HTMLCanvasElement | null {
        const sourceImg = overrideUrl ? _cardBackPreload : target.querySelector('img')

        if (!sourceImg?.complete || !sourceImg.naturalWidth) return null

        const w = Math.round(scaledWidth)
        const h = Math.round(scaledHeight)
        const dpr = window.devicePixelRatio || 1

        const canvas = document.createElement('canvas')
        canvas.width = w * dpr
        canvas.height = h * dpr
        canvas.style.width = w + 'px'
        canvas.style.height = h + 'px'
        canvas.style.position = 'fixed'
        canvas.style.top = '-9999px'
        canvas.style.left = '-9999px'

        const ctx = canvas.getContext('2d')
        if (!ctx) return null

        ctx.scale(dpr, dpr)
        ctx.drawImage(sourceImg, 0, 0, w, h)

        document.body.appendChild(canvas)

        return canvas
    }


    function handleDrop(event: DragEvent, toZone: ZoneType) {
        if (draggedCardId.value) {
            const card = game.findCard(draggedCardId.value)

            if (card) {
                if (toZone === 'commandZone' && !card.startsInCommandZone) return

                if (card.zone === 'commandZone' && toZone === 'battlefield') {
                    card.castCount = (card.castCount ?? 0) + 1
                }

                const target = event.currentTarget as HTMLElement
                const rect = target.getBoundingClientRect()
                const x = Math.max(0, (event.clientX - rect.left - dragGrabOffset.value.x) / zoomLevel.value)
                const y = Math.max(0, (event.clientY - rect.top - dragGrabOffset.value.y) / zoomLevel.value)

                console.log({
                    clientX: event.clientX,
                    clientY: event.clientY,
                    rectLeft: rect.left,
                    rectTop: rect.top,
                    rectHeight: rect.height,
                    grabOffsetX: dragGrabOffset.value.x,
                    grabOffsetY: dragGrabOffset.value.y,
                    finalX: x,
                    finalY: y
                })

                if (toZone === 'battlefield') {
                    game.placeOnBattlefield(draggedCardId.value, card.zone, x, y)
                } else {
                    game.moveCard(draggedCardId.value, card.zone, toZone)
                }
            }
        }

        draggedCardId.value = null
    }

    function handleDragEnd() {
        draggedCardId.value = null
    }

    function handleDragOver(event: DragEvent) {
        event.preventDefault()
    }

    function handleContextMenu(event: MouseEvent, cardId: string) {
        event.preventDefault()
        contextMenuCard.value = cardId
        contextMenuPosition.value = { x: event.clientX, y: event.clientY }
        showContextMenu.value = true
    }

    function moveToGraveyard() {
        if (contextMenuCard.value) {
            const card = game.findCard(contextMenuCard.value)

            if (card) {
                game.moveCard(contextMenuCard.value, card.zone, 'graveyard')
            }
        }

        closeContextMenu()
    }

    function markFaceDown() {
        if (contextMenuCard.value) {
            game.setFaceDown(contextMenuCard.value, true)
        }
        closeContextMenu()
    }

    function toggleTapCard() {
        if (contextMenuCard.value) {
            game.toggleTap(contextMenuCard.value)
        }
        closeContextMenu()
    }

    function returnToCommandZone() {
        if (contextMenuCard.value) {
            const card = game.findCard(contextMenuCard.value)
            if (card) game.moveCard(contextMenuCard.value, card.zone, 'commandZone')
        }
        closeContextMenu()
    }

    function moveToExile() {
        if (contextMenuCard.value) {
            const card = game.findCard(contextMenuCard.value)
            if (card) game.moveCard(contextMenuCard.value, card.zone, 'exile')
        }
        closeContextMenu()
    }

    function returnToHand() {
        if (contextMenuCard.value) {
            const card = game.findCard(contextMenuCard.value)
            if (card) game.moveCard(contextMenuCard.value, card.zone, 'hand')
        }
        closeContextMenu()
    }

    // Position is 0 based from the top, so a position of 0 is the same as 'top'.
    function moveToLibrary(position: number | 'top' | 'bottom') {
        if (contextMenuCard.value) {
            const card = game.findCard(contextMenuCard.value)
            if (card) game.moveCard(contextMenuCard.value, card.zone, 'library', position)
        }
        closeContextMenu()
    }

    function addCounter(type: CounterType) {
        if (!contextMenuCard.value) return
        const card = game.findCard(contextMenuCard.value)
        if (!card) return

        const hasCounter = card.counters.some(c => c.type === type)

        if (hasCounter) {
            game.removeCounter(contextMenuCard.value, type)
            closeContextMenu()
        } else if (type === 'freeform') {
            pendingFreeformCardId.value = contextMenuCard.value
            closeContextMenu()
            showFreeformModal.value = true
        } else {
            game.addCounter(contextMenuCard.value, type)
            closeContextMenu()
        }
    }

    function handleFreeformSubmit() {
        if (pendingFreeformCardId.value && freeformText.value.trim()) {
            game.addCounter(pendingFreeformCardId.value, 'freeform', freeformText.value.trim())
        }
        showFreeformModal.value = false
        freeformText.value = ''
        pendingFreeformCardId.value = null
    }

    function closeContextMenu() {
        showContextMenu.value = false
        contextMenuCard.value = null
    }

    function handleCardHover(card: CardInstance) {
        hoveredCard.value = card
    }

    function handleCardMove(event: MouseEvent, card: CardInstance) {
        hoveredCard.value = card

        const cardElement = event.currentTarget as HTMLElement
        const rect = cardElement.getBoundingClientRect()

        const x = (event.clientX - rect.left) / rect.width
        const y = (event.clientY - rect.top) / rect.height

        magnifierPosition.value = { x, y }
    }

    function handleCardLeave() {
        hoveredCard.value = null
    }

    function resetView() {
        if (battlefieldRef.value) {
            const { width, height } = battlefieldRef.value.getBoundingClientRect()

            panX.value = width * (1 - CANVAS_MULTIPLIER) / 2
            panY.value = height * (1 - CANVAS_MULTIPLIER) / 2

            zoomLevel.value = 1.0
        }
    }

    return {
        CARD_BACK_URL,
        game,
        loading,
        showLoadModal,
        draggedCardId,
        contextMenuPosition,
        contextMenuCard,
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
        showFreeformModal,
        freeformText,
        freeformInput,
        addCounter,
        handleFreeformSubmit,
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
        markFaceDown,
        toggleTapCard,
        returnToCommandZone,
        moveToExile,
        returnToHand,
        moveToLibrary,
    }
}