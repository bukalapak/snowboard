package main

//go:generate esc -o templates.go ../../templates

import (
	"bytes"
	"errors"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"text/tabwriter"

	"github.com/fsnotify/fsnotify"
	"github.com/subosito/snowboard"
	"github.com/subosito/snowboard/engines/drafter"
	"github.com/subosito/snowboard/engines/drafterc"
)

const versionStr = "v0.3.1"

var (
	version  = flag.Bool("v", false, "Display version information")
	input    = flag.String("i", "", "API Blueprint file")
	output   = flag.String("o", "index.html", "HTML output file")
	watch    = flag.Bool("w", false, "Watch input (and template, if any) file for changes")
	serve    = flag.Bool("s", false, "Serve HTML via 0.0.0.0:8088")
	tplFile  = flag.String("t", "alpha", "Custom template for documentation")
	engineF  = flag.String("e", "cgo", "Use different engine. Supported engines: cgo, cli")
	validate = flag.Bool("l", false, "Validate input only")
)

func main() {
	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "Usage:\n  snowboard [OPTIONS]\n\nOptions:\n")
		flag.PrintDefaults()
		os.Exit(0)
	}

	flag.Parse()

	engine := parserEngine()

	if *version {
		fmt.Printf("Snowboard version: %s\n", versionStr)
		fmt.Println("Engine:")

		for name, v := range engine.Version() {
			fmt.Printf("  %s version: %s\n", name, v)
		}

		os.Exit(0)
	}

	if *input == "" {
		flag.Usage()
	}

	if *validate {
		cEngine := checkerEngine()

		b, err := readFile(*input)
		checkErr(err)

		bf := bytes.NewReader(b)

		out, err := snowboard.Validate(bf, cEngine)
		if err == nil && out == nil {
			fmt.Fprintf(os.Stdout, "OK\n")
			os.Exit(0)
		}

		if err != nil {
			checkErr(err)
		}

		s := "--------"
		w := tabwriter.NewWriter(os.Stdout, 8, 0, 0, ' ', tabwriter.Debug)
		fmt.Fprintln(w, "Row\tCol\tDescription")
		fmt.Fprintf(w, "%s\t%s\t%s\n", s, s, strings.Repeat(s, 12))

		for _, n := range out.Annotations {
			for _, m := range n.SourceMaps {
				fmt.Fprintf(w, "%d\t%d\t%s\n", m.Row, m.Col, n.Description)
			}
		}

		w.Flush()
		os.Exit(1)
	}

	if *watch {
		watcher, err := fsnotify.NewWatcher()
		checkErr(err)
		defer watcher.Close()

		done := make(chan bool)
		go func() {
			for {
				select {
				case event := <-watcher.Events:
					if event.Op&fsnotify.Write == fsnotify.Write {
						renderHTML(engine)
					}
				case err := <-watcher.Errors:
					log.Println("Error:", err)
				}
			}
		}()

		err = watcher.Add(*input)
		checkErr(err)

		_, err = os.Stat(*tplFile)
		if err == nil {
			err = watcher.Add(*tplFile)
			checkErr(err)
		}

		renderHTML(engine)
		serveHTML()

		<-done
	} else {
		renderHTML(engine)
		serveHTML()
	}
}

func readFile(fn string) ([]byte, error) {
	info, err := os.Stat(fn)
	if err != nil {
		return nil, errors.New("File is not exist")
	}

	if info.IsDir() {
		return nil, errors.New("File is a directory")
	}

	return ioutil.ReadFile(fn)
}

func readTemplate(fn string) ([]byte, error) {
	tf, err := readFile(fn)
	if err == nil {
		return tf, nil
	}

	fs := FS(false)
	ff, err := fs.Open("/templates/" + fn + ".html")
	if err != nil {
		return nil, err
	}

	defer ff.Close()
	return ioutil.ReadAll(ff)
}

func checkErr(err error) {
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %s\n", err)
		os.Exit(1)
	}
}

func renderHTML(engine snowboard.Parser) {
	b, err := readFile(*input)
	logErr(err)

	log.Println("Generate HTML... START")

	bf := bytes.NewReader(b)
	bp, err := snowboard.Parse(bf, engine)
	logErr(err)

	of, err := os.Create(*output)
	logErr(err)
	defer of.Close()

	tf, err := readTemplate(*tplFile)
	logErr(err)

	err = snowboard.HTML(string(tf), of, bp)
	logErr(err)

	log.Println("Generate HTML... DONE")
}

func logErr(err error) {
	if err != nil {
		log.Fatalln("Error: ", err)
	}
}

func serveHTML() {
	if !*serve {
		return
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, *output)
	})

	err := http.ListenAndServe(":8088", nil)
	logErr(err)
}

func parserEngine() snowboard.Parser {
	switch *engineF {
	case "cli":
		return drafterc.Engine{}
	}

	return drafter.Engine{}
}

func checkerEngine() snowboard.Checker {
	return drafter.Engine{}
}
