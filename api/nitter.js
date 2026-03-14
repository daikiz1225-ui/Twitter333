export default async function handler(req, res) {
    const { q, type } = req.query;
    
    // 検索ワード：トレンドなら「lang:ja」、検索なら入力ワード
    const searchQuery = type === 'trending' ? 'lang:ja' : q;
    // Nitterの公開インスタンス（負荷分散のため複数候補を知っておくと◎）
    const nitterInstance = 'https://nitter.net';
    const url = `${nitterInstance}/search?f=tweets&q=${encodeURIComponent(searchQuery)}`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) throw new Error('Nitter Access Denied');
        const html = await response.text();

        const tweets = [];
        // タイムラインの各アイテムを分割して解析
        const blocks = html.split('class="timeline-item"').slice(1);

        blocks.forEach(block => {
            const tweet = {
                fullname: (block.match(/class="fullname"[^>]*>([^<]+)/) || [])[1] || "ユーザー",
                username: (block.match(/class="username"[^>]*>([^<]+)/) || [])[1] || "@user",
                avatar: nitterInstance + ((block.match(/class="avatar"[^>]*src="([^"]+)"/) || [])[1] || ""),
                content: (block.match(/class="tweet-content[^>]*>([^<]+)/) || [])[1] || "",
                // いいね数とリポスト数を数値化（カンマ除去）
                likes: parseInt(((block.match(/class="icon-heart"><\/div>\s*([\d,]+)/) || [])[1] || "0").replace(/,/g, '')),
                retweets: parseInt(((block.match(/class="icon-retweet"><\/div>\s*([\d,]+)/) || [])[1] || "0").replace(/,/g, '')),
                time: (block.match(/class="tweet-date"[^>]*>([^<]+)/) || [])[1] || "不明"
            };
            // 本文が空でないものだけ採用
            if (tweet.content) tweets.push(tweet);
        });

        // いいね数（人気順）でソート
        tweets.sort((a, b) => b.likes - a.likes);

        // Vercelにキャッシュを指示（60秒間は高速に返す）
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        res.status(200).json(tweets);

    } catch (error) {
        res.status(500).json({ error: "Data Fetch Error" });
    }
}
