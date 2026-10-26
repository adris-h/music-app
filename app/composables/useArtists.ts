import type { ArtistWithAlbums } from '~/types/models'

// All artists
export const useArtists = () => {
    return useFetch<ArtistWithAlbums[]>('/api/artists')
}

// One artist by id (same idea as useAlbum).
// NOTE: this needs a server/api/artists/[id].get.ts file, which you did not upload.
export const useArtist = (id: MaybeRefOrGetter<number | string>) => {
    return useFetch<ArtistWithAlbums>(() => {
        const plainId = toValue(id)
        return `/api/artists/${plainId}`
    })
}