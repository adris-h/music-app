export interface Track {
    position: number;
    title: string;
    duration_ms: number | null;
    mbid: string | null;
}

export const useAlbumTracks = (releaseGroupId: MaybeRefOrGetter<string | null | undefined>) => {
    const query = computed(() => ({ release_group_id: toValue(releaseGroupId) ?? '' }))

    return useFetch<Track[]>('/api/tracks/tracks', {
        query,
        immediate: !!toValue(releaseGroupId),
        watch: [() => toValue(releaseGroupId)],
    })
}