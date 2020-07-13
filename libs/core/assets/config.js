const fs = require('fs');
const path = require('path');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const typescript = require('rollup-plugin-typescript2');
const { terser } = require('rollup-plugin-terser');
const license = require('rollup-plugin-license');
const replace = require('@rollup/plugin-replace');
const { v5 } = require('uuid');

const packagePath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
const multi = require('@rollup/plugin-multi-entry');
exports.pkg = pkg;

exports.config = {
  input: [
    path.join(__dirname, 'pluginEntry.ts'),
    pkg.main
  ],
  output: {
    file: `./dist/${pkg.name}.nwpjs`,
    format: 'umd',
    name: `nwplay-plugin-${pkg.name}`,
    sourcemap: true,
    globals: {
      '@nwplay/core': '@nwplay/core',
      'cheerio': 'cheerio'
    }
  },
  plugins: [
    replace({
      __packagePath__: packagePath,
      __pluginId__: v5(pkg.name, 'C376823D-6C52-4F38-8EC7-9544B07EF192')
    }),
    multi(),
    resolve.default({
      customResolveOptions: {
        moduleDirectory: 'node_modules'
      },
      preferBuiltins: true
    }),
    typescript({
      typescript: require('typescript')
    }),
    commonjs(),
    json(),
    terser({
      keep_classnames: true,
      keep_fnames: true
    }),
    license({
      banner: `
Bundle of <%= pkg.pluginName %> (<%= pkg.name %>)
Generated: <%= moment().format('YYYY-MM-DD') %>
Version: <%= pkg.version %>
Description: <%= pkg.description %>
Min Core Version: <%= pkg.devDependencies['@nwplay/core'] %>
Dependencies:
<% _.forEach(dependencies, function (dependency) { %>
  <%= dependency.name %> -- <%= dependency.version %>
<% }) %>
            `.trim()
    })
  ],
  external: [
    '@nwplay/core',
    'cheerio'
  ]
};
