export default async function handler(req, res) {
  // 1. 公開インスタンスを一つに固定してテスト（動いたら増やしましょう）
  const target = 'https://nitter.privacydev.net';

  // 2. アクセス先URLを組み立て
  // req.url には "/api/nitter/search?q=..." などが入ってくる
  const path = req.url.replace('/api/nitter', '') || '/';
  const targetUrl = `${target}${path}`;

  console.log(`Forwarding to: ${targetUrl}`); // Vercelのログで確認用

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,webp,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
      }
    });

    if (!response.ok) {
      return res.status(response.status).send(`Nitter側がエラーを返しました: ${response.status}`);
    }

    let data = await response.text();

    // 3. HTML内のリンクを自分のサイト（Vercel）に向くように書き換え
    const myDomain = req.headers.host;
    // 全ての nitter リンクを自分に置き換える
    data = data.split(target).join(`https://${myDomain}/api/nitter`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(data);

  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ error: '中継サーバーでエラーが発生しました', details: error.message });
  }
}
