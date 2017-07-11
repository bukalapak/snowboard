package parser

import (
	"html/template"
	"io"
	"strconv"
	"strings"

	"github.com/bukalapak/snowboard/api"
	"github.com/miekg/mmark"
)

func markdownize(s string) template.HTML {
	return template.HTML(markdown([]byte(s)))
}

func parameterize(s string) string {
	return strings.Replace(strings.ToLower(s), " ", "-", -1)
}

func toString(v interface{}) string {
	s, ok := v.(string)
	if ok {
		return s
	}

	n, ok := v.(int)
	if ok {
		return strconv.Itoa(n)
	}

	return ""
}

func colorize(v interface{}) string {
	switch toString(v) {
	case "GET":
		return "green"
	case "POST":
		return "blue"
	case "PUT":
		return "teal"
	case "PATCH":
		return "violet"
	case "DELETE":
		return "red"
	case "200", "201", "202", "204":
		return "blue"
	case "401", "403", "404", "422":
		return "orange"
	case "500":
		return "red"
	}

	return ""
}

func alias(s string) string {
	if strings.Contains(s, "json") {
		return "json"
	}

	return ""
}

func markdown(input []byte) string {
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

	return bf.String()
}

// HTML renders blueprint.API struct as HTML document
func HTML(tpl string, w io.Writer, b *api.API) error {
	funcMap := template.FuncMap{
		"markdownize":  markdownize,
		"parameterize": parameterize,
		"colorize":     colorize,
		"alias":        alias,
	}

	tmpl, err := template.New("html").Funcs(funcMap).Parse(tpl)
	if err != nil {
		return err
	}

	err = tmpl.Execute(w, b)
	if err != nil {
		return err
	}

	return nil
}
