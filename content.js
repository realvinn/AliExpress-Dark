let isDarkModeActive = false;       // Local state for the current page
let darkModeStyleLink = null;       // Holds reference to the injected stylesheet link
let observer = null;                // Will hold the MutationObserver

// Fetch the initial state from storage
chrome.storage.sync.get('darkModeEnabled', (data) => {
  isDarkModeActive = !!data.darkModeEnabled;
  if (isDarkModeActive) {
    enableDarkMode();
  }
});

// Listen for toggle messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TOGGLE_DARK_MODE') {
    isDarkModeActive = message.value;
    if (isDarkModeActive) {
      enableDarkMode();
    } else {
      disableDarkMode();
    }
    sendResponse({ status: 'OK' });
  }
});

/**
 * Inject dark-mode.css and set up mutation observer
 */
function enableDarkMode() {
  if (darkModeStyleLink) return; // Already enabled

  // Create a <link> element for dark-mode.css
  darkModeStyleLink = document.createElement('link');
  darkModeStyleLink.rel = 'stylesheet';
  darkModeStyleLink.type = 'text/css';
  darkModeStyleLink.href = chrome.runtime.getURL('dark-mode.css');
  document.head.appendChild(darkModeStyleLink);

  // Set up mutation observer to handle dynamically inserted content
  observer = new MutationObserver(handleMutations);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  
  // Optional: Scan the page for inline background styles (white/off-white) right away
  fixInlineStyles(document.body);
}

/**
 * Remove the <link> and stop observing mutations
 */
function disableDarkMode() {
  if (!darkModeStyleLink) return; // Already disabled

  darkModeStyleLink.remove();
  darkModeStyleLink = null;

  if (observer) {
    observer.disconnect();
    observer = null;
  }

  // Optionally revert inline background styles if needed
  revertInlineStyles(document.body);
}

/**
 * Callback for MutationObserver.
 * Ensures newly added elements get fixed.
 */
function handleMutations(mutations) {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        fixInlineStyles(node);
      }
    });
  });
}

/**
 * Fix inline styles for white/off-white backgrounds on newly loaded elements
 */
function fixInlineStyles(root) {
  if (!isDarkModeActive) return;

  // If the node is an element and has a background of #fff or #f2f2f2, override it
  if (root.nodeType === Node.ELEMENT_NODE) {
    overrideWhiteBackground(root);
  }

  // Recursively handle child elements
  if (root.querySelectorAll) {
    root.querySelectorAll('*').forEach((elem) => {
      overrideWhiteBackground(elem);
    });
  }
}

/**
 * Revert inline styles if we want to go back to light mode
 * (Optional: This depends on whether you want to fully revert or just remove the dark overrides)
 */
function revertInlineStyles(root) {
  // Implementation depends on your preference. For a thorough approach:
  // e.g., store the original inline style in a data-attribute before overriding, then restore it here.
  // But many times it’s acceptable not to revert if AliExpress re-renders the page.
}

/**
 * Override background if it is #fff or #f2f2f2
 */
function overrideWhiteBackground(element) {
    const computedBg = window.getComputedStyle(element).backgroundColor;
    // Convert it to lowercase for easy substring checks
    const bgLower = computedBg.toLowerCase();
  
    // Patterns to match
    const isWhiteOrLight = (
      bgLower.includes('rgb(255, 255, 255)') ||
      bgLower.includes('rgb(242, 242, 242)') ||
      bgLower.includes('rgb(245, 245, 245)') ||
      bgLower.includes('255, 240') // Catch pinkish tints, e.g., rgb(255, 240, 245)
    );
  
    if (isWhiteOrLight) {
      element.style.backgroundColor = '#121212';
      element.style.color = '#dddddd';
    }
  } 
