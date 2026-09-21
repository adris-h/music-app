export default defineEventHandler(async () => {
  try {
    // Calculate date range for recent releases (last 60 days)
    const today = new Date()
    const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)
    
    const startDate = sixtyDaysAgo.toISOString().split('T')[0]
    const endDate = today.toISOString().split('T')[0]

    const albumsRes = await $fetch<{
      releases: Array<{
        id: string
        title: string
        date?: string
        'first-release-date'?: string
        'artist-credit'?: Array<{
          name: string
          artist: { id: string; name: string }
        }>
      }>
    }>('https://musicbrainz.org/ws/2/release', {
      query: {
        query: `date:[${startDate} TO ${endDate}] AND status:official`,
        fmt: 'json',
        limit: 25,
        offset: 0,
        inc: 'artist-credits+release-groups'
      },
      headers: {
        'User-Agent': 'MusicRatingAppDiary'
      }
    })

    console.log('MusicBrainz response:', albumsRes)

    // Fetch cover art for each album
    const albumsWithCovers = await Promise.all(
      (albumsRes.releases || []).map(async (release) => {
        let coverUrl = null
        try {
          const coverRes = await $fetch<{ images: Array<{ image: string }> }>(
            `https://coverartarchive.org/release/${release.id}`,
            { retry: 1 }
          )
          coverUrl = coverRes.images?.[0]?.image || null
        } catch (e) {
          // No cover art available
        }

        return {
          id: release.id,
          title: release.title,
          artist: {
            id: release['artist-credit']?.[0]?.artist?.id || '',
            name: release['artist-credit']?.[0]?.name || 'Unknown'
          },
          releaseDate: release.date || release['first-release-date'] || 'Unknown',
          coverUrl: coverUrl
        }
      })
    )

    return albumsWithCovers
  } catch (error) {
    console.error('MusicBrainz fetch error:', error)
    throw createError({ 
      statusCode: 500, 
      message: 'Failed to fetch albums from MusicBrainz' 
    })
  }
})