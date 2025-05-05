const renderLists = () => {
    const timelineList = document.getElementById('timelineList');
    const bookmarkList = document.getElementById('bookmarkList');
    chrome.storage.local.get(['timelines', 'bookmarks'], data => {
        timelineList.innerHTML = (data.timelines || []).map(item =>
            `<li><span data-time="${item.time}" data-url="${item.url}">${item.time}</span><button data-delete-t="${item.time}|${item.url}">x</button></li>`
        ).join('');
        bookmarkList.innerHTML = (data.bookmarks || []).map(url =>
            `<li><span data-url="${url}">${url}</span><button data-delete-b="${url}">x</button></li>`
        ).join('');
        attachHandlers();
    });
}

const attachHandlers = () => {
    document.querySelectorAll('[data-time]').forEach(el => el.addEventListener('click', () => {
        const url = el.dataset.url;
        const time = el.dataset.time;
        const [h, m, s] = time.split(':').map(Number);
        const seconds = h * 3600 + m * 60 + s;
        chrome.tabs.create({ url }, () => {
            // Seek will be applied after the tab is created
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: secs => {
                    const video = document.querySelector('video');
                    if (video) video.currentTime = secs;
                },
                args: [seconds]
            });
        });
    }));
    document.querySelectorAll('[data-url]').forEach(el => el.addEventListener('click', () => chrome.tabs.create({ url: el.dataset.url })));
    document.querySelectorAll('[data-delete-t]').forEach(el => el.addEventListener('click', () => {
        const [time, url] = el.dataset.deleteT.split('|');
        deleteItem('timelines', { time, url });
    }));
    document.querySelectorAll('[data-delete-b]').forEach(el => el.addEventListener('click', () => deleteItem('bookmarks', el.dataset.deleteB)));
}

const saveItem = (key, value) => {
    chrome.storage.local.get([key], data => {
        const list = data[key] || [];
        list.push(value);
        console.log(list)
        chrome.storage.local.set({ [key]: list }, renderLists);
    });
}

const deleteItem = (key, value) => {
    chrome.storage.local.get([key], data => {
        const list = (data[key] || []).filter(item =>
            typeof item === 'string'
                ? item !== value
                : item.time !== value.time || item.url !== value.url
        );
        chrome.storage.local.set({ [key]: list }, renderLists);
    });
}
// let currentTime = null;
// let Videourl = null;

// const port = chrome.runtime.connect({ name: "popup" });

// port.postMessage({ status: "opened" });

// port.onMessage.addListener((msg) => {
//     console.log("Received from background:", msg);
//     if (msg.action === "OK") {
//         console.log("Received OK from background script");
//     }
// });

// port.onDisconnect.addListener(() => {
//     console.log("Popup port disconnected.");
// });

// setInterval(() => {
//     port.postMessage({ ACK: true });
// }, 1000);

// chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
//     console.log(msg)
//     if (msg.from === "background" && msg.action === "sendTime&URL") {
//         console.log("Received time from content script:", msg.time, msg.url);
//         currentTime = msg.time;
//         Videourl = msg.url;
//         sendResponse({ success: true });
//     }
// });
