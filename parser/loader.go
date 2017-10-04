package parser

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

	"github.com/imdario/mergo"
	"github.com/pkg/errors"
)

type loader struct {
	name    string
	baseDir string
	seeds   []string
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

func (d *loader) loadSeeds() (map[string]interface{}, error) {
	z := map[string]interface{}{}

	for _, seed := range d.seeds {
		m, err := d.unmarshal(seed)
		if err != nil {
			return z, errors.Wrap(err, fmt.Sprintf("%s -> %s", d.name, seed))
		}

		mergo.Merge(&z, m)
	}

	return z, nil
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
		d.seeds = append(d.seeds, rs[1])
		return ""
	}

	return fmt.Sprintf(format, rs[1])
}

func (d *loader) parse() (string, error) {
	f, err := os.Open(d.name)
	if err != nil {
		return "", errors.Wrap(err, d.name)
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

func join(ss []interface{}, s string) string {
	xs := []string{}

	for _, s := range ss {
		if z, ok := s.(string); ok {
			xs = append(xs, z)
		}
	}

	return strings.Join(xs, s)
}

// Read reads API blueprint from file as bytes
func Read(name string) ([]byte, error) {
	d := newLoader(name)

	s, err := d.parse()
	if err != nil {
		return nil, err
	}

	data, err := d.loadSeeds()
	if err != nil {
		return nil, err
	}

	b, _ := process(s, data, template.FuncMap{"partial": d.partial})

	funcMap := template.FuncMap{
		"upcase": strings.ToUpper,
		"join":   join,
	}

	b, err = process(string(b), data, funcMap)
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

// Seeds lists filenames of API blueprint's seeds.
func Seeds(name string) []string {
	d := newLoader(name)

	if _, err := d.parse(); err != nil {
		return []string{}
	}

	return d.seeds
}
