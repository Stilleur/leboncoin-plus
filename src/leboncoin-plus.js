patch()

// The patching will likely happen after the first fetch(es).
// Get the initial ad(s) from __NEXT_DATA__.
getInitialAds()

// Add our stored data to the UI (if any) when an ad gets added to the DOM.
onNewAd((el, ad) => { addPublicationDate(el, ad) })


function onNewAd(callback) {
  const singleAdSelector = 'article#grid'
  const selectors = ['a[data-qa-id=aditem_container]', singleAdSelector]
  const isAdContainer = node => node?.getAttribute && node.getAttribute('data-qa-id') === 'aditem_container'
  const isSingleAdPage = () => new URL(window.location.href).pathname.endsWith('.htm')
  const possibleNewAdTests = [
    (node) => isAdContainer(node?.parentElement) && !isSingleAdPage(),
    (node) => isAdContainer(node?.lastChild) && !isSingleAdPage(),
    (node) => node?.querySelector && node.querySelector(selectors) && !isSingleAdPage(),
    (node) => node?.querySelector && node.querySelector(singleAdSelector),
  ]

  const callbackOnAdElements = () => {
    const adElements = document.querySelectorAll(selectors)
    const store = getStore()
    for (const adEl of adElements) {
      const href = adEl.getAttribute('href') || window.location.href
      const from = href.lastIndexOf('/') + 1
      const to = href.indexOf('.', from)
      const id = Number(href.substring(from, to))

      const ad = store.ads.find(a => a.id === id)
      if (ad) callback(adEl, ad)
    }
  }

  const obs = new MutationObserver((mutations) => {
    let hasPossiblyAtLeastOneNewAd = false

    for (const mutation of mutations) {
      for (const addedNode of mutation.addedNodes) {
        // If at least one test passes, we possibly have a new ad.
        if (possibleNewAdTests.some(test => test(addedNode))) {
          hasPossiblyAtLeastOneNewAd = true
          break
        }
      }
      if (hasPossiblyAtLeastOneNewAd) break
    }

    if (hasPossiblyAtLeastOneNewAd) callbackOnAdElements()
  })

  const target = document.getElementById('mainContent')
  obs.observe(target, { subtree: true, childList: true })

  // Run once at the beginning.
  callbackOnAdElements()
}

function addPublicationDate(el, ad) {
  const parentElGetters = [
    (el) => el?.querySelector && el.querySelector('div[data-test-id=bigpicture-housing-content]'),
    (el) => el?.querySelector && el.querySelector('p[data-qa-id=adview_date]')?.parentElement
  ]

  let parentEl
  for (const getter of parentElGetters) {
    parentEl = getter(el)
    if (parentEl) break
  }

  // No parent element found.
  if (!parentEl) return

  const pubEl = document.createElement('p')
  pubEl.textContent = `Publi?? le ${new Date(ad.pub).toLocaleDateString('fr-FR')}`
  pubEl.className = parentEl.lastChild.className
  parentEl.style.gap = '0 10px'
  parentEl.appendChild(pubEl)
}

function patch() {
  const urlPrefix = 'https://api.leboncoin.fr/finder/'

  const _fetch = window.fetch
  window.fetch = async (input, init) => {
    const res = await _fetch(input, init)

    // Only process ad-related requests (classified, search, etc).
    if (res.url.startsWith(urlPrefix)) {
      // We must clone as the data is consumed by the json() call.
      const json = await res.clone().json()
      const ads = extractAds(json)
      storeAds(ads)
    }

    return res
  }
}

function getInitialAds() {
  const nextDataEl = document.getElementById('__NEXT_DATA__')
  const nextData = JSON.parse(nextDataEl.textContent)
  const ads = extractAds(nextData.props.pageProps.searchData || nextData.props.pageProps.ad)
  storeAds(ads)
}

function extractAds(json) {
  const ads = []

  // Single ad.
  if (json?.list_id) {
    ads.push({
      id: json.list_id,
      pub: new Date(json.first_publication_date),
    })
  }
  // Multiple ads.
  else if (json?.ads) {
    json.ads.forEach(ad => {
      ads.push({
        id: ad.list_id,
        pub: new Date(ad.first_publication_date),
      })
    })
  }

  return ads
}

function getStore() {
  const key = 'leboncoin-plus'
  const initialState = { key, ads: [] }

  const _store = localStorage.getItem(key)
  return JSON.parse(_store) || initialState
}

function storeAds(ads) {
  const store = getStore()

  // Filter out data > 30 days old now.
  store.ads = store.ads.filter(a => new Date() - new Date(a.at) < 1000 * 60 * 60 * 24 * 30)

  // Do not replace existing ads, just add new ones.
  for (const ad of ads) {
    const exists = store.ads.some(a => a.id === ad.id)
    if (!exists) store.ads.push({ ...ad, at: new Date() })
  }

  localStorage.setItem(store.key, JSON.stringify(store))
}
