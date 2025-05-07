chrome.tabs.query({ active: true }, ([tab]) => {
    const isVideo = /youtube\.com\/watch/.test(tab.url);
    const saveTimestamp = document.getElementById('saveTimestamp')
    if (saveTimestamp) {
        saveTimestamp.disabled = !isVideo;
    }
})

const timeline = () => {
    const saveTimestamp = document.getElementById('saveTimestamp')
    const output = document.getElementById('timeline-output')
    saveTimestamp.addEventListener('click', async () => {
        let [tab] = await chrome.tabs.query({ active: true });
        if (!/youtube\.com\/watch/.test(tab.url)) return console.log(/youtube\.com\/watch/.test(tab.url));
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const titleElement = document.querySelector('h1.title.style-scope.ytd-video-primary-info-renderer');
                const ad_layout = document.querySelector('.ytp-ad-player-overlay-layout');
                const video = document.querySelectorAll('video')[0];
                const [href] = location.href.split('&')

                if (ad_layout) return null;
                if (!video) return null;
                const timeStr = new Date(Math.floor(video.currentTime * 1000)).toISOString().slice(11, 19);

                if (titleElement) {
                    const title = titleElement.textContent.trim();
                    console.log('YouTube Video Title:', title);
                    return { title: title, time: timeStr, url: href };
                } else {
                    console.log('Not found title');
                    return { title: null, time: timeStr, url: href };
                }
            }
        }, ([res]) => {
            console.log(res)
            if (!res?.result) return output.textContent = "An advertisement is currently playing.", setTimeout(() => { output.textContent = null}, 3000);
            if (res?.result) saveItem('timelines', res.result);
        });
    });
}