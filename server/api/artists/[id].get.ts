import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const albumsFile = join(process.cwd(), 'server', 'data', 'albums.json')
const artistsFile = join(process.cwd(), 'server', 'data', 'artists.json')

const headers = { 'User-Agent': 'MyMusicApp/0.1 (your@email.com)' }

// ---------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------

async function fetchDiscography(artistMbid: string) {
    try {
        const data = await $fetch<any>('https://musicbrainz.org/ws/2/release-group', {
            query: {
                artist: artistMbid,
                type: 'album|ep|single',
                limit: 100,
                fmt: 'json',
            },
            headers,
        })

        return data['release-groups'] ?? []
    } catch (err) {
        // If MusicBrainz fails, return an empty list.
        // The page can still show the albums you saved.
        console.error('Discography fetch failed:', err)
        return []
    }
}

function formatSavedAlbum(saved: any) {
    return {
        id: saved.id,
        mbid: saved.mbid,
        title: saved.title,
        release_date: saved.release_date ?? '',
        cover_url: saved.cover_url,
        saved: true,
        type: saved.type ?? 'Album',
        secondary_types: saved.secondary_types ?? [],
    }
}

function formatOnlineAlbum(online: any, savedMatch: any) {
    const defaultCover = `https://coverartarchive.org/release-group/${online.id}/front-250`

    return {
        id: savedMatch?.id ?? null,                       // null = not saved yet
        mbid: online.id,
        title: online.title,
        release_date: online['first-release-date'] ?? '',
        cover_url: savedMatch?.cover_url ?? defaultCover, // prefer saved cover
        saved: savedMatch !== undefined,                  // true if match found
        type: online['primary-type'] ?? 'Album',
        secondary_types: online['secondary-types'] ?? [],
    }
}

export default defineEventHandler(async (event) => {
    const id = Number(getRouterParam(event, 'id'))

    const allAlbums: any[] = JSON.parse(await readFile(albumsFile, 'utf-8'))
    const allArtists: any[] = JSON.parse(await readFile(artistsFile, 'utf-8'))

    const artist = allArtists.find(a => a.id === id)

    if (!artist) {
        throw createError({ statusCode: 404, statusMessage: 'Artist not found' })
    }

    const savedAlbums = allAlbums.filter(a => a.artist_id === artist.id)

    let onlineAlbums: any[] = []

    if (artist.mbid) {
        onlineAlbums = await fetchDiscography(artist.mbid)
    }

    const albums = []

    for (const online of onlineAlbums) {
        const savedMatch = savedAlbums.find(s => s.mbid === online.id)
        albums.push(formatOnlineAlbum(online, savedMatch))
    }

    for (const saved of savedAlbums) {
        const alreadyInList = albums.some(a => a.mbid === saved.mbid)

        if (!alreadyInList) {
            albums.push(formatSavedAlbum(saved))
        }
    }

    albums.sort((a, b) => b.release_date.localeCompare(a.release_date))

    return { ...artist, albums: albums }
})