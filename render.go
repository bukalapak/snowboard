package snowboard

import (
	"html/template"
	"io"
	"reflect"
)

func markdownize(v reflect.Value) template.HTML {
	b := markdown([]byte(v.String()))
	return template.HTML(string(b))
}

func dig(s string, el *Element) reflect.Value {
	switch s {
	case "title":
		return el.Path("meta.title").Value()
	case "description":
		return el.Path("content").Index(0).Path("content").Value()
	}

	return reflect.Value{}
}

func Render(s string, w io.Writer, el *Element) error {
	funcMap := template.FuncMap{
		"dig":         dig,
		"markdownize": markdownize,
	}

	tmpl, err := template.New("api").Funcs(funcMap).Parse(s)
	if err != nil {
		return err
	}

	err = tmpl.Execute(w, el)
	if err != nil {
		return err
	}

	return nil
}
