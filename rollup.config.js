import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';
import inject from 'rollup-plugin-inject';
import pkg from "./package.json";

export default {
  input: __dirname + `/lib/main.js`,
  output: {
    file: __dirname + `/scratch/rolled/${pkg._name}.user.js`,
    format: 'iife', // immediately-invoked function expression — suitable for <script> tags
    // banner: 'document.addEventListener("DOMContentLoaded", function(event) { ',
    // footer: '});',
    name: 'userscript',
    sourcemap: false,
    globals: {
      jquery: '$',
      GM_config: 'GM_config',
    }
  },
  external: [
    'jquery',
    'GM_config'
  ],
  treeshake: true,
  plugins: [
    /* multiEntry({ exports: false }), */
    resolve({
      // pass custom options to the resolve plugin
      customResolveOptions: {
        moduleDirectory: 'node_modules'
      }
    }), // tells Rollup how to find date-fns in node_modules
    commonJS({ // converts date-fns to ES modules
      sourceMap: false,
      include: 'node_modules/**',
      ignoreGlobal: false,
    }),
    inject({
      // see https://stackoverflow.com/questions/45549689/prevent-rollup-from-renaming-promise-to-promise1
      // see https://github.com/rollup/rollup-plugin-inject
      // control which files this plugin applies to
      // with include/exclude
      include: '**/*.js',
      exclude: 'node_modules/**',

      /* all other options are treated as modules...*/

      // use the default – i.e. insert
      // import $ from 'jquery'
      $: 'jquery',
      /* ...but if you want to be careful about separating modules
         from other options, supply `options.modules` instead */
      modules: {
        $: 'jquery'
      }
    })
  ]
  // sourceMap: 'inline',
};
