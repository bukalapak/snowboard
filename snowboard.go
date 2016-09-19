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

const version = "v0.1.0"

func Version() map[string]string {
	v := C.drafter_version_string()

	return map[string]string{
		"Snowboard": version,
		"Drafter":   C.GoString(v),
	}
}
