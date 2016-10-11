// Package snowboard parses API Blueprint and renders it as HTML document
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

type Renderer interface {
	HTML([]byte) []byte
}

// Parse formats API Blueprint as blueprint.API struct using selected Parser
func Parse(r io.Reader, engine Parser) (*api.API, error) {
	el, err := parseElement(r, engine)
	if err != nil {
		return nil, err
	}

	return convertElement(el)
}

// Validate validates API Blueprint using selected Parser
func Validate(r io.Reader, engine Parser) (*api.API, error) {
	el, err := validateElement(r, engine)
	if err == nil && el.Object() == nil {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return convertElement(el)
}

func parseElement(r io.Reader, engine Parser) (*api.Element, error) {
	b, err := engine.Parse(r)
	if err != nil {
		return nil, err
	}

	return parseJSON(bytes.NewReader(b))
}

func validateElement(r io.Reader, engine Parser) (*api.Element, error) {
	b, err := engine.Validate(r)
	if err != nil {
		return nil, err
	}

	if len(b) == 0 {
		return &api.Element{}, nil
	}

	return parseJSON(bytes.NewReader(b))
}

func parseJSON(r io.Reader) (*api.Element, error) {
	return api.ParseJSON(r)
}

func convertElement(el *api.Element) (*api.API, error) {
	return api.NewAPI(el)
}
