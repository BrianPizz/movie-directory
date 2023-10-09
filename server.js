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
// GET request for saved movies
app.get('/api/movies', (req,res) => {
    fs.readFile(`./db/movies.json`, (err, data) => {
        if (err) throw err;
        res.json(JSON.parse(data))
    })
})
// POST request to add movie data to db
app.post('/api/movies', (req, res) => {
    console.log('Received POST request to /api/movies');
    const { title, director, description, rating } = req.body;
    
    // Read the existing movie data from the JSON file
    fs.readFile(`./db/movies.json`, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json('Error in reading movie data');
        }

        const movies = JSON.parse(data);

        // Check if a movie with the same title already exists
        const existingMovie = movies.find((movie) => movie.title === title);

        if (existingMovie) {
            // If the movie already exists, return an error response
            return res.status(400).json('Movie with the same title already exists');
        }

        // If there's no existing movie with the same title, add the new movie
        const newMovie = {
            title: title,
            director: director,
            description: description,
            rating: rating,
            id: Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1),
        };

        movies.push(newMovie);

        // Write the updated movie data back to the JSON file
        fs.writeFile(`./db/movies.json`, JSON.stringify(movies, null, 4), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json('Error in writing movie data');
            }

            console.log('Movie added!');
            res.json(movies);
        });
    });
});
// Listen for connections
app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT}`)
);
