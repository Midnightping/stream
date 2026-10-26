// TMDB API Configuration
const TMDB_API_KEY = "";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/original";
const TMDB_PROXY_URL = "/api/tmdb";

const SECTION_TITLES = {
    nowPlaying: 'Now Playing',
    topMovies: 'Top Movies Today',
    topSeries: 'Top Series Today',
    action: 'Action',
    comedy: 'Comedy',
    trending: 'Trending',
    movies: 'Movies',
    tv: 'TV Shows',
    anime: 'Anime'
};

const CATEGORY_ENDPOINTS = {
    trending: '/trending/all/week',
    movies: '/discover/movie?language=en-US&sort_by=popularity.desc',
    tv: '/discover/tv?language=en-US&sort_by=popularity.desc',
    anime: '/discover/tv?with_genres=16&with_origin_country=JP&language=en-US&sort_by=popularity.desc'
};

// Global State
const state = {
    currentView: 'home',
    activeMovie: null,
    searchResults: [],
    activeGenreId: null,
    activeCategory: 'home',
    favorites: JSON.parse(localStorage.getItem('blvckstream_favorites')) || [],
    genres: [],
    hasShownOnboarding: localStorage.getItem('blvckstream_onboarding') === 'true',
    isDarkMode: localStorage.getItem('blvckstream_theme') !== 'light',
    videoProviderIndex: 0,
    heroMuted: false,
    watchRegion: detectWatchRegion(),
    recentlyWatched: JSON.parse(localStorage.getItem('blvckstream_recently_watched') || '[]'),
    sections: {
        nowPlaying: [],
        topMovies: [],
        topSeries: [],
        action: [],
        comedy: []
    },
    tvSeason: 1,
    tvEpisode: 1,
    tvSeasons: [],
    sportsSources: [],
    sportsSourceIndex: 0,
    selectedSport: 'football',
    selectedLeague: 'all',
    allSportsMatches: [],
    featuredSportsMatch: null
};

const SPORTSRC_API = 'https://api.sportsrc.org';

const VIDEO_PROVIDERS = [
    {
        name: 'Blvck Alpha',
        buildUrl: (item) => mediaTypeOf(item) === 'tv'
            ? `https://vidsrc.to/embed/tv/${item.id}/${state.tvSeason}/${state.tvEpisode}`
            : `https://vidsrc.to/embed/movie/${item.id}`
    },
    {
        name: 'Blvck Prime',
        buildUrl: (item) => mediaTypeOf(item) === 'tv'
            ? `https://vidsrc.me/embed/tv/${item.id}/${state.tvSeason}-${state.tvEpisode}`
            : `https://vidsrc.me/embed/movie/${item.id}`
    },
    {
        name: 'Blvck Nova',
        buildUrl: (item) => mediaTypeOf(item) === 'tv'
            ? `https://multiembed.mov/?video_id=${item.id}&tmdb=1&s=${state.tvSeason}&e=${state.tvEpisode}`
            : `https://multiembed.mov/?video_id=${item.id}&tmdb=1`
    },
    {
        name: 'Blvck Flux',
        buildUrl: (item) => mediaTypeOf(item) === 'tv'
            ? `https://www.2embed.cc/embedtv/${item.id}&s=${state.tvSeason}&e=${state.tvEpisode}`
            : `https://www.2embed.cc/embed/${item.id}`
    },
    {
        name: 'Blvck Ultra',
        buildUrl: (item) => mediaTypeOf(item) === 'tv'
            ? `https://embed.su/embed/tv/${item.id}/${state.tvSeason}/${state.tvEpisode}`
            : `https://embed.su/embed/movie/${item.id}`
    },
    {
        name: 'Blvck Storm',
        buildUrl: (item) => mediaTypeOf(item) === 'tv'
            ? `https://player.smashy.stream/tv/${item.id}?s=${state.tvSeason}&e=${state.tvEpisode}`
            : `https://player.smashy.stream/movie/${item.id}`
    },
    {
        name: 'Blvck Hyper',
        buildUrl: (item) => mediaTypeOf(item) === 'tv'
            ? `https://www.NontonGo.net/embed/tv/${item.id}/${state.tvSeason}/${state.tvEpisode}`
            : `https://www.NontonGo.net/embed/movie/${item.id}`
    }
];

// DOM Elements
const elements = {
    apiKeyAlert: document.getElementById('apiKeyAlert'),
    navbar: document.getElementById('navbar'),
    logoBtn: document.getElementById('logoBtn'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeIcon: document.getElementById('themeIcon'),
    searchInput: document.getElementById('searchInput'),
    favoritesBtn: document.getElementById('favoritesBtn'),
    genreFilter: document.getElementById('genreFilter'),
    genreSelect: document.getElementById('genreSelect'),
    categoryNav: document.getElementById('categoryNav'),
    homeView: document.getElementById('homeView'),
    playerView: document.getElementById('playerView'),
    heroBanner: document.getElementById('heroBanner'),
    heroBackdrop: document.getElementById('heroBackdrop'),
    heroVideoWrap: document.getElementById('heroVideoWrap'),
    heroVideoIframe: document.getElementById('heroVideoIframe'),
    heroVolumeBtn: document.getElementById('heroVolumeBtn'),
    heroVolumeIcon: document.getElementById('heroVolumeIcon'),
    heroTitle: document.getElementById('heroTitle'),
    heroOverview: document.getElementById('heroOverview'),
    heroYear: document.getElementById('heroYear'),
    heroRating: document.getElementById('heroRating'),
    heroTypeBadge: document.getElementById('heroTypeBadge'),
    heroWatchBtn: document.getElementById('heroWatchBtn'),
    heroDetailsBtn: document.getElementById('heroDetailsBtn'),
    heroDots: document.getElementById('heroDots'),
    nowWatchingList: document.getElementById('nowWatchingList'),
    genreChips: document.getElementById('genreChips'),
    nowPlayingCarousel: document.getElementById('nowPlayingCarousel'),
    topMoviesCarousel: document.getElementById('topMoviesCarousel'),
    topSeriesCarousel: document.getElementById('topSeriesCarousel'),
    actionCarousel: document.getElementById('actionCarousel'),
    comedyCarousel: document.getElementById('comedyCarousel'),
    recentlyWatchedCarousel: document.getElementById('recentlyWatchedCarousel'),
    searchResultsSection: document.getElementById('searchResultsSection'),
    searchResults: document.getElementById('searchResults'),
    browseTitle: document.getElementById('browseTitle'),
    favoritesSection: document.getElementById('favoritesSection'),
    favoritesGrid: document.getElementById('favoritesGrid'),
    sportsSection: document.getElementById('sportsSection'),
    sportsGrid: document.getElementById('sportsGrid'),
    sportsHero: document.getElementById('sportsHero'),
    sportsHeroBackdrop: document.getElementById('sportsHeroBackdrop'),
    sportsHeroLiveTag: document.getElementById('sportsHeroLiveTag'),
    sportsHeroLeague: document.getElementById('sportsHeroLeague'),
    sportsHeroHomeBadge: document.getElementById('sportsHeroHomeBadge'),
    sportsHeroHomeName: document.getElementById('sportsHeroHomeName'),
    sportsHeroAwayBadge: document.getElementById('sportsHeroAwayBadge'),
    sportsHeroAwayName: document.getElementById('sportsHeroAwayName'),
    sportsHeroTime: document.getElementById('sportsHeroTime'),
    sportsHeroWatchBtn: document.getElementById('sportsHeroWatchBtn'),
    sportsCategoryNav: document.getElementById('sportsCategoryNav'),
    sportsLeagueNav: document.getElementById('sportsLeagueNav'),
    backToHomeBtn: document.getElementById('backToHomeBtn'),
    videoContainer: document.getElementById('videoContainer'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    sourceSelectorBtn: document.getElementById('sourceSelectorBtn'),
    sourceDropdownMenu: document.getElementById('sourceDropdownMenu'),
    selectedSourceName: document.getElementById('selectedSourceName'),
    playerTitle: document.getElementById('playerTitle'),
    playerReleaseDate: document.getElementById('playerReleaseDate'),
    playerOverview: document.getElementById('playerOverview'),
    favoriteBtn: document.getElementById('favoriteBtn'),
    favoriteIcon: document.getElementById('favoriteIcon'),
    recommendedCarousel: document.getElementById('recommendedCarousel'),
    loadingSkeleton: document.getElementById('loadingSkeleton'),
    onboardingModal: document.getElementById('onboardingModal'),
    closeOnboarding: document.getElementById('closeOnboarding'),
    platformPills: document.getElementById('platformPills'),
    tvEpisodeBar: document.getElementById('tvEpisodeBar'),
    seasonSelect: document.getElementById('seasonSelect'),
    episodeSelect: document.getElementById('episodeSelect'),
    downloadBtn: document.getElementById('downloadBtn'),
    downloadModal: document.getElementById('downloadModal'),
    closeDownloadModal: document.getElementById('closeDownloadModal'),
    streamUrlInput: document.getElementById('streamUrlInput'),
    copyStreamUrlBtn: document.getElementById('copyStreamUrlBtn')
};

function detectWatchRegion() {
    try {
        const locale = navigator.language || 'en-US';
        const maximized = new Intl.Locale(locale).maximize();
        const region = maximized.region || locale.split('-')[1];
        return (region && region.length === 2) ? region.toUpperCase() : 'US';
    } catch {
        const parts = (navigator.language || 'en-US').split('-');
        return parts[1] ? parts[1].toUpperCase() : 'US';
    }
}

function mediaTypeOf(item) {
    if (!item) return 'movie';
    if (item.media_type === 'tv' || item.mediaType === 'tv') return 'tv';
    if (item.media_type === 'movie' || item.mediaType === 'movie') return 'movie';
    if (item.first_air_date && !item.release_date) return 'tv';
    if (item.name && !item.title) return 'tv';
    return 'movie';
}

function itemTitle(item) {
    return item?.title || item?.name || 'Untitled';
}

function itemDate(item) {
    return item?.release_date || item?.first_air_date || '';
}

function itemYear(item) {
    const date = itemDate(item);
    return date ? new Date(date).getFullYear() : 'N/A';
}

function tagMedia(items, fallbackType) {
    return (items || []).map((item) => ({
        ...item,
        media_type: item.media_type || fallbackType
    }));
}

function withPosters(items) {
    return (items || []).filter((item) => item.poster_path && item.media_type !== 'person');
}

function favoriteKey(item) {
    return `${mediaTypeOf(item)}-${item.id}`;
}

function isFavorite(item) {
    return state.favorites.some((fav) => favoriteKey(fav) === favoriteKey(item));
}

function ratingRingHTML(score) {
    const value = Number(score) || 0;
    const pct = Math.max(0, Math.min(100, (value / 10) * 100));
    const colorClass = value >= 7 ? 'ring-green' : value >= 5 ? 'ring-orange' : 'ring-red';
    const radius = 15.5;
    const circumference = 2 * Math.PI * radius;
    const dash = (pct / 100) * circumference;
    return `
        <div class="rating-ring ${colorClass}" aria-label="Rating ${value.toFixed(1)}">
            <svg viewBox="0 0 36 36">
                <circle class="ring-track" cx="18" cy="18" r="${radius}"></circle>
                <circle class="ring-fill" cx="18" cy="18" r="${radius}"
                    stroke-dasharray="${dash} ${circumference}"
                    transform="rotate(-90 18 18)"></circle>
            </svg>
            <span>${value ? value.toFixed(1) : '—'}</span>
        </div>
    `;
}

// Initialize Application
async function init() {
    checkApiKey();
    applyTheme();
    setupEventListeners();
    setupHeroObserver();
    showLoading();

    if (!state.hasShownOnboarding) {
        elements.onboardingModal.classList.remove('hidden');
    }

    try {
        await fetchGenres();
        await Promise.all([
            loadNowPlaying(),
            loadTopMovies(),
            loadTopSeries(),
            loadActionMovies(),
            loadComedyMovies()
        ]);
        renderRecentlyWatched();
        hideLoading();
    } catch (error) {
        console.error('Initialization error:', error);
        hideLoading();
        showError(`Failed to load content: ${error.message}. Check console for details.`);
    }
}

function checkApiKey() {
    // API key is handled server-side via the /api/tmdb proxy
    // Always hide the alert and return true - the proxy will return errors if the key is missing
    if (elements.apiKeyAlert) {
        elements.apiKeyAlert.classList.add('hidden');
    }
    return true;
}

function applyTheme() {
    if (state.isDarkMode) {
        document.body.classList.remove('light');
        elements.themeIcon.innerHTML = '<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>';
    } else {
        document.body.classList.add('light');
        elements.themeIcon.innerHTML = '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>';
    }
}

function toggleTheme() {
    state.isDarkMode = !state.isDarkMode;
    localStorage.setItem('blvckstream_theme', state.isDarkMode ? 'dark' : 'light');
    applyTheme();
}

function setupEventListeners() {
    elements.logoBtn.addEventListener('click', () => {
        setActiveCategory('home');
        showHomeView();
    });

    elements.themeToggleBtn.addEventListener('click', toggleTheme);
    window.addEventListener('scroll', handleNavbarScroll);
    window.addEventListener('scroll', handleInfiniteScroll);

    let searchTimeout;
    elements.searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => handleSearch(e.target.value), 500);
    });

    elements.favoritesBtn.addEventListener('click', toggleFavoritesView);
    elements.genreSelect.addEventListener('change', (e) => handleGenreFilter(e.target.value));

    if (elements.genreChips) {
        elements.genreChips.addEventListener('click', (e) => {
            const chip = e.target.closest('.genre-chip');
            if (!chip) return;
            elements.genreChips.querySelectorAll('.genre-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const genreId = chip.getAttribute('data-genre-id');
            handleGenreFilter(genreId);
        });
    }

    elements.categoryNav?.querySelectorAll('.cat-pill').forEach((btn) => {
        btn.addEventListener('click', () => handleCategoryClick(btn.dataset.category));
    });

    document.querySelectorAll('.carousel-arrow').forEach((btn) => {
        btn.addEventListener('click', () => scrollCarousel(btn.dataset.target, Number(btn.dataset.dir)));
    });

    document.querySelectorAll('.view-all-link').forEach((btn) => {
        btn.addEventListener('click', () => showSectionGrid(btn.dataset.section));
    });

    elements.platformPills?.querySelectorAll('.platform-pill').forEach((btn) => {
        btn.addEventListener('click', () => handlePlatformFilter(btn));
    });

    const openHeroItem = () => {
        if (state.activeMovie) {
            showPlayerView(state.activeMovie);
        } else {
            showError('No title selected. Please try selecting one from a carousel.');
        }
    };

    elements.heroWatchBtn.addEventListener('click', openHeroItem);
    elements.heroDetailsBtn?.addEventListener('click', openHeroItem);

    if (elements.heroVolumeBtn) {
        elements.heroVolumeBtn.addEventListener('click', toggleHeroVolume);
    }

    elements.backToHomeBtn.addEventListener('click', () => {
        if (state.currentView === 'sports' || state.currentView === 'sports-player') {
            showSportsView();
            return;
        }
        showHomeView();
    });
    elements.favoriteBtn.addEventListener('click', toggleFavorite);

    elements.closeOnboarding.addEventListener('click', () => {
        elements.onboardingModal.classList.add('hidden');
        localStorage.setItem('blvckstream_onboarding', 'true');
        state.hasShownOnboarding = true;
    });

    // Download modal event listeners
    elements.downloadBtn.addEventListener('click', showDownloadModal);
    elements.closeDownloadModal.addEventListener('click', hideDownloadModal);
    elements.copyStreamUrlBtn.addEventListener('click', copyStreamUrl);

    if (elements.sourceSelectorBtn) {
        elements.sourceSelectorBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            elements.sourceDropdownMenu.classList.toggle('hidden');
        });
    }

    document.addEventListener('click', (e) => {
        if (elements.sourceDropdownMenu && !elements.sourceDropdownMenu.classList.contains('hidden')) {
            if (!elements.sourceSelectorBtn.contains(e.target) && !elements.sourceDropdownMenu.contains(e.target)) {
                elements.sourceDropdownMenu.classList.add('hidden');
            }
        }
    });

    elements.seasonSelect?.addEventListener('change', () => {
        state.tvSeason = Number(elements.seasonSelect.value) || 1;
        populateEpisodeSelect();
        loadVideoEmbed(state.activeMovie, state.videoProviderIndex);
    });

    elements.episodeSelect?.addEventListener('change', () => {
        state.tvEpisode = Number(elements.episodeSelect.value) || 1;
        loadVideoEmbed(state.activeMovie, state.videoProviderIndex);
    });

    // Sports Category Sub-nav Listener
    if (elements.sportsCategoryNav) {
        elements.sportsCategoryNav.addEventListener('click', (e) => {
            const pill = e.target.closest('.sports-pill');
            if (!pill) return;
            document.querySelectorAll('.sports-pill').forEach(btn => btn.classList.remove('active'));
            pill.classList.add('active');
            const sport = pill.getAttribute('data-sport') || 'football';
            state.selectedSport = sport;
            loadSportsMatches(sport);
        });
    }

    // Sports League Sub-nav Listener
    if (elements.sportsLeagueNav) {
        elements.sportsLeagueNav.addEventListener('click', (e) => {
            const pill = e.target.closest('.league-pill');
            if (!pill) return;
            document.querySelectorAll('.league-pill').forEach(btn => btn.classList.remove('active'));
            pill.classList.add('active');
            const league = pill.getAttribute('data-league') || 'all';
            state.selectedLeague = league;
            applySportsLeagueFilter();
        });
    }

    // Sports Hero Watch Button Listener
    if (elements.sportsHeroWatchBtn) {
        elements.sportsHeroWatchBtn.addEventListener('click', () => {
            if (state.featuredSportsMatch) {
                openSportsMatch(state.featuredSportsMatch);
            }
        });
    }
}

function handleNavbarScroll() {
    if (window.scrollY > 50) {
        elements.navbar.classList.add('navbar-scrolled');
    } else {
        elements.navbar.classList.remove('navbar-scrolled');
    }
}

function setActiveCategory(category) {
    state.activeCategory = category;
    elements.categoryNav?.querySelectorAll('.cat-pill').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
}

function scrollCarousel(targetId, direction) {
    const carousel = document.getElementById(targetId);
    if (!carousel) return;
    const amount = Math.min(carousel.clientWidth * 0.85, 720);
    carousel.scrollBy({ left: amount * direction, behavior: 'smooth' });
}

async function fetchFromTMDB(endpoint) {
    const url = `${TMDB_PROXY_URL}?path=${encodeURIComponent(endpoint)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        return response.json();
    } catch (error) {
        throw new Error(`Failed to fetch: ${error.message}`);
    }
}

async function fetchGenres() {
    try {
        const data = await fetchFromTMDB('/genre/movie/list?language=en-US');
        state.genres = data.genres;
        populateGenreFilter();
    } catch (error) {
        console.error('Error fetching genres:', error);
    }
}

function populateGenreFilter() {
    state.genres.forEach((genre) => {
        const option = document.createElement('option');
        option.value = genre.id;
        option.textContent = genre.name;
        elements.genreSelect.appendChild(option);
    });
}

async function loadNowPlaying() {
    try {
        const data = await fetchFromTMDB('/trending/movie/week');
        const movies = withPosters(tagMedia(data.results, 'movie'));
        state.sections.nowPlaying = movies;
        if (movies.length > 0) {
            state.activeMovie = movies[0];
            updateHeroBanner(movies[0], movies);
            renderCarousel(elements.nowPlayingCarousel, movies);
        } else {
            elements.nowPlayingCarousel.innerHTML = '<p class="empty-state">No titles available</p>';
        }
    } catch (error) {
        console.error('Error loading now playing:', error);
        elements.nowPlayingCarousel.innerHTML = `<p class="error-state">${error.message}</p>`;
    }
}

async function loadTopMovies() {
    try {
        const data = await fetchFromTMDB('/movie/now_playing?language=en-US');
        const movies = withPosters(tagMedia(data.results, 'movie')).slice(0, 6);
        state.sections.topMovies = movies;
        renderCarousel(elements.topMoviesCarousel, movies, { ranked: true });
    } catch (error) {
        console.error('Error loading top movies:', error);
        elements.topMoviesCarousel.innerHTML = `<p class="error-state">${error.message}</p>`;
    }
}

async function loadTopSeries() {
    try {
        const data = await fetchFromTMDB('/trending/tv/week');
        const shows = withPosters(tagMedia(data.results, 'tv')).slice(0, 6);
        state.sections.topSeries = shows;
        renderCarousel(elements.topSeriesCarousel, shows, { ranked: true });
    } catch (error) {
        console.error('Error loading top series:', error);
        elements.topSeriesCarousel.innerHTML = `<p class="error-state">${error.message}</p>`;
    }
}

async function loadActionMovies() {
    try {
        const data = await fetchFromTMDB('/discover/movie?with_genres=28&language=en-US&sort_by=popularity.desc');
        const movies = withPosters(tagMedia(data.results, 'movie'));
        state.sections.action = movies;
        renderCarousel(elements.actionCarousel, movies);
    } catch (error) {
        console.error('Error loading action movies:', error);
        showError('Failed to load action movies');
    }
}

async function loadComedyMovies() {
    try {
        const data = await fetchFromTMDB('/discover/movie?with_genres=35&language=en-US&sort_by=popularity.desc');
        const movies = withPosters(tagMedia(data.results, 'movie'));
        state.sections.comedy = movies;
        renderCarousel(elements.comedyCarousel, movies);
    } catch (error) {
        console.error('Error loading comedy movies:', error);
        showError('Failed to load comedy movies');
    }
}

async function handleSearch(query) {
    if (!query.trim()) {
        if (state.activeCategory === 'home') {
            showHomeView();
        } else {
            handleCategoryClick(state.activeCategory);
        }
        return;
    }

    showLoading();
    try {
        const endpoint = `/search/multi?query=${encodeURIComponent(query)}&language=en-US`;
        const data = await fetchFromTMDB(endpoint);
        const results = withPosters(data.results);
        state.searchResults = results;
        renderBrowseGrid(results, `Results for “${query.trim()}”`, {
            page: data.page,
            totalPages: data.total_pages,
            endpoint: endpoint,
            fallback: undefined
        });
        hideLoading();
    } catch (error) {
        console.error('Search error:', error);
        hideLoading();
        showError('Search failed. Please try again.');
    }
}

async function handleGenreFilter(genreId) {
    if (!genreId) {
        showHomeView();
        return;
    }

    showLoading();
    try {
        const endpoint = `/discover/movie?with_genres=${genreId}&language=en-US&sort_by=popularity.desc`;
        const data = await fetchFromTMDB(endpoint);
        const movies = withPosters(tagMedia(data.results, 'movie'));
        const genreName = state.genres.find((g) => String(g.id) === String(genreId))?.name || 'Genre';
        renderBrowseGrid(movies, genreName, {
            page: data.page,
            totalPages: data.total_pages,
            endpoint: endpoint,
            fallback: 'movie'
        });
        hideLoading();
    } catch (error) {
        console.error('Genre filter error:', error);
        hideLoading();
        showError('Failed to load movies for this genre.');
    }
}

async function handleCategoryClick(category) {
    setActiveCategory(category);
    document.querySelectorAll('.platform-pill').forEach((btn) => btn.classList.remove('active'));

    if (category === 'home') {
        showHomeView();
        return;
    }

    if (category === 'sports') {
        try {
            await loadSportsMatches(state.selectedSport || 'football');
        } catch (error) {
            console.error('Sports loading error:', error);
            showError('Failed to load sports matches.');
        }
        return;
    }

    showLoading();
    try {
        const endpoint = CATEGORY_ENDPOINTS[category];
        const data = await fetchFromTMDB(endpoint);
        const fallback = category === 'movies' ? 'movie' : (category === 'trending' ? undefined : 'tv');
        const items = withPosters(fallback ? tagMedia(data.results, fallback) : data.results);
        renderBrowseGrid(items, SECTION_TITLES[category] || 'Browse', {
            page: data.page,
            totalPages: data.total_pages,
            endpoint: endpoint,
            fallback: fallback
        });
        hideLoading();
    } catch (error) {
        console.error('Category filter error:', error);
        hideLoading();
        showError('Failed to load this category.');
    }
}

async function handlePlatformFilter(button) {
    const providerId = button.dataset.providerId;
    const label = button.textContent.trim();
    const alreadyActive = button.classList.contains('active');

    document.querySelectorAll('.platform-pill').forEach((btn) => btn.classList.remove('active'));
    if (alreadyActive) {
        showHomeView();
        return;
    }

    button.classList.add('active');
    showLoading();
    try {
        const endpoint = `/discover/movie?with_watch_providers=${providerId}&watch_region=${state.watchRegion}&watch_monetization_types=flatrate&sort_by=popularity.desc&language=en-US`;
        const data = await fetchFromTMDB(endpoint);
        const movies = withPosters(tagMedia(data.results, 'movie'));
        renderBrowseGrid(movies, `On ${label} · ${state.watchRegion}`, {
            page: data.page,
            totalPages: data.total_pages,
            endpoint: endpoint,
            fallback: 'movie'
        });
        hideLoading();
    } catch (error) {
        console.error('Platform filter error:', error);
        hideLoading();
        showError('Failed to load titles for this platform.');
    }
}

async function showSectionGrid(sectionKey) {
    showLoading();
    try {
        const endpoints = {
            nowPlaying: '/movie/now_playing?language=en-US',
            topMovies: '/trending/movie/week',
            topSeries: '/trending/tv/week',
            action: '/discover/movie?with_genres=28&language=en-US&sort_by=popularity.desc',
            comedy: '/discover/movie?with_genres=35&language=en-US&sort_by=popularity.desc',
            trending: '/trending/all/week',
            movies: '/discover/movie?language=en-US&sort_by=popularity.desc',
            tv: '/discover/tv?language=en-US&sort_by=popularity.desc',
            anime: '/discover/tv?with_genres=16&with_origin_country=JP&language=en-US&sort_by=popularity.desc'
        };
        const fallbacks = {
            nowPlaying: 'movie',
            topMovies: 'movie',
            topSeries: 'tv',
            action: 'movie',
            comedy: 'movie',
            trending: undefined,
            movies: 'movie',
            tv: 'tv',
            anime: 'tv'
        };

        const endpoint = endpoints[sectionKey];
        if (!endpoint) {
            const items = state.sections[sectionKey] || [];
            renderBrowseGrid(items, SECTION_TITLES[sectionKey] || 'Browse');
            hideLoading();
            return;
        }

        const data = await fetchFromTMDB(endpoint);
        const fallback = fallbacks[sectionKey];
        const items = withPosters(fallback ? tagMedia(data.results, fallback) : data.results);
        renderBrowseGrid(items, SECTION_TITLES[sectionKey] || 'Browse', {
            page: data.page,
            totalPages: data.total_pages,
            endpoint: endpoint,
            fallback: fallback
        });
        hideLoading();
    } catch (error) {
        console.error('Error loading section grid:', error);
        hideLoading();
        showError('Failed to load this section.');
    }
}

function renderNowWatchingList(items) {
    if (!elements.nowWatchingList) return;
    elements.nowWatchingList.innerHTML = '';
    const slice = items.slice(1, 4);
    slice.forEach(item => {
        const card = document.createElement('div');
        card.className = 'now-watching-card';
        const imgUrl = item.backdrop_path
            ? `${TMDB_IMAGE_BASE_URL}${item.backdrop_path}`
            : (item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : '');
        
        const type = mediaTypeOf(item) === 'tv' ? 'Series' : 'Movie';
        const rating = item.vote_average ? item.vote_average.toFixed(1) : '4.8';
        const year = itemYear(item);

        card.innerHTML = `
            <div class="now-watching-thumb">
                <img src="${imgUrl}" alt="${itemTitle(item)}" loading="lazy">
                <div class="now-watching-play">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </div>
            </div>
            <div class="now-watching-info">
                <div class="now-watching-name">${itemTitle(item)}</div>
                <div class="now-watching-sub">${year} · ${type}</div>
                <div class="now-watching-meta">
                    <span>★ ${rating} IMDB</span>
                </div>
            </div>
        `;
        card.addEventListener('click', () => showPlayerView(item));
        elements.nowWatchingList.appendChild(card);
    });
}

function updateHeroBanner(item, moviesList = []) {
    const backdropUrl = item.backdrop_path
        ? `${TMDB_BACKDROP_BASE_URL}${item.backdrop_path}`
        : (item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : '');

    if (elements.heroBackdrop) {
        elements.heroBackdrop.style.backgroundImage = backdropUrl ? `url(${backdropUrl})` : 'none';
    }
    if (elements.heroTitle) elements.heroTitle.textContent = itemTitle(item);
    if (elements.heroOverview) elements.heroOverview.textContent = item.overview || 'No description available.';
    if (elements.heroYear) elements.heroYear.textContent = itemYear(item);
    if (elements.heroRating) {
        elements.heroRating.textContent = item.vote_average
            ? `★ ${item.vote_average.toFixed(1)} IMDB`
            : '★ 4.8 IMDB';
    }

    if (elements.heroTypeBadge) {
        elements.heroTypeBadge.textContent = mediaTypeOf(item) === 'tv' ? 'TV SERIES' : 'MOVIE';
    }

    // Hero carousel dots
    if (elements.heroDots && Array.isArray(moviesList) && moviesList.length > 0) {
        elements.heroDots.innerHTML = '';
        const dotsCount = Math.min(4, moviesList.length);
        for (let i = 0; i < dotsCount; i++) {
            const dot = document.createElement('div');
            dot.className = `hero-dot ${moviesList[i].id === item.id ? 'active' : ''}`;
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                state.activeMovie = moviesList[i];
                updateHeroBanner(moviesList[i], moviesList);
            });
            elements.heroDots.appendChild(dot);
        }
    }

    // Now watching panel
    if (Array.isArray(moviesList) && moviesList.length > 1) {
        renderNowWatchingList(moviesList);
    }

    loadHeroTrailer(item);
}

async function loadHeroTrailer(item) {
    if (!elements.heroVideoWrap || !elements.heroVideoIframe) return;

    // On mobile screens, skip trailer entirely — just keep the poster backdrop
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
        elements.heroVideoWrap.classList.add('hidden');
        if (elements.heroVolumeBtn) elements.heroVolumeBtn.classList.add('hidden');
        return;
    }

    elements.heroVideoWrap.classList.add('hidden');
    if (elements.heroVolumeBtn) elements.heroVolumeBtn.classList.add('hidden');
    elements.heroVideoIframe.src = '';

    try {
        const type = mediaTypeOf(item);
        const data = await fetchFromTMDB(`/${type}/${item.id}/videos?language=en-US`);
        if (!data || !data.results || data.results.length === 0) return;

        const trailer = data.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer')
                     || data.results.find((v) => v.site === 'YouTube' && v.type === 'Teaser')
                     || data.results.find((v) => v.site === 'YouTube');

        if (trailer && trailer.key) {
            const embedUrl = `https://www.youtube.com/embed/${trailer.key}?enablejsapi=1&autoplay=1&mute=1&controls=0&disablekb=1&fs=0&iv_load_policy=3&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${trailer.key}&playsinline=1`;
            elements.heroVideoIframe.src = embedUrl;

            elements.heroVideoIframe.onload = () => {
                if (state.currentView === 'home') {
                    elements.heroVideoWrap.classList.remove('hidden');
                    if (elements.heroVolumeBtn) elements.heroVolumeBtn.classList.remove('hidden');
                    updateHeroVolumeUI();
                    setupUserActivationAudio();
                }
            };
        }
    } catch (error) {
        console.warn('Could not load hero trailer:', error);
    }
}

function setupUserActivationAudio() {
    const activate = () => {
        if (!state.heroMuted && elements.heroVideoIframe && elements.heroVideoIframe.contentWindow) {
            elements.heroVideoIframe.contentWindow.postMessage(
                JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
                '*'
            );
        }
    };
    activate();
    ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach((evt) => {
        window.addEventListener(evt, activate, { once: true });
    });
}

function toggleHeroVolume() {
    state.heroMuted = !state.heroMuted;
    updateHeroVolumeUI();

    if (elements.heroVideoIframe && elements.heroVideoIframe.contentWindow) {
        const command = state.heroMuted ? 'mute' : 'unMute';
        console.log('Sending volume command:', command);
        
        // Try multiple methods to ensure mute/unmute works
        elements.heroVideoIframe.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: command, args: [] }),
            '*'
        );
        
        // Also try direct method as fallback
        setTimeout(() => {
            elements.heroVideoIframe.contentWindow.postMessage(
                JSON.stringify({ event: 'command', func: command, args: [] }),
                '*'
            );
        }, 100);
        
        // Alternative: reload iframe with different mute parameter
        setTimeout(() => {
            if (state.activeMovie && elements.heroVideoIframe.src) {
                const currentSrc = elements.heroVideoIframe.src;
                const newSrc = state.heroMuted 
                    ? currentSrc.replace(/mute=0/, 'mute=1')
                    : currentSrc.replace(/mute=1/, 'mute=0');
                
                if (newSrc !== currentSrc) {
                    elements.heroVideoIframe.src = newSrc;
                }
            }
        }, 200);
    }
}

function updateHeroVolumeUI() {
    if (!elements.heroVolumeBtn || !elements.heroVolumeIcon) return;

    if (state.heroMuted) {
        elements.heroVolumeIcon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
        `;
        elements.heroVolumeBtn.setAttribute('aria-label', 'Unmute audio');
    } else {
        elements.heroVolumeIcon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        `;
        elements.heroVolumeBtn.setAttribute('aria-label', 'Mute audio');
    }
}

function pauseHeroTrailer() {
    if (elements.heroVideoIframe && elements.heroVideoIframe.contentWindow) {
        elements.heroVideoIframe.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
            '*'
        );
        // Also mute when pausing to ensure audio stops
        elements.heroVideoIframe.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'mute', args: [] }),
            '*'
        );
    }
}

function playHeroTrailer() {
    if (elements.heroVideoIframe && elements.heroVideoIframe.contentWindow && state.currentView === 'home') {
        elements.heroVideoIframe.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
            '*'
        );
        const command = state.heroMuted ? 'mute' : 'unMute';
        elements.heroVideoIframe.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: command, args: [] }),
            '*'
        );
    }
}

function setupHeroObserver() {
    if (!elements.heroBanner || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                if (state.currentView === 'home') playHeroTrailer();
            } else {
                pauseHeroTrailer();
            }
        });
    }, { threshold: 0.15 });

    observer.observe(elements.heroBanner);
}

function createMovieCard(item, options = {}) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const posterUrl = item.poster_path
        ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}`
        : 'https://via.placeholder.com/500x750/f4f4f7/a1a1aa?text=No+Image';

    const rank = options.rank;
    const rating = item.vote_average ? item.vote_average.toFixed(1) : '4.8';

    card.innerHTML = `
        <div class="card-poster">
            <img src="${posterUrl}" alt="${itemTitle(item)}" loading="lazy">
            <div class="card-play-overlay">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </div>
            ${typeof rank === 'number' ? `<div class="card-rank-badge">${rank}</div>` : ''}
        </div>
        <div class="card-meta-row">
            <span class="card-rating">${rating}</span>
            <span class="card-imdb">IMDB</span>
        </div>
        <div class="card-title">${itemTitle(item)}</div>
    `;

    card.addEventListener('click', () => showPlayerView(item));
    return card;
}

function renderCarousel(container, items, options = {}) {
    if (!container) return;
    container.innerHTML = '';
    items.forEach((item, index) => {
        container.appendChild(createMovieCard(item, {
            rank: options.ranked ? index + 1 : undefined
        }));
    });
}

function toggleScrollLoader(show) {
    let loader = document.getElementById('scrollLoader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'scrollLoader';
        loader.className = 'scroll-loader hidden';
        loader.innerHTML = '<div class="spinner"></div><span>Loading more content…</span>';
        elements.searchResultsSection.appendChild(loader);
    }
    loader.classList.toggle('hidden', !show);
}

async function loadMoreContent() {
    if (!state.pagination || !state.pagination.hasMore || state.pagination.loadingMore) return;

    state.pagination.loadingMore = true;
    toggleScrollLoader(true);

    const { currentPage, currentEndpoint, currentFallback } = state.pagination;
    const nextPage = currentPage + 1;
    const separator = currentEndpoint.includes('?') ? '&' : '?';
    const nextPageEndpoint = `${currentEndpoint}${separator}page=${nextPage}`;

    try {
        const data = await fetchFromTMDB(nextPageEndpoint);
        
        if (data && data.results && data.results.length) {
            const items = withPosters(currentFallback ? tagMedia(data.results, currentFallback) : data.results);
            
            items.forEach((item) => {
                elements.searchResults.appendChild(createMovieCard(item));
            });

            state.pagination.currentPage = nextPage;
            state.pagination.totalPages = data.total_pages || state.pagination.totalPages;
            state.pagination.hasMore = nextPage < state.pagination.totalPages;
        } else {
            state.pagination.hasMore = false;
        }
    } catch (error) {
        console.error('Error loading more content:', error);
    } finally {
        state.pagination.loadingMore = false;
        toggleScrollLoader(false);
    }
}

function handleInfiniteScroll() {
    if (!elements.searchResultsSection.classList.contains('hidden')) {
        const threshold = 800; // Load 800px before reaching the bottom
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - threshold) {
            loadMoreContent();
        }
    }
}

function renderBrowseGrid(items, title, paginationContext = null) {
    pauseHeroTrailer();
    elements.homeView.classList.add('hidden');
    elements.favoritesSection.classList.add('hidden');
    elements.sportsSection.classList.add('hidden');
    elements.playerView.classList.add('hidden');
    elements.searchResultsSection.classList.remove('hidden');
    if (elements.browseTitle) elements.browseTitle.textContent = title;

    elements.searchResults.innerHTML = '';
    if (!items.length) {
        elements.searchResults.innerHTML = '<p class="empty-state">No results found</p>';
        return;
    }

    items.forEach((item) => {
        elements.searchResults.appendChild(createMovieCard(item));
    });

    if (paginationContext) {
        state.pagination = {
            currentPage: paginationContext.page || 1,
            totalPages: paginationContext.totalPages || 1,
            loadingMore: false,
            hasMore: (paginationContext.page || 1) < (paginationContext.totalPages || 1),
            currentEndpoint: paginationContext.endpoint,
            currentFallback: paginationContext.fallback
        };
    } else {
        state.pagination = null;
    }
    toggleScrollLoader(false);
}

async function showPlayerView(item) {
    pauseHeroTrailer();
    state.currentView = 'player';
    state.activeMovie = item;
    state.videoProviderIndex = 0;
    state.tvSeason = 1;
    state.tvEpisode = 1;

    elements.homeView.classList.add('hidden');
    elements.searchResultsSection.classList.add('hidden');
    elements.favoritesSection.classList.add('hidden');
    elements.playerView.classList.remove('hidden');
    elements.playerView.classList.add('fade-in');

    elements.playerTitle.textContent = itemTitle(item);
    const date = itemDate(item);
    elements.playerReleaseDate.textContent = date
        ? `${mediaTypeOf(item) === 'tv' ? 'First aired' : 'Released'}: ${new Date(date).toLocaleDateString()}`
        : 'Release date: N/A';
    elements.playerOverview.textContent = item.overview || 'No description available.';

    updateFavoriteButton();
    addToRecentlyWatched(item);

    if (mediaTypeOf(item) === 'tv') {
        elements.tvEpisodeBar?.classList.remove('hidden');
        await loadTvSeasons(item.id);
    } else {
        elements.tvEpisodeBar?.classList.add('hidden');
    }

    loadVideoEmbed(item);
    loadRecommendations(item);
    window.scrollTo(0, 0);
}

async function loadTvSeasons(tvId) {
    try {
        const data = await fetchFromTMDB(`/tv/${tvId}?language=en-US`);
        state.tvSeasons = (data.seasons || []).filter((season) => season.season_number > 0);
        if (elements.seasonSelect) {
            elements.seasonSelect.innerHTML = '';
            state.tvSeasons.forEach((season) => {
                const option = document.createElement('option');
                option.value = season.season_number;
                option.textContent = season.name || `Season ${season.season_number}`;
                elements.seasonSelect.appendChild(option);
            });
        }
        state.tvSeason = Number(elements.seasonSelect?.value) || 1;
        populateEpisodeSelect();
        if (data.overview) {
            elements.playerOverview.textContent = data.overview;
        }
    } catch (error) {
        console.warn('Could not load TV seasons:', error);
        populateEpisodeSelect();
    }
}

function populateEpisodeSelect() {
    if (!elements.episodeSelect) return;
    const season = state.tvSeasons.find((s) => s.season_number === state.tvSeason);
    const count = season?.episode_count || 12;
    elements.episodeSelect.innerHTML = '';
    for (let i = 1; i <= count; i += 1) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Episode ${i}`;
        elements.episodeSelect.appendChild(option);
    }
    state.tvEpisode = 1;
}

function loadVideoEmbed(item, providerIndex = 0) {
    const provider = VIDEO_PROVIDERS[providerIndex];
    if (!provider || !item) {
        elements.loadingSpinner.classList.add('hidden');
        showError('All video sources failed. Please try again later.');
        return;
    }

    state.videoProviderIndex = providerIndex;
    elements.loadingSpinner.classList.remove('hidden');
    elements.videoContainer.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.src = provider.buildUrl(item);
    iframe.className = 'video-container';
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture');
    iframe.setAttribute('referrerpolicy', 'origin');
    // Removed sandbox attribute to allow video player to function

    iframe.onload = () => {
        elements.loadingSpinner.classList.add('hidden');
    };

    elements.videoContainer.appendChild(iframe);
    updateVideoSourceBar(item, provider.name);
}

function updateVideoSourceBar(item, providerName) {
    if (elements.selectedSourceName) {
        elements.selectedSourceName.textContent = providerName;
    }

    if (elements.sourceDropdownMenu) {
        elements.sourceDropdownMenu.innerHTML = '';
        VIDEO_PROVIDERS.forEach((provider, index) => {
            const btn = document.createElement('button');
            btn.className = `dropdown-item ${index === state.videoProviderIndex ? 'active' : ''}`;
            btn.type = 'button';
            btn.textContent = provider.name;
            btn.addEventListener('click', () => {
                loadVideoEmbed(item, index);
                elements.sourceDropdownMenu.classList.add('hidden');
            });
            elements.sourceDropdownMenu.appendChild(btn);
        });
    }
}

async function loadRecommendations(item) {
    try {
        const type = mediaTypeOf(item);
        const data = await fetchFromTMDB(`/${type}/${item.id}/recommendations?language=en-US`);
        renderCarousel(elements.recommendedCarousel, withPosters(tagMedia(data.results, type)));
    } catch (error) {
        console.error('Error loading recommendations:', error);
        elements.recommendedCarousel.innerHTML = '<p class="empty-state">No recommendations available</p>';
    }
}

function showHomeView() {
    state.currentView = 'home';
    setActiveCategory('home');
    document.querySelectorAll('.platform-pill').forEach((btn) => btn.classList.remove('active'));
    if (elements.genreSelect) elements.genreSelect.value = '';

    elements.playerView.classList.add('hidden');
    elements.searchResultsSection.classList.add('hidden');
    elements.favoritesSection.classList.add('hidden');
    elements.sportsSection.classList.add('hidden');
    elements.homeView.classList.remove('hidden');
    elements.homeView.classList.add('fade-in');

    elements.videoContainer.innerHTML = '';
    window.scrollTo(0, 0);
    playHeroTrailer();
}

function toggleFavoritesView() {
    if (state.favorites.length === 0) {
        showError('No favorites yet. Add some titles to your list!');
        return;
    }

    pauseHeroTrailer();
    elements.homeView.classList.add('hidden');
    elements.searchResultsSection.classList.add('hidden');
    elements.playerView.classList.add('hidden');
    elements.favoritesSection.classList.remove('hidden');
    elements.favoritesSection.classList.add('fade-in');
    renderFavorites();
}

function renderFavorites() {
    elements.favoritesGrid.innerHTML = '';
    state.favorites.forEach((item) => {
        elements.favoritesGrid.appendChild(createMovieCard(item));
    });
}

function toggleFavorite() {
    if (!state.activeMovie) return;

    const index = state.favorites.findIndex((fav) => favoriteKey(fav) === favoriteKey(state.activeMovie));
    if (index > -1) {
        state.favorites.splice(index, 1);
    } else {
        state.favorites.push(state.activeMovie);
    }

    localStorage.setItem('blvckstream_favorites', JSON.stringify(state.favorites));
    updateFavoriteButton();
}

function updateFavoriteButton() {
    const fav = state.activeMovie && isFavorite(state.activeMovie);
    if (fav) {
        elements.favoriteIcon.classList.add('favorite-active');
        elements.favoriteIcon.setAttribute('fill', 'currentColor');
    } else {
        elements.favoriteIcon.classList.remove('favorite-active');
        elements.favoriteIcon.setAttribute('fill', 'none');
    }
}

function addToRecentlyWatched(item) {
    if (!item) return;

    // Remove if already exists (to move to top)
    const index = state.recentlyWatched.findIndex((watched) => favoriteKey(watched) === favoriteKey(item));
    if (index > -1) {
        state.recentlyWatched.splice(index, 1);
    }

    // Add to beginning with timestamp
    state.recentlyWatched.unshift({
        ...item,
        watchedAt: Date.now()
    });

    // Limit to last 20 items
    if (state.recentlyWatched.length > 20) {
        state.recentlyWatched = state.recentlyWatched.slice(0, 20);
    }

    localStorage.setItem('blvckstream_recently_watched', JSON.stringify(state.recentlyWatched));
}

function renderRecentlyWatched() {
    if (!elements.recentlyWatchedCarousel) return;

    elements.recentlyWatchedCarousel.innerHTML = '';

    if (state.recentlyWatched.length === 0) {
        return;
    }

    const moviesWithPosters = state.recentlyWatched.filter((item) => item.poster_path);
    renderCarousel(elements.recentlyWatchedCarousel, moviesWithPosters);
}

function parseMatchDate(value) {
    const ts = Number(value);
    if (!Number.isFinite(ts) || ts <= 0) return null;
    return new Date(ts < 1e12 ? ts * 1000 : ts);
}

function isMatchLive(match) {
    if (match.status === 'live' || match.isLive) return true;
    const date = parseMatchDate(match.date);
    if (!date) return false;
    const start = date.getTime();
    const now = Date.now();
    return now >= start - 20 * 60 * 1000 && now <= start + 3 * 60 * 60 * 1000;
}

const BALLON_DOR_EVENT = {
    id: 'ballon-dor-gala',
    isSpecialEvent: true,
    title: "Ballon d'Or 2024 Gala Ceremony",
    category: 'football',
    league: "Ballon d'Or · France Football",
    competition: "Ballon d'Or",
    popular: true,
    isLive: true,
    poster: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80',
    date: Date.now(),
    teams: {
        home: {
            name: "Ballon d'Or Gala",
            badge: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="22" r="15" fill="%23d4af37"/><circle cx="20" cy="18" r="14" fill="%23f59e0b" opacity="0.6"/><path d="M24 7 C 20 14, 28 20, 24 37" stroke="%2392400e" stroke-width="1.5" fill="none"/><path d="M11 22 C 18 18, 30 26, 37 22" stroke="%2392400e" stroke-width="1.5" fill="none"/><ellipse cx="24" cy="40" rx="9" ry="3.5" fill="%2378350f"/><rect x="21" y="35" width="6" height="5" fill="%2392400e"/></svg>'
        },
        away: {
            name: "Théâtre du Châtelet, Paris",
            badge: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="24" fill="%230f172a"/><path d="M24 10 L27 18 L35 19 L29 25 L31 33 L24 29 L17 33 L19 25 L13 19 L21 18 Z" fill="%23d4af37"/></svg>'
        }
    },
    overview: "The 68th annual Ballon d'Or ceremony presented by France Football and UEFA live from the Théâtre du Châtelet in Paris, honoring the world's best football players.",
    sources: [
        {
            name: "L'Équipe Official Gala Stream (1080p)",
            language: "Official Stream",
            hd: true,
            embedUrl: "https://www.youtube-nocookie.com/embed/5aQ2hNglq14?autoplay=1"
        },
        {
            name: "UEFA Live Gala Stream",
            language: "English",
            hd: true,
            embedUrl: "https://www.youtube-nocookie.com/embed/wzXQo6uP4eM?autoplay=1"
        },
        {
            name: "International Red Carpet & Ceremony Feed",
            language: "International",
            hd: true,
            embedUrl: "https://www.youtube-nocookie.com/embed/Y7dpJ0oseIA?autoplay=1"
        }
    ]
};

const TOP_LEAGUE_KEYWORDS = {
    ballondor: ['ballon', "ballon d'or", 'ballondor', 'france football', 'chatelet', 'gala'],
    ucl: ['Champions League', 'UCL', 'UEFA Champions', 'Europa League', 'Conference League', 'Super Cup'],
    epl: ['Premier League', 'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Ipswich', 'Leicester', 'Liverpool', 'Man City', 'Manchester City', 'Man United', 'Manchester United', 'Newcastle', 'Nottingham Forest', 'Southampton', 'Tottenham', 'Spurs', 'West Ham', 'Wolves', 'Sunderland', 'Leeds'],
    laliga: ['La Liga', 'LaLiga', 'Real Madrid', 'Barcelona', 'Atletico Madrid', 'Sevilla', 'Real Betis', 'Athletic Bilbao', 'Real Sociedad', 'Valencia', 'Villarreal', 'Girona', 'Mallorca', 'Osasuna', 'Getafe', 'Celta Vigo', 'Rayo Vallecano', 'Espanyol', 'Las Palmas'],
    seriea: ['Serie A', 'Inter', 'AC Milan', 'Juventus', 'Napoli', 'Atalanta', 'Roma', 'Lazio', 'Fiorentina', 'Torino', 'Bologna', 'Udinese', 'Genoa', 'Monza', 'Parma', 'Como'],
    bundesliga: ['Bundesliga', 'Bayern', 'Leverkusen', 'Borussia Dortmund', 'Dortmund', 'RB Leipzig', 'Leipzig', 'Eintracht Frankfurt', 'Frankfurt', 'Wolfsburg', 'Gladbach', 'Stuttgart', 'Freiburg', 'Mainz', 'Werder Bremen', 'Hoffenheim', 'Union Berlin', 'St Pauli', 'Kaiserslautern', 'Hannover'],
    ligue1: ['Ligue 1', 'Paris FC', 'PSG', 'Paris Saint-Germain', 'Marseille', 'Monaco', 'Lyon', 'Lille', 'Lens', 'Nice', 'Rennes', 'Reims', 'Strasbourg', 'Brest', 'Nantes', 'Toulouse']
};

function detectMatchLeagueKey(match) {
    if (match.id === 'ballon-dor-gala' || match.isSpecialEvent) return 'ballondor';
    const text = (match.title || '') + ' ' + (match.league || '') + ' ' + (match.competition || '');
    for (const [key, keywords] of Object.entries(TOP_LEAGUE_KEYWORDS)) {
        if (keywords.some(kw => text.toLowerCase().includes(kw.toLowerCase()))) {
            return key;
        }
    }
    return null;
}

function formatMatchLeague(match) {
    if (match.id === 'ballon-dor-gala' || match.isSpecialEvent) return "Ballon d'Or · France Football";
    if (match.league) return match.league;
    if (match.competition) return match.competition;
    
    const key = detectMatchLeagueKey(match);
    if (key === 'ballondor') return "Ballon d'Or · France Football";
    if (key === 'ucl') return 'UEFA Champions League';
    if (key === 'epl') return 'Premier League';
    if (key === 'laliga') return 'La Liga';
    if (key === 'seriea') return 'Serie A';
    if (key === 'bundesliga') return 'Bundesliga';
    if (key === 'ligue1') return 'Ligue 1';

    return match.category ? match.category.toUpperCase() : 'FOOTBALL';
}

function sortMatchesByPopularity(matches) {
    return matches.slice().sort((a, b) => {
        // Pinned special events (like Ballon d'Or) always rank top
        if ((a.isSpecialEvent || a.id === 'ballon-dor-gala') && !(b.isSpecialEvent || b.id === 'ballon-dor-gala')) return -1;
        if (!(a.isSpecialEvent || a.id === 'ballon-dor-gala') && (b.isSpecialEvent || b.id === 'ballon-dor-gala')) return 1;

        const liveA = isMatchLive(a) ? 1 : 0;
        const liveB = isMatchLive(b) ? 1 : 0;
        if (liveA !== liveB) return liveB - liveA; // Live matches first

        const popA = (a.popular || detectMatchLeagueKey(a) !== null) ? 1 : 0;
        const popB = (b.popular || detectMatchLeagueKey(b) !== null) ? 1 : 0;
        if (popA !== popB) return popB - popA; // Popular & Top Leagues next

        return (a.date || 0) - (b.date || 0); // Earliest next
    });
}

function updateLeagueNavPills(matches) {
    if (!elements.sportsLeagueNav) return;
    
    const counts = {
        all: matches.length,
        popular: matches.filter(m => m.popular || detectMatchLeagueKey(m) !== null).length,
        ballondor: matches.filter(m => detectMatchLeagueKey(m) === 'ballondor').length || 1,
        ucl: matches.filter(m => detectMatchLeagueKey(m) === 'ucl').length,
        epl: matches.filter(m => detectMatchLeagueKey(m) === 'epl').length,
        laliga: matches.filter(m => detectMatchLeagueKey(m) === 'laliga').length,
        seriea: matches.filter(m => detectMatchLeagueKey(m) === 'seriea').length,
        bundesliga: matches.filter(m => detectMatchLeagueKey(m) === 'bundesliga').length,
        ligue1: matches.filter(m => detectMatchLeagueKey(m) === 'ligue1').length
    };

    const isFootball = state.selectedSport === 'football';

    let html = `
        <button class="league-pill ${state.selectedLeague === 'all' ? 'active' : ''}" type="button" data-league="all">
            🏆 All Matches <span class="pill-count">${counts.all}</span>
        </button>
        <button class="league-pill ${state.selectedLeague === 'popular' ? 'active' : ''}" type="button" data-league="popular">
            🔥 Popular & Top <span class="pill-count">${counts.popular}</span>
        </button>
    `;

    if (isFootball) {
        html += `
            <button class="league-pill ballon-dor-pill ${state.selectedLeague === 'ballondor' ? 'active' : ''}" type="button" data-league="ballondor">
                ✨ Ballon d'Or <span class="pill-count">LIVE</span>
            </button>
            <button class="league-pill ${state.selectedLeague === 'ucl' ? 'active' : ''}" type="button" data-league="ucl">
                🇪🇺 Champions League ${counts.ucl ? `<span class="pill-count">${counts.ucl}</span>` : ''}
            </button>
            <button class="league-pill ${state.selectedLeague === 'epl' ? 'active' : ''}" type="button" data-league="epl">
                🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League ${counts.epl ? `<span class="pill-count">${counts.epl}</span>` : ''}
            </button>
            <button class="league-pill ${state.selectedLeague === 'laliga' ? 'active' : ''}" type="button" data-league="laliga">
                🇪🇸 La Liga ${counts.laliga ? `<span class="pill-count">${counts.laliga}</span>` : ''}
            </button>
            <button class="league-pill ${state.selectedLeague === 'seriea' ? 'active' : ''}" type="button" data-league="seriea">
                🇮🇹 Serie A ${counts.seriea ? `<span class="pill-count">${counts.seriea}</span>` : ''}
            </button>
            <button class="league-pill ${state.selectedLeague === 'bundesliga' ? 'active' : ''}" type="button" data-league="bundesliga">
                🇩🇪 Bundesliga ${counts.bundesliga ? `<span class="pill-count">${counts.bundesliga}</span>` : ''}
            </button>
            <button class="league-pill ${state.selectedLeague === 'ligue1' ? 'active' : ''}" type="button" data-league="ligue1">
                🇫🇷 Ligue 1 ${counts.ligue1 ? `<span class="pill-count">${counts.ligue1}</span>` : ''}
            </button>
        `;
    }

    elements.sportsLeagueNav.innerHTML = html;
}

function applySportsLeagueFilter() {
    const rawMatches = state.allSportsMatches || [];
    const sorted = sortMatchesByPopularity(rawMatches);

    let filtered = sorted;
    if (state.selectedLeague && state.selectedLeague !== 'all') {
        if (state.selectedLeague === 'popular') {
            filtered = sorted.filter(m => m.popular || detectMatchLeagueKey(m) !== null);
        } else {
            filtered = sorted.filter(m => detectMatchLeagueKey(m) === state.selectedLeague);
        }
    }

    const liveMatches = filtered.filter((match) => isMatchLive(match));
    const upcomingMatches = filtered.filter((match) => !isMatchLive(match));

    // Pick top featured match (prioritize Ballon d'Or when selected)
    const featured = state.selectedLeague === 'ballondor'
        ? (filtered[0] || BALLON_DOR_EVENT)
        : (liveMatches[0] || filtered.find(m => m.popular) || filtered[0] || sorted[0]);

    state.featuredSportsMatch = featured;
    if (featured) {
        renderSportsHero(featured);
    } else {
        if (elements.sportsHero) elements.sportsHero.classList.add('hidden');
    }

    renderSportsMatches(liveMatches, upcomingMatches, state.selectedSport, state.selectedLeague);
}

function matchTeamDetails(match) {
    const homeTeam = match.teams?.home?.name || match.homeTeam || match.home || match.title?.split(' vs')[0] || 'Home Team';
    const awayTeam = match.teams?.away?.name || match.awayTeam || match.away || match.title?.split(/vs\.?\s/i)[1] || 'Away Team';
    const homeBadge = match.teams?.home?.badge || null;
    const awayBadge = match.teams?.away?.badge || null;
    return { homeTeam, awayTeam, homeBadge, awayBadge };
}

async function fetchSportsDetail(matchId, category = state.selectedSport || 'football') {
    const response = await fetch(`${SPORTSRC_API}/?data=detail&category=${encodeURIComponent(category)}&id=${encodeURIComponent(matchId)}`);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    return payload?.data || payload;
}

async function loadSportsMatches(category = state.selectedSport || 'football') {
    state.selectedSport = category;
    state.selectedLeague = 'all';
    showLoading();
    try {
        const response = await fetch(`${SPORTSRC_API}/?data=matches&category=${encodeURIComponent(category)}`);
        const data = await response.json();
        let matches = data?.data || data;

        if (!Array.isArray(matches)) matches = [];

        // If category is football, ensure BALLON_DOR_EVENT is included at the top
        if (category === 'football') {
            const hasBallon = matches.some(m => m.id === 'ballon-dor-gala' || detectMatchLeagueKey(m) === 'ballondor');
            if (!hasBallon) {
                matches = [BALLON_DOR_EVENT, ...matches];
            }
        }

        if (matches.length) {
            state.allSportsMatches = matches;
            updateLeagueNavPills(matches);
            applySportsLeagueFilter();
            showSportsView();
        } else {
            state.allSportsMatches = [];
            if (elements.sportsHero) elements.sportsHero.classList.add('hidden');
            updateLeagueNavPills([]);
            elements.sportsGrid.innerHTML = `
                <div class="empty-state" style="text-align:center; padding:3.5rem 1rem;">
                    <div style="font-size:3rem; margin-bottom:1rem;">🏟️</div>
                    <p style="font-size:1.15rem; color:var(--text); font-weight:700;">No ${category.replace('-', ' ')} matches scheduled right now</p>
                    <p style="color:var(--text-secondary); margin-top:0.5rem; font-size:0.9rem;">Check back closer to game time or choose another sport above.</p>
                </div>
            `;
            showSportsView();
        }
    } catch (error) {
        console.error('Error loading sports matches:', error);
        if (category === 'football') {
            state.allSportsMatches = [BALLON_DOR_EVENT];
            updateLeagueNavPills(state.allSportsMatches);
            applySportsLeagueFilter();
            showSportsView();
        } else {
            if (elements.sportsHero) elements.sportsHero.classList.add('hidden');
            elements.sportsGrid.innerHTML = `<p class="error-state" style="text-align:center; padding:2rem;">Error loading matches: ${error.message}</p>`;
            showSportsView();
        }
    } finally {
        hideLoading();
    }
}

function showSportsView() {
    pauseHeroTrailer();
    state.currentView = 'sports';
    elements.homeView.classList.add('hidden');
    elements.searchResultsSection.classList.add('hidden');
    elements.favoritesSection.classList.add('hidden');
    elements.playerView.classList.add('hidden');
    elements.sportsSection.classList.remove('hidden');
    window.scrollTo(0, 0);
}

function renderSportsHero(match) {
    if (!elements.sportsHero || !match) {
        if (elements.sportsHero) elements.sportsHero.classList.add('hidden');
        return;
    }

    const { homeTeam, awayTeam, homeBadge, awayBadge } = matchTeamDetails(match);
    const league = formatMatchLeague(match);
    const live = isMatchLive(match);
    const matchDate = parseMatchDate(match.date);
    const time = matchDate
        ? matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : (match.time || 'Live');

    if (elements.sportsHeroBackdrop) {
        const posterUrl = match.poster || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1400&q=80';
        elements.sportsHeroBackdrop.style.backgroundImage = `url('${posterUrl}')`;
    }

    if (elements.sportsHeroLiveTag) {
        elements.sportsHeroLiveTag.textContent = live ? '🔴 LIVE NOW' : '⏱ UPCOMING MATCH';
        elements.sportsHeroLiveTag.className = live ? 'match-live-pulse-badge' : 'sports-hero-league';
    }

    if (elements.sportsHeroLeague) elements.sportsHeroLeague.textContent = league;
    if (elements.sportsHeroHomeName) elements.sportsHeroHomeName.textContent = homeTeam;
    if (elements.sportsHeroAwayName) elements.sportsHeroAwayName.textContent = awayTeam;

    if (elements.sportsHeroHomeBadge) {
        if (homeBadge) {
            elements.sportsHeroHomeBadge.src = homeBadge;
            elements.sportsHeroHomeBadge.style.display = 'block';
        } else {
            elements.sportsHeroHomeBadge.style.display = 'none';
        }
    }

    if (elements.sportsHeroAwayBadge) {
        if (awayBadge) {
            elements.sportsHeroAwayBadge.src = awayBadge;
            elements.sportsHeroAwayBadge.style.display = 'block';
        } else {
            elements.sportsHeroAwayBadge.style.display = 'none';
        }
    }

    if (elements.sportsHeroTime) {
        elements.sportsHeroTime.textContent = live ? (match.score ? `${match.score.home} - ${match.score.away}` : 'In Progress') : `${time}`;
    }

    elements.sportsHero.classList.remove('hidden');
}

function renderSportsMatches(liveMatches, upcomingMatches, category, leagueKey = 'all') {
    elements.sportsGrid.innerHTML = '';

    if ((!liveMatches || liveMatches.length === 0) && (!upcomingMatches || upcomingMatches.length === 0)) {
        const leagueName = leagueKey !== 'all' ? leagueKey.toUpperCase() : category;
        elements.sportsGrid.innerHTML = `
            <div class="empty-state" style="text-align:center; padding:3rem 1rem;">
                <p style="font-size:1.1rem; color:var(--text); font-weight:700;">No live or upcoming matches found for ${leagueName}</p>
                <p style="color:var(--text-secondary); margin-top:0.4rem; font-size:0.9rem;">Select "All Matches" above to view all available fixtures.</p>
            </div>
        `;
        return;
    }

    if (liveMatches && liveMatches.length > 0) {
        const liveSection = document.createElement('div');
        liveSection.className = 'sports-group-section';
        liveSection.innerHTML = `
            <div class="sports-group-header">
                <h3 class="sports-group-title">
                    <span>🔴 Live Now</span>
                    <span class="sports-group-count">${liveMatches.length}</span>
                </h3>
            </div>
            <div class="sports-match-grid"></div>
        `;
        const grid = liveSection.querySelector('.sports-match-grid');
        liveMatches.forEach((match) => grid.appendChild(createMatchCard(match)));
        elements.sportsGrid.appendChild(liveSection);
    }

    if (upcomingMatches && upcomingMatches.length > 0) {
        const upcomingSection = document.createElement('div');
        upcomingSection.className = 'sports-group-section';
        upcomingSection.innerHTML = `
            <div class="sports-group-header">
                <h3 class="sports-group-title">
                    <span>📅 Upcoming Fixtures & Top Matches</span>
                    <span class="sports-group-count">${upcomingMatches.length}</span>
                </h3>
            </div>
            <div class="sports-match-grid"></div>
        `;
        const grid = upcomingSection.querySelector('.sports-match-grid');
        upcomingMatches.forEach((match) => grid.appendChild(createMatchCard(match)));
        elements.sportsGrid.appendChild(upcomingSection);
    }
}

function createMatchCard(match) {
    const card = document.createElement('div');
    const isSpecial = match.isSpecialEvent || match.id === 'ballon-dor-gala';
    card.className = `match-card-modern ${isSpecial ? 'special-event-card' : ''}`;

    const { homeTeam, awayTeam, homeBadge, awayBadge } = matchTeamDetails(match);
    const league = formatMatchLeague(match);
    const live = isMatchLive(match);
    const matchDate = parseMatchDate(match.date);
    const time = matchDate
        ? matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : (match.time || 'TBD');
    const score = match.score ? `${match.score.home} - ${match.score.away}` : (isSpecial ? 'GALA' : 'VS');
    const posterUrl = match.poster || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80';

    card.innerHTML = `
        <div class="match-card-poster" style="background-image: url('${posterUrl}');"></div>
        <div class="match-card-overlay"></div>
        <div class="match-card-body">
            <div class="match-card-top">
                <span class="match-card-league">${league}</span>
                <div class="match-card-badge-wrap">
                    ${isSpecial ? '<span class="match-pill-gala">🏆 GALA</span>' : ''}
                    ${match.popular && !isSpecial ? '<span class="match-pill-popular">🔥 Hot</span>' : ''}
                    ${live ? '<span class="match-pill-live">🔴 LIVE</span>' : `<span class="match-pill-time">⏱ ${time}</span>`}
                </div>
            </div>
            
            <div class="match-card-center">
                <div class="match-card-team home">
                    <div class="match-team-icon-wrap">
                        ${homeBadge ? `<img class="match-team-icon" src="${homeBadge}" alt="${homeTeam}" onerror="this.style.display='none'" />` : '<span style="font-size:1.1rem">🛡️</span>'}
                    </div>
                    <span class="match-team-name-text">${homeTeam}</span>
                </div>
                
                <div class="match-card-vs-box">
                    <span class="match-vs-tag">${live ? score : (isSpecial ? 'GALA' : 'VS')}</span>
                </div>
                
                <div class="match-card-team away">
                    <div class="match-team-icon-wrap">
                        ${awayBadge ? `<img class="match-team-icon" src="${awayBadge}" alt="${awayTeam}" onerror="this.style.display='none'" />` : '<span style="font-size:1.1rem">🛡️</span>'}
                    </div>
                    <span class="match-team-name-text">${awayTeam}</span>
                </div>
            </div>

            <div class="match-card-action">
                <button class="match-watch-btn-modern" type="button">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    <span>${live ? 'Watch Live Stream' : 'Watch Stream'}</span>
                </button>
            </div>
        </div>
    `;

    card.addEventListener('click', () => {
        openSportsMatch(match);
    });

    return card;
}

async function openSportsMatch(match) {
    if (!match?.id) {
        showError('Stream not available for this match');
        return;
    }

    const { homeTeam, awayTeam } = matchTeamDetails(match);
    const league = match.league || match.competition || 'Sports';

    state.currentView = 'sports-player';
    state.sportsSources = [];
    state.sportsSourceIndex = 0;
    elements.tvEpisodeBar?.classList.add('hidden');

    elements.homeView.classList.add('hidden');
    elements.searchResultsSection.classList.add('hidden');
    elements.favoritesSection.classList.add('hidden');
    elements.sportsSection.classList.add('hidden');
    elements.playerView.classList.remove('hidden');
    elements.playerView.classList.add('fade-in');

    elements.playerTitle.textContent = match.title || `${homeTeam} vs ${awayTeam}`;
    elements.playerReleaseDate.textContent = league;
    elements.playerOverview.textContent = match.overview || (isMatchLive(match) ? 'Live match' : 'Loading stream sources…');
    elements.videoContainer.innerHTML = '';
    elements.loadingSpinner.classList.remove('hidden');
    if (elements.selectedSourceName) elements.selectedSourceName.textContent = 'Loading…';
    window.scrollTo(0, 0);

    // If sources are already pre-configured (e.g. Ballon d'Or or custom special event)
    if (Array.isArray(match.sources) && match.sources.length > 0) {
        state.sportsSources = match.sources;
        loadSportsEmbed(0);
        return;
    }

    try {
        const detail = await fetchSportsDetail(match.id, match.category || state.selectedSport || 'football');
        const sources = (detail?.sources || []).filter((source) => source.embedUrl);
        if (!sources.length) {
            elements.loadingSpinner.classList.add('hidden');
            elements.videoContainer.innerHTML = '<p class="error-state">Stream not available for this match</p>';
            showError('Stream not available for this match');
            return;
        }

        state.sportsSources = sources;
        elements.playerOverview.textContent = isMatchLive(detail) || isMatchLive(match)
            ? 'Live match'
            : (detail.title || 'Match stream');
        loadSportsEmbed(0);
    } catch (error) {
        console.error('Error loading match stream:', error);
        elements.loadingSpinner.classList.add('hidden');
        elements.videoContainer.innerHTML = '<p class="error-state">Failed to load stream</p>';
        showError('Failed to load stream for this match.');
    }
}

function sportsSourceLabel(source, index) {
    const quality = source.hd ? 'HD' : 'SD';
    const language = source.language || `Source ${index + 1}`;
    return `${language} · ${quality}`;
}

function loadSportsEmbed(sourceIndex = 0) {
    const source = state.sportsSources[sourceIndex];
    if (!source?.embedUrl) {
        elements.loadingSpinner.classList.add('hidden');
        elements.videoContainer.innerHTML = '<p class="error-state">Stream not available for this match</p>';
        showError('Stream not available for this match');
        return;
    }

    state.sportsSourceIndex = sourceIndex;
    elements.loadingSpinner.classList.remove('hidden');
    elements.videoContainer.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.src = source.embedUrl;
    iframe.className = 'video-container';
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture');

    iframe.onload = () => {
        elements.loadingSpinner.classList.add('hidden');
    };

    elements.videoContainer.appendChild(iframe);
    updateSportsSourceBar();
}

function updateSportsSourceBar() {
    const current = state.sportsSources[state.sportsSourceIndex];
    if (elements.selectedSourceName) {
        elements.selectedSourceName.textContent = current
            ? sportsSourceLabel(current, state.sportsSourceIndex)
            : 'No source';
    }

    if (!elements.sourceDropdownMenu) return;
    elements.sourceDropdownMenu.innerHTML = '';
    state.sportsSources.forEach((source, index) => {
        const btn = document.createElement('button');
        btn.className = `dropdown-item ${index === state.sportsSourceIndex ? 'active' : ''}`;
        btn.type = 'button';
        btn.textContent = sportsSourceLabel(source, index);
        btn.addEventListener('click', () => {
            loadSportsEmbed(index);
            elements.sourceDropdownMenu.classList.add('hidden');
        });
        elements.sourceDropdownMenu.appendChild(btn);
    });
}

function showLoading() {
    elements.loadingSkeleton.classList.remove('hidden');
}

function hideLoading() {
    elements.loadingSkeleton.classList.add('hidden');
}

function showError(message) {
const errorDiv = document.createElement('div');
errorDiv.className = 'toast-error';
errorDiv.textContent = message;
document.body.appendChild(errorDiv);

setTimeout(() => errorDiv.remove(), 5000);
}

// Download Modal Functions
async function showDownloadModal() {
if (!state.activeMovie) {
    showError('No movie selected');
    return;
}

elements.downloadModal.classList.remove('hidden');
elements.streamUrlInput.value = 'Loading stream URL...';

try {
    // Fetch HLS stream URL from ezvidapi
    const provider = VIDEO_PROVIDERS[state.videoProviderIndex || 0];
    const streamUrl = await fetchStreamUrl(state.activeMovie, provider);
    
    if (streamUrl) {
        elements.streamUrlInput.value = streamUrl;
    } else {
        elements.streamUrlInput.value = 'Could not fetch stream URL. Try a different server.';
    }
} catch (error) {
    console.error('Error fetching stream URL:', error);
    elements.streamUrlInput.value = 'Error fetching stream URL. Please try again.';
}
}

function hideDownloadModal() {
elements.downloadModal.classList.add('hidden');
}

async function fetchStreamUrl(item, provider) {
// Try to get HLS stream URL from ezvidapi
try {
    const tmdbId = item.id;
    const type = mediaTypeOf(item);
    
    // Use ezvidapi's stream endpoint
    let apiUrl;
    if (type === 'tv') {
        apiUrl = `https://ezvidapi.com/movie/vidsrc/${tmdbId}`;
    } else {
        apiUrl = `https://ezvidapi.com/movie/vidsrc/${tmdbId}`;
    }

    // Since ezvidapi returns iframe embeds, we'll use the embed URL as the stream URL
    // Users can use tools like yt-dlp to extract the actual HLS stream from the embed
    return provider.buildUrl(item);
} catch (error) {
    console.error('Error fetching stream URL:', error);
    return null;
}
}

function copyStreamUrl() {
const streamUrl = elements.streamUrlInput.value;
if (streamUrl && streamUrl !== 'Loading stream URL...' && !streamUrl.startsWith('Error') && !streamUrl.startsWith('Could not')) {
    navigator.clipboard.writeText(streamUrl).then(() => {
        const originalText = elements.copyStreamUrlBtn.innerHTML;
        elements.copyStreamUrlBtn.innerHTML = 'Copied!';
        setTimeout(() => {
            elements.copyStreamUrlBtn.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        showError('Failed to copy to clipboard');
    });
} else {
    showError('No valid stream URL to copy');
}
}

if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', init);
} else {
init();
}
