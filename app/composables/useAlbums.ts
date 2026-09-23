
// import a ts type describing
// an album object that also includes its nested artist object
import type { AlbumWithArtist } from '~/types/models'


// composable for fetching all albums
// useFetch calls the given URL and gives you
// back reactive state: data, loading, error, etc.
export const useAlbums = () =>
    useFetch<AlbumWithArtist[]>('/api/albums')

// composable for fetching one album by id.
// id can be a plain number/string, or a Vue ref,or a function that
// returns one — MaybeRefOrGetter<number | string> covers all three cases,
// so callers can pass something reactive (like a route param) and it'll
// stay in sync
export const useAlbum = (id: MaybeRefOrGetter<number | string>) =>
    // The url is passed as a function here
    // useFetch reruns the fetch automatically whenever the value inside
    // changes, because it's watching this function's dependencies.
    // toValue(id) finds out whatever id actually is (ref, getter, or plain
    // value) down to a plain number/string to create the url string
    useFetch<AlbumWithArtist>(() => `/api/albums/${toValue(id)}`)