// const selectors = {
//   ad: {
//     listing: 'a[data-qa-id=aditem_container]',
//     single: 'article[id=grid]',
//   },
// }

// chrome.tabs.executeScript(tabId, {code: actualCode, runAt: 'document_end'}, cb)

// const _fetch = window.fetch
// window.fetch = function(url, options) {
//   alert('fetch')
//   _fetch(url, options)
// }

// const _open = XMLHttpRequest.prototype.open
// XMLHttpRequest.prototype.open = function() {
//   alert('open')
//   // this.addEventListener("load", event => console.log(event), false);
//   _open.apply(this, arguments);
// }

function update(nextDataEl) {
  const jsonString = nextDataEl.textContent
  const json = JSON.parse(jsonString)


  // switch (json.page) {
  //   case '/SearchListing':
  //     handleListing(json.props.pageProps.searchData.ads)
  //     break
  //   case '/ClassifiedAd':
  //     handleAd(json.props.pageProps.ad)
  //     break
  // }
}

function handleListing(ads) {
  const selectors = {
    ad: 'a[data-qa-id=aditem_container]',
    content: 'div[data-test-id=bigpicture-housing-content]',
  }

  const adEls = document.querySelectorAll(selectors.ad)
  for (const adEl of adEls) {
    const href = adEl.getAttribute('href')
    const lastSlashIndex = href.lastIndexOf('/')
    const endIndex = href.length - 4 // take out '.htm'

    const id = href.substring(lastSlashIndex + 1, endIndex)
    const ad = ads.find(ad => ad.list_id === Number(id))
    const contentEl = adEl.querySelector(selectors.content)
    const dateEl = contentEl.nextSibling.firstChild

    dateEl.textContent = getDateText(ad.first_publication_date)
  }
}

function handleAd(ad) {
  const el = document.querySelector('p[data-qa-id=adview_date]')
  el.textContent = getDateText(ad.first_publication_date)
}

function getDateText(date) {
  const _date = new Date(date)
  return `Publié le ${_date.toLocaleDateString('fr-FR')} (à ${_date.toLocaleTimeString('fr-FR')})`
}

