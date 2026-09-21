import type { ArtistWithAlbums } from '~/types/models'

export const useArtists = () =>
    useFetch<ArtistWithAlbums[]>('/api/artists')

export const useArtist = (id: MaybeRefOrGetter<number | string>) =>
    useFetch<ArtistWithAlbums>(() => `/api/artists/${toValue(id)}`)