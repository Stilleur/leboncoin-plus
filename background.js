const uniqueKey = '__LEBONCOIN_PLUS__'
const srcUrl = chrome.runtime.getURL('leboncoin-plus.js')

chrome.tabs.onUpdated.addListener(async (tabId, _, tab) => {
  // The tab.url is only defined when it matches our manifest host permissions.
  // We can inject as soon as we have an url.
  if (tab.url) {
    const res = await chrome.scripting.executeScript({
      target: { tabId },
      func: inject,
      args: [srcUrl, uniqueKey],
    })
  }
})

// See https://www.moesif.com/blog/technical/apirequest/How-We-Captured-AJAX-Requests-with-a-Chrome-Extension/
function inject(scriptSrc, extensionUniqueKey) {
  // Prevents injecting multiple times.
  if (window[extensionUniqueKey]) return
  window[extensionUniqueKey] = {}

  const scriptEl = document.createElement('script')
  scriptEl.src = scriptSrc
  document.head.appendChild(scriptEl)
}
