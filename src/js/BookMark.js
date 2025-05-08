chrome.tabs.query({ active: true }, ([tab]) => {
    const isVideo = /youtube\.com\/(watch|shorts)/.test(tab.url);
    const addBookmark = document.getElementById('addBookmark');
    const output = document.getElementById('bookmark-output')

    if (addBookmark) {
        addBookmark.disabled = !isVideo;
        if (isVideo === false) {
            setTimeout(() => {
                output.textContent = "Only works on YouTube video pages."
                output.classList.add('visible');

                setTimeout(() => {
                    output.classList.remove('visible');

                    setTimeout(() => {
                        output.textContent = null;
                    }, 500);
                }, 3000);
            }, 1000);
        }
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
                const isShorts = window.location.pathname.includes("/shorts");
                const isLongForm = window.location.pathname.includes("/watch");
                const titleElement = document.querySelector('h1.title.style-scope.ytd-video-primary-info-renderer');
                const shortstitleElement = document.querySelector('h2.ytShortsVideoTitleViewModelShortsVideoTitle');
                const [href] = location.href.split('&');

                const title = titleElement ? titleElement.textContent.trim() : null;
                const shortstitle = shortstitleElement ? shortstitleElement.textContent.trim() : null;

                if (isLongForm && title) {
                    console.log('YouTube Video Title:', title);
                    return { title: title, url: href };
                } else if (isShorts && shortstitle) {
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