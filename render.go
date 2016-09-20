package snowboard

import (
	"html/template"
	"io"
	"reflect"

	bf "github.com/russross/blackfriday"
)

func markdownize(v reflect.Value) template.HTML {
	b := bf.MarkdownCommon([]byte(v.String()))
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

func HTML(w io.Writer, el *Element) error {
	return Render(DefaultTemplate, w, el)
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
