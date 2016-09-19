package main

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
	"flag"
	"fmt"
	"os"
)

const appVersion = "0.1.0"

func main() {
	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "Usage:\n  snowboard [OPTIONS]\n\nOptions:\n")
		flag.PrintDefaults()
	}

	version := flag.Bool("v", false, "Display version information")
	flag.Parse()

	if *version {
		v := C.drafter_version_string()
		s := C.GoString(v)
		fmt.Printf("Snowboard version: v%s\n", appVersion)
		fmt.Printf("Drafter version: %s\n", s)
		os.Exit(0)
	}
}
