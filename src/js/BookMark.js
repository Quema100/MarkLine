const bookmark = () => {
    const addBookmark = document.getElementById('addBookmark')

    addBookmark.addEventListener('click', async () => {
        let [tab] = await chrome.tabs.query({ active: true });
        if (!/\/(shorts|watch)/.test(tab.url)) return console.log(!/\/(shorts|watch)/.test(tab.url));
        saveItem('bookmarks', tab.url);
      });
}