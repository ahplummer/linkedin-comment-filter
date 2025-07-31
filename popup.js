document.addEventListener('DOMContentLoaded', function() {
  const status = document.getElementById('status');
  const hiddenCount = document.getElementById('hiddenCount');

  let currentTab = null;

  // Get initial status
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    currentTab = tabs[0];
    if (currentTab.url.includes('linkedin.com')) {
      // Ensure content script is injected
      chrome.scripting.executeScript({
        target: {tabId: currentTab.id},
        files: ['content.js']
      }, function() {
        // Wait a moment for script to initialize, then get status
        setTimeout(() => {
          getStatus();
        }, 100);
      });
    } else {
      status.textContent = 'Navigate to LinkedIn to use this extension';
      status.style.backgroundColor = '#fff3cd';
    }
  });

  function getStatus() {
    if (currentTab && currentTab.url.includes('linkedin.com')) {
      chrome.tabs.sendMessage(currentTab.id, {action: 'getStatus'}, function(response) {
        if (chrome.runtime.lastError) {
          console.error('Error getting status:', chrome.runtime.lastError);
          status.textContent = 'Extension is ready. Click the toolbar icon to toggle.';
          status.style.backgroundColor = '#e3f2fd';
        } else if (response) {
          updateUI(response.status, response.hiddenCount);
        } else {
          status.textContent = 'Content script not ready. Try refreshing the page.';
          status.style.backgroundColor = '#fff3cd';
        }
      });
    }
  }

  function updateUI(filterStatus, hiddenCommentsCount) {
    if (filterStatus === 'enabled') {
      status.textContent = 'Filter is ON - Pre-canned comments are hidden';
      status.style.backgroundColor = '#d4edda';
      hiddenCount.textContent = `${hiddenCommentsCount || 0} comments hidden`;
    } else {
      status.textContent = 'Filter is OFF - All comments are visible';
      status.style.backgroundColor = '#f8d7da';
      hiddenCount.textContent = '';
    }
  }

  // Refresh status every 2 seconds while popup is open
  setInterval(() => {
    if (currentTab && currentTab.url.includes('linkedin.com')) {
      getStatus();
    }
  }, 2000);
});