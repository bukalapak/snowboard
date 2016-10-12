// Package snowboard API blueprint parser and renderer
package snowboard

import (
	"bytes"
	"io"

	"github.com/subosito/snowboard/api"
)

type Parser interface {
	Parse(r io.Reader) ([]byte, error)
	Validate(r io.Reader) ([]byte, error)
	Version() map[string]string
}

// Parse formats API blueprint as blueprint.API struct using selected Parser
func Parse(r io.Reader, engine Parser) (*api.API, error) {
	el, err := parseElement(r, engine)
	if err != nil {
		return nil, err
	}

	return api.NewAPI(el)
}

// Validate validates API blueprint using selected Parser
func Validate(r io.Reader, engine Parser) (*api.API, error) {
	el, err := validateElement(r, engine)
	if err == nil && el.Object() == nil {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return api.NewAPI(el)
}

// Load reads API blueprint from file as blueprint.API struct using selected Parser
func Load(name string, engine Parser) (*api.API, error) {
	b, err := Read(name)
	if err != nil {
		return nil, err
	}

	return Parse(bytes.NewReader(b), engine)
}

func parseElement(r io.Reader, engine Parser) (*api.Element, error) {
	b, err := engine.Parse(r)
	if err != nil {
		return nil, err
	}

	return api.ParseJSON(bytes.NewReader(b))
}

func validateElement(r io.Reader, engine Parser) (*api.Element, error) {
	b, err := engine.Validate(r)
	if err != nil {
		return nil, err
	}

	if len(b) == 0 {
		return &api.Element{}, nil
	}

	return api.ParseJSON(bytes.NewReader(b))
}
