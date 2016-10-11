package snowboard

import (
	"bufio"
	"bytes"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"text/template"

	"github.com/subosito/snowboard/api"
)

type loader struct {
	name    string
	baseDir string
}

func newLoader(name string) *loader {
	d := &loader{name: name}
	d.detectBaseDir()

	return d
}

func (d *loader) detectBaseDir() {
	abs, err := filepath.Abs(filepath.Dir(d.name))
	if err == nil {
		d.baseDir = abs
	}
}

func (d *loader) partial(name string) string {
	fname := filepath.Join(d.baseDir, name)

	b, err := ioutil.ReadFile(fname)
	if err != nil {
		return ""
	}

	return string(b)
}

func (d *loader) convert(s string) string {
	var format string
	var re *regexp.Regexp

	switch {
	case strings.Contains(s, "include"):
		re = regexp.MustCompile(`<!-- include\((.+)\) -->`)
		format = `{{partial "%s"}}`
	default:
		re = regexp.MustCompile(`<!-- (.+) -->`)
		format = `{%s}`
	}

	rs := re.FindStringSubmatch(s)

	if len(rs) != 2 {
		return s
	}

	return fmt.Sprintf(format, rs[1])
}

func (d *loader) read() (string, error) {
	f, err := os.Open(d.name)
	if err != nil {
		return "", err
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	cs := []string{}

	for scanner.Scan() {
		if strings.HasPrefix(scanner.Text(), "<!--") {
			cs = append(cs, d.convert(scanner.Text()))
		} else {
			cs = append(cs, scanner.Text())
		}
	}

	return strings.Join(cs, "\n"), nil
}

func Read(name string) ([]byte, error) {
	d := newLoader(name)

	s, err := d.read()
	if err != nil {
		return nil, err
	}

	funcMap := template.FuncMap{
		"partial": d.partial,
	}

	tmpl, err := template.New("apib").Funcs(funcMap).Parse(s)
	if err != nil {
		return nil, err
	}

	z := bytes.NewBufferString("")

	err = tmpl.Execute(z, nil)
	if err != nil {
		return nil, err
	}

	return z.Bytes(), nil
}

// Load reads API Blueprint from file as blueprint.API struct using selected Parser
func Load(name string, engine Parser) (*api.API, error) {
	b, err := Read(name)
	if err != nil {
		return nil, err
	}

	return Parse(bytes.NewReader(b), engine)
}
