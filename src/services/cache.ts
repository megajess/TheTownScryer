import type { ScryfallCard } from '@/types/scryfall'

const DB_NAME = 'TownScryerCache'
const DB_VERSION = 1
const STORE_NAME = 'cards'

let db: IDBDatabase | null = null

export async function initCache(): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
            db = request.result

            resolve()
        }

        request .onupgradeneeded = (event) => {
            const databse = (event.target as IDBOpenDBRequest).result

            if (!databse.objectStoreNames.contains(STORE_NAME)) {
                databse.createObjectStore(STORE_NAME, { keyPath: 'name' })
            }
        }
    })
}

export async function getCachedCard(name: string): Promise<ScryfallCard | null> {
    if (!db) await initCache()

    return new Promise((resolve, reject) => {
        const transaction = db!.transaction([STORE_NAME], 'readonly')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.get(name)

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result || null)
    })
}

export async function cacheCard(card: ScryfallCard): Promise<void> {
    if (!db) await initCache()

    return new Promise((resolve, reject) => {
        const transaction = db!.transaction([STORE_NAME], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.put(card)

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
    })
}