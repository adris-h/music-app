// GET /api/albums/5  ->  one album (the one with id 5), with its artist
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
    // 1. Read the "5" from the URL. It arrives as text, so turn it into a number.
    const idFromUrl = getRouterParam(event, 'id')
    const id = Number(idFromUrl)

    // 2. Read both data files
    const albumsFile = join(process.cwd(), 'server', 'data', 'albums.json')
    const artistsFile = join(process.cwd(), 'server', 'data', 'artists.json')

    const albums = JSON.parse(await readFile(albumsFile, 'utf-8'))
    const artists = JSON.parse(await readFile(artistsFile, 'utf-8'))

    // 3. Find the album. If none matches, find() gives back undefined.
    const album = albums.find((a: any) => a.id === id)

    // 4. No album? Send a 404 ("not found") error and stop here.
    if (!album) {
        throw createError({ statusCode: 404, statusMessage: 'Album not found' })
    }

    // 5. Find its artist and send both back together
    const artist = artists.find((a: any) => a.id === album.artist_id)

    return { ...album, artist: artist }
})