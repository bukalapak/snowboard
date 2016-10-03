// Package snowboard parses API Blueprint and renders it as HTML document
package snowboard

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"

	"github.com/subosito/snowboard/blueprint"
)

type Parser interface {
	Parse(r io.Reader) ([]byte, error)
	Version() map[string]string
}

type Checker interface {
	Validate(r io.Reader) ([]byte, error)
	Version() map[string]string
}

// API is alias for blueprint.API
type API blueprint.API

// Parse formats API Blueprint as blueprint.API struct using selected Parser
func Parse(r io.Reader, engine Parser) (*API, error) {
	el, err := parseElement(r, engine)
	if err != nil {
		return nil, err
	}

	return convertElement(el)
}

// Validate validates API Blueprint using selected Parser
func Validate(r io.Reader, engine Checker) (*API, error) {
	el, err := validateElement(r, engine)
	if err != nil {
		return nil, err
	}

	return convertElement(el)
}

func parseElement(r io.Reader, engine Parser) (*Element, error) {
	b, err := engine.Parse(r)
	if err != nil {
		return nil, err
	}

	return parseJSON(bytes.NewReader(b))
}

func validateElement(r io.Reader, engine Checker) (*Element, error) {
	b, err := engine.Validate(r)
	if err != nil {
		return nil, err
	}

	if len(b) == 0 {
		return &Element{}, nil
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

func convertElement(el *Element) (*API, error) {
	if el.Path("element").String() != "parseResult" {
		return nil, errors.New("Unsupported element")
	}

	children, err := el.Path("content").Children()
	if err != nil {
		return nil, err
	}

	api := &API{}

	for _, child := range children {
		switch child.Path("element").String() {
		case "category":
			if hasClass("api", child) {
				api.Title = digTitle(child)
				api.Description = digDescription(child)
				api.Metadata = digMetadata(child)
				api.ResourceGroups = digResourceGroups(child)
				api.DataStructures = digDataStructures(child)
			}
		case "annotation":
			api.Annotations = append(api.Annotations, extractAnnotation(child))
		}
	}

	return api, nil
}
