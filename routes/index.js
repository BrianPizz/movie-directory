const express = require('express');

const moviesRouter = require('./movies');

const app = express();

app.use('/movies', moviesRouter);

module.exports = app;