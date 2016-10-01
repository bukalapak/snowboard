# snowboard

[![Build Status](https://travis-ci.org/subosito/snowboard.svg?branch=master)](https://travis-ci.org/subosito/snowboard)
[![GoDoc](https://godoc.org/github.com/subosito/snowboard?status.svg)](https://godoc.org/github.com/subosito/snowboard)
[![Docker Automated build](https://img.shields.io/docker/automated/subosito/snowboard.svg?maxAge=2592000)](https://hub.docker.com/r/subosito/snowboard/)

API blueprint parser and formatter.

## Installation

The latest executables for supported platforms are available from the [release page](https://github.com/subosito/snowboard/releases).

Just extract and start using it:

```
$ wget https://github.com/subosito/snowboard/releases/download/${version}/snowboard-${version}.${os}-${arch}.tar.gz
$ tar -zxvf snowboard-${version}.${os}-${arch}.tar.gz
$ ./snowboard -h
```

Alternatively, you can also use options below:

### Homebrew

```sh
$ brew install --HEAD https://raw.github.com/subosito/snowboard/master/tools/homebrew/snowboard.rb
```

### Docker

You can also use automated build docker image on `subosito/snowboard`:

```
$ docker pull subosito/snowboard
$ docker run subosito/snowboard -h
```

### Manual

```sh
$ git clone https://github.com/subosito/snowboard.git
$ cd snowboard
$ make install
```

Note: ensure you have installed [Go](https://golang.org/doc/install#tarball) and configured your `GOPATH` and `PATH`.

## Usage

Let's say we have API Blueprint document called `API.apib`, like:

```
$ cat API.apib
# My API
## GET /message
+ Response 200 (text/plain)

        Hello World!
```

There are some scenarios we can perform:


### Generate HTML Documentation

To generate HTML documentation we can do:

```
$ snowboard -i API.apib -o output.html
```

Above command will generate `ouput.html` using `snowboard` default template (called `alpha`).

### Using Custom Template

If you want to use custom template, you can use flag `-t` for that:

```
$ snowboard -i API.apib -o output.html -t awesome-template.html
```

To see how the template looks like, you can see `snowboard` default template located in [templates/alpha.html](templates/alpha.html).

### Auto-Regenerate HTML Documentation

If you want toauto-regenerate HTML documentation, especially on local development, you can pass `-w` flag:

```
$ snowboard -i API.apib -o output.html -t awesome-template.html -w
```

With this flag, any updates on both input and template file will trigger auto-regeneration.

### Help

As usual, you can also see all supported flags by passing `-h`:

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

You can see examples of `snowboard` default template outputs, in [examples/alpha](examples/alpha) directory. They looks like:

- [Named Resource and Actions](https://htmlpreview.github.io/?https://github.com/subosito/snowboard/blob/master/examples/alpha/03.%20Named%20Resource%20and%20Actions.html)
- [Real World API](https://htmlpreview.github.io/?https://github.com/subosito/snowboard/blob/master/examples/alpha/Real%20World%20API.html)
- And many more...

All of the examples are generated from official [API Blueprint examples](https://github.com/apiaryio/api-blueprint/tree/master/examples)


## Status

Most features have been implemented. There are some incomplete parts, like handling complex Data Structure, JSON Schema, etc, which are on the way.

