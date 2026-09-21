import type { AlbumWithArtist } from '~/types/models'

export const useAlbums = () =>
    useFetch<AlbumWithArtist[]>('/api/albums')

export const useAlbum = (id: MaybeRefOrGetter<number | string>) =>
    useFetch<AlbumWithArtist>(() => `/api/albums/${toValue(id)}`)