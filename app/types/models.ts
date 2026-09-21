export interface Artist {
    id: number
    name: string
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
}

export interface AlbumWithArtist extends Album {
    artist: Artist
}


