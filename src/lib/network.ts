// What the page itself can prove about its own network activity, using Resource
// Timing. This does not read request bodies (a page cannot); it counts requests
// by destination and kind, which is enough to state the exact claim we make:
// nothing went to another origin and nothing was a fetch / XHR / beacon.
// `data:` and `blob:` URLs never leave the page, so they are not network.

export interface NetworkReport {
  /** Requests recorded since the mark, excluding data: and blob: URLs. */
  total: number
  /** Requests to an origin other than this page's. */
  otherOrigin: number
  /** fetch / XHR / beacon requests to the network (not data: or blob:). */
  data: number
}

export interface TimingLike {
  name: string
  startTime: number
  initiatorType: string
}

const DATA_INITIATORS = new Set(['fetch', 'xmlhttprequest', 'beacon'])

export function summarizeNetwork(entries: readonly TimingLike[], since: number, origin: string): NetworkReport {
  const report: NetworkReport = { total: 0, otherOrigin: 0, data: 0 }
  for (const entry of entries) {
    if (entry.startTime < since) continue
    let url: URL
    try {
      url = new URL(entry.name, origin)
    } catch {
      continue
    }
    if (url.protocol === 'data:' || url.protocol === 'blob:') continue
    report.total += 1
    if (url.origin !== origin) report.otherOrigin += 1
    if (DATA_INITIATORS.has(entry.initiatorType)) report.data += 1
  }
  return report
}

/** Mark the moment a file is chosen. Returns undefined where Resource Timing is unavailable. */
export function markNow(): number | undefined {
  return typeof performance === 'undefined' ? undefined : performance.now()
}

export function observeNetworkSince(mark: number | undefined): NetworkReport | null {
  if (mark === undefined || typeof performance === 'undefined' || typeof location === 'undefined') return null
  return summarizeNetwork(performance.getEntriesByType('resource') as PerformanceResourceTiming[], mark, location.origin)
}
