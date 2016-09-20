package main

import (
	"errors"
	"flag"
	"fmt"
	"os"

	"github.com/subosito/snowboard"
)

var (
	version = flag.Bool("v", false, "Display version information")
	input   = flag.String("i", "API.apib", "API Blueprint file")
	output  = flag.String("o", "index.html", "HTML output file")
)

func main() {
	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "Usage:\n  snowboard [OPTIONS]\n\nOptions:\n")
		flag.PrintDefaults()
		os.Exit(0)
	}

	flag.Parse()

	if *version {
		vs := snowboard.Version()
		for name, version := range vs {
			fmt.Printf("%s version: %s\n", name, version)
		}
		os.Exit(0)
	}

	f, err := openFile(*input)
	checkErr(err)
	defer f.Close()

	el, err := snowboard.Parse(f)
	checkErr(err)

	of, err := os.Create(*output)
	checkErr(err)
	defer of.Close()

	err = snowboard.HTML(of, el.Path("content").Index(0))
	checkErr(err)
}

func openFile(fn string) (*os.File, error) {
	info, err := os.Stat(fn)
	if err != nil {
		return nil, errors.New("File is not exist")
	}

	if info.IsDir() {
		return nil, errors.New("File is not valid blueprint document")
	}

	return os.Open(fn)
}

func checkErr(err error) {
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %s\n", err)
		os.Exit(1)
	}
}
