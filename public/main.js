async function fetchTweets(query = 'lang:ja') {
    tweetContainer.innerHTML = '<div class="loading">𝕏 通信中...</div>';
    try {
        // /api/x に変更
        const response = await fetch(`/api/x?q=${encodeURIComponent(query)}`);
        const tweets = await response.json();
        renderTweets(tweets);
    } catch (e) {
        tweetContainer.innerHTML = '<div class="error">取得失敗。</div>';
    }
}
