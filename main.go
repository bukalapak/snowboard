package main

//go:generate esc -o templates.go ./templates

import (
	"bytes"
	"errors"
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"text/tabwriter"

	"github.com/fsnotify/fsnotify"
	"github.com/subosito/snowboard/engines/drafter"
	snowboard "github.com/subosito/snowboard/parser"
)

var versionStr string
var engine = drafter.Engine{}

var (
	version  = flag.Bool("v", false, "Display version information")
	input    = flag.String("i", "", "API blueprint file")
	output   = flag.String("o", "index.html", "Output file")
	format   = flag.String("f", "html", "Format of output file. Supported formats: html, apib")
	serve    = flag.Bool("s", false, "Serve HTML via HTTP server")
	bind     = flag.String("b", "127.0.0.1:8088", "Set HTTP server listen address and port")
	tplFile  = flag.String("t", "alpha", "Custom template for documentation")
	validate = flag.Bool("l", false, "Validate input only")
)

func main() {
	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "Usage:\n  snowboard [OPTIONS]\n\nOptions:\n")
		flag.PrintDefaults()
		os.Exit(0)
	}

	flag.Parse()

	if *version {
		displayVersion()
	}

	if *input == "" {
		flag.Usage()
	}

	if *validate {
		performValidation()
	}

	if *serve {
		watch()
	} else {
		render()
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

func renderHTML() {
	bp, err := snowboard.Load(*input, engine)
	logErr(err)

	of, err := os.Create(*output)
	logErr(err)
	defer of.Close()

	tf, err := readTemplate(*tplFile)
	logErr(err)

	err = snowboard.HTML(string(tf), of, bp)
	logErr(err)
	log.Println("HTML has been generated!")
}

func renderAPIB() {
	b, err := snowboard.Read(*input)
	logErr(err)

	of, err := os.Create(*output)
	logErr(err)
	defer of.Close()

	_, err = io.Copy(of, bytes.NewReader(b))
	logErr(err)

	log.Println("API blueprint has been generated!")
}

func logErr(err error) {
	if err != nil {
		log.Fatalln("Error: ", err)
	}
}

func runServer() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, *output)
	})

	err := http.ListenAndServe(*bind, nil)
	logErr(err)
}

func displayVersion() {
	if versionStr == "" {
		versionStr = "HEAD"
	}

	fmt.Printf("Snowboard version: %s\n", versionStr)
	fmt.Printf("Drafter version: %s\n", engine.Version())

	os.Exit(0)
}

func performValidation() {
	b, err := readFile(*input)
	checkErr(err)

	bf := bytes.NewReader(b)

	out, err := snowboard.Validate(bf, engine)
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

func watch() {
	watcher, err := fsnotify.NewWatcher()
	checkErr(err)
	defer watcher.Close()

	done := make(chan bool)
	go func() {
		for {
			select {
			case event := <-watcher.Events:
				if event.Op&fsnotify.Write == fsnotify.Write {
					render()
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

	render()
	runServer()

	<-done
}

func render() {
	switch *format {
	case "html":
		renderHTML()
	case "apib":
		renderAPIB()
	}
}
