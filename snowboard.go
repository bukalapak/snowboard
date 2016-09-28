// Package snowboard parses API Blueprint and renders it as HTML document
package snowboard

/*
#cgo CFLAGS: -I./ext/drafter/src/ -I./ext/drafter/ext/snowcrash/src/
#cgo darwin LDFLAGS: -L"./ext/drafter/build/out/Release/" -ldrafter -lsos -lsnowcrash -lmarkdownparser -lsundown -lc++
#cgo linux LDFLAGS: -L"./ext/drafter/build/out/Release/" -ldrafter -lsos -lsnowcrash -lmarkdownparser -lsundown -lstdc++
#include <stdlib.h>
#include <stdio.h>
#include "drafter.h"
*/
import "C"
import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"unsafe"

	"github.com/subosito/snowboard/blueprint"
)

const version = "v0.1.0"

// API is alias for blueprint.API
type API blueprint.API

// Version returns current version of Snowboard and Drafter
func Version() map[string]string {
	v := C.drafter_version_string()

	return map[string]string{
		"Snowboard": version,
		"Drafter":   C.GoString(v),
	}
}

// Parse formats API Blueprint as blueprint.API struct
func Parse(r io.Reader) (*API, error) {
	el, err := ParseElement(r)
	if err != nil {
		return nil, err
	}

	return element2API(el), nil
}

// ParseElement formats API Blueprint as Element for easier traversal
func ParseElement(r io.Reader) (*Element, error) {
	b, err := parseBlueprint(r)
	if err != nil {
		return nil, err
	}

	return parseJSON(bytes.NewReader(b))
}

func parseBlueprint(r io.Reader) ([]byte, error) {
	b, err := ioutil.ReadAll(r)
	if err != nil {
		return nil, err
	}

	var s string

	cSource := C.CString(string(b))
	cResult := C.CString(s)
	options := C.drafter_options{sourcemap: false, format: C.DRAFTER_SERIALIZE_JSON}

	code := int(C.drafter_parse_blueprint_to(cSource, &cResult, options))
	if code != 0 {
		return nil, fmt.Errorf("ParseBlueprint failed with code: %d", code)
	}

	result := C.GoString(cResult)
	C.free(unsafe.Pointer(cResult))

	return []byte(result), nil
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
	}
}
