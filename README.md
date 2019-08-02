# snowboard

[![Build Status](https://travis-ci.org/bukalapak/snowboard.svg?branch=master)](https://travis-ci.org/bukalapak/snowboard)
[![Docker Repository on Quay](https://quay.io/repository/bukalapak/snowboard/status)](https://quay.io/repository/bukalapak/snowboard)
[![npm version](https://badgen.net/npm/v/snowboard)](https://www.npmjs.com/package/snowboard)

API blueprint toolkit.

![Screenshot with playground enabled](examples/screenshot.png)

## Installation

```
$ npm install -g snowboard
```

Alternatively, you can also use options below:

### Docker

You can also use automated build docker image on `quay.io/bukalapak/snowboard`:

```
$ docker pull quay.io/bukalapak/snowboard
$ docker run -it --rm quay.io/bukalapak/snowboard help
```

To run snowboard with the current directory mounted to `/doc`:

```
$ docker run -it --rm -v $PWD:/doc quay.io/bukalapak/snowboard html -o output.html API.apib
```

### Tarball executables

The latest executables for supported platforms are available from the [release page](https://github.com/bukalapak/snowboard/releases).

Just extract and start using it:

```
$ wget https://github.com/bukalapak/snowboard/releases/download/${version}/snowboard-${version}.${os}-${arch}.tar.gz
$ tar -zxvf snowboard-${version}.${os}-${arch}.tar.gz
$ ./snowboard -h
```

## Usage

Let's say we have API Blueprint document called `API.apib`, like:

```apib
# API
## GET /message
+ Response 200 (text/plain)

        Hello World!
```

There are some scenarios we can perform, like:

```
# generate HTML documentation
$ snowboard html -o index.html API.apib

# run mock server
$ snowboard mock API.apib

# and more, see sections below
```

## HTML Documentation

To generate HTML documentation, we can do:

```
$ snowboard html -o output.html API.apib
```

Above command will generate `output.html` using `snowboard` default template (called `winter`).

Flag `-o` has two different behaviors depending on the value passed:

- When you pass directory name, like `-o outputDir`, snowboard will create 3 files for HTML, javascript, and CSS into the `outputDir`.

- When you pass file name, like `-o output.html`, snowboard will only generate a single HTML file with javascript and CSS embedded. It also applies when you don't specify flag `-o`.

### Custom Template

If you want to use a custom template, you can use flag `-t` for that:

```
$ snowboard html -o output.html -t awesome-template.html API.apib
```

To see how the template looks like, you can see `snowboard` default template in [templates/winter.html](templates/winter.html).

### Custom Base Path

By default base path for produced HTML documentation is `/`. If you need to serve documentation on subdirectory like, `https://doc.example.com/super-project`, you can customize base path using a configuration file:

```yaml
html:
  basePath: /super-project
```

Then, you can pass the configuration using flag `-c`:

```
$ snowboard html -o outputDir -c config.yaml API.apib
```

### HTTP Server

If you want to access HTML documentation via HTTP, you can use `http` sub-command:

```
$ snowboard http -t awesome-template.html API.apib
```

With this flag, you can access HTML documentation on `localhost:8088`.

If you need to customize binding address, you can use flag `-b`.

### API Playground

You can activate the playground feature to let your users interact with your staging or even production API.

The Playground can be activate using flag `--playground` or using a configuration file, by setting `enabled: false`.

Playground requires a configuration contains supported environments and the name of the default environment. On each environment, you can set an authentication option.

Here's the example of playground configuration along with the different authentication combination supported:

```yaml
html:
  playground:
    enabled: true
    env: development
    environments:
      development:
        url: http://localhost:8087/
        auth:
          name: apikey
          options:
            key: api-dev-key
            header: X-Api-Key
      staging:
        url: https://staging.example.com/
        auth:
          name: basic
          options:
            username: admin
            password: secret
      production:
        url: https://api.example.com
        auth:
          name: oauth2
          options:
            authorizeUrl: https://accounts.example.com/oauth/authorize
            tokenUrl: https://accounts.example.com/oauth/access_token
            callbackUrl: https://www.example.com
            clientId: <client-id>
            clientSecret: <client-secret>
            scopes: <scope-names>
```

Once you have a configuration file, you can do:

```
$ snowboard html -o outputDir -c config.yaml API.apib

# http sub-command works too
$ snowboard http -c config.yaml API.apib
```

To disable playground on particular environment, you can add `playground: false` under environment configuration, like:

```yaml
html:
  playground:
    enabled: true
    env: development
    environments:
      development:
        url: http://localhost:8087/
        playground: false
      staging:
        url: https://staging.example.com/
```

## Mock Server

Another snowboard useful feature is having a mock server. You can use `mock` sub-command for that.

```
$ snowboard mock API.apib
```

Then you can use `localhost:8087` for accessing mock server. You can customize the address using flag `-b`.

For multiple responses, you can set `Prefer` header to select a specific response:

```
Prefer: status=200
```

You can also supply multiple inputs for `mock` sub-command:

```
$ snowboard mock API.apib OTHER.apib
```

### Mock Server Authentication

The mock server supports various authentication, you can enable that by passing a configuration file using flag `-c`, like:

```
$ snowboard mock -c config.yaml API.apib
```

Here's the example of the configuration file for mock server:

**API key authentication**

```yaml
mock:
  auth:
    name: apikey
    options:
      key: <api-key>
      header: <Header-Name>
```

**Basic authentication**

```yaml
mock:
  auth:
    name: basic
    options:
      username: <username>
      password: <password>
```

## Split API Blueprint

When you have documentation split across files, you can use `apib` sub-command to allow `snowboard` to produce single formatted API blueprint.

```
$ snowboard apib -o API.apib project/split.apib
```

To let you split your documentation as several files, snowboard provides some neat feature you can use:

### External Files

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

### Seed Files

As your API blueprint document become large, you might move some value to a separate file for an easier organization and modification. Snowboard supports this.

Just place your values into a json file, say, `seed.json`:

```json
{
  "official": {
    "username": "olaf"
  }
}
```

Then on your API blueprint document, you can use `seed` comment helper:

```apib
# API

<!-- seed(seed.json) -->

Our friendly username is {{.official.username}}.
```

It also supports multiple seeds.

## Other Features

Besides the above features, snowboard also has several useful features for working with API blueprint:

### Validate API blueprint

Besides rendering to HTML, snowboard also support validates API blueprint document. You can use `lint` sub-command.

```
$ snowboard lint API.apib
```

Using flag `--json`, you will receive output as JSON format.

### Render API Element JSON

In case you need to get API element JSON output for further processing, you can use:

```
$ snowboard json API.apib
```

### List Routes

If you need to list all available routes for current API blueprints, you can do:

```
$ snowboard list API.apib ANOTHER.apib
```

Using flag `--json`, you will receive output as JSON format.

## SSL Support

To enable HTTPS server, both `http`, and `mock` subcommand supports SSL configuration. You can do:

```
# http server
$ snowboard http -S -C cert.pem -K key.pem API.apib

# mock server
$ snowboard mock -S -C cert.pem -K key.pem API.apib
```

For example, for local development, you can utilize [mkcert](https://github.com/FiloSottile/mkcert) to create your local development certificate and use it with snowboard:

```
# generate localhost certificate
$ mkcert -install
$ mkcert localhost

# use the generated certificate with snowboard http or mock subcommand
$ snowboard http -S -C localhost.pem -K localhost-key.pem API.apib

# you can now access using https://localhost:8088/
```

## Watcher Support

To enable auto-regeneration on input files updates, you can add global flag `--watch`

```
$ snowboard html --watch -o output.html -t awesome-template.html -s API.apib
```

Optionally, you can also use `--watch-interval` to enable polling interval.

```
$ snowboard html --watch --watch-interval 100ms -o output.html -t awesome-template.html -s API.apib
```

This watcher works on all sub-commands.

## Help

As usual, you can also see all supported flags by passing `-h`:

```
$ snowboard
Usage: snowboard <command> [options] <input>

API blueprint toolkit

Options:
  -v, --version                       output the version number
  -w, --watch                         watch for the files changes
  -n, --watch-interval <value>        set watch interval. This activates polling watcher. Accepted format: 100ms, 1s, etc
  -h, --help                          output usage information

Commands:
  lint [options] <input>              validate API blueprint
  html [options] <input>              render HTML documentation
  http [options] <input>              HTML documentation via HTTP server
  apib [options] <input>              render API blueprint
  json [options] <input>              render API elements json
  mock [options] <input> [inputs...]  run mock server
  list [options] <input> [inputs...]  list routes
```
