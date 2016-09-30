# snowboard

[![CircleCI](https://img.shields.io/circleci/project/subosito/snowboard.svg?maxAge=2592000)](https://circleci.com/gh/subosito/snowboard)
[![GoDoc](https://godoc.org/github.com/subosito/snowboard?status.svg)](https://godoc.org/github.com/subosito/snowboard)

API blueprint parser and formatter.

## Installation

**Homebrew** for macOS:

```sh
$ brew install --HEAD https://raw.github.com/subosito/snowboard/master/tools/homebrew/snowboard.rb
```

**Manual** installation:

```sh
$ git clone https://github.com/subosito/snowboard.git
$ cd snowboard
$ make install
```

Note: ensure you have configured your `GOPATH` and `PATH`.

**Docker**

You can also use automated build docker image on `subosito/snowboard`:

```
$ docker pull subosito/snowboard
$ docker run subosito/snowboard -h
```

## CLI Usage

Let's say we have API Blueprint document called `API.apib`, like:

```
$ cat API.apib
# My API
## GET /message
+ Response 200 (text/plain)

        Hello World!
EOF
```

**Generate HTML Documentation**

To generate HTML documentation we can do:

```
$ snowboard -i API.apib -o output.html
```

Above command will generate `ouput.html` using default template (currently, it's called `alpha`).

**Custom Template**

If you want to use custom template, you can use flag `-t` for that:

```
$ snowboard -i API.apib -o output.html -t awesome-template.html
```

To see how the template looks like, you can see `snowboard` default template located in `templates/alpha.html`.

**Auto-Regenerate HTML Documentation**

When you want to perform auto-regenerate HTML documentation, you can pass `-w` flag:

```
$ snowboard -i API.apib -o output.html -t awesome-template.html -w
```

With this flag, any updates on both input and template will trigger auto-regeneration.

**Help**

You can also see all supported flags by passing `-h`, like:

```
$ snowboard -h
Usage:
  snowboard [OPTIONS]

Options:
  -i string  API Blueprint file
  -o string  HTML output file (default "index.html")
  -s         Serve HTML via 0.0.0.0:8088
  -t string  Custom template for documentation (default "alpha")
  -v         Display version information
  -w         Watch input (and template, if any) file for changes
```

## Examples

You can see examples of default template, called `alpha`, in `examples/alpha` directory. They looks like:

- [Named Resource and Actions](https://htmlpreview.github.io/?https://github.com/subosito/snowboard/blob/master/examples/alpha/03.%20Named%20Resource%20and%20Actions.html)
- [Real World API](https://htmlpreview.github.io/?https://github.com/subosito/snowboard/blob/master/examples/alpha/Real%20World%20API.html)
- And many more...

All of the examples are generated from official [API Blueprint examples](https://github.com/apiaryio/api-blueprint/tree/master/examples)


## Status

Most features have been implemented. There are some missing part, like handling complex Data Structure, etc are on the way. Please be patient :)

