// TMDB API Configuration (switching back to TMDB for reliability)
const TMDB_API_KEY = "3a26347da92e2a6c5141f4e3fe0d6c2b";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/original";

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
    sportsSourceIndex: 0
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
    // API key is present, no alert needed
    if (elements.apiKeyAlert) {
        elements.apiKeyAlert.classList.add('hidden');
    }
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

    let searchTimeout;
    elements.searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => handleSearch(e.target.value), 500);
    });

    elements.favoritesBtn.addEventListener('click', toggleFavoritesView);
    elements.genreSelect.addEventListener('change', (e) => handleGenreFilter(e.target.value));

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
    if (!TMDB_API_KEY) {
        throw new Error('TMDB API Key is missing');
    }

    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${TMDB_BASE_URL}${endpoint}${separator}api_key=${TMDB_API_KEY}`;

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
            updateHeroBanner(movies[0]);
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
        const data = await fetchFromTMDB(`/search/multi?query=${encodeURIComponent(query)}&language=en-US`);
        const results = withPosters(data.results);
        state.searchResults = results;
        renderBrowseGrid(results, `Results for “${query.trim()}”`);
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
        const data = await fetchFromTMDB(`/discover/movie?with_genres=${genreId}&language=en-US&sort_by=popularity.desc`);
        const movies = withPosters(tagMedia(data.results, 'movie'));
        const genreName = state.genres.find((g) => String(g.id) === String(genreId))?.name || 'Genre';
        renderBrowseGrid(movies, genreName);
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
        showLoading();
        try {
            await loadFootballMatches();
            hideLoading();
        } catch (error) {
            console.error('Sports loading error:', error);
            hideLoading();
            showError('Failed to load football matches.');
        }
        return;
    }

    showLoading();
    try {
        const endpoint = CATEGORY_ENDPOINTS[category];
        const data = await fetchFromTMDB(endpoint);
        const fallback = category === 'movies' ? 'movie' : (category === 'trending' ? undefined : 'tv');
        const items = withPosters(fallback ? tagMedia(data.results, fallback) : data.results);
        renderBrowseGrid(items, SECTION_TITLES[category] || 'Browse');
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
        const data = await fetchFromTMDB(
            `/discover/movie?with_watch_providers=${providerId}&watch_region=${state.watchRegion}&watch_monetization_types=flatrate&sort_by=popularity.desc&language=en-US`
        );
        const movies = withPosters(tagMedia(data.results, 'movie'));
        renderBrowseGrid(movies, `On ${label} · ${state.watchRegion}`);
        hideLoading();
    } catch (error) {
        console.error('Platform filter error:', error);
        hideLoading();
        showError('Failed to load titles for this platform.');
    }
}

function showSectionGrid(sectionKey) {
    const items = state.sections[sectionKey] || [];
    renderBrowseGrid(items, SECTION_TITLES[sectionKey] || 'Browse');
}

function updateHeroBanner(item) {
    const backdropUrl = item.backdrop_path
        ? `${TMDB_BACKDROP_BASE_URL}${item.backdrop_path}`
        : '';

    elements.heroBackdrop.style.backgroundImage = backdropUrl ? `url(${backdropUrl})` : 'none';
    elements.heroTitle.textContent = itemTitle(item);
    elements.heroOverview.textContent = item.overview || 'No description available.';
    elements.heroYear.textContent = itemYear(item);
    elements.heroRating.textContent = item.vote_average
        ? `★ ${item.vote_average.toFixed(1)}`
        : '—';

    if (elements.heroTypeBadge) {
        elements.heroTypeBadge.textContent = mediaTypeOf(item) === 'tv' ? 'TV SERIES' : 'MOVIE';
    }

    loadHeroTrailer(item);
}

async function loadHeroTrailer(item) {
    if (!elements.heroVideoWrap || !elements.heroVideoIframe) return;

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
        : 'https://via.placeholder.com/500x750/14141a/71717a?text=No+Image';

    const year = itemYear(item);
    const rank = options.rank;

    card.innerHTML = `
        <div class="poster-wrap">
            <img src="${posterUrl}" alt="${itemTitle(item)}" loading="lazy" onerror="this.src='https://via.placeholder.com/500x750/14141a/71717a?text=No+Image'">
            ${ratingRingHTML(item.vote_average)}
            <div class="play-icon">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <div class="card-overlay">
                <p class="card-title line-clamp-2">${itemTitle(item)}</p>
                <p class="card-year">${year}</p>
            </div>
            ${typeof rank === 'number' ? `<div class="card-rank">${rank}</div>` : ''}
            ${isFavorite(item) ? '<div class="card-fav"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg></div>' : ''}
        </div>
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

function renderBrowseGrid(items, title) {
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

function matchTeamNames(match) {
    const homeTeam = match.teams?.home?.name || match.homeTeam || match.home || match.title?.split(' vs')[0] || 'Home Team';
    const awayTeam = match.teams?.away?.name || match.awayTeam || match.away || match.title?.split(/vs\.?\s/i)[1] || 'Away Team';
    return { homeTeam, awayTeam };
}

async function fetchSportsDetail(matchId) {
    const response = await fetch(`${SPORTSRC_API}/?data=detail&category=football&id=${encodeURIComponent(matchId)}`);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    return payload?.data || payload;
}

async function loadFootballMatches() {
    try {
        const response = await fetch(`${SPORTSRC_API}/?data=matches&category=football`);
        const data = await response.json();
        const matches = data?.data || data;

        if (Array.isArray(matches) && matches.length) {
            const liveMatches = matches.filter((match) => isMatchLive(match));
            const upcomingMatches = matches.filter((match) => !isMatchLive(match));
            renderFootballMatches(liveMatches, upcomingMatches);
            showSportsView();
        } else {
            elements.sportsGrid.innerHTML = '<p class="empty-state">No matches available at the moment</p>';
            showSportsView();
        }
    } catch (error) {
        console.error('Error loading football matches:', error);
        elements.sportsGrid.innerHTML = `<p class="error-state">Error loading matches: ${error.message}</p>`;
        showSportsView();
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

function renderFootballMatches(liveMatches, upcomingMatches) {
    elements.sportsGrid.innerHTML = '';

    if ((!liveMatches || liveMatches.length === 0) && (!upcomingMatches || upcomingMatches.length === 0)) {
        elements.sportsGrid.innerHTML = '<p class="empty-state">No matches available at the moment</p>';
        return;
    }

    if (liveMatches && liveMatches.length > 0) {
        const liveSection = document.createElement('div');
        liveSection.className = 'matches-section';
        liveSection.innerHTML = '<h3 class="matches-section-title">Live Matches</h3>';
        liveMatches.forEach((match) => liveSection.appendChild(createMatchCard(match)));
        elements.sportsGrid.appendChild(liveSection);
    }

    if (upcomingMatches && upcomingMatches.length > 0) {
        const upcomingSection = document.createElement('div');
        upcomingSection.className = 'matches-section';
        upcomingSection.innerHTML = '<h3 class="matches-section-title">Upcoming Fixtures</h3>';
        upcomingMatches.forEach((match) => upcomingSection.appendChild(createMatchCard(match)));
        elements.sportsGrid.appendChild(upcomingSection);
    }
}

function createMatchCard(match) {
    const card = document.createElement('div');
    card.className = 'match-card';

    const { homeTeam, awayTeam } = matchTeamNames(match);
    const league = match.league || match.competition || 'Football';
    const live = isMatchLive(match);
    const matchDate = parseMatchDate(match.date);
    const time = matchDate
        ? matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : (match.time || 'TBD');
    const score = match.score ? `${match.score.home} - ${match.score.away}` : 'vs';

    card.innerHTML = `
        <div class="match-header">
            <span class="match-league">${league}</span>
            ${live ? '<span class="match-live-badge">LIVE</span>' : ''}
        </div>
        <div class="match-content">
            <div class="match-team">
                <span class="team-name">${homeTeam}</span>
            </div>
            <div class="match-info">
                <span class="match-score">${score}</span>
                <span class="match-time">${time}</span>
            </div>
            <div class="match-team">
                <span class="team-name">${awayTeam}</span>
            </div>
        </div>
        <button class="watch-match-btn" type="button">Watch Stream</button>
    `;

    card.querySelector('.watch-match-btn').addEventListener('click', () => {
        openSportsMatch(match);
    });

    return card;
}

async function openSportsMatch(match) {
    if (!match?.id) {
        showError('Stream not available for this match');
        return;
    }

    const { homeTeam, awayTeam } = matchTeamNames(match);
    const league = match.league || match.competition || 'Football';

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
    elements.playerOverview.textContent = isMatchLive(match) ? 'Live match' : 'Loading stream sources…';
    elements.videoContainer.innerHTML = '';
    elements.loadingSpinner.classList.remove('hidden');
    if (elements.selectedSourceName) elements.selectedSourceName.textContent = 'Loading…';
    window.scrollTo(0, 0);

    try {
        const detail = await fetchSportsDetail(match.id);
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
