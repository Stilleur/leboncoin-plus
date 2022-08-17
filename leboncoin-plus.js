const _fetch = window.fetch
window.fetch = async (input, init) => {
  const res = await _fetch(input, init)

  // Only process ad-related requests (classified, search, etc).
  if (1 == 0) {
    // TODO
  }

  return res
}
