package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/subosito/snowboard"
)

func main() {
	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "Usage:\n  snowboard [OPTIONS]\n\nOptions:\n")
		flag.PrintDefaults()
	}

	version := flag.Bool("v", false, "Display version information")
	flag.Parse()

	if *version {
		vs := snowboard.Version()
		for name, version := range vs {
			fmt.Printf("%s version: %s\n", name, version)
		}
		os.Exit(0)
	}
}
