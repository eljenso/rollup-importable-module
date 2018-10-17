#!/usr/bin/env node

const rollup = require("rollup");
const commander = require("commander");

const resolve = require("rollup-plugin-node-resolve");
const typescript = require("rollup-plugin-typescript");
const commonjs = require("rollup-plugin-commonjs");
const replace = require("rollup-plugin-replace");
const del = require("rollup-plugin-delete");
const terser = require("rollup-plugin-terser").terser;

let entryFile;

/**
 * Setup of cli options
 */
commander
  .arguments("<input>")
  .description(
    "Uses rollup to transform TS module into single importable file. <input> should be the entry file of that component."
  )
  .option("-o, --output [directory]", "Directory to write to", "dist")
  .option(
    "--no-resolve",
    "Set if you do not want to bundle vendor scripts (e.g. react)"
  )
  .option("--no-uglify", "Disable uglify")
  .action(input => {
    entryFile = input;
  })
  .parse(process.argv);

if (!entryFile) {
  throw new Error("Input must be defined! Use -h for help.");
}

/**
 * Plugins to use with rollup
 */
const plugins = [
  del({ targets: `${commander.output}/*` /* , verbose: true */ }),
  typescript()
];

// Resolve 3rd party scripts and put into bundle
if (commander.resolve) {
  plugins.push(
    replace({
      // Fix for react expecting process.env.NODE_ENV to be set
      // This will replace `if (process.env.NODE_ENV !== 'production')` with `if ("production" !== 'production')`
      // That block will later be removed by rollup because it's dead-code
      "process.env.NODE_ENV": JSON.stringify("production")
    })
  );
  plugins.push(resolve());
  plugins.push(
    commonjs({
      include: "node_modules/**",
      // Fix react's exports
      namedExports: {
        "node_modules/react/index.js": [
          "Component",
          "PureComponent",
          "Fragment",
          "Children",
          "createElement"
        ]
      }
    })
  );
}

// Uglify output if not otherwise chosen by user
if (commander.uglify) {
  plugins.push(terser());
}

const inputOptions = {
  input: entryFile,
  // experimentalCodeSplitting: true,
  plugins
};

const outputFile = `${commander.output}/index.js`;
const outputOptions = {
  file: outputFile,
  format: "es",
  sourcemap: true
};

async function build() {
  // Create a bundle
  console.log(`Starting to bundle module with entry ${entryFile}...`);
  const bundle = await rollup.rollup(inputOptions);

  // Write the bundle to disk
  console.log(`Writing bundle to ${outputFile}.`);
  await bundle.write(outputOptions);
}

// Do it!
build();
