# Third-party notices

## Liberation Sans (exported PDF, Cyrillic and other non-Latin text)

When a CV built in the browser contains Cyrillic, Greek or Latin Extended letters, the
exported PDF embeds **Liberation Sans** (Regular and Bold), which is shipped inside
`pdfjs-dist` (`standard_fonts/`). Latin-only CVs use the standard Helvetica font and embed
nothing.

- Source: the Liberation Fonts, distributed by `pdfjs-dist`.
- Licence: GNU General Public License v2 with the Liberation font exception. A document that
  embeds the unaltered font is not itself covered by the GPL. The full text is in
  [`public/licenses/LiberationFonts.txt`](public/licenses/LiberationFonts.txt) and is served at
  `/licenses/LiberationFonts.txt`.
- The font files are not modified.
