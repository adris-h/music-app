import albums from '../../data/albums.json'
import artists from '../../data/artists.json'

export default defineEventHandler(() => {
    return albums.map(a => ({
        ...a,
        artist: artists.find(x => x.id === a.artist_id),
    }))
})