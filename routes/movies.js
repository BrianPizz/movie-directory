const movies = require('express').Router();

const fs = require('fs');

// GET request for saved movies
movies.get('/', (req, res) => {
    fs.readFile(`./db/movies.json`, (err, data) => {
        if (err) throw err;
        res.json(JSON.parse(data))
    })
})
// POST request to add movie data to db
movies.post('/', (req, res) => {
    console.log('Received POST request to /api/movies');
    const { title, director, description, rating, image, year } = req.body;

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
            image: image,
            year: year,
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

// DELETE request to remove movie
movies.delete('/:id', (req, res) => {
    const movieIdToRemove = req.params.id;

    fs.readFile(`./db/movies.json`, (err, data) => {
        if (err) throw err;
        let movies = JSON.parse(data);

        // Find the index of the movie with the specified ID
        const indexToRemove = movies.findIndex((movie) => movie.id === movieIdToRemove);

        if (indexToRemove === -1) {
            return res.status(404).json('Movie not found');
        }

        // Remove the movie from the array
        movies.splice(indexToRemove, 1);

        // Write the updated movie data back to the JSON file
        fs.writeFile(`./db/movies.json`, JSON.stringify(movies, null, 4), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json('Error in writing movie data');
            }

            console.log('Movie removed!');
            res.json(movies);
        });
    });
});

module.exports = movies;