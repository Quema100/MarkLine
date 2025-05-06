const renderLists = () => {
    const timelineList = document.getElementById('timelineList');
    const bookmarkList = document.getElementById('bookmarkList');
    chrome.storage.local.get(['timelines', 'bookmarks'], data => {
        timelineList.innerHTML = (data.timelines || []).map(item =>
            `<li><span data-time="${item.time}" data-url="${item.url}">${item.title} ${item.time}</span><button data-delete-timeline="${item.title}|${item.time}|${item.url}">x</button></li>`
        ).join('');
        bookmarkList.innerHTML = (data.bookmarks || []).map(item =>
            `<li><span data-url="${item.url}">${item.title}</span><button data-delete-bookmark="${item.title}|${item.url}">x</button></li>`
        ).join('');
        attachHandlers();
    });
}

const attachHandlers = () => {
    document.querySelectorAll('[data-time]').forEach(element =>
        element.addEventListener('click', async () => {
            const url = element.dataset.url;
            const time = element.dataset.time;
            const [hour, minute, second] = time.split(':').map(Number);
            const times = hour * 3600 + minute * 60 + second;
            console.log(times)
            let [tab] = await chrome.tabs.query({ active: true });
            if (!tab) return;

            if (tab.url !== url) {
                console.log('tab update');
                chrome.tabs.update(tab.id, { url });

                const checkReadyAndExecute = setInterval(() => {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: secs => {
                            const video = document.querySelector('video');
                            const ad_layout = document.querySelector('.ytp-ad-player-overlay-layout');

                            if (!video || ad_layout) return false;

                            video.currentTime = secs;
                            return true;
                        },
                        args: [times],
                    }, (results) => {
                        if (results && results[0]?.result === true) {
                            clearInterval(checkReadyAndExecute);
                            console.log('✅ Script executed successfully');
                        }
                    });
                }, 1000);
            } else {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: secs => {
                        const video = document.querySelectorAll('video')[0];
                        const ad_layout = document.querySelector('.ytp-ad-player-overlay-layout');

                        if (!video) return;
                        if (ad_layout) return;

                        video.currentTime = secs;
                    },
                    args: [times]
                });
            }
        }));

    document.querySelectorAll('[data-url]').forEach(element => {
        element.addEventListener('click', async () => {
            const url = element.dataset.url;
            let [tab] = await chrome.tabs.query({ active: true });
            if (tab.url !== url) {
                chrome.tabs.update(tab.id, { url });
            }
        });
    });

    document.querySelectorAll('[data-delete-timeline]').forEach(element => {
        element.addEventListener('click', () => {
            const [title, time, url] = element.dataset.deleteTimeline.split('|');
            deleteItem('timelines', { title, time, url });
        });
    });

    document.querySelectorAll('[data-delete-bookmark]').forEach(element => {
        element.addEventListener('click', () => {
            const [title, url] = element.dataset.deleteBookmark.split('|');
            deleteItem('bookmarks', { title, url });
        });
    });
}

const saveItem = (key, value) => {
    chrome.storage.local.get([key], data => {

        const list = data[key] || [];

        const isDuplicate = list.some(item => {
            const itemTime = item.time || null;
            const valueTime = value.time || null;
            return item.title === value.title && item.url === value.url && itemTime === valueTime;
        });

        if (isDuplicate) {
            console.log('🔁 Duplicate entry skipped:', value);
            return;
        }

        list.push(value);

        console.log('✅ New item saved:', value);

        chrome.storage.local.set({ [key]: list }, renderLists);
    });
}

const deleteItem = (key, value) => {
    chrome.storage.local.get([key], data => {

        const list = (data[key] || []).filter(item => {

            const itemTime = item.time || null;
            const valueTime = value.time || null;
            return item.url !== value.url || item.title !== value.title || itemTime !== valueTime;

        });
        chrome.storage.local.set({ [key]: list }, renderLists);
    });
}
