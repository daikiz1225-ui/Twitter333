// api/nitter.js
const fetch = require('node-fetch');

export default async function handler(req, res) {
  // 1. 世界のどこかで動いている「公開Nitter」をターゲットにする
  const NITTER_INSTANCES = [
    'https://nitter.privacydev.net',
    'https://nitter.perennialte.ch',
    'https://nitter.cz'
  ];
  // ランダムに一つ選ぶ（負荷分散）
  const target = NITTER_INSTANCES[Math.floor(Math.random() * NITTER_INSTANCES.length)];

  // 2. あなたのサイトへのリクエストパスをそのまま転送
  const path = req.url.replace('/api/nitter', '');
  const url = `${target}${path}`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...' }
    });

    // 3. 取得したHTMLの「nitter.net」などの文字を「自分のドメイン」に書き換える
    let data = await response.text();
    const myDomain = req.headers.host;
    data = data.replace(new RegExp(target, 'g'), `https://${myDomain}/api/nitter`);

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send("中継に失敗したよ。別のインスタンスを試してみて！");
  }
}
