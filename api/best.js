export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const urls = (req.body.urls || [])
    .map(u => u.trim())
    .filter(Boolean);

  const TIMEOUT = 5000;

  async function fetchWithTimeout(url) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      return res;
    } catch {
      clearTimeout(id);
      return null;
    }
  }

  async function checkInstance(base) {
    const start = Date.now();

    let score = 0;

    // ① stats（重要）
    const stats = await fetchWithTimeout(`${base}/api/v1/stats`);
    if (stats && stats.ok) score++;

    // ② search（重要）
    const search = await fetchWithTimeout(`${base}/api/v1/search?q=test`);
    if (search && search.ok) score++;

    // ③ video（補助）
    let videoOk = false;
    const video = await fetchWithTimeout(
      `${base}/api/v1/videos/dQw4w9WgXcQ`
    );

    if (video && video.ok) {
      try {
        const data = await video.json();
        if (data && data.videoId) {
          videoOk = true;
          score++; // 加点扱い
        }
      } catch {
        // 無視
      }
    }

    const ms = Date.now() - start;

    // ❌ 完全死亡判定（statsもsearchも死んでる）
    if (score === 0) return null;

    return {
      base,
      ms,
      score,
      videoOk
    };
  }

  const results = await Promise.all(urls.map(checkInstance));

  const valid = results
    .filter(Boolean)
    .sort((a, b) => {
      // まずスコア優先 → 次に速度
      if (b.score !== a.score) return b.score - a.score;
      return a.ms - b.ms;
    });

  res.status(200).json({
    best: valid[0] || null,
    all: valid
  });
}
