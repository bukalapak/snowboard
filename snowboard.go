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
)

const version = "v0.1.0"

func Version() map[string]string {
	v := C.drafter_version_string()

	return map[string]string{
		"Snowboard": version,
		"Drafter":   C.GoString(v),
	}
}

func Parse(r io.Reader) (*Element, error) {
	b, err := ParseBlueprint(r)
	if err != nil {
		return nil, err
	}

	return ParseJSON(bytes.NewReader(b))
}

func ParseBlueprint(r io.Reader) ([]byte, error) {
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

func ParseJSON(r io.Reader) (*Element, error) {
	var el Element

	err := json.NewDecoder(r).Decode(&el.object)
	if err != nil {
		return nil, err
	}

	return &el, nil
}
