// API key for OMDb API
const apiKey = '9b354fbd';

// Load watchlist from local storage on page load
const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

// Function to initialize the application
function initApp() {
  const watchlistSection = document.getElementById('watchlist');
  const movieSearch = document.getElementById('movie-search');
  const addMovieButton = document.getElementById('add-movie');
  const movieList = document.getElementById('movie-list');

  // Render watchlist and fetch latest movies on page load
  renderWatchlist();
  fetchLatestMovies();

  addMovieButton.addEventListener('click', () => {
    const searchTerm = movieSearch.value.trim();
    if (searchTerm) {
      // Search for movies using the OMDb API
      fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
          if (data.Response === 'True') {
            if (data.Search.length === 1) {
              // If there's only one result, add it to the watchlist
              const movie = data.Search[0];
              addMovieToWatchlist(movie);
            } else if (data.Search.length > 1) {
              // If there are multiple results, show options to the user
              const options = data.Search.map(movie => `<option value="${movie.imdbID}">${movie.Title} (${movie.Year})</option>`);
              const selectOptions = `<select id="movie-options">${options.join('')}</select>`;
              const confirmButton = `<button id="confirm-movie">Add Selected Movie</button>`;
              const optionsContainer = document.createElement('div');
              optionsContainer.innerHTML = `
                <p>Multiple movies found. Please select the one you want to add:</p>
                ${selectOptions}
                ${confirmButton}
              `;
              document.body.appendChild(optionsContainer);

              const confirmMovieButton = document.getElementById('confirm-movie');
              confirmMovieButton.addEventListener('click', () => {
                const selectedMovieId = document.getElementById('movie-options').value;
                fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${selectedMovieId}`)
                  .then(response => response.json())
                  .then(movieData => {
                    addMovieToWatchlist(movieData);
                    optionsContainer.remove();
                  })
                  .catch(error => console.error(error));
              });
            } else {
              // If there are no results, show an error message
              alert('No movies found with that title.');
            }
          } else {
            console.error(data.Error);
          }
        })
        .catch(error => console.error(error));
    }
  });

  function addMovieToWatchlist(movie) {
    watchlist.push(movie);
    renderWatchlist();
    saveWatchlistToLocalStorage();
  }

  function renderWatchlist() {
    watchlistSection.innerHTML = '';
    watchlist.forEach(movie => {
      const watchlistMovie = document.createElement('div');
      watchlistMovie.classList.add('watchlist-movie');
      watchlistMovie.innerHTML = `
        <img src="${movie.Poster}" alt="${movie.Title}">
        <h3>${movie.Title} (${movie.Year})</h3>
      `;
      watchlistSection.appendChild(watchlistMovie);
    });
  }

  function saveWatchlistToLocalStorage() {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }

  function fetchLatestMovies() {
    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=movie&type=movie&y=2023`)
      .then(response => response.json())
      .then(data => {
        if (data.Response === 'True') {
          data.Search.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            movieCard.innerHTML = `
              <img src="${movie.Poster}" alt="${movie.Title}">
              <h3>${movie.Title}</h3>
            `;
            movieList.appendChild(movieCard);
          });
        } else {
          console.error(data.Error);
        }
      })
      .catch(error => console.error(error));
  }
}

// Call the initApp function when the page has finished loading
document.addEventListener('DOMContentLoaded', initApp);


// ... (existing code) ...

const darkModeBtn = document.getElementById('dark-mode-btn');
const body = document.body;

darkModeBtn.addEventListener('click', toggleDarkMode);

function toggleDarkMode() {
  body.classList.toggle('dark-mode');
  darkModeBtn.textContent = body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
}


const searchInput = document.getElementById('movie-search');
const searchSuggestionsContainer = document.getElementById('search-suggestions');

searchInput.addEventListener('input', debounce(fetchSearchSuggestions, 500));

function fetchSearchSuggestions() {
  const searchTerm = searchInput.value.trim();
  if (searchTerm) {
    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(searchTerm)}`)
      .then(response => response.json())
      .then(data => {
        if (data.Response === 'True') {
          renderSearchSuggestions(data.Search);
        } else {
          renderSearchSuggestions([]);
        }
      })
      .catch(error => console.error(error));
  } else {
    renderSearchSuggestions([]);
  }
}

function renderSearchSuggestions(suggestions) {
  searchSuggestionsContainer.innerHTML = '';
  suggestions.forEach(suggestion => {
    const suggestionElement = document.createElement('div');
    suggestionElement.textContent = `${suggestion.Title} (${suggestion.Year})`;
    suggestionElement.addEventListener('click', () => {
      searchInput.value = suggestion.Title;
      searchSuggestionsContainer.innerHTML = '';
    });
    searchSuggestionsContainer.appendChild(suggestionElement);
  });
}

function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

let currentPage = 1;
let isLoadingMovies = false;

window.addEventListener('scroll', handleInfiniteScroll);

function handleInfiniteScroll() {
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = document.documentElement.scrollTop;
  const clientHeight = document.documentElement.clientHeight;

  if (scrollTop + clientHeight >= scrollHeight && !isLoadingMovies) {
    loadMoreMovies();
  }
}

function loadMoreMovies() {
  isLoadingMovies = true;
  document.getElementById('loading-spinner').style.display = 'block';

  fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=movie&type=movie&y=2023&page=${currentPage}`)
    .then(response => response.json())
    .then(data => {
      if (data.Response === 'True') {
        renderMovies(data.Search);
        currentPage++;
      } else {
        console.error(data.Error);
      }
      isLoadingMovies = false;
      document.getElementById('loading-spinner').style.display = 'none';
    })
    .catch(error => console.error(error));
}

function renderMovies(movies) {
  const movieList = document.getElementById('movie-list');
  movies.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');
    movieCard.innerHTML = `
      <img src="${movie.Poster}" alt="${movie.Title}">
      <h3>${movie.Title}</h3>
    `;
    movieList.appendChild(movieCard);
  });
}

