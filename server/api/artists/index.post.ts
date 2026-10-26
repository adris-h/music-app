import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const artistsFile = join(process.cwd(), 'server', 'data', 'artists.json')
const headers = { 'User-Agent': 'MyMusicApp' }

// Next free id: highest id + 1
function nextId(items: any[]) {
    let highest = 0
    for (const item of items) {
        if (item.id > highest) highest = item.id
    }
    return highest + 1
}

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const mbid = body.mbid

    if (!mbid) {
        throw createError({ statusCode: 400, statusMessage: 'Missing mbid' })
    }

    // 2. Already saved? Return it.
    const artists = JSON.parse(await readFile(artistsFile, 'utf-8'))
    const existing = artists.find((a: any) => a.mbid === mbid)

    if (existing) return existing

    try {
        // 3. New artist: ask MusicBrainz for the details
        const info = await $fetch<any>(`https://musicbrainz.org/ws/2/artist/${mbid}`, {
            query: { inc: 'aliases', fmt: 'json' },
            headers,
        })

        const legalNameAlias = info.aliases?.find((x: any) => x.type === 'Legal name')

        // 4. Build the artist in your own shape
        const artist = {
            id: nextId(artists),
            name: info.name ?? 'Unknown artist',
            mbid: info.id ?? mbid,
            image_url: '',
            legalName: legalNameAlias?.['sort-name'] ?? '',
            country: info.country ?? '',
        }

        // 5. Save and return it
        artists.push(artist)
        await writeFile(artistsFile, JSON.stringify(artists, null, 2))

        return artist
    } catch (err) {
        console.error('Saving artist failed:', err)
        throw createError({ statusCode: 502, statusMessage: 'Could not fetch artist from MusicBrainz' })
    }
})