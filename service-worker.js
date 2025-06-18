// terser home.js -o index.js --compress
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        if (details.tabId <= 0) return;
        const headers = details.requestHeaders;
        chrome.tabs.sendMessage(details.tabId, {
            type: "REQUEST_HEADERS",
            headers: headers
        }).catch(err => {
            console.log(`消息发送失败: ${err}`);
        });
    },
    { urls: ["<all_urls>"] },
    ["requestHeaders"]
);