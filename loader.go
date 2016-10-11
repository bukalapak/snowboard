package snowboard

import (
	"bufio"
	"bytes"
	"io/ioutil"
	"os"
	"path/filepath"
	"regexp"
	"strings"
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

func partialComment(s string) string {
	re := regexp.MustCompile(`<!--\s?include\((.+)\)\s?-->`)
	rs := re.FindStringSubmatch(s)

	if len(rs) != 2 {
		return s
	}

	return `{{partial "` + rs[1] + `"}}`
}

// Load reads API Blueprint from file as blueprint.API struct using selected Parser
func Load(name string, engine Parser) (*api.API, error) {
	f, err := os.Open(name)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	cs := []string{}
	scanner := bufio.NewScanner(f)

	for scanner.Scan() {
		if strings.HasPrefix(scanner.Text(), "<!--") {
			cs = append(cs, partialComment(scanner.Text()))
		} else {
			cs = append(cs, scanner.Text())
		}
	}

	loader := newLoader(name)
	funcMap := template.FuncMap{
		"partial": loader.partial,
	}

	s := strings.Join(cs, "\n")

	tmpl, err := template.New("apib").Funcs(funcMap).Parse(s)
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
