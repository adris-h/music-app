// GET /api/tracks/tracks?release_group_id=...
// Gets the songs of an album from MusicBrainz WITHOUT saving anything.
const headers = { 'User-Agent': 'MusicRatingAppDiary' }

function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// "Cached" handler: the answer is remembered for 24 hours,
// so asking for the same album again does not call MusicBrainz again.
export default defineCachedEventHandler(async (event) => {
    // 1. Read ?release_group_id=... from the URL
    const releaseGroupId = String(getQuery(event).release_group_id ?? '')

    if (!releaseGroupId) {
        throw createError({ statusCode: 400, statusMessage: 'Missing release_group_id' })
    }

    // 2. Ask for the album and the list of its editions ("releases")
    const releaseGroup: any = await $fetch(
        `https://musicbrainz.org/ws/2/release-group/${releaseGroupId}`,
        { query: { inc: 'releases', fmt: 'json' }, headers },
    )

    const releases = releaseGroup.releases ?? []

    // No editions means no tracks
    if (releases.length === 0) {
        return []
    }

    // 3. Pick an edition (same rule as in index.post.ts, so both agree)
    const sameTitle = releases.find((r: any) => r.title === releaseGroup.title)
    const release = sameTitle ?? releases[0]

    // 4. Wait a bit: MusicBrainz allows about 1 request per second
    await wait(1100)

    // 5. Ask for that edition, including its songs
    const releaseData: any = await $fetch(
        `https://musicbrainz.org/ws/2/release/${release.id}`,
        { query: { inc: 'recordings+artist-credits', fmt: 'json' }, headers },
    )

    // 6. Put the songs of all discs into ONE list, numbered 1, 2, 3...
    const tracks = []
    let position = 1

    for (const disc of releaseData.media ?? []) {
        for (const track of disc.tracks ?? []) {
            tracks.push({
                position: position,
                title: track.title,
                duration_ms: track.length ?? track.recording?.length ?? null,
                mbid: track.recording?.id ?? null,
            })
            position++
        }
    }

    return tracks
}, {
    maxAge: 60 * 60 * 24, // remember for 24 hours (in seconds)
    // The "name" the answer is remembered under: one entry per album
    getKey: (event) => String(getQuery(event).release_group_id),
})