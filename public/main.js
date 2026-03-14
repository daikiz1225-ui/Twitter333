const tweetContainer = document.getElementById('tweetContainer');
const searchInput = document.getElementById('searchInput');
const pageTitle = document.getElementById('pageTitle');

// APIからデータを取得して表示
async function fetchTweets(type = 'trending', query = '') {
    tweetContainer.innerHTML = '<div style="padding: 20px; color: #71767b;">読み込み中...</div>';
    
    try {
        const response = await fetch(`/api/nitter?type=${type}&q=${encodeURIComponent(query)}`);
        const tweets = await response.json();
        
        if (!tweets || tweets.length === 0) {
            tweetContainer.innerHTML = '<div style="padding: 20px;">見つかりませんでした。</div>';
            return;
        }
        
        renderTweets(tweets);
    } catch (error) {
        tweetContainer.innerHTML = '<div style="padding: 20px; color: #f4212e;">データの取得に失敗しました。</div>';
    }
}

// HTMLの生成
function renderTweets(tweets) {
    tweetContainer.innerHTML = '';
    tweets.forEach(tweet => {
        const tweetHtml = `
            <div class="tweet">
                <img src="${tweet.avatar}" class="avatar" onerror="this.src='https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png'">
                <div class="tweet-content">
                    <div class="user-info">
                        <span class="fullname">${tweet.fullname}</span>
                        <span class="username">${tweet.username}</span>
                        <span class="time">・ ${tweet.time}</span>
                    </div>
                    <div class="text">${tweet.content}</div>
                    <div class="actions">
                        <span>💬 0</span>
                        <span>🔄 ${tweet.retweets.toLocaleString()}</span>
                        <span style="color: #f91880;">❤️ ${tweet.likes.toLocaleString()}</span>
                        <span>📊 0</span>
                    </div>
                </div>
            </div>
        `;
        tweetContainer.insertAdjacentHTML('beforeend', tweetHtml);
    });
}

// 検索実行
function performSearch() {
    const q = searchInput.value;
    if (q) {
        pageTitle.innerText = `「${q}」の検索結果（いいね順）`;
        fetchTweets('search', q);
    }
}

// トレンドタグ用
function quickSearch(word) {
    searchInput.value = word;
    performSearch();
}

// エンターキーで検索
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

// 初期起動：トレンドを表示
fetchTweets('trending');
