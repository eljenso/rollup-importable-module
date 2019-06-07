#!/usr/bin/env node

const rollup = require("rollup");
const commander = require("commander");
const path = require("path");

const typescript = require("rollup-plugin-typescript");
const del = require("rollup-plugin-delete");
const { terser } = require("rollup-plugin-terser");
const postcss = require("rollup-plugin-postcss");

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
  .option("-p, --packages", "Path to local package.json file", "package.json")
  // .option("-w, --watch", "Watch mode")
  .option("--no-uglify", "Disable uglify")
  .option("--no-sourcemap", "Disable sourcemap")
  .action(input => {
    entryFile = input;
  })
  .parse(process.argv);

if (!entryFile) {
  throw new Error("Input must be defined! Use -h for help.");
}

const { dependencies } = require(path.resolve(process.cwd(), "package.json"));
if (!dependencies) {
  throw new Error("Invalid package.json provided! Use -h for help.");
}

/**
 * Plugins to use with rollup
 */
const plugins = [
  // Clear dist folder
  del({ targets: `${commander.output}/*` }),

  // Enable TS support
  typescript(),

  // Compile and insert styles into JS
  postcss({
    extensions: [".css", ".sss", ".pcss", ".less", ".scss"]
  })
];

// Uglify output if not otherwise chosen by user
if (commander.uglify) {
  plugins.push(terser());
}

const inputOptions = {
  input: entryFile,
  external: Object.keys(dependencies),
  plugins
};

const outputFile = `${commander.output}/index.js`;
const outputOptions = {
  file: outputFile,
  format: "es",
  sourcemap: commander.sourcemap
};

if (!commander.watch) {
  async function build() {
    try {
      // Create bundle
      console.log(`Starting to bundle module with entry ${entryFile}...`);
      if (dependencies) {
        const depsString = Object.keys(dependencies).reduce(
          (prevString, dependency) => {
            if (prevString) return `${prevString}, ${dependency}`;
            return dependency;
          },
          ""
        );

        console.log(`Treating these dependencies as externals: ${depsString}`);
      }

      const bundle = await rollup.rollup(inputOptions);

      // Write bundle to disk
      console.log(`Writing bundle to ${outputFile}.`);
      await bundle.write(outputOptions);
    } catch (error) {
      console.error(error);
    }
  }

  // Do it!
  build();
} else {
  const watcher = rollup.watch({
    ...inputOptions,
    output: [outputOptions],
    watch: {
      chokidar: true,
      clearScreen: true,
      exclude: "node_modules/**"
    }
  });

  watcher.on("event", event => {
    switch (event.code) {
      // Watcher is (re)starting
      case "START": {
        break;
      }
      // Building an individual bundle
      case "BUNDLE_START": {
        break;
      }
      // Finished building a bundle
      case "BUNDLE_END": {
        break;
      }
      // Finished building all bundles
      case "END": {
        break;
      }

      // Encountered an error while bundling
      case "ERROR": {
        console.error(event.error);
        // watcher.close();
        break;
      }

      // Encountered an unrecoverable error
      case "FATAL": {
        throw new Error(event);
      }
    }
  });
}
