import type { AlbumWithArtist } from '~/types/models'

// All albums.
// useFetch calls the URL and gives you: data, pending (loading), error...
export const useAlbums = () => {
    return useFetch<AlbumWithArtist[]>('/api/albums')
}

// One album by id.
// "id" can be a plain value (5), a ref (a reactive value), or a function.
// Passing the URL as a function makes useFetch re-fetch whenever the id changes.
export const useAlbum = (id: MaybeRefOrGetter<number | string>) => {
    return useFetch<AlbumWithArtist>(() => {
        // toValue() unwraps the id, whichever of the three kinds it is
        const plainId = toValue(id)
        return `/api/albums/${plainId}`
    })
}