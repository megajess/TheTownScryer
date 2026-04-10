export type ZoneType =
    | 'library'
    | 'hand'
    | 'battlefield'
    | 'commandZone'
    | 'graveyard'
    | 'exile'
    | 'reveal'

export type CounterType = 'plusOne' | 'minusOne' | 'loyalty' | 'generic' | 'freeform'

export interface Counter {
    id: string
    type: CounterType
    count: number
    name?: string
}

export interface CardInstance {
    id: string
    cardId: string
    name: string
    imageUrl: string
    backImageUrl?: string
    zone: ZoneType
    tapped: boolean
    faceDown: boolean
    startsInCommandZone: boolean
    castCount?: number
    isToken: boolean
    counters: Counter[]
    x?: number
    y?: number
    isFlipped: boolean
    isScrying?: boolean
}