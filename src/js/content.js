// const port = chrome.runtime.connect({ name: "currentTime" });
// let video = null;
// let currentTime = null;
// let url = null

// port.onMessage.addListener((msg) => {
//     console.log('Frome Background', msg);
// });

// port.onDisconnect.addListener(() => {
//     console.log("Disconnected from background script");
// });


// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === 'tab-url') {
//         if (request.Video) {
//             console.log('VIDEO:', request.Video);
//             video = true;
//         } else {
//             console.log('VIDEO:', request.Video);
//             video = false;
//         };
//         sendResponse({ success: true });
//     };
//     return true;
// });

// const videocurrentTime = () => {
//     if (video) {
//         console.log('Video currentTime:', video);
//         if (!document.querySelectorAll("video")[0]) return console.log('No element found');
//         url = window.location.href
//         currentTime = document.querySelectorAll("video")[0].currentTime
//         console.log('Current Time:', currentTime);
//         port.postMessage({ currentTime: currentTime, url: url });
//     } else {
//         console.log('No video found');
//         try{
//             setTimeout(() => {
//                 port.postMessage({ ACK: true });
//             }, 1500);
//         }catch(error){
//             console.log("Port disconnected: ", error)
//         }

//     };
// };

// setInterval(() => {
//     videocurrentTime()
// }, 500);