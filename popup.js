const toggleBtn = document.getElementById('toggleBtn');

let darkModeEnabled = false;

// Load the saved state from storage
chrome.storage.sync.get('darkModeEnabled', (data) => {
  darkModeEnabled = !!data.darkModeEnabled;
  updatePopupAppearance(darkModeEnabled);
});

// Handle clicks on the toggle button
toggleBtn.addEventListener('click', async () => {
  darkModeEnabled = !darkModeEnabled;
  
  // Save to storage
  chrome.storage.sync.set({ darkModeEnabled });

  // Update popup (sun/moon icon and background color)
  updatePopupAppearance(darkModeEnabled);

  // Send a message to all open AliExpress tabs to update them
  const tabs = await chrome.tabs.query({ url: '*://*.aliexpress.com/*' });
  for (const tab of tabs) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'TOGGLE_DARK_MODE',
      value: darkModeEnabled
    });
  }
});

/**
 * Updates the popup's background color and toggle icon
 */
function updatePopupAppearance(isDarkMode) {
  if (isDarkMode) {
    document.body.classList.add('dark-active');
    document.body.classList.remove('dark-inactive');
    toggleBtn.textContent = '☀️';  // Show sun if currently in dark mode
  } else {
    document.body.classList.add('dark-inactive');
    document.body.classList.remove('dark-active');
    toggleBtn.textContent = '🌙';  // Show moon if currently in light mode
  }
}
