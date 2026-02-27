import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useGameStore } from '@/stores/game'
import type { CardInstance, ZoneType } from '@/types/card'
import { fetchCardByName, getImageUrl } from '@/services/scryfall'
import { getCachedCard, cacheCard } from '@/services/cache'
import { CARD_BACK_URL } from '@/services/scryfall'

export function useGameView() {
    const CANVAS_MULTIPLIER = 3.5

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
        draggedCardId.value = cardId

        const target = event.currentTarget as HTMLElement
        const rect = target.getBoundingClientRect()
        const card = game.findCard(cardId)
        const isOnBattlefield = card?.zone === 'battlefield'
        const width = isOnBattlefield ? rect.width : rect.width * zoomLevel.value
        const height = isOnBattlefield ? rect.height : rect.height * zoomLevel.value
        const dragImg = createDragImage(target, width, height)

        if (!dragImg) return

        dragGrabOffset.value = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        }

        event.dataTransfer?.setDragImage(dragImg, dragGrabOffset.value.x, dragGrabOffset.value.y)
        setTimeout(() => document.body.removeChild(dragImg), 0)
    }

    function createDragImage(target: HTMLElement, scaledWidth: number, scaledHeight: number): HTMLDivElement | null {
        const cardImg = target.querySelector('img')?.src

        if (!cardImg) return null

        const dragImg = document.createElement('div')

        dragImg.style.backgroundImage = `url(${cardImg})`
        dragImg.style.backgroundSize = '100% 100%'
        dragImg.style.width = scaledWidth + 'px'
        dragImg.style.height = scaledHeight + 'px'
        dragImg.style.position = 'fixed'
        dragImg.style.top = '-9999px'
        dragImg.style.left = '-9999px'

        document.body.appendChild(dragImg)

        return dragImg
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

                game.moveCard(draggedCardId.value, card.zone, toZone, x, y)
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

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Shift') {
            isShiftPressed.value = true
        }
    }

    function handleKeyUp(event: KeyboardEvent) {
        if (event.key === 'Shift') {
            isShiftPressed.value = false
        }
    }

    function resetView() {
        if (battlefieldRef.value) {
            const { width, height } = battlefieldRef.value.getBoundingClientRect()

            panX.value = width * (1 - CANVAS_MULTIPLIER) / 2
            panY.value = height * (1 - CANVAS_MULTIPLIER) / 2

            zoomLevel.value = 1.0
        }
    }

    onMounted(async () => {
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        await nextTick()

        resetView()
    })

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('keyup', handleKeyUp)
    })

    return {
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
        toggleMenu
    }
}