// import ecvery needed local json file
import albums from '../../data/albums.json'
import artists from '../../data/artists.json'

// register this file as a server API route handler
// this function runs everytime something else requests this specific endpoint
export default defineEventHandler(() => {
    // create a new array of albums with the artist object included
    return albums.map(a => ({
        ...a, // copy all the album fields

        // create a new field called artist, which is the artist object that matches the album's artist_id
        artist: artists.find(x => x.id === a.artist_id),
    }))
})

