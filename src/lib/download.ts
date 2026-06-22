// Shared in-browser download helpers (Blob + object URL). Nothing is sent
// anywhere — the file is created client-side and handed to the browser.

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function downloadText(filename: string, text: string, mime = 'text/markdown') {
  downloadBlob(filename, new Blob([text], { type: `${mime};charset=utf-8` }))
}
