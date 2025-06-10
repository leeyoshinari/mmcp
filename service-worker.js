chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        const headers = details.requestHeaders;
        chrome.tabs.sendMessage(details.tabId, {
            type: "REQUEST_HEADERS",
            headers: headers
        });
    },
    { urls: ["<all_urls>"] },
    ["requestHeaders"]
);