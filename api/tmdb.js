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
    const isBearer = apiKey.startsWith('eyJ');
    const headers = { 'accept': 'application/json' };
    let tmdbUrl;

    if (isBearer) {
      headers['Authorization'] = `Bearer ${apiKey.trim()}`;
      tmdbUrl = `https://api.themoviedb.org/3${path}`;
    } else {
      tmdbUrl = `https://api.themoviedb.org/3${path}${path.includes('?') ? '&' : '?'}api_key=${apiKey.trim()}`;
    }

    const response = await fetch(tmdbUrl, { headers });

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
