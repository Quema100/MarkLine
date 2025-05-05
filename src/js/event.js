const Eventlist = () => {
    document.getElementById('openLink').addEventListener('click', () => {
        console.log('openLink clicked');
        const targetUrl = 'https://www.youtube.com/'; 
        chrome.tabs.create({ url: targetUrl });
    });
};