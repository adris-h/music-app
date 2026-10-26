// GET /api/artists  ->  all saved artists, each with their saved albums
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async () => {
    const albumsFile = join(process.cwd(), 'server', 'data', 'albums.json')
    const artistsFile = join(process.cwd(), 'server', 'data', 'artists.json')

    // Read both files and turn the text into lists
    const albums = JSON.parse(await readFile(albumsFile, 'utf-8'))
    const artists = JSON.parse(await readFile(artistsFile, 'utf-8'))

    const result = []

    for (const artist of artists) {
        // filter() keeps ALL albums of this artist (find() would keep only one)
        const artistAlbums = albums.filter((a: any) => a.artist_id === artist.id)

        // Copy the artist and add their albums
        result.push({ ...artist, albums: artistAlbums })
    }

    return result
})