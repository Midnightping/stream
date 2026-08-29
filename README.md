# FlexStream - Premium Streaming Aggregator

A modern, responsive streaming media aggregator with a premium dark-theme UI. FlexStream connects TMDB movie metadata with multi-host video embedding for a seamless streaming experience.

## Features

- **Premium Dark UI**: Netflix-inspired interface with smooth animations
- **TMDB Integration**: Real-time movie data from The Movie Database
- **Video Embedding**: Multi-source video player with responsive design
- **Smart Search**: Real-time search with debouncing
- **Genre Filtering**: Browse movies by genre
- **Favorites System**: Save your favorite movies with localStorage persistence
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Loading States**: Skeleton screens and smooth transitions
- **Ad Disclaimer**: Transparent communication about third-party ads

## Setup Instructions

### 1. Get TMDB API Key

1. Visit [themoviedb.org](https://www.themoviedb.org/)
2. Sign up for a free account
3. Go to Settings > API > Create a new API key
4. Copy your API key

### 2. Configure API Key

Open `app.js` and replace the placeholder:

```javascript
const TMDB_API_KEY = "YOUR_KEY_HERE"; // Replace with your actual key
```

### 3. Run Locally

Simply open `index.html` in your browser, or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

## Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variable in Vercel dashboard:
   - Go to your project settings
   - Add environment variable: `TMDB_API_KEY`
   - Paste your TMDB API key

### Manual Deployment

The project consists of static files and can be deployed to any static hosting service:
- Netlify
- GitHub Pages
- AWS S3
- Cloudflare Pages

## Project Structure

```
flexstream/
├── index.html          # Main HTML structure
├── styles.css          # Custom CSS styles
├── app.js              # Core application logic
├── vercel.json         # Vercel configuration
└── README.md           # Documentation
```

## Technical Details

- **Framework**: Vanilla JavaScript with state management
- **Styling**: Tailwind CSS + Custom CSS
- **API**: TMDB v3 API
- **Video Engine**: Multiembed.mov
- **Storage**: localStorage for favorites
- **Responsive**: Mobile-first design approach

## API Endpoints Used

- `/trending/movie/week` - Trending movies
- `/search/movie` - Movie search
- `/discover/movie` - Genre-based discovery
- `/movie/{id}/recommendations` - Movie recommendations
- `/genre/movie/list` - Genre list

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project is for educational purposes. Please respect the terms of service of TMDB and the video embedding services used.

## Disclaimer

This application does not host any media files. It functions as a client-side directory that connects to public movie metadata and video embedding services. Any ads displayed in the video player originate from external file servers and are not controlled by this application.
