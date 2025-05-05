// let video_currentTime = null;
// let open_popup = false;
// let video_Url = null

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//     if (changeInfo.status === 'complete' && tab.url) {
//         console.log('tab update: ', tab.url);

//         const isVideo = tab.url.includes('/watch');

//         chrome.tabs.sendMessage(tabId, {
//             action: 'tab-url',
//             Video: isVideo
//         }, (res) => {
//             if (chrome.runtime.lastError) {
//                 console.warn('[content error]', chrome.runtime.lastError.message);
//             } else {
//                 console.log('[content reply]:', res);
//             }
//         });
//     }
// });

// chrome.runtime.onInstalled.addListener(() => {
//     chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
//     console.log('keepAlive alarm created');
// });

// chrome.alarms.onAlarm.addListener(alarm => {
//     if (alarm.name === 'keepAlive') {
//         console.log('keepAlive alarm fired - service worker kept alive');
//     }
// });

// chrome.runtime.onConnect.addListener(port => {
//     console.log('Port connected:', port.name);

//     if (port.name === 'popup') {
//         port.onMessage.addListener(msg => {
//             console.log('Popup connected:', port.name);
//             if (msg.status === 'opened') {
//                 port.postMessage({ action: 'OK' });
//                 open_popup = true;
//             }
//             if (msg.ACK){
//                 port.postMessage({ action: 'OK' })
//             }
//         });

//         port.onDisconnect.addListener(() => {
//             console.log('Port disconnected:', port.name);
//             open_popup = false;
//         });
//     }

//     if (port.name === 'currentTime') {
//         port.onMessage.addListener(msg => {
//             console.log('CurrentTime connected:', port.name);
//             if (msg.currentTime !== undefined) {
//                 video_currentTime = msg.currentTime
//                 video_Url = msg.url
//                 port.postMessage({ ACK: true, currentTime: video_currentTime, url: video_Url });
//             }
//         })
//         port.onDisconnect.addListener(() => {
//             console.log('Port disconnected:', port.name);
//         });
//     }
// });

// const sendcurrentTime = () => {
//     if (!open_popup) return;
//     if (!video_currentTime) return;
//     if (!video_Url) return;

//     chrome.runtime.sendMessage({
//         from: "background",
//         action: "sendTime&URL",
//         time: video_currentTime,
//         url: video_Url
//     }, (res) => {
//         if (chrome.runtime.lastError) {
//             console.warn('Send failed:', chrome.runtime.lastError.message);
//         } else {
//             console.log('reply:', res);
//         }
//     });
// }

// setInterval(() => {
//     sendcurrentTime()
// }, 500);
