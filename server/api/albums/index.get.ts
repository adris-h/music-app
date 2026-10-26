import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async () => {
    const albumsFile = join(process.cwd(), 'server', 'data', 'albums.json')
    const artistsFile = join(process.cwd(), 'server', 'data', 'artists.json')

    const albums = JSON.parse(await readFile(albumsFile, 'utf-8'))
    const artists = JSON.parse(await readFile(artistsFile, 'utf-8'))

    const result = []

    for (const album of albums) {
        const artist = artists.find((a: any) => a.id === album.artist_id)

        result.push({ ...album, artist: artist })
    }

    return result
})