chrome.runtime.onConnect.addListener((port) => {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === "complete") {
      port.postMessage({ action: "TAB_UPDATED" });
    }
  });
});
