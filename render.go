package snowboard

import (
	"html/template"
	"io"
)

func markdownize(s string) template.HTML {
	return template.HTML(string(markdown([]byte(s))))
}

// HTML renders blueprint.API struct as HTML document
func HTML(tpl string, w io.Writer, b *API) error {
	funcMap := template.FuncMap{
		"markdownize": markdownize,
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
