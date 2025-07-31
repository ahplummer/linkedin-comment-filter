// Background service worker for LinkedIn Comment Filter extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('LinkedIn Comment Filter extension installed');
  // Set initial icon state to disabled
  chrome.action.setIcon({
    path: {
      "16": "icon16_disabled.png",
      "32": "icon32_disabled.png",
      "48": "icon48_disabled.png",
      "128": "icon128_disabled.png"
    }
  });
  chrome.action.setTitle({
    title: 'LinkedIn Comment Filter - OFF (click to enable)'
  });
});

// Handle extension icon click - toggle the filter
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url.includes('linkedin.com')) {
    try {
      // Inject content script if needed
      await chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ['content.js']
      });
      
      // Send toggle message to content script
      const response = await chrome.tabs.sendMessage(tab.id, {action: 'toggleFilter'});
      
      if (response) {
        // Update icon based on new state
        updateIcon(response.status, tab.id);
      }
    } catch (error) {
      console.error('Error toggling filter:', error);
    }
  }
});

// Listen for messages from content script to update icon
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateIcon') {
    updateIcon(request.status, sender.tab.id);
  }
});

// Update the toolbar icon based on filter status
function updateIcon(status, tabId) {
  const iconSet = status === 'enabled' ? {
    "16": "icon16.png",
    "32": "icon32.png", 
    "48": "icon48.png",
    "128": "icon128.png"
  } : {
    "16": "icon16_disabled.png",
    "32": "icon32_disabled.png",
    "48": "icon48_disabled.png", 
    "128": "icon128_disabled.png"
  };
  
  const title = status === 'enabled' 
    ? 'LinkedIn Comment Filter - ON (click to disable)'
    : 'LinkedIn Comment Filter - OFF (click to enable)';
  
  chrome.action.setIcon({
    path: iconSet,
    tabId: tabId
  });
  
  chrome.action.setTitle({
    title: title,
    tabId: tabId
  });
}