let messageSend = false

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
            if (!res?.result) {
                if (messageSend) return console.log('Message already sent.');

                messageSend = true;

                output.textContent = "An advertisement is currently playing."
                output.classList.add('visible');

                setTimeout(() => {
                    output.classList.remove('visible');

                    setTimeout(() => {
                        output.textContent = null;
                        messageSend = false;
                    }, 500); 
                }, 3000);
                
                return ;
            }
            console.log(res)

            saveItem('timelines', res.result);
        });
    });
}