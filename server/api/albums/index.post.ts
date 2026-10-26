// POST /api/albums  with body { mbid: "..." }
// Gets an album from MusicBrainz and saves it in your JSON files.
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const albumsFile = join(process.cwd(), 'server', 'data', 'albums.json')
const artistsFile = join(process.cwd(), 'server', 'data', 'artists.json')

const headers = { 'User-Agent': 'MyMusicApp (adrianahanouskova2007@gmail.com)' }

// ---------------------------------------------------------------
// SMALL HELPERS (each does one job)
// ---------------------------------------------------------------

// Pause the code for some milliseconds.
// MusicBrainz only allows about 1 request per second.
function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// Give the next free id: highest id + 1. Starts at 1 for an empty list.
function nextId(items: any[]) {
    let highest = 0
    for (const item of items) {
        if (item.id > highest) highest = item.id
    }
    return highest + 1
}

// An album ("release group") has many editions ("releases"): CD, vinyl, deluxe...
// Prefer the edition with the same title as the album. Otherwise take the first.
function pickRelease(releases: any[], albumTitle: string) {
    const sameTitle = releases.find(r => r.title === albumTitle)
    return sameTitle ?? releases[0]
}

// Ask MusicBrainz for one release and turn it into a clean list of tracks
async function fetchTracks(releaseId: string) {
    const release = await $fetch<any>(`https://musicbrainz.org/ws/2/release/${releaseId}`, {
        query: { inc: 'recordings', fmt: 'json' },
        headers,
    })

    const tracks = []
    let position = 1 // we number tracks 1, 2, 3... across all discs

    // A release has "media" (discs). Each disc has its own tracks.
    for (const disc of release.media ?? []) {
        for (const track of disc.tracks ?? []) {
            tracks.push({
                position: position,
                title: track.title,
                duration_ms: track.length ?? null,
                mbid: track.recording?.id ?? track.id,
            })
            position++
        }
    }

    return tracks
}

// Return the artist from your file, or fetch + create it if it's new
async function findOrCreateArtist(artists: any[], artistMbid: string) {
    // Already saved? Reuse it.
    const existing = artists.find(a => a.mbid === artistMbid)
    if (existing) return existing

    // New artist: ask MusicBrainz for the details
    const info = await $fetch<any>(`https://musicbrainz.org/ws/2/artist/${artistMbid}`, {
        query: { inc: 'aliases', fmt: 'json' },
        headers,
    })

    // Some artists have a "Legal name" alias. Look for it.
    const legalNameAlias = info.aliases?.find((x: any) => x.type === 'Legal name')

    const newArtist = {
        id: nextId(artists),
        name: info.name ?? 'Unknown artist',
        mbid: info.id ?? '',
        image_url: '',
        legalName: legalNameAlias?.['sort-name'] ?? '',
        country: info.country ?? '',
    }

    artists.push(newArtist)
    return newArtist
}

// ---------------------------------------------------------------
// THE ROUTE
// ---------------------------------------------------------------
export default defineEventHandler(async (event) => {
    // The frontend sends { mbid: "..." } in the body
    const body = await readBody(event)
    const mbid = body.mbid

    if (!mbid) {
        throw createError({ statusCode: 400, statusMessage: 'Missing mbid' })
    }

    // Load your saved data
    const albums = JSON.parse(await readFile(albumsFile, 'utf-8'))
    const artists = JSON.parse(await readFile(artistsFile, 'utf-8'))

    // STEP 1: Already saved? Return it. No MusicBrainz request needed.
    const alreadySaved = albums.find((a: any) => a.mbid === mbid)
    if (alreadySaved) return alreadySaved

    try {
        // STEP 2: Get the album itself, with its artist and its editions
        const releaseGroup = await $fetch<any>(`https://musicbrainz.org/ws/2/release-group/${mbid}`, {
            query: { inc: 'artists+releases', fmt: 'json' },
            headers,
        })

        // STEP 3: Get the tracks (only if the album has at least one edition)
        let tracks: any[] = []
        const releases = releaseGroup.releases ?? []

        if (releases.length > 0) {
            const release = pickRelease(releases, releaseGroup.title)
            await wait(1100) // be polite: wait before the next request
            tracks = await fetchTracks(release.id)
        }

        // STEP 4: Find or create the artist
        const credit = releaseGroup['artist-credit']?.[0]?.artist
        if (!credit) {
            throw new Error('This album has no artist on MusicBrainz')
        }
        const artist = await findOrCreateArtist(artists, credit.id)

        // STEP 5: Build the album in your own shape, then save both files
        const album = {
            id: nextId(albums),
            artist_id: artist.id,
            title: releaseGroup.title,
            release_date: releaseGroup['first-release-date'] ?? '',
            cover_url: `https://coverartarchive.org/release-group/${mbid}/front-500`,
            mbid: mbid,
            tracks: tracks,
            type: releaseGroup['primary-type'] ?? 'Album',
            secondary_types: releaseGroup['secondary-types'] ?? [],
        }

        albums.push(album)

        await writeFile(albumsFile, JSON.stringify(albums, null, 2))
        await writeFile(artistsFile, JSON.stringify(artists, null, 2))

        return album
    } catch (err) {
        // Show the real error in your terminal, send a clean error to the frontend
        console.error('Saving album failed:', err)
        throw createError({ statusCode: 502, statusMessage: 'Could not fetch album from MusicBrainz' })
    }
})