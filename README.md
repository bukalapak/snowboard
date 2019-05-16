# snowboard.js

[![Build Status](https://badgen.net/circleci/github/bukalapak/snowboard.js)](https://circleci.com/gh/bukalapak/snowboard.js)
[![npm version](https://badgen.net/npm/v/snowboard)](https://www.npmjs.com/package/snowboard)

API blueprint toolkit.

## Installation

```
$ npm install -g snowboard
```

## Usage

Let's say we have API Blueprint document called `API.apib`, like:

```apib
# API
## GET /message
+ Response 200 (text/plain)

        Hello World!
```

There are some scenarios we can perform:

### Generate HTML Documentation

To generate HTML documentation we can do:

```
$ snowboard html -o output.html API.apib
```

Above command will generate `ouput.html` using `snowboard` default template (called `alpha`).

### Using Custom Template

If you want to use custom template, you can use flag `-t` for that:

```
$ snowboard html -o output.html -t awesome-template.html API.apib
```

To see how the template looks like, you can see `snowboard` default template located in [templates/alpha.html.hbs](templates/alpha.html.hbs).

### Multi Pages HTML

When your API blueprints large enough to be served as single HTML file, you can pass `-o` flag with value without `.html` extension to let snowboard generate multi pages documentation:

```
$ snowboard html -o output-dir API-LARGE.apib
```

### Serve HTML Documentation

If you want to access HTML documentation via HTTP, especially on local development, you can use `http` subcommand:

```
$ snowboard http -t awesome-template.html API.apib
```

With this flag, You can access HTML documentation on `localhost:8088`.

If you need to customize binding address, you can use flag `-b`.

You can also use multi pages feature as above, just pass `-o` flag without `.html` extension.

### Generate formatted API blueprint

When you have documentation splitted across files, you can use `apib` subcommand to allow `snowboard` to produce single formatted API blueprint.

```
$ snowboard apib -o API.apib project/splitted.apib
```

### Validate API blueprint

Besides render to HTML, snowboard also support validates API blueprint document. You can use `lint` subcommand.

```
$ snowboard lint API.apib
```

### Mock server from API blueprint

Another snowboard useful feature is having mock server. You can use `mock` subcommand for that.

```
$ snowboard mock API.apib
```

Then you can use `localhost:8087` for accessing mock server. You can customize the address by passing flag `-b`.

For multiple responses, you can set `Prefer` header to select specific response:

```
Prefer: status=200
```

You can also supply multiple inputs for `mock` subcommand:

```
$ snowboard mock API.apib OTHER.apib
```

## External Files

You can split your API blueprint document to several files and use `partial` helper to includes it to your main document.

```
{{partial "some-resource.apib"}}
```

Alternatively, you can also use HTML comment syntax to include those files:

```html
<!-- partial(some-resource.apib) -->
```

or

```html
<!-- include(some-resource.apib) -->
```

## Seed Files

As your API blueprint document become large, you might move some value to separate file for easier organization and modification. Snowboard supports this as well.

Just place your values into a json file, say, `seed.json`:

```json
{
  "official": {
    "username": "olaf"
  }
}
```

Then on your API blueprint document you can use `seed` comment helper:

```apib
# API

<!-- seed(seed.json) -->

Our friendly username is {{.official.username}}.
```

Multiple seeds are also supported.

## API Element JSON

In case you need to get API element JSON output for further processing, you can use:

```
$ snowboard json API.apib
```

## List Available Routes

If you need to list all available routes for current API blueprints you can do:

```
$ snowboard list API.apib ANOTHER.apib
```

## Help

As usual, you can also see all supported flags by passing `-h`:

```
$ snowboard
Usage: snowboard <command> [options] <input>

API blueprint toolkit

Options:
  -v, --version                       output the version number
  -h, --help                          output usage information

Commands:
  lint <input>                        validate API blueprint
  html [options] <input>              render HTML documentation
  http [options] <input>              HTML documentation via HTTP server
  apib [options] <input>              render API blueprint
  json [options] <input>              render API elements json
  mock [options] <input> [inputs...]  run mock server
  list <input> [inputs...]            list available routes
```
