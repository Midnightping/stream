export default async function handler(req, res) {
  const { path } = req.query || {};

  if (!path) {
    return res.status(400).json({ error: 'Missing path' });
  }

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'TMDB_API_KEY is not configured' });
  }

  try {
    const tmdbUrl = `https://api.themoviedb.org/3${path}${path.includes('?') ? '&' : '?'}api_key=${apiKey}`;
    const response = await fetch(tmdbUrl);

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text || 'TMDB request failed');
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('TMDB proxy error:', error);
    return res.status(500).json({ error: 'Failed to fetch TMDB data' });
  }
}
