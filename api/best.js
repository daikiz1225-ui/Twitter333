export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const urls = req.body.urls || [];

  const TIMEOUT = 4000;

  async function fetchWithTimeout(url) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const r = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      return r;
    } catch {
      clearTimeout(id);
      return null;
    }
  }

  async function check(base) {
    const start = Date.now();

    const stats = await fetchWithTimeout(`${base}/api/v1/stats`);
    if (!stats || !stats.ok) return null;

    const search = await fetchWithTimeout(`${base}/api/v1/search?q=test`);
    if (!search || !search.ok) return null;

    const video = await fetchWithTimeout(`${base}/api/v1/videos/dQw4w9WgXcQ`);
    if (!video || !video.ok) return null;

    return {
      base,
      ms: Date.now() - start
    };
  }

  const results = await Promise.all(urls.map(u => check(u.trim())));

  const valid = results
    .filter(Boolean)
    .sort((a, b) => a.ms - b.ms);

  res.status(200).json({
    best: valid[0] || null,
    all: valid
  });
}
