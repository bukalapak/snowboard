// Package parser is an API blueprint parser and renderer
package parser

import (
	"bytes"
	"io"

	"github.com/bukalapak/snowboard/api"
)

type Parser interface {
	Parse(r io.Reader) ([]byte, error)
	Validate(r io.Reader) ([]byte, error)
	Version() string
}

// Parse formats API blueprint as blueprint.API struct using selected Parser
func Parse(r io.Reader, engine Parser) (*api.API, error) {
	el, err := parseElement(r, engine)
	if err != nil {
		return nil, err
	}

	return api.NewAPI(el)
}

// ParseAsJSON parse API blueprint as API Element JSON
func ParseAsJSON(r io.Reader, engine Parser) ([]byte, error) {
	return engine.Parse(r)
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

// LoadAsJSON reads API blueprint from file as API Element JSON using selected Parser
func LoadAsJSON(name string, engine Parser) ([]byte, error) {
	b, err := Read(name)
	if err != nil {
		return nil, err
	}

	return ParseAsJSON(bytes.NewReader(b), engine)
}

func parseElement(r io.Reader, engine Parser) (*api.Element, error) {
	b, err := ParseAsJSON(r, engine)
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
