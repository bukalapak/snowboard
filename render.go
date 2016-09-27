package snowboard

import (
	"html/template"
	"io"
)

func markdownize(s string) template.HTML {
	return template.HTML(string(markdown([]byte(s))))
}

func Render(s string, w io.Writer, b *API) error {
	funcMap := template.FuncMap{
		"markdownize": markdownize,
	}

	tmpl, err := template.New("api").Funcs(funcMap).Parse(s)
	if err != nil {
		return err
	}

	err = tmpl.Execute(w, b)
	if err != nil {
		return err
	}

	return nil
}
