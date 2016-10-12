package snowboard

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"text/template"
)

type loader struct {
	name    string
	seed    string
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
	b, err := d.read(name)
	if err != nil {
		return ""
	}

	return string(b)
}

func (d *loader) read(name string) ([]byte, error) {
	fname := filepath.Join(d.baseDir, name)
	return ioutil.ReadFile(fname)
}

func (d *loader) unmarshal(name string) (data map[string]interface{}, err error) {
	if name == "" {
		return
	}

	b, err := d.read(name)
	if err != nil {
		return
	}

	err = json.Unmarshal(b, &data)
	if err != nil {
		return
	}

	return
}

func (d *loader) loadSeed() (map[string]interface{}, error) {
	return d.unmarshal(d.seed)
}

func (d *loader) convert(s string) string {
	var format string
	var re *regexp.Regexp

	switch {
	case strings.Contains(s, "seed"):
		re = regexp.MustCompile(`<!-- seed\((.+)\) -->`)
		format = "seed"
	case strings.Contains(s, "include"):
		re = regexp.MustCompile(`<!-- include\((.+)\) -->`)
		format = `{{partial "%s"}}`
	case strings.Contains(s, "partial"):
		re = regexp.MustCompile(`<!-- partial\((.+)\) -->`)
		format = `{{partial "%s"}}`
	default:
		re = regexp.MustCompile(`<!-- (.+) -->`)
		format = `{%s}`
	}

	rs := re.FindStringSubmatch(s)

	if len(rs) != 2 {
		return s
	}

	if format == "seed" {
		d.seed = rs[1]
		return ""
	}

	return fmt.Sprintf(format, rs[1])
}

func (d *loader) parse() (string, error) {
	f, err := os.Open(d.name)
	if err != nil {
		return "", err
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	cs := []string{}

	for scanner.Scan() {
		switch {
		case strings.HasPrefix(scanner.Text(), "<!--"):
			cs = append(cs, d.convert(scanner.Text()))
		default:
			cs = append(cs, scanner.Text())
		}
	}

	return strings.Join(cs, "\n"), nil
}

// Read reads API blueprint from file as bytes
func Read(name string) ([]byte, error) {
	d := newLoader(name)

	s, err := d.parse()
	if err != nil {
		return nil, err
	}

	funcMap := template.FuncMap{
		"partial": d.partial,
	}

	data, err := d.loadSeed()
	if err != nil {
		return nil, err
	}

	b, err := process(s, data, funcMap)
	if err != nil {
	}

	b, err = process(string(b), data, nil)
	if err != nil {
		return nil, err
	}

	return b, nil
}

func process(s string, data interface{}, funcMap template.FuncMap) ([]byte, error) {
	tmpl, err := template.New("apib").Funcs(funcMap).Parse(s)
	if err != nil {
		return nil, err
	}

	z := bytes.NewBufferString("")

	err = tmpl.Execute(z, data)
	if err != nil {
		return nil, err
	}

	return z.Bytes(), nil
}
