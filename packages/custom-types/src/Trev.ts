
// Response type for the Trev API
type TrevResponse = {
    type: string,
    data: string,
    width: number
    height: number
    ext: 'jpg',
    text: string // a copy of what the text was
}

export type { TrevResponse }
