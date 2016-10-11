package snowboard

import "github.com/miekg/mmark"

func Markdown(input []byte) []byte {
	flags := 0
	flags |= mmark.HTML_USE_SMARTYPANTS
	flags |= mmark.HTML_SMARTYPANTS_FRACTIONS
	flags |= mmark.HTML_SMARTYPANTS_DASHES
	flags |= mmark.HTML_SMARTYPANTS_LATEX_DASHES

	extensions := 0
	extensions |= mmark.EXTENSION_TABLES
	extensions |= mmark.EXTENSION_FENCED_CODE
	extensions |= mmark.EXTENSION_AUTOLINK
	extensions |= mmark.EXTENSION_SPACE_HEADERS
	extensions |= mmark.EXTENSION_CITATION
	extensions |= mmark.EXTENSION_TITLEBLOCK_TOML
	extensions |= mmark.EXTENSION_HEADER_IDS
	extensions |= mmark.EXTENSION_AUTO_HEADER_IDS
	extensions |= mmark.EXTENSION_UNIQUE_HEADER_IDS
	extensions |= mmark.EXTENSION_FOOTNOTES
	extensions |= mmark.EXTENSION_SHORT_REF
	extensions |= mmark.EXTENSION_INCLUDE
	extensions |= mmark.EXTENSION_PARTS
	extensions |= mmark.EXTENSION_ABBREVIATIONS
	extensions |= mmark.EXTENSION_DEFINITION_LISTS

	hr := mmark.HtmlRenderer(flags, "", "")
	bf := mmark.Parse(input, hr, extensions)

	return bf.Bytes()
}
