package drafter

/*
#cgo CFLAGS: -I"${SRCDIR}/ext/drafter/src/" -I"${SRCDIR}/ext/drafter/ext/snowcrash/src/"
#cgo darwin LDFLAGS: -L"${SRCDIR}/ext/drafter/build/out/Release/" -ldrafter -lsos -lsnowcrash -lmarkdownparser -lsundown -lc++
#cgo linux LDFLAGS: -L"${SRCDIR}/ext/drafter/build/out/Release/" -ldrafter -lsos -lsnowcrash -lmarkdownparser -lsundown -lstdc++
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

const Version = "v3.2.6"

type Engine struct{}

func (e Engine) Parse(r io.Reader) ([]byte, error) {
	b, err := ioutil.ReadAll(r)
	if err != nil {
		return nil, err
	}

	cSource := C.CString(string(b))
	cResult := &C.drafter_result{}

	code := int(C.drafter_parse_blueprint(cSource, &cResult))
	if code != 0 {
		return nil, fmt.Errorf("ParseBlueprint failed with code: %d", code)
	}

	C.free(unsafe.Pointer(cSource))

	return e.serialize(cResult), nil
}

func (e Engine) Validate(r io.Reader) ([]byte, error) {
	b, err := ioutil.ReadAll(r)
	if err != nil {
		return nil, err
	}

	cSource := C.CString(string(b))
	cResult := C.drafter_check_blueprint(cSource)

	C.free(unsafe.Pointer(cSource))

	return e.serialize(cResult), nil
}

func (e Engine) Version() string {
	return C.GoString(C.drafter_version_string())
}

func (e Engine) serialize(r *C.drafter_result) []byte {
	options := C.drafter_options{sourcemap: false, format: C.DRAFTER_SERIALIZE_JSON}
	cResult := C.drafter_serialize(r, options)
	results := C.GoString(cResult)

	C.free(unsafe.Pointer(cResult))

	return []byte(results)
}
