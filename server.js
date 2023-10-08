// Express and node imports
const express = require('express');
const path = require('path');
const fs = require('fs')
// specify port for sever
const PORT = 3001;
// Initialize instance on express
const app = express();
// middleware for parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Static middleware
app.use(express.static('public'));
// GET request for start page
app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);
// GET request for movies
app.get('/movies', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/movies.html'))
);
// POST request to add movie data to db
app.post('/api/movies', (req, res) => {
    console.log('recieved POST req')
    const { title, director, description, rating } = req.body;
    // only save movie data if there is a rating
    if (rating) {
        const newMovie = {
            title: title,
            director: director,
            description: description,
            rating: rating,
            id: Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1),
        }
        fs.readFile(`./db/movies.json`, (err,data) => {
            if (err) throw err;
            const movies = JSON.parse(data);
            movies.forEach()
            movies.push(newMovie);

            fs.writeFile(`./db/movies.json`, JSON.stringify(movies, null, 4), (err) =>
            err ? console.error(err) : console.log('Movie added!'))
            res.json(movies)
        })
        const response = {
            status: 'success',
            body: newMovie,
        };
        console.log(response)
    } else {
        res.status(500).json('Error in adding movie')
    }
})
// Listen for connections
app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT}`)
);
