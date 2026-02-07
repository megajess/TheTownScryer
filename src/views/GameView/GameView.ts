import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/game'
import type { CardInstance, ZoneType } from '@/types/card'
import { fetchCardByName, getImageUrl } from '@/services/scryfall'
import { getCachedCard, cacheCard } from '@/services/cache'

export function useGameView() {
    const game = useGameStore()
    const loading = ref(false)
    const showLoadModal = ref(true)
    const draggedCardId = ref<string | null>(null)
    const contextMenuCard = ref<string | null>(null)
    const contextMenuPosition = ref(({ x: 0, y: 0 }))
    const showContextMenu = ref(false)
    const hoveredCard = ref<CardInstance | null>(null)
    const magnifierPosition = ref({ x: 0, y: 0 })
    const isShiftPressed = ref(false)

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

        game.loadLibrary(loadedCards)
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

    function handleDragStart(cardId: string) {
        draggedCardId.value = cardId
    }

    function handleDrop(toZone: ZoneType) {
        if (draggedCardId.value) {
            const card = game.findCard(draggedCardId.value)

            if (card) {
                game.moveCard(draggedCardId.value, card.zone, toZone)
            }
        }
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

    onMounted(() => {
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
    })

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('keyup', handleKeyUp)
    })

    return {
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
    }
}