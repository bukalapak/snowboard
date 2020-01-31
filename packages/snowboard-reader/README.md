# snowboard-reader

The snowboard reader reads as single API blueprint.

## Installation

```
$ npm install snowboard-reader
```

## Usage

```js
const { read, extractPaths } from 'snowboard-reader';
```

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
