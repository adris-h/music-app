// GET /api/search?q=dark side
// Searches YOUR saved data and MusicBrainz, then merges the results.
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const albumsFile = join(process.cwd(), 'server', 'data', 'albums.json')
const artistsFile = join(process.cwd(), 'server', 'data', 'artists.json')

const headers = { 'User-Agent': 'MyMusicApp/0.1 (your@email.com)' }

// ---------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------


// How alike two words must be to count as a typo of each other.
// 0.8 = 80%. Lower it (for example 0.75) to be more forgiving.
const MIN_SIMILARITY = 0.8

// Words shorter than this must match exactly (no typo allowed).
const MIN_LENGTH_FOR_TYPOS = 4


// MusicBrainz treats characters like ( ) - " : / as search commands.
// Put a backslash before each one so they count as normal text.
function escapeWord(word: string) {
    return word.replace(/[+\-&|!(){}\[\]^"~*?:\\/]/g, '\\$&')
}

// How many changes (add, remove, replace a letter) turn a into b?
function editDistance(a: string, b: string): number {
    const row = Array.from({ length: b.length + 1 }, (_, i) => i)
    for (let i = 1; i <= a.length; i++) {
        let prev = row[0]!
        row[0] = i
        for (let j = 1; j <= b.length; j++) {
            const temp = row[j]!
            row[j] = a[i - 1] === b[j - 1]
                ? prev
                : 1 + Math.min(prev, row[j]!, row[j - 1]!)
            prev = temp
        }
    }
    return row[b.length]!
}

// True if two single words are at least MIN_SIMILARITY alike.
function isSimilar(searchWord: string, realWord: string) {
    const changes = editDistance(searchWord, realWord)
    const longest = Math.max(searchWord.length, realWord.length)
    const similarity = 1 - changes / longest
    return similarity >= MIN_SIMILARITY
}

// True if EVERY search word matches something in the text,
// either exactly (inside a word) or as a likely typo.
// words = ['pink', 'floyed'], text = 'Pink Floyd' -> true
function containsSimilarWords(text: string, words: string[]) {
    const lowerText = text.toLowerCase()
    const textWords = lowerText.split(/\s+/)

    return words.every(searchWord => {
        // 1. Exact match first (also allows partial words like "dark" in "darkside")
        if (lowerText.includes(searchWord)) return true

        // 2. Short words must be exact, so no typo check
        if (searchWord.length < MIN_LENGTH_FOR_TYPOS) return false

        // 3. Typo check: is it similar to at least one real word?
        return textWords.some(realWord => isSimilar(searchWord, realWord))
    })
}

// ---------------------------------------------------------------
// SEARCH YOUR OWN DATA (plain JavaScript, no web request)
// ---------------------------------------------------------------

function searchSavedAlbums(albums: any[], artists: any[], words: string[]) {
    const result = []

    for (const album of albums) {
        const artist = artists.find(a => a.id === album.artist_id)
        const artistName = artist?.name ?? 'Unknown artist'

        // Search in "title + artist name" together
        if (containsSimilarWords(`${album.title} ${artistName}`, words)) {
            result.push({ ...album, artist: artistName, saved: true })
        }
    }

    return result
}

function searchSavedArtists(artists: any[], words: string[]) {
    const result = []

    for (const artist of artists) {
        if (containsSimilarWords(artist.name, words)) {
            result.push({ ...artist, saved: true })
        }
    }

    return result
}

// ---------------------------------------------------------------
// SEARCH MUSICBRAINZ (web requests)
// ---------------------------------------------------------------



type OnlineArtist = {
    id: null
    mbid: string
    name: string
    type: string
    country: string
    legalName: string
    saved: boolean
}

type OnlineAlbums = {
    id: null
    mbid: string
    title: string
    artist: string
    release_date: string
    cover_url: string
    type: string
    saved: boolean
}

async function searchOnlineAlbums(words: string[]): Promise<OnlineAlbums[]> {
    // Every word must be in the album title OR the artist name:
    // (releasegroup:dark OR artist:dark) AND (releasegroup:side OR artist:side)
    const parts = words.map(word => {
        const safe = escapeWord(word)
        return `(releasegroup:${safe} OR artist:${safe})`
    })
    const query = parts.join(' AND ')

    try {
        const data = await $fetch<any>('https://musicbrainz.org/ws/2/release-group', {
            query: { query: query, fmt: 'json', limit: 8 },
            headers,
        })

        // Convert each MusicBrainz result into the shape your app uses
        return data['release-groups'].map((r: any) => ({
            id: null, // not in your database
            mbid: r.id,
            title: r.title,
            artist: r['artist-credit']?.[0]?.name ?? 'Unknown artist',
            release_date: r['first-release-date'] ?? '',
            cover_url: `https://coverartarchive.org/release-group/${r.id}/front-250`,
            type: r['primary-type'] ?? 'Album',
            saved: false,
        }))
    } catch (err) {
        // If MusicBrainz fails, return nothing, so saved results still show
        console.error('Album search failed:', err)
        return []
    }
}

async function searchOnlineArtistsUnlimited(words: string[]): Promise<OnlineArtist[]> {
    const parts = words.map(word => `artist:${escapeWord(word)}`)
    const query = parts.join(' AND ')

    try {
        const data = await $fetch<any>('https://musicbrainz.org/ws/2/artist', {
            query: { query: query, fmt: 'json', limit: 10 },
            headers,
        })

        return data.artists.map((a: any) => ({
            id: null,
            mbid: a.id,
            name: a.name,
            type: a.type ?? 'Artist',
            country: a.country ?? a.area?.name ?? '',
            legalName: a.aliases?.find((x: any) => x.type === 'Legal name')?.['sort-name'] ?? '',
            saved: false,
        }))
    } catch (err) {
        console.error('Artist search failed:', err)
        return []
    }
}



async function searchOnlineArtists(words: string[]): Promise<OnlineArtist[]> {
    // Every word must be in the artist name
    const parts = words.map(word => `artist:${escapeWord(word)}`)
    const query = parts.join(' AND ')

    try {
        const data = await $fetch<any>('https://musicbrainz.org/ws/2/artist', {
            query: { query: query, fmt: 'json', limit: 5 },
            headers,
        })

        return data.artists.map((a: any) => ({
            id: null,
            mbid: a.id,
            name: a.name,
            type: a.type ?? 'Artist',
            country: a.country ?? a.area?.name ?? '',
            legalName: a.aliases?.find((x: any) => x.type === 'Legal name')?.['sort-name'] ?? '',
            saved: false,
        }))
    } catch (err) {
        console.error('Artist search failed:', err)
        return []
    }
}

// ---------------------------------------------------------------
// THE ROUTE
// ---------------------------------------------------------------
export default defineEventHandler(async (event) => {
    // 1. Read ?q=... and remove spaces at the start and end
    const text = String(getQuery(event).q ?? '').trim()

    if (!text) {
        throw createError({ statusCode: 400, statusMessage: 'Missing q' })
    }

    // "Dark Side" -> ['dark', 'side']
    const words = text.toLowerCase().split(/\s+/)

    // 2. Read your data. We read the files NOW (not with "import"), because
    //    "import" copies the file once, so newly saved albums would not show up.
    const albums = JSON.parse(await readFile(albumsFile, 'utf-8'))
    const artists = JSON.parse(await readFile(artistsFile, 'utf-8'))

    // 3. Search your own data
    const savedAlbums = searchSavedAlbums(albums, artists, words)
    const savedArtists = searchSavedArtists(artists, words)

    // 4. Search MusicBrainz. Both searches start at the same time.
    const [onlineAlbums, onlineArtists] = await Promise.all([
        searchOnlineAlbums(words),
        searchOnlineArtists(words),
    ])

    // 5. Remove online results you already saved (compare by mbid)
    const savedAlbumMbids = new Set(savedAlbums.map((a: any) => a.mbid))
    const savedArtistMbids = new Set(savedArtists.map((a: any) => a.mbid))

    const newAlbums = onlineAlbums.filter((a: any) => !savedAlbumMbids.has(a.mbid))
    const newArtists = onlineArtists.filter((a: any) => !savedArtistMbids.has(a.mbid))

    // 6. Saved results first, then new ones
    return {
        albums: [...savedAlbums, ...newAlbums],
        artists: [...savedArtists, ...newArtists],
    }
})