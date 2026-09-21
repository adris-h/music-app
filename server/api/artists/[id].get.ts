import albums from '../../data/albums.json'
import artists from '../../data/artists.json'


export default defineEventHandler((event) => {
    const id = Number(getRouterParam(event, 'id'))
    const artist = artists.find(a => a.id === id)

    if (!artist) {
        throw createError({ statusCode: 404, statusMessage: 'Artist not found' })
    }

    return { ...artist, albums: albums.filter(a => a.artist_id === artist.id) }
})

