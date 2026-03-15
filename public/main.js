async function fetchTweets(query = 'lang:ja') {
    const container = document.getElementById('tweetContainer');
    container.innerHTML = '<div style="padding: 20px;">𝕏 データを取得中...</div>';
    
    try {
        const response = await fetch(`/api/x?q=${encodeURIComponent(query)}`);
        const tweets = await response.json();
        
        container.innerHTML = '';
        tweets.forEach(t => {
            container.insertAdjacentHTML('beforeend', `
                <div class="tweet">
                    <img src="${t.avatar}" class="avatar" onerror="this.src='https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png'">
                    <div class="tweet-content">
                        <div class="user-info">${t.fullname} <span class="username">${t.username}</span></div>
                        <div class="text">${t.content}</div>
                        <div class="actions">
                            <span>🔄 ${t.retweets}</span>
                            <span style="color: #f91880;">❤️ ${t.likes}</span>
                        </div>
                    </div>
                </div>
            `);
        });
    } catch (e) {
        container.innerHTML = '<div style="padding: 20px;">取得できませんでした。時間をおいて試してください。</div>';
    }
}

function performSearch() {
    const q = document.getElementById('searchInput').value;
    if(q) fetchTweets(q);
}

window.onload = () => fetchTweets('lang:ja');
