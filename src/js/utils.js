const summaryclickMap = new Map();

const renderLists = () => {
    const timelineList = document.getElementById('timelineList');
    const bookmarkList = document.getElementById('bookmarkList');
    chrome.storage.local.get(['timelines', 'bookmarks'], data => {

        const timelineItems = data.timelines || [];
        const groupedTimelines = groupItemsByUrl(timelineItems);

        timelineList.innerHTML = Object.entries(groupedTimelines).map(([url, items]) => {
            if (items.length === 1) {
                return `
                    <li>
                        <span data-time='${items[0].time}' data-url='${url}'>
                            ${Array.from(items[0].title).length > 17 ? Array.from(items[0].title).slice(0, 17).join('') + '...' : items[0].title} ${items[0].time}
                        </span>
                        <div id='Timelinebtn'>
                            <button data-delete-timeline="${items[0].title}§${items[0].time}§${url}">x</button>
                        </div>
                    </li>`;
            } else {
                const dropdownOptions = items.map(item =>
                    `<li>
                        <span data-time='${item.time}' data-url='${item.url}'>
                            🕒 Time: [${item.time}]
                        </span>
                        <div id='Timelinebtn'>
                            <button data-delete-timeline="${item.title}§${item.time}§${item.url}">x</button>
                        </div>
                    </li>`
                ).join('');

                return `
                    <li>
                        <details name="timelinelists">
                            <summary>
                                ${Array.from(items[0].title).length > 16 ? Array.from(items[0].title).slice(0, 16).join('') + '...' : items[0].title} (${items.length} timelines)
                            </summary>
                            <ul>
                                ${dropdownOptions}
                            </ul>
                        </details>
                    </li>`;
            }
        }).join('');

        bookmarkList.innerHTML = (data.bookmarks || []).map(item =>
            `<li>
                <span data-url='${item.url}'>${Array.from(item.title).length > 21 ? Array.from(item.title).slice(0, 21).join('') + '...' : item.title}</span>
                <div id='Bookmarkbtn'>
                    <button data-delete-bookmark="${item.title}§${item.url}">x</button>
                </div>
            </li>`
        ).join('');

        attachHandlers();
        keepDetailsOpen()
    });
};

const keepDetailsOpen = () => {
    document.querySelectorAll('details').forEach((details, index) => {
        const summary = details.querySelector('summary');

        details.addEventListener('toggle', () => {
            if (details.open) {
                console.log(`${summary.innerText} opened`);
                summaryclickMap.set(`details_${index}`, true);
            } else {
                console.log(`${summary.innerText} closed`);
                summaryclickMap.set(`details_${index}`, false);
            }
        });

        const isOpen = details.hasAttribute('open');
        const summaryclick = summaryclickMap.get(`details_${index}`);
        if (!isOpen && summaryclick === true) {
            details.setAttribute('open', '');
        }
    });
};

const groupItemsByUrl = (items) => {
    return items.reduce((groups, item) => {
        if (!groups[item.url]) {
            groups[item.url] = [];
        }
        groups[item.url].push(item);
        return groups;
    }, {});
};


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

                            if (!video || ad_layout) return false; // shit i can't sovle the ad problem...


                            video.currentTime = secs; // plz wait..
                            return true;
                        },
                        args: [times],
                    }, (results) => {
                        if (results && results[0]?.result === true) {
                            clearInterval(checkReadyAndExecute);
                            console.log('✅ Script executed successfully');
                        }
                    });
                }, 2000);
            } else {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: secs => {
                        const video = document.querySelectorAll('video')[0];
                        const ad_layout = document.querySelector('.ytp-ad-player-overlay-layout');

                        if (!video || ad_layout) return false;

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
            const [title, time, url] = element.dataset.deleteTimeline.split('§');
            console.log(title, time, url)
            deleteItem('timelines', { title, time, url });
        });
    });

    document.querySelectorAll('[data-delete-bookmark]').forEach(element => {
        element.addEventListener('click', () => {
            const [title, url] = element.dataset.deleteBookmark.split('§');
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
