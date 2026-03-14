export default async function handler(req, res) {
    const { q, type } = req.query;
    const searchQuery = type === 'trending' ? 'lang:ja' : q;
    
    // 稼働している可能性の高いインスタンスリスト
    const instances = [
        'https://nitter.privacydev.net',
        'https://nitter.net',
        'https://nitter.poast.org'
    ];

    let lastError = null;

    // 使えるインスタンスが見つかるまでループ
    for (const instance of instances) {
        try {
            const url = `${instance}/search?f=tweets&q=${encodeURIComponent(searchQuery)}`;
            
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            if (!response.ok) continue; // 失敗したら次のインスタンスへ

            const html = await response.text();
            const tweets = [];
            const blocks = html.split('class="timeline-item"').slice(1);

            if (blocks.length === 0) continue; // データが空なら次へ

            blocks.forEach(block => {
                const tweet = {
                    fullname: (block.match(/class="fullname"[^>]*>([^<]+)/) || [])[1] || "ユーザー",
                    username: (block.match(/class="username"[^>]*>([^<]+)/) || [])[1] || "@user",
                    avatar: instance + ((block.match(/class="avatar"[^>]*src="([^"]+)"/) || [])[1] || ""),
                    content: (block.match(/class="tweet-content[^>]*>([^<]+)/) || [])[1] || "",
                    likes: parseInt(((block.match(/class="icon-heart"><\/div>\s*([\d,]+)/) || [])[1] || "0").replace(/,/g, '')),
                    retweets: parseInt(((block.match(/class="icon-retweet"><\/div>\s*([\d,]+)/) || [])[1] || "0").replace(/,/g, '')),
                    time: (block.match(/class="tweet-date"[^>]*>([^<]+)/) || [])[1] || "不明"
                };
                if (tweet.content) tweets.push(tweet);
            });

            tweets.sort((a, b) => b.likes - a.likes);

            // 成功したらデータを返して終了
            res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
            return res.status(200).json(tweets);

        } catch (error) {
            lastError = error;
            console.log(`${instance} failed, trying next...`);
        }
    }

    // すべてのインスタンスがダメだった場合
    res.status(500).json({ error: "All instances failed", details: lastError?.message });
}
