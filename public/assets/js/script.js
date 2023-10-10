const movieSearchEl = $('#movie-search');
const movieSearchResultsEl = $('#search-results');
const searchBtn = $('#search-button');
const savedMoviesPosterEl = $('#saved-movies');
const savedMoviesListEl = $('#movie-list')
let movieId = [];

const getMovieId = async () => {
    movieId = []
    let moviePar = movieSearchEl.val();
    const movieUrl = `https://mdblist.p.rapidapi.com/?s=${moviePar}`;

    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '5785bee15emshf94920a3813b013p19d4f8jsn16dcd17b2cc5',
            'X-RapidAPI-Host': 'mdblist.p.rapidapi.com'
        }
    };
    try {
        const response = await fetch(movieUrl, options);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // if there are more than five movies only display five
        if (data.total > 5) {
            for (let i = 0; i < 5; i++) {
                movieId.push(data.search[i].id);
            }
        } else {
            for (let i = 0; i < data.total; i++) {
                movieId.push(data.search[i].id);
            }
        }
        // console.log(movieId)
        // get movie details for each ID
        for (const id of movieId) {
            await getDetails(id);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};


const getDetails = async (id) => {
    let key = '90baf5f1';
    const url = `http://www.omdbapi.com/?i=${id}&apikey=${key}&`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // console.log(data);
        data.Response === 'True' && renderMovieSearch(data);

    } catch (error) {
        console.error('Error:', error);
    }
};

const renderMovieSearch = (movie) => {
    // copy html format and create replica div
    console.log(movie)
    const card = $('<div>').addClass('card');

    const resultCard = $('<div>').addClass('card-content');
    card.append(resultCard)

    const media = $('<div>').addClass('media');
    resultCard.append(media);

    const mediaSec = $('<div>').addClass('media-left');
    media.append(mediaSec);
    const figure = $('<figure>').addClass('image is-96x96');
    mediaSec.append(figure);

    const image = $('<img>').attr('src', movie.Poster);
    image.attr('alt', movie.Title);
    figure.append(image);

    const content = $('<div>').addClass('custom-media media-content');
    media.append(content);

    const title = $('<div>').addClass('title is-4').text(movie.Title);
    content.append(title);

    const dir = $('<div>').addClass('subtitle is-6 mb-1').text(movie.Director);
    content.append(dir);

    const date = $('<div>').addClass('has-text-weight-light mb-1').text(movie.Year);
    content.append(date);

    const plot = $('<div>').addClass('has-text-weight-medium is-6').text(movie.Plot);
    content.append(plot);

    movieSearchResultsEl.append(card);

    const rating = $('<div>').addClass('has-text-centered');
    media.append(rating)

    const stars = $('<div>').addClass('stars');
    rating.append(stars);

    for (let i = 0; i < 5; i++) {
        const icon = $('<span>').addClass('icon');
        stars.append(icon);
        const star = $('<i>').addClass('fas fa-star');
        icon.append(star);

        star.on('click', () => {
            // Clear 'active' class from all stars
            stars.find('i').removeClass('active');

            // Add 'active' class to clicked star and previous stars
            for (let j = 0; j <= i; j++) {
                stars.find('i').eq(j).addClass('active');
            }
        });
    }

    const add = $('<button>').addClass('mt-5 mb-3 add button is-primary').text('Add');
    rating.append(add)
}

// create an object of movie data when Add button is clicked
$('#search-results').on('click', '.add', function () {
    const title = $(this).closest('.card').find('.title').text();
    const director = $(this).closest('.card').find('.subtitle').text();
    const description = $(this).closest('.card').find('.has-text-weight-medium').text();
    const selectedStars = $(this).closest('.card').find('.active').length;
    const image = $(this).closest('.card').find('img').attr('src');
    const year = $(this).closest('.card').find('.has-text-weight-light').text();

    const newMovie = {
        title: title,
        director: director,
        description: description,
        rating: selectedStars,
        image: image,
        year: year,
    }
    // save movie when Add button clicked
    if (selectedStars) {
        saveMovie(newMovie)
    } else {
        console.log('Added movie must include a rating!')
    }

})

const getMovies = () =>
    fetch('/api/movies', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

const renderSavedMovies = async (movies) => {
    let jsonMovies = await movies.json();

    let movieList = [];

    const createEl = (img, title, dir, year, rating) => {

        const renderStars = () => {
            let starHtml = '';
            for(let i = 0; i < rating; i++){
                starHtml += `<span class="icon">
                <i class="fas fa-star active"></i>
              </span>`
        }  
        return starHtml;
    }
    savedMoviesListEl.append(`
    <div class="card m-2">
        <div class="card-content">
          <div class="media">
            <div class="media-left">
              <figure class="image is-96x96">
                <img src="${img}" alt="${title}">
              </figure>
            </div>
            <div class="custom-media media-content">
              <p class="title is-4">${title}</p>
              <p class="subtitle is-6 mb-1">${dir}</p>
              <p class="has-text-weight-light mb-6">${year}</p>
            </div>
            <div class="has-text-centered">
              <div class="stars">
                ${renderStars()}
              </div>
              <div class="button-container has-text-centered mt-4">
                <button class="button is-danger is-outlined">
                  <span>Remove</span>
                  <span class="icon is-small">
                    <i class="fas fa-times"></i>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>`)
    }
    

    if (jsonMovies.length === 0) {
        savedMoviesListEl.append(`
        <div class="columns">
            <div class="column has-text-centered">
              <div class="subtitle">No movies saved!</div>
            </div>
          </div>
        `)
    }

    jsonMovies.forEach(movie => {
        createEl(movie.image, movie.title, movie.director, movie.year, movie.rating)
    });
};

const saveMovie = (movie) =>
    fetch('/api/movies', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(movie)
    })


searchBtn.on('click', async function (event) {
    event.preventDefault();
    movieSearchResultsEl.empty();
    movieSearchEl.empty();
    await getMovieId();
})

const getAndRenderMovies = () => getMovies().then(renderSavedMovies);
getAndRenderMovies();

$(document).ready(function () {
    $('.slick').slick({
        dots: true,
        infinite: true,
        speed: 500,
        fade: true,
        cssEase: 'linear',
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
    });
});
// for poster add
// $('.slick').slick('slickAdd', saveCard)