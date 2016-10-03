package drafter

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
	"fmt"
	"io"
	"io/ioutil"
	"unsafe"
)

func Parse(r io.Reader) ([]byte, error) {
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
