export interface Artist {
    id: number
    name: string
    mbid: string | null
    image_url: string | null
    country: string | null
    aliases: string[]
}

export interface Track {
    position: number
    title: string
    duration_ms: number | null
    mbid: string | null
}

export interface Album {
    id: number
    artist_id: number
    title: string
    release_date: string
    cover_url: string | null
    mbid: string | null
    apple_music_id: string | null
    tracks?: Track[]
}

export interface AlbumWithArtist extends Album {
    artist?: Artist
}


export interface ArtistWithAlbums extends Artist {
    albums?: Album[]
}


export interface ArtistAliases {
    name: string
}

export type SearchResult = {
    type: string
    mbid: string
    title: string
    artist_id?: number
    artist: string
    release_date: string
    cover_url: string | null
    aliases?: ArtistAliases[]
    genre: string | null
}

export interface SearchArtist {
    id: number | null
    mbid?: string
    name: string
    type?: string
    country?: string
    saved: boolean
    aliases: string[]
}

export interface SearchResponse {
    albums: SearchResult[]
    artists: SearchArtist[]
}

