import { Scraper } from 'agent-twitter-client';

export default async function handler(req, res) {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Keyword required" });

    const scraper = new Scraper();
    try {
        // ログインなしでの検索。これが一番「Nitter」に近い動き。
        const results = await scraper.fetchSearchTweets(q, 20);
        
        const tweets = results.tweets.map(t => ({
            fullname: t.name || "User",
            username: "@" + t.username,
            avatar: t.user?.profile_image_url_https || "",
            content: t.text,
            likes: t.likes || 0,
            retweets: t.retweets || 0,
            time: t.timeParsed || "不明",
            link: `https://twitter.com/${t.username}/status/${t.id}`
        }));

        // いいね数順に並び替え
        tweets.sort((a, b) => b.likes - a.likes);

        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        res.status(200).json(tweets);
    } catch (error) {
        res.status(500).json({ error: "Fetch error", details: error.message });
    }
}
