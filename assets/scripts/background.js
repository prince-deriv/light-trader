const handleAction = (request) => {
  const { action } = request;

  switch (action) {
    case "logout":
      chrome.tabs.query({}, function (tabs) {
        for (var i = 0; i < tabs.length; ++i) {
          chrome.tabs.sendMessage(tabs[i].id, { action: "logout" });
        }
      });
      break;

    default:
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        const activeTab = tabs[0];

        chrome.tabs.sendMessage(activeTab.id, request);
      });
      break;
  }
};

chrome.runtime.onMessage.addListener(handleAction);
