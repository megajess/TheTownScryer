export type ZoneType = 
| 'library'
| 'hand'
| 'battlefield'
| 'commandZone'
| 'graveyard'
| 'exile'
| 'reveal'

export type CounterType = 'plusOne' | 'minusOne' | 'loyalty' | 'generic'

export interface Counter {
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
    isCommander: boolean
    isToken: boolean
    counters: Counter[]
    position: number
    isFlipped: boolean
}