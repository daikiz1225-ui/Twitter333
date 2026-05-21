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

  async function checkInstance(base) {
    const start = Date.now();

    const result = {
      base,
      stats: false,
      search: false,
      video: false,
      ms: null,
    };

    const stats = await fetchWithTimeout(`${base}/api/v1/stats`);
    result.stats = !!(stats && stats.ok);

    const search = await fetchWithTimeout(`${base}/api/v1/search?q=test`);
    result.search = !!(search && search.ok);

    const video = await fetchWithTimeout(`${base}/api/v1/videos/dQw4w9WgXcQ`);
    result.video = !!(video && video.ok);

    result.ms = Date.now() - start;

    return result;
  }

  const results = await Promise.all(
    urls.map(u => checkInstance(u.trim()))
  );

  res.status(200).json(results);
}
