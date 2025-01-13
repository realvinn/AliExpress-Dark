document.getElementById("toggle-dark-mode").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        // Use tabs[0].id within this callback
        const tabId = tabs[0].id;
  
        // Inject content script if necessary
        chrome.scripting.executeScript(
          {
            target: { tabId: tabId },
            files: ["content.js"],
          },
          () => {
            if (chrome.runtime.lastError) {
              console.error("Error injecting content script:", chrome.runtime.lastError.message);
            } else {
              // Send a message to the content script
              chrome.tabs.sendMessage(
                tabId,
                { action: "toggleDarkMode" },
                (response) => {
                  if (chrome.runtime.lastError) {
                    console.error("Error:", chrome.runtime.lastError.message);
                  } else {
                    console.log("Message sent successfully, response:", response);
                  }
                }
              );
            }
          }
        );
      } else {
        console.error("No active tab found.");
      }
    });
  });
  