export interface ScryfallCard {
    id: string
    name: string
    image_uris?: {
        small: string
        normal: string
        large: string
        png: string
    }
    card_faces: Array<{
        name: string
        image_uris?: {
            small: string
            normal: string
            large: string
            png: string
        }
    }>
}