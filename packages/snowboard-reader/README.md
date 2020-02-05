# snowboard-reader

The snowboard reader reads an input document with partials and seeds as a single document.

## Installation

```
$ npm install snowboard-reader
```

## Usage

```js
import { read } from "snowboard-reader";

async () => {
  const content = await read("input.md");
};
```

`read` returns string of concatenated document that has been expanded to include values from partials and seeds.

```js
import { extractPaths } from "snowboard-reader";

async () => {
  const paths = await extractPaths("input.md");
};
```

`extractPaths` returns list of external and seed files path along with the input path itself.

## Supported Features

To let you split your documentation as several files, `snowboard-parser` provides some neat feature you can use:

### External Files

You can split your API blueprint document to several files and use `partial` or `include` helper to includes it to your main document.

```html
<!-- partial(some-resource.apib) -->
<!-- include(some-other-resource.apib) -->
```

You can also use alternative syntax:

```
{{partial "some-resource.apib"}}
{{include "some-other-resource.apib"}}
```

### Seed Files

You can move repeated values to separated files and refer that to your API blueprint document.

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

You can also use alternative syntax:

```
{{seed "seed.json"}}
```

Snowboard supports multiple seeds.
