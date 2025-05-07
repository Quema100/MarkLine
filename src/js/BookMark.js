chrome.tabs.query({ active: true }, ([tab]) => {
    const isVideo = /youtube\.com\/(watch|shorts)/.test(tab.url);
    const addBookmark = document.getElementById('addBookmark');
    if (addBookmark) {
        addBookmark.disabled = !isVideo;
    }
})

const bookmark = () => {
    const addBookmark = document.getElementById('addBookmark')

    addBookmark.addEventListener('click', async () => {
        let [tab] = await chrome.tabs.query({ active: true });
        if (!/youtube\.com\/(watch|shorts)/.test(tab.url)) return console.log(!/youtube\.com\/(watch|shorts)/.test(tab.url));
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const titleElement = document.querySelector('h1.title.style-scope.ytd-video-primary-info-renderer');
                const shortstitleElement = document.querySelector('h2.ytShortsVideoTitleViewModelShortsVideoTitle');
                const [href] = location.href.split('&');

                const title = titleElement ? titleElement.textContent.trim() : null;
                const shortstitle = shortstitleElement ? shortstitleElement.textContent.trim() : null;

                if (title) {
                    console.log('YouTube Video Title:', title);
                    return { title: title, url: href };
                } else if (shortstitle) {
                    console.log('YouTube Shorts Video Title:', shortstitle);
                    return { title: shortstitle, url: href };
                } else {
                    console.log('Not found title');
                    return { title: null, url: href };
                }

            }
        }, ([res]) => {
            console.log(res)
            if (res?.result) saveItem('bookmarks', res.result);
        });
    });
}