export default async function handler(req, res) {
  // ブラウザで直接開けるか確認済みのURLに随時変えるのがコツ！
  const target = 'https://nitter.no-logs.com';

  const path = req.url.replace('/api/nitter', '') || '/';
  const targetUrl = `${target}${path}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const data = await response.text();
    
    // 文字列置換を最小限にしてエラーを防ぐ
    const myDomain = req.headers.host;
    const finalData = data.split(target).join(`https://${myDomain}`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(finalData);

  } catch (error) {
    // ここで失敗したら、targetのURL自体が死んでる可能性大！
    return res.status(500).json({ error: '接続失敗', details: error.message, target: target });
  }
}
