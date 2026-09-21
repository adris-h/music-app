import albums from '../../data/albums.json'
import artists from '../../data/artists.json'


export default defineEventHandler((event) => {
    const id = Number(getRouterParam(event, 'id'))
    const album = albums.find(a => a.id === id)

    if (!album) {
        throw createError({ statusCode: 404, statusMessage: 'Album not found' })
    }

    return { ...album, artist: artists.find(a => a.id === album.artist_id) }
})

//import music from "https://musicbrainz.org/ws/2/"