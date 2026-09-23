export default defineCachedEventHandler(async (event) => {
    const releaseGroupId = String(getQuery(event).release_group_id ?? '')

    if (!releaseGroupId) {
        throw createError({ statusCode: 400, statusMessage: 'Missing release_group_id' })
    }

    const headers = {
        'User-Agent': 'MusicRatingAppDiary',
    }

    const releaseGroupData: any = await $fetch(
        `https://musicbrainz.org/ws/2/release-group/${releaseGroupId}`,
        {
            query: { inc: 'releases', fmt: 'json' },
            headers,
        }
    )

    const releaseList = releaseGroupData.releases ?? []

    if (releaseList.length === 0) {
        return []
    }

    const firstRelease = releaseList[0]

    await new Promise((resolve) => setTimeout(resolve, 1100))

    const releaseData: any = await $fetch(
        `https://musicbrainz.org/ws/2/release/${firstRelease.id}`,
        {
            query: { inc: 'recordings+artist-credits', fmt: 'json' },
            headers,
        }
    )

    const allTracks = []
    const mediaList = releaseData.media ?? []

    for (const medium of mediaList) {
        const tracksOnThisMedium = medium.tracks ?? []

        for (const track of tracksOnThisMedium) {
            allTracks.push({
                position: track.position,
                title: track.title,
                duration_ms: track.length ?? track.recording?.length ?? null,
                mbid: track.recording?.id ?? null,
            })
        }
    }

    return allTracks
}, {
    maxAge: 60 * 60 * 24,
    getKey: (event) => String(getQuery(event).release_group_id),
})