const timeline = () => {
    const saveTimestamp = document.getElementById('saveTimestamp')
    saveTimestamp.addEventListener('click', async () => {
        let [tab] = await chrome.tabs.query({ active: true });
        if (!tab.url.includes('/watch')) return console.log(tab.url.includes('/watch'));
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const ad_layout = document.querySelector('.ytp-ad-player-overlay-layout');
                const video = document.querySelectorAll('video')[0];
                if (ad_layout) return null;
                if (!video) return null;
                const timeStr = new Date(Math.floor(video.currentTime * 1000)).toISOString().slice(11, 19);
                return { time: timeStr, url: location.href };
            }
        }, ([res]) => {
            if (res?.result) saveItem('timelines', res.result);
        });
    });
}