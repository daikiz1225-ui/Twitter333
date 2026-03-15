// api/x.js
import { Scraper } from 'agent-twitter-client';

export default async function handler(req, res) {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Query is required" });

    const scraper = new Scraper();

    try {
        // ログインなしで検索結果（最新）を取得する非公式メソッドを叩く
        const tweets = [];
        // fetchSearchTweets は公開されているツイートを取得する
        const searchResults = await scraper.fetchSearchTweets(q, 20); 

        for (const t of searchResults.tweets) {
            tweets.push({
                fullname: t.name || "User",
                username: "@" + t.username,
                avatar: t.user?.profile_image_url_https || "",
                content: t.text,
                likes: t.likes || 0,
                retweets: t.retweets || 0,
                time: t.timeParsed || "Just now",
                link: `https://twitter.com/${t.username}/status/${t.id}`
            });
        }

        // いいね順にソート（これがやりたかったこと！）
        tweets.sort((a, b) => b.likes - a.likes);

        res.status(200).json(tweets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Xからデータを取得できませんでした。対策された可能性があります。" });
    }
}
