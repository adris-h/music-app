// The shape of one song
export interface Track {
    position: number
    title: string
    duration_ms: number | null
    mbid: string | null
}

// Get the songs of an album. The id may be missing at first (null/undefined).
export const useAlbumTracks = (releaseGroupId: MaybeRefOrGetter<string | null | undefined>) => {
    // The ?release_group_id=... part of the URL. Updates when the id changes.
    const query = computed(() => {
        return { release_group_id: toValue(releaseGroupId) ?? '' }
    })

    // "!!" turns a value into true/false: an id gives true, empty gives false
    const hasId = !!toValue(releaseGroupId)

    return useFetch<Track[]>('/api/tracks/tracks', {
        query: query,
        immediate: hasId,                          // only fetch right away if we have an id
        watch: [() => toValue(releaseGroupId)],    // fetch again when the id changes
    })
}