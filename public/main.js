const tweetContainer = document.getElementById('tweetContainer');
const searchInput = document.getElementById('searchInput');

async function fetchTweetsJSON(query = 'lang:ja') {
    tweetContainer.innerHTML = '<div class="loading">JSONデータ解析中...</div>';

    // RSS-Bridgeのインスタンス（Twitter検索をRSS化してくれる）
    const rssUrl = `https://rss-bridge.org/bridge01/?action=display&bridge=TwitterBridge&context=Search+query&q=${encodeURIComponent(query)}&format=Mrss`;
    
    // RSSをJSONに変換するAPI（無料枠を利用）
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status !== 'ok') throw new Error('API Error');

        // RSSの項目をツイート風に整形
        const tweets = data.items.map(item => {
            return {
                fullname: item.author || "Twitter User",
                username: "@user",
                avatar: "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png",
                content: item.description.replace(/<[^>]*>?/gm, ''), // HTMLタグを除去
                time: item.pubDate,
                link: item.link
            };
        });

        renderTweets(tweets);
    } catch (error) {
        console.error(error);
        tweetContainer.innerHTML = '<div class="error">JSONの取得に失敗しました。</div>';
    }
}

function renderTweets(tweets) {
    tweetContainer.innerHTML = '';
    tweets.forEach(tweet => {
        const html = `
            <div class="tweet" onclick="window.open('${tweet.link}')">
                <img src="${tweet.avatar}" class="avatar">
                <div class="tweet-content">
                    <div class="user-info">
                        <span class="fullname">${tweet.fullname}</span>
                        <span class="time">・ ${tweet.time}</span>
                    </div>
                    <div class="text">${tweet.content}</div>
                    <div class="actions">
                        <span>🔄 RT</span>
                        <span style="color: #f91880;">❤️ Like</span>
                    </div>
                </div>
            </div>
        `;
        tweetContainer.insertAdjacentHTML('beforeend', html);
    });
}

// 検索ボタンなどの処理はこれまでと同じ
function performSearch() {
    const q = searchInput.value;
    if (q) fetchTweetsJSON(q);
}

window.onload = () => fetchTweetsJSON('lang:ja');
