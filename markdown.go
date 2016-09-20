package snowboard

import (
	"bytes"

	bf "github.com/russross/blackfriday"
)

type markdownHtml struct {
	bf.Renderer
}

func markdownRenderer() bf.Renderer {
	var commonHtmlFlags = 0 |
		bf.HTML_USE_XHTML |
		bf.HTML_USE_SMARTYPANTS |
		bf.HTML_SMARTYPANTS_FRACTIONS |
		bf.HTML_SMARTYPANTS_DASHES |
		bf.HTML_SMARTYPANTS_LATEX_DASHES

	return newMarkdownRenderer(commonHtmlFlags, "", "")
}

func markdown(input []byte) []byte {
	var commonExtensions = 0 |
		bf.EXTENSION_NO_INTRA_EMPHASIS |
		bf.EXTENSION_TABLES |
		bf.EXTENSION_FENCED_CODE |
		bf.EXTENSION_AUTOLINK |
		bf.EXTENSION_STRIKETHROUGH |
		bf.EXTENSION_SPACE_HEADERS |
		bf.EXTENSION_HEADER_IDS |
		bf.EXTENSION_BACKSLASH_LINE_BREAK |
		bf.EXTENSION_DEFINITION_LISTS

	renderer := markdownRenderer()
	return bf.MarkdownOptions(input, renderer, bf.Options{Extensions: commonExtensions})
}

func newMarkdownRenderer(flags int, title string, css string) bf.Renderer {
	renderer := bf.HtmlRenderer(flags, title, css)
	return &markdownHtml{renderer}
}

/** overriding blackfriday default rendering **/

func doubleSpace(out *bytes.Buffer) {
	if out.Len() > 0 {
		out.WriteByte('\n')
	}
}

func (options *markdownHtml) Table(out *bytes.Buffer, header []byte, body []byte, columnData []int) {
	doubleSpace(out)
	out.WriteString("<table class=\"table\">\n<thead>\n")
	out.Write(header)
	out.WriteString("</thead>\n\n<tbody>\n")
	out.Write(body)
	out.WriteString("</tbody>\n</table>\n")
}
