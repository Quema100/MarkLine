const bookmark = () => {
  const addBookmark = document.getElementById('addBookmark')

  addBookmark.addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({ active: true });
    if (!/\/(shorts|watch)/.test(tab.url)) return console.log(!/\/(shorts|watch)/.test(tab.url));
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const titleElement = document.querySelector('h1.title.style-scope.ytd-video-primary-info-renderer');
        if (titleElement) {
          const title = titleElement.textContent.trim();
          console.log('YouTube Video Title:', title);
          return { title: title, url: location.href };
        } else {
          console.log('Not found title');
          return { title: null, url: location.href };
        }

      }
    }, ([res]) => {
      console.log(res)
      if (res?.result) saveItem('bookmarks', res.result);
    });
  });
}