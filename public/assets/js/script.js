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

    const dir = $('<div>').addClass('subtitle is-6').text(movie.Director);
    content.append(dir);

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
    const image = $(this).closest('.card').find('img').attr('src')

    const newMovie = {
        title: title,
        director: director,
        description: description,
        rating: selectedStars,
        image: image,
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

    const createEl = (img, title, dir, desc) => {
        const saveCard = $('<div>').addClass('card');

        const saveImgSec = $('<div>').addClass('card-image');
        saveCard.append(saveImgSec);

        const saveImgCont = $('<figure>').addClass('image');
        saveImgSec.append(saveImgCont);

        const saveImg = $('<img>').attr('src', img);
        saveImgCont.append(saveImg);

        const saveCardContent = $('<div>').addClass('card-content');
        saveCard.append(saveCardContent);

        const saveMedia = $('<div>').addClass('media has-text-centered');
        saveCardContent.append(saveMedia);

        const saveMediaContent = $('<div>').addClass('media-content');
        saveMedia.append(saveMediaContent);

        const saveTitle = $('<div>').addClass('title is-4').text(title);
        saveMediaContent.append(saveTitle);

        const saveDirector = $('<div>').addClass('subtitle is-6').text(dir);
        saveMediaContent.append(saveDirector);

        const saveDesc = $('<div>').addClass('content desc-custom has-text-weight-medium is-6').text(desc);
        saveCardContent.append(saveDesc);

        const saveRating = $('<div>').addClass('stars has-text-centered mt-3');
        saveDesc.append(saveRating);

        for (let i = 0; i < 5; i++) {
            const saveIcon = $('<span>').addClass('icon');
            saveRating.append(saveIcon);
            const saveStar = $('<i>').addClass('fas fa-star');
            saveIcon.append(saveStar);

            //add active star icon 
        }

        const removeBtnContainer = $('<div>').addClass('button-container has-text-centered mt-4');
        saveDesc.append(removeBtnContainer);

        const removeBtn = $('<button>').addClass('button is-danger is-outlined');
        removeBtnContainer.append(removeBtn);

        const btnText = $('<span>').text('Remove');
        removeBtn.append(btnText);

        const iconContainer = $('<span>').addClass('icon is-small');
        removeBtn.append(iconContainer);

        const removeIcon = $('<i>').addClass('fas fa-times');
        iconContainer.append(removeIcon);

        // $('.slick').slick('slickAdd', saveCard)
    }

    if (jsonMovies.length === 0) {
        createEl('#', 'No saved Movies!', '', '')
    }

    jsonMovies.forEach(movie => {
        console.log(movie)
        createEl(movie.image, movie.title, movie.director, movie.description)
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
//getAndRenderMovies();

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