export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const urls = (req.body.urls || [])
    .map(u => u.trim().replace(/\/$/, ""))
    .filter(Boolean);

  const TIMEOUT = 7000;

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

  async function safeCheck(base, path) {
    const r = await fetchWithTimeout(`${base}${path}`);
    if (!r || !r.ok) return false;

    try {
      await r.json();
      return true;
    } catch {
      return false;
    }
  }

  async function checkInstance(base) {
    const start = Date.now();

    let score = 0;

    // ① stats（最重要）
    const stats = await safeCheck(base, "/api/v1/stats");
    if (stats) score++;

    // ② search（重要）
    const search = await safeCheck(base, "/api/v1/search?q=test");
    if (search) score++;

    // ③ video（補助）
    let videoOk = false;
    const video = await fetchWithTimeout(
      `${base}/api/v1/videos/dQw4w9WgXcQ`
    );

    if (video && video.ok) {
      try {
        const data = await video.json();
        if (data?.videoId || data?.title) {
          videoOk = true;
          score++;
        }
      } catch {
        // 無視
      }
    }

    const ms = Date.now() - start;

    // ★ここが重要：1つでも動けば候補
    if (score === 0) return null;

    // ★生存判定（2以上で“安定”）
    const alive = score >= 2;

    return {
      base,
      ms,
      score,
      alive,
      checks: {
        stats,
        search,
        video: videoOk
      }
    };
  }

  const results = await Promise.all(urls.map(checkInstance));

  const valid = results
    .filter(Boolean)
    .sort((a, b) => {
      // ① 安定性優先
      if (a.alive !== b.alive) return b.alive - a.alive;

      // ② スコア
      if (b.score !== a.score) return b.score - a.score;

      // ③ 速度
      return a.ms - b.ms;
    });

  res.status(200).json({
    best: valid[0] || null,
    all: valid
  });
}
