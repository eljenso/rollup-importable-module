# Rollup importable module

Tool for converting TS modules into a single importable module file, which includes all dependencies.

```sh
Usage: rollup-importable-module [options] <input>

Uses rollup to transform TS module into single importable file. <input> should be the entry file of that component.

Options:
  -o, --output [directory]  Directory to write to (default: "dist")
  --no-uglify               Disable uglify
  -h, --help                output usage information
```
