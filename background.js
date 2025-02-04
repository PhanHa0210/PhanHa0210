let isActive = false;

// Hàm kiểm tra và inject content script nếu cần
async function ensureContentScript(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { action: "ping" }, (response) => {
      if (chrome.runtime.lastError || !response) {
        console.warn("Content script chưa được inject. Đang inject lại...");
        chrome.scripting.executeScript(
          {
            target: { tabId },
            files: ["content.js"]
          },
          () => resolve(true)
        );
      } else {
        resolve(true);
      }
    });
  });
}

// Xử lý sự kiện khi click vào icon extension
chrome.action.onClicked.addListener(async (tab) => {
  try {
    await ensureContentScript(tab.id);
    await chrome.tabs.sendMessage(tab.id, { action: "toggle" });
  } catch (error) {
    console.error("Error sending message:", error);
  }
});

// Xử lý cập nhật icon
chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.action === "updateIcon") {
    isActive = request.isActive;
    let iconPath = isActive
      ? {
          "16": "icons/active-16.png",
          "32": "icons/active-32.png",
          "48": "icons/active-48.png",
          "128": "icons/active-128.png"
        }
      : {
          "16": "icons/inactive-16.png",
          "32": "icons/inactive-32.png",
          "48": "icons/inactive-48.png",
          "128": "icons/inactive-128.png"
        };

    if (sender.tab && sender.tab.id) {
      chrome.action.setIcon({ path: iconPath, tabId: sender.tab.id });
    } else {
      chrome.action.setIcon({ path: iconPath });
    }
  }
});
