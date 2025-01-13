// Apply inversion fix to all existing images and videos
function applyDarkModeFix() {
    const mediaElements = document.querySelectorAll("img, video");
    mediaElements.forEach((el) => {
      el.style.filter = "invert(1) hue-rotate(180deg)";
    });
  }
  
  // Apply dark mode and fix images/videos
  function toggleDarkMode() {
    const body = document.body;
    if (!body.classList.contains("dark-mode")) {
      body.style.filter = "invert(1) hue-rotate(180deg)";
      body.classList.add("dark-mode");
      applyDarkModeFix();
    } else {
      body.style.filter = "";
      body.classList.remove("dark-mode");
      const mediaElements = document.querySelectorAll("img, video");
      mediaElements.forEach((el) => {
        el.style.filter = ""; // Reset the filter
      });
    }
  }
  
  // Observe dynamically added elements (e.g., lazy-loaded images)
  function observeDynamicContent() {
    const observer = new MutationObserver(() => {
      if (document.body.classList.contains("dark-mode")) {
        applyDarkModeFix();
      }
    });
  
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  // Listen for the toggle message
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleDarkMode") {
      toggleDarkMode();
      sendResponse({ status: "Dark mode toggled successfully" });
    }
    return true; // Keep the message port open
  });
  
  // Start observing for dynamic content
  observeDynamicContent();
  