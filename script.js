const API_KEY = 'b2df3b29750f4e49ed2522b1b8866b3c';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_SRC_BASE = `https://image.tmdb.org/t/p/w500`;

const TABS = {
  HOME: 'HOME',
  LIKE: 'LiKED',
};

const model = {
  movieList: [],
  likedList: [],
  activeTab: TABS.HOME,
  totalPages: 0,
  currentMovie: null,
  currentFilter: 'popular',
  currentPage: 1,
};

//load the movie data of a particular category and page
function loadMovieData(category, page) {
  return fetch(`${BASE_URL}/movie/${category}?page=${page}&api_key=${API_KEY}`)
    .then((response) => {
      if (!response.ok) {
        console.log('Network data was not OK');
        return [];
      }
      return response.json();
    })
    .then((data) => {
      //console.log(data); // Access the response data here
      return data;
    })
    .catch((error) => {
      console.error(error); // Handle any error that occurred during the request
      return [];
    });
}

//load the movie data of a particular category and page, and then update the movielist and the totalpage of the model
function loadMovies(category, page) {
  return loadMovieData(category, page)
    .then((movieData) => {
      //console.log(movieData);
      model.movieList = movieData.results;
      model.totalPages = movieData.total_pages;
    })
    .catch((error) => {
      console.error(error);
    });
}

//fetch the data of a particular movie given the movie id
const fetchMovieData = (movieId) => {
  const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`;
  return fetch(url).then((resp) => {
    return resp.json();
  });
};

//create a movie card based on the json file of a movie
const createMovieCard = (movie) => {
  const cardDiv = document.createElement('div');
  cardDiv.className = 'movie-card';
  cardDiv.id = movie.id;
  const liked = model.likedList.some(
     (likedMovie) => likedMovie.id === movie.id
   );
  const imgSrc = `${IMG_SRC_BASE}${movie.poster_path}`;
  const cardHTML = `
    <div class="movie-card-img">
      <img src="${imgSrc}">
    </div>
    <h4 class="movie-card-title">${movie.title}</h4>
    <div class="movie-card-rating">
      <div class='rating'>
        <i class="icon ion-md-star rating-icon"></i>
        <span>${movie.vote_average}</span>
        <div>
        <i class="like-icon icon ${
          liked ? "ion-md-heart" : "ion-md-heart-empty"
        }"></i>
      </div>
    </div>
    
    </div>
  `;

  cardDiv.innerHTML = cardHTML;
  return cardDiv;
};

//show the floating window of the current movie
const showFloatWindow = () => {
  const floatWindow = document.querySelector('#floatWindow');
  floatWindow.style.display = 'flex';
  console.log(floatWindow.style.display);
};

//close the floating window of the current movie
const closeFloatWindow = () => {
  const floatWindow = document.querySelector('#floatWindow');
  floatWindow.style.display = 'none';
};

//View

//update the current view, both the moviecontainer and teh liked container
function renderView() {
  const movieList = model.movieList;

  const movieListContainer = document.querySelector('#movieList');
  movieListContainer.innerHTML = '';
  // console.log(movieList);
  movieList.forEach((movie) => {
    // console.log(movie);
    const movieCard = createMovieCard(movie);
    movieListContainer.append(movieCard);
  });
  console.log(movieListContainer);

  const likedList = model.likedList;

  const likedListContainer = document.querySelector('#likedList');
  likedListContainer.innerHTML = '';

  likedList.forEach((movie) => {
    const movieCard = createMovieCard(movie);
    likedListContainer.append(movieCard);
  });
  const currentPage = model.currentPage;
  const totalPages = model.totalPages;

  const currentPageContainer = document.querySelector('#currentPage');
  currentPageContainer.innerHTML = `${currentPage} / ${totalPages}`;
}

//update the current tab view. Only show the tab-view-active
const updateTabs = () => {
  const currentTab = model.activeTab;
  const tabItems = document.querySelectorAll('.tab-item');
  tabItems.forEach((tab) => {
    const tabName = tab.getAttribute('name');
    if (tabName === currentTab) {
      tab.className = 'tab-item active';
    } else {
      tab.className = 'tab-item';
    }
  });
  const homeContainer = document.querySelector('#homeContainer');
  const likedContainer = document.querySelector('#likedContainer');
  if (currentTab === TABS.HOME) {
    homeContainer.className = 'tab-view tab-view-active';
    likedContainer.className = 'tab-view';
  } else {
    likedContainer.className = 'tab-view tab-view-active';
    homeContainer.className = 'tab-view';
  }
};

//update the content of the floating window.
const updateFloatWindow = () => {
  const movieData = model.currentMovie;

  const floatWindowContentHTML = `
    <div class="floatWindow-img">
        <img src="${IMG_SRC_BASE}/${movieData.poster_path}" />
    </div>
    <div class="floatWindow-info">
        <h2>${movieData.title}</h2>
        <br />
        <h3>Overview</h3>
        <p class="floatWindow-overview">
        ${movieData.overview}
        </p>
        <h3>Genres</h3>
        <div class="genre-container">
            ${movieData.genres.map((genre) => {
              return `<div class="genre-item">${genre.name}</div>`;
            })}
        </div>
        <h3>Rating</h3>
        <p>${movieData.vote_average}</p>
        <h3>Production companies</h3>
        <div class="production-container">
       
            ${movieData.production_companies.map((company) => {
              return `
              <div class="production-item">
                <img src="${IMG_SRC_BASE}/${company.logo_path}" />
              </div>`;
            })}
        
        </div>
    </div>
    `;

  const floatWindowContentContainer = document.querySelector(
    '.floatWindow-content'
  );
  floatWindowContentContainer.innerHTML = floatWindowContentHTML;
};

//when click the nav bar home/liked, we need to show the corresponding tab
const handleNavBarClick = (e) => {
  const target = e.target;
  const name = target.getAttribute('name');
  if (!name) {
    return;
  }

  model.activeTab = name;
  updateTabs();
};

//when click the movie card, we need to show the float window
const handleListClick = (e) => {
  const target = e.target;
  const card = target.closest('.movie-card');
  if (!card) {
    return;
  }

  const movieId = Number(card.id);
  if (target.classList.contains("like-icon")) {
    const movieData = model.movieList.find((movie) => movie.id === movieId);
    const alreadyLiked = model.likedList.some(
      (likedMovie) => likedMovie.id === movieId
    );
    if (alreadyLiked) {
      model.likedList = model.likedList.filter((movie) => movie.id !== movieId);
    } else {
      model.likedList.push(movieData);
    }
    renderView();
    return;
  }

  if (target.classList.contains('movie-card-title')) {
    fetchMovieData(movieId).then((movieData) => {
      model.currentMovie = movieData;
      updateFloatWindow();
      showFloatWindow();
    });
  }
};

//when change the filter, we need to show the new movies under the filter
const handleFilterChange = (e) => {
  const value = e.target.value;
  model.currentFilter = value;
  loadMovies(model.currentFilter, 1).then(() => {
    renderView();
  });
};

//when click next, we need to go to the next page
const handleClickNext = () => {
  const currentPage = model.currentPage;
  if (currentPage === model.totalPages) {
    return;
  }
  const nextPage = currentPage + 1;
  loadMovies(model.currentFilter, nextPage).then(() => {
    model.currentPage = nextPage;
    renderView();
  });
};

//when click prev, we need to go to the previous page
const handleClickPrev = () => {
  const currentPage = model.currentPage;
  if (currentPage === 1) {
    return;
  }
  const nextPage = currentPage - 1;
  loadMovies(model.currentFilter, nextPage).then(() => {
    model.currentPage = nextPage;
    renderView();
  });
};

const loadEvent = () => {
  const navBar = document.querySelector('.nav-bar');
  const lists = document.querySelectorAll('.list-container');
  const closeWindowElement = document.querySelector('.close-floatWindow');
  const select = document.querySelector('.filter-select');
  const nextButton = document.querySelector('#nextButton');
  const prevButton = document.querySelector('#prevButton');

  nextButton.addEventListener('click', handleClickNext);
  prevButton.addEventListener('click', handleClickPrev);

  select.addEventListener('change', handleFilterChange);

  closeWindowElement.addEventListener('click', closeFloatWindow);
  lists.forEach((list) => {
    list.addEventListener('click', handleListClick);
  });

  navBar.addEventListener('click', handleNavBarClick);
};

const onLoad = () => {
  loadEvent();
  loadMovies(model.currentFilter, 1).then(() => {
    updateTabs();
    renderView();
  });
};

onLoad();
