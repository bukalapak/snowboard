# snowboard

[![npm version](https://badge.fury.io/js/snowboard.svg)](https://www.npmjs.com/package/snowboard)

API blueprint toolkit.

# Usage

<!-- usage -->

```sh-session
$ npm install -g snowboard
$ snowboard COMMAND
running command...
$ snowboard (-v|--version|version)
snowboard/4.0.0-rc.14 darwin-x64 node-v12.16.0
$ snowboard --help [COMMAND]
USAGE
  $ snowboard COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`snowboard apib INPUT`](#snowboard-apib-input)
- [`snowboard help [COMMAND]`](#snowboard-help-command)
- [`snowboard html INPUT`](#snowboard-html-input)
- [`snowboard http INPUT`](#snowboard-http-input)
- [`snowboard json INPUT`](#snowboard-json-input)
- [`snowboard lint INPUT`](#snowboard-lint-input)
- [`snowboard list INPUT [INPUTS...]`](#snowboard-list-input-inputs)
- [`snowboard mock INPUT [INPUTS...]`](#snowboard-mock-input-inputs)

## `snowboard apib INPUT`

render API blueprint

```
USAGE
  $ snowboard apib INPUT

OPTIONS
  -o, --output=output  output file
  -q, --quiet          quiet mode
```

_See code: [lib/commands/apib.js](https://github.com/bukalapak/snowboard/blob/master/packages/snowboard/src/commands/apib.js)_

## `snowboard help [COMMAND]`

display help for snowboard

```
USAGE
  $ snowboard help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `snowboard html INPUT`

render HTML documentation

```
USAGE
  $ snowboard html INPUT

OPTIONS
  -O, --optimized          optimized mode
  -o, --output=output      output directory
  -q, --quiet              quiet mode
  -t, --template=template  custom template
  -w, --watch              watch for the files changes
```

_See code: [lib/commands/html.js](https://github.com/bukalapak/snowboard/blob/master/packages/snowboard/src/commands/html.js)_

## `snowboard http INPUT`

serve HTML documentation

```
USAGE
  $ snowboard http INPUT

OPTIONS
  -C, --cert=cert          SSL cert file
  -K, --key=key            SSL key file
  -O, --optimized          optimized mode
  -S, --ssl                enable https
  -b, --bind=bind          [default: :8088] listen address
  -q, --quiet              quiet mode
  -t, --template=template  custom template
  -w, --watch              watch for the files changes
```

_See code: [lib/commands/http.js](https://github.com/bukalapak/snowboard/blob/master/packages/snowboard/src/commands/http.js)_

## `snowboard json INPUT`

render API elements json

```
USAGE
  $ snowboard json INPUT

OPTIONS
  -O, --optimized      optimized mode
  -o, --output=output  output file
  -q, --quiet          quiet mode
```

_See code: [lib/commands/json.js](https://github.com/bukalapak/snowboard/blob/master/packages/snowboard/src/commands/json.js)_

## `snowboard lint INPUT`

validate API blueprint

```
USAGE
  $ snowboard lint INPUT

OPTIONS
  -O, --optimized  optimized mode
  -j, --json       json mode
  -q, --quiet      quiet mode
```

_See code: [lib/commands/lint.js](https://github.com/bukalapak/snowboard/blob/master/packages/snowboard/src/commands/lint.js)_

## `snowboard list INPUT [INPUTS...]`

list API routes

```
USAGE
  $ snowboard list INPUT [INPUTS...]

OPTIONS
  -O, --optimized  optimized mode
  -j, --json       json mode
  -q, --quiet      quiet mode
```

_See code: [lib/commands/list.js](https://github.com/bukalapak/snowboard/blob/master/packages/snowboard/src/commands/list.js)_

## `snowboard mock INPUT [INPUTS...]`

run mock server

```
USAGE
  $ snowboard mock INPUT [INPUTS...]

OPTIONS
  -C, --cert=cert  SSL cert file
  -K, --key=key    SSL key file
  -S, --ssl        enable https
  -b, --bind=bind  [default: :8087] listen address
  -q, --quiet      quiet mode
```

_See code: [lib/commands/mock.js](https://github.com/bukalapak/snowboard/blob/master/packages/snowboard/src/commands/mock.js)_

<!-- commandsstop -->
