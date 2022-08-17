const srcUrl = chrome.runtime.getURL('leboncoin-plus.js')
const injectedTabIds = []

chrome.tabs.onUpdated.addListener(async (tabId, _, tab) => {
  // tab.url is only defined when matching manifest host permissions.
  if (tab.url) {
    if (!injectedTabIds.includes(tabId)) {
      // Push tab id into injectedTabIds already so we don't inject twice.
      injectedTabIds.push(tabId)

      const res = await chrome.scripting.executeScript({
        target: { tabId },
        func: inject,
        args: [srcUrl],
      })

      // Remove the tab id from injectedTabIds if the injection failed.
      if (!res[0].result.injected) {
        const index = injectedTabIds.indexOf(tabId)
        injectedTabIds.splice(index, 1)
      }
    }
  }
})

// see https://www.moesif.com/blog/technical/apirequest/How-We-Captured-AJAX-Requests-with-a-Chrome-Extension/
function inject(src) {
  try {
    const scriptEl = document.createElement('script')
    scriptEl.src = src
    document.head.appendChild(scriptEl)
    
    return { injected: true }
  } catch (error) {
    return { injected: false, error }
  }
}
