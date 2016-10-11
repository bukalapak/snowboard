package snowboard

import (
	"bytes"
	"io/ioutil"
	"path/filepath"
	"text/template"

	"github.com/subosito/snowboard/api"
)

type loader struct {
	base string
}

func newLoader(name string) *loader {
	abs, err := filepath.Abs(filepath.Dir(name))
	if err != nil {
		return &loader{}
	}

	return &loader{base: abs}
}

func (l *loader) partial(name string) string {
	fname := filepath.Join(l.base, name)

	b, err := ioutil.ReadFile(fname)
	if err != nil {
		return ""
	}

	return string(b)
}

// Load reads API Blueprint from file as blueprint.API struct using selected Parser
func Load(name string, engine Parser) (*api.API, error) {
	b, err := ioutil.ReadFile(name)
	if err != nil {
		return nil, err
	}

	loader := newLoader(name)
	funcMap := template.FuncMap{
		"partial": loader.partial,
	}

	tmpl, err := template.New("apib").Funcs(funcMap).Parse(string(b))
	if err != nil {
		return nil, err
	}

	z := bytes.NewBufferString("")

	err = tmpl.Execute(z, nil)
	if err != nil {
		return nil, err
	}

	return Parse(z, engine)
}
