// Fonts for the exported PDF. The standard PDF fonts (Helvetica) only cover the
// WinAnsi range, so a CV with Cyrillic, Greek or Latin Extended letters would
// export as blanks. For those documents we embed Liberation Sans (metric-
// compatible with Arial and Helvetica, and it covers Cyrillic). Latin-only
// documents keep Helvetica, so nothing changes for them.
//
// Liberation Fonts are shipped with pdfjs-dist (GPLv2 with the font exception: a
// document that embeds the unaltered font is not covered by the GPL). The licence
// text is served at /licenses/LiberationFonts.txt and listed in THIRD_PARTY_NOTICES.md.
import { Font } from '@react-pdf/renderer'
import regularUrl from 'pdfjs-dist/standard_fonts/LiberationSans-Regular.ttf?url'
import boldUrl from 'pdfjs-dist/standard_fonts/LiberationSans-Bold.ttf?url'

export const UNICODE_FAMILY = 'Liberation Sans'

/** Latin Extended, Greek and Cyrillic: beyond what Helvetica's encoding can draw. */
const BEYOND_WINANSI = /[Ā-ɏͰ-ϿЀ-ԯ]/

export const needsUnicodeFont = (text: string): boolean => BEYOND_WINANSI.test(text)

let registered = false
export function registerUnicodeFont(): void {
  if (registered) return
  Font.register({
    family: UNICODE_FAMILY,
    fonts: [
      { src: regularUrl, fontWeight: 400 },
      { src: boldUrl, fontWeight: 700 },
    ],
  })
  registered = true
}

export interface FontFaces {
  regular: { fontFamily: string }
  bold: { fontFamily: string; fontWeight?: 700 }
}

export function fontFaces(unicode: boolean): FontFaces {
  return unicode
    ? { regular: { fontFamily: UNICODE_FAMILY }, bold: { fontFamily: UNICODE_FAMILY, fontWeight: 700 } }
    : { regular: { fontFamily: 'Helvetica' }, bold: { fontFamily: 'Helvetica-Bold' } }
}
