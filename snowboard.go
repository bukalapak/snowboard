// Package snowboard parses API Blueprint and renders it as HTML document
package snowboard

import (
	"bytes"
	"encoding/json"
	"io"

	"github.com/subosito/snowboard/blueprint"
)

type Parser interface {
	Parse(r io.Reader) ([]byte, error)
	Validate(r io.Reader) ([]byte, error)
	Version() map[string]string
}

// API is alias for blueprint.API
type API blueprint.API

// Parse formats API Blueprint as blueprint.API struct using selected Parser
func Parse(r io.Reader, engine Parser) (*API, error) {
	el, err := ParseElement(r, engine)
	if err != nil {
		return nil, err
	}

	return element2API(el), nil
}

// ParseElement formats API Blueprint as Element for easier traversal
func ParseElement(r io.Reader, engine Parser) (*Element, error) {
	b, err := engine.Parse(r)
	if err != nil {
		return nil, err
	}

	return parseJSON(bytes.NewReader(b))
}

func parseJSON(r io.Reader) (*Element, error) {
	var el Element

	err := json.NewDecoder(r).Decode(&el.object)
	if err != nil {
		return nil, err
	}

	return &el, nil
}

func element2API(el *Element) *API {
	l := el.Path("content").Index(0)

	return &API{
		Title:          digTitle(l),
		Description:    digDescription(l),
		Metadata:       digMetadata(l),
		ResourceGroups: digResourceGroups(l),
		DataStructures: digDataStructures(l),
	}
}
