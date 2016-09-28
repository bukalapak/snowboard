package snowboard

import (
	"html/template"
	"io"
	"strings"

	"github.com/subosito/snowboard/blueprint"
)

func markdownize(s string) template.HTML {
	return template.HTML(string(markdown([]byte(s))))
}

func parameterize(s string) string {
	return strings.Replace(strings.ToLower(s), " ", "-", -1)
}

func colorize(t blueprint.Transition) string {
	for _, m := range t.Transactions {
		switch m.Request.Method {
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
		}
	}

	return ""
}

// HTML renders blueprint.API struct as HTML document
func HTML(tpl string, w io.Writer, b *API) error {
	funcMap := template.FuncMap{
		"markdownize":  markdownize,
		"parameterize": parameterize,
		"colorize":     colorize,
	}

	tmpl, err := template.New("api").Funcs(funcMap).Parse(tpl)
	if err != nil {
		return err
	}

	err = tmpl.Execute(w, b)
	if err != nil {
		return err
	}

	return nil
}
