
module.exports = function (grunt) {
  var packageData = grunt.file.readJSON('package.json');
  var BUILD_VERSION = packageData.version + '-' + (process.env.BUILD_NUMBER ? process.env.BUILD_NUMBER : '0');
  /**
   * includeFile() - embeds a file content within another. Meant to be
   * used from the copy task as a 'processContent' function. The following
   * tokens can be used in files: <br>
   *
   *  -   BUILD_INCLUDE('file')
   *  -   /* BUILD_INCLUDE('file') *\x47
   *  -   &lt;!-- BUILD_INCLUDE("file") --&gt;
   *
   * In addition, options can be added to the token above that further
   * process the file being included:
   *
   *  -   BUILD_INCLUDE('file')[option1,option2,option3]
   *
   * Supported options:
   *
   *  -   asJsString : Escapes all double-quotes and new line characters
   *                   in the file
   *
   * @param {String} fileContent
   * @param {String} filePath
   *
   * @return {String} fileContent
   *
   * @see https://gist.github.com/purtuga/85ee689f0d3d90484ce3
   * @see https://www.regexpal.com/?fam=108264
   *
   * @example
   *
   *  ...
   *  copy: {
   *      options: {
   *          expand: true,
   *          process: includeFile
   *      }
   *  }
   *  ...
   *
   */
  function includeFile(fileContent, filePath) {

    if (fileContent.indexOf("BUILD_INCLUDE") > -1) {

      grunt.log.write("includeFile(): [" + filePath + "] has BUILD_INCLUDE: ");
      // Match:
      //      // BUILD_INCLUDE('file')
      //      /* BUILD_INCLUDE('file') */
      //      <!-- BUILD_INCLUDE("file") -->
      //
      //  Token OPtions:
      //      // BUILD_INCLUDE('file')[options,here,as,array]
      //
      //      asJsString
      //
      var re = /(?:(?:\/\/)|(?:<\!\-\-)|(?:\/\*))\s+BUILD_INCLUDE\(['"](.*)['"]\)(?:\[(.*)\])?(?:(?:\s+\-\->)|(?:\s+\*\/))?/i,
        match, file, fileIncludeOptions;

      while ((match = re.exec(fileContent)) !== null) {
        grunt.log.write(".");
        grunt.verbose.writeln("    Match array: " + match);
        file = grunt.template.process(match[1]);
        grunt.verbose.writeln("    File to embed: " + file);
        file = grunt.file.read(file);
        // If options were set, then parse them
        if (match[2]) {
          fileIncludeOptions = match[2].split(',');
          // If option: asJsString
          if (
            fileIncludeOptions.some(function (option) {
              return String(option).toLowerCase() === "asjsstring";
            })
          ) {
            file = file
              .replace(/"/g, '\\"')
              .replace(/'/g, "\\'")
              .replace(/\r\n|\n/g, "\\n");
          }

          if (
            fileIncludeOptions.some(function (option) {
              return String(option).toLowerCase() === "singletodouble";
            })
          ) { file = file.replace(/'/g, '"'); }
        }
        fileContent = fileContent.replace(match[0], function () { return file; });
      }
      grunt.log.writeln("");
      return fileContent;
    }
    return fileContent;
  } //end: includeFile()

  grunt.initConfig({
    pkg: packageData,

    clean: {
      dirs: ['scratch', 'dist', 'lib'],
      compiled: ['scratch/compiled'],
      readme: ['./Readme.md']
    },

    tslint: {
      options: {
        configuration: 'tslint.json'
      },
      plugin: ['src/**/*.ts']
    },

    shell: {
      tsc: 'tsc',
      rollup: 'npx rollup -c'
    },

    remove_comments: {
      js: {
        options: {
          multiline: true, // Whether to remove multi-line block comments
          singleline: true, // Whether to remove the comment of a single line.
          keepSpecialComments: false, // Whether to keep special comments, like: /*! !*/
          linein: true, // Whether to remove a line-in comment that exists in the line of code, it can be interpreted as a single-line comment in the line of code with /* or //.
          isCssLinein: true // Whether the file currently being processed is a CSS file
        },
        cwd: 'scratch/nodebug/',
        src: '**/*.js',
        expand: true,
        dest: 'scratch/compiled/'
      },
      debug_nc: {
        options: {
          multiline: true, // Whether to remove multi-line block comments
          singleline: true, // Whether to remove the comment of a single line.
          keepSpecialComments: false, // Whether to keep special comments, like: /*! !*/
          linein: true, // Whether to remove a line-in comment that exists in the line of code, it can be interpreted as a single-line comment in the line of code with /* or //.
          isCssLinein: true // Whether the file currently being processed is a CSS file
        },
        cwd: 'scratch/NoDebugComment/',
        src: '**/*.js',
        expand: true,
        dest: 'scratch/debug_nc/'
      }
    },

    replace: { // https://www.npmjs.com/package/grunt-text-replace
      debug_comments: {
        src: ['scratch/build_ops/<%= pkg._name %>.user.js'],
        dest: 'scratch/nodebug/<%= pkg._name %>.user.js',  // destination directory or file
        replacements: [{
          // .net reges \s*//\s#region\s\[debug\][\s\S]*?//\s#endregion\sdebug\s*$
          // see also: http://regexstorm.net/tester
          from: /[\s]*\/\/\s#region\s\[debug\][.\s\S]*?\/\/\s#endregion\sdebug[\s]*$/gm, // see https://www.regexpal.com/?fam=108587
          to: ''
        }]
      },
       build_remove: {
         src: ['scratch/rolled/<%= pkg._name %>.user.js'],
         dest: 'scratch/build_ops/<%= pkg._name %>.user.js', // destination directory or file
         replacements: [{
           // .net reges \s*//\s#region\s\[BUILD_REMOVE\][\s\S]*?//\s#endregion\sBUILD_REMOVE\s*$
           // see also: http://regexstorm.net/tester
           from: /[\s]*\/\/\s#region\s\[BUILD_REMOVE\][.\s\S]*?\/\/\s#endregion\sBUILD_REMOVE[\s]*$/gm, // see https://www.regexpal.com/?fam=108661
           to: ''
         }]
       },
      outer_div_css: {
        src: ['scratch/css/style.min.css'],
        dest: 'scratch/text/outter_div.txt',
        replacements: [{
          from: /(?:.*#en_fs_prev{(.*?)}.*)/,
          to: '$1;'
        }]
      },
      inner_div_css: {
        src: ['scratch/css/style.min.css'],
        dest: 'scratch/text/inner_div_css.txt',
        replacements: [{
          from: /(?:.*en_fs_prev_inner{(.*?)}.*)/,
          to: '$1;'
        }]
      },
      iframe_css: {
        src: ['scratch/css/style.min.css'],
        dest: 'scratch/text/iframe_css.txt',
        replacements: [{
          from: /(?:.*en_fs_frame{(.*?)}.*)/,
          to: '$1;'
        }]
      },
      title_css: {
        src: ['scratch/css/style.min.css'],
        dest: 'scratch/text/title_css.txt',
        replacements: [{
          from: /(?:.*en_fs_prev_title{(.*?)}.*)/,
          to: '$1;'
        }]
      },
      header_build: {
        src: ['src/main/text/header.txt'],   // source files array (supports minimatch)
        dest: 'scratch/text/header.txt', 
        replacements: [{
          from: '@BUILD_NUMBER@',            // string replacement
          to: packageData.version
        },
        {
          from: '@FULL_NAME@',
          to: packageData._fullName
        },
        {
          from: '@SCRIPT_NAME@',
          to: packageData._name
        },
        {
          from: '@AUTHOR@',
          to: packageData.author
        },
        {
          from: '@DESCRIPTION@',
          to: packageData.description
        },
        {
          from: '@LICENSE@',
          to: packageData.license
        },
        {
          from: '@REPOSITORY_NAME@',
          to: packageData._repositoryName
        }
        ]
      },
      readme_build: {
        src: ['src/main/text/Readme.md'],
        dest: './Readme.md',
        replacements: [{
          from: '@BUILD_NUMBER@',
          to: packageData.version
        },
        {
          from: '@SCRIPT_NAME@',
          to: packageData._name
        },
        {
          from: '@AUTHOR@',
          to: packageData.author
        },
        {
          from: '@REPOSITORY_NAME@',
          to: packageData._repositoryName
        }
        ]
      }
    },
    /*
     * copy
     * https://github.com/gruntjs/grunt-contrib-copy
     */
    copy: {
      /*
       * Build
       * build will replace build includes in the file such as // BUILD_INCLUDE('./scratch/text/buttonstyle.txt')
       * https://paultavares.wordpress.com/2014/12/01/grunt-how-to-embed-the-content-of-files-in-javascript-files/
       */
      // 
      build: {
        options: {
          expand: true,
          process: includeFile
        },
        files: {
          "scratch/build_ops/<%= pkg._name %>.user.js": "scratch/build_ops/<%= pkg._name %>.user.js"
        }
      },

      no_debug: {
        files: [{
          cwd: 'scratch/build_ops/',
          src: '<%= pkg._name %>.user.js',
          dest: 'scratch/compiled/',
          expand: true
        }]
      },
      debug_nc: {
        files: [{
          cwd: 'scratch/compiled/',
          src: '<%= pkg._name %>.user.js',
          dest: 'scratch/NoDebugComment/',
          expand: true
        }]
      },
      debug_nc_clean: {
        files: [{
          cwd: 'scratch/debug_nc/',
          src: '<%= pkg._name %>.user.js',
          dest: 'scratch/compiled/',
          expand: true
        }]
      }
    },

    if: {  // https://github.com/bonesoul/grunt-if-next
      debug: {
        // Target-specific file lists and/or options go here.
        options: {
          // execute test function(s)
          test: function () { return packageData._debuglevel > 0; }
        },
        //array of tasks to execute if all tests pass
        ifTrue: [
          'replace:debug_comments',
          'remove_comments:js'
        ],
        //array of tasks to execute if any test fails
        ifFalse: ['copy:no_debug']
      },
      debug_remove_comments: {
        options: {
          test: function () { return ((packageData._debuglevel === 0) && (packageData._debugRemoveComment === true)); }
        },
        ifTrue: [
          // copy from compiled, remove comments and copy back to compiled
          'copy:debug_nc',
          'clean:compiled',
          'remove_comments:debug_nc',
          'copy:debug_nc_clean',
        ],
        //array of tasks to execute if any test fails
        ifFalse: []
      }
    },

    concat: {
      dist: {
        src: ['scratch/text/header.txt', 'scratch/compiled/<%= pkg._name %>.user.js'],
        dest: 'dist/<%= pkg._name %>.user.js'
      }
    },

    // cssmin minify css code
    cssmin: { // https://github.com/gruntjs/grunt-contrib-cssmin
      target: {
        files: [{
          expand: true,
          cwd: 'src/main/css',
          src: ['style.css', 'button.css'],
          dest: 'scratch/css',
          ext: '.min.css'
        }]
      }
    },
    writeFile: {
      title: {
        content: packageData._memu_opt_name,
        dest: 'scratch/text/menu_options.txt'
      },
      debug: {
        content: function () {
          var dl = 'debugLevel: DebugLevel.';
          switch (packageData._debuglevel) {
            case 0:
              dl += 'debug';
              break;
            case 1:
              dl += 'error';
              break;
            case 2:
              dl += 'warn';
              break;
            case 3:
              dl += 'info';
            break;
            default:
              dl += 'none';
              break;
          }
          dl += ','
          return dl;
        },
        dest: 'scratch/text/debug_level.txt'
      }
    }
  });
  require('load-grunt-tasks')(grunt);
  // grunt.loadNpmTasks('@ephox/swag');
  grunt.loadNpmTasks('grunt-contrib-concat');
  // grunt.loadNpmTasks('grunt-zip');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-remove-comments');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-if-next');

  grunt.registerTask('version', 'Creates a version file', function () {
    grunt.file.write('dist/version.txt', BUILD_VERSION);
  });
  /**
   * Writes contents to a file
   * @see https://stackoverflow.com/questions/15647276/grunt-js-output-and-write-contents-of-folder-to-file
   */
  grunt.registerMultiTask("writeFile", "Write content to a file", function () {
    var out = this.data.dest;
    var content = this.data.content;
    var result = '';
    if (typeof content === 'function') {
      result = content();
    } else {
      result = content;
    }
    grunt.file.write(out, result);
  });

  grunt.registerTask('default', [
    /*
     * Task clean: dirs
     * clean the folder out from any previous build
     */
    'clean:dirs',
    /*
     * Task clean: readme
     * remove root Readme.md from project root
     */
    'clean:readme',
    /*
     * Task tslint
     * check the ts files for any lint issues
     */
    'tslint',
    /*
     * Task shell: tsc
     * run tsc, outputs to /lib
     */
    'shell:tsc',
    /*
     * Task shell: rollup
     * run rollup to combine all the files into one js file.
     */
    'shell:rollup',
    /*
     * Task replace: build_remove
     * Remove all #region [BUILD_REMOVE] blocks
     * Outputs to /scratch/build_ops/< pkg._name >.user.js
     */
    'replace:build_remove',
    /*
     * Task cssmin
     * minify css files to be later injected into the js file.
     * outputs to /scratch/css/<filename>.min.css
     */
    'cssmin',
    /*
     * Task replace: outer_div_css
     * Reads the en_fs_prev class from /scratch/css/style.min.css file
     * and writes the class css into /scratch/text/outter_div.txt
     */
    'replace:outer_div_css',
    /*
     * Task replace: inner_div_css
     * Reads the en_fs_prev_inner class from /scratch/css/style.min.css
     * and writes the class css into /scratch/text/inner_div_css.txt
     */
    'replace:inner_div_css',
    /*
     * Task replace: iframe_css
     * Reads the en_fs_frame class from /scratch/css/style.min.css
     * and writes the class css into /scratch/text/iframe_css.txt
     */
    'replace:iframe_css',
    /*
     * Task replace: title_css
     * Reads the en_fs_prev_title class from /scratch/css/style.min.css
     * and writes the class css into /scratch/text/title_css.txt
     */
    'replace:title_css',
    /*
     * Task 'writeFile:title
     * Writes the package.json _menu_opt_name property into
     * file /scratch/text/menu_options.txt
     */
    'writeFile:title',
    /*
     * Task writeFile: debug
     * Reads pacakge.json _debuglevel and bases upon the value
     * writes a line of code into file /scratch/text/debug_level.txt
     */
    'writeFile:debug',
   /*
    * Task copy: build
    * run special function includeFile that is in this script to replace
    * BUILD_INCLUDE values in /scratch/build_ops/< pkg._name >.user.js
    * These replacements are done in place. No new file is created.
    */
    'copy:build',
    /*
     * Task 'if:debug
     * Reads package.json _debug value and if it is greater than 0
     * Runs task replace:debug_comments see below
     * Runs task remove_comments:js see below
     */
    'if:debug',
    /*
     * Task if: debug_remove_comments
     * Reads package.json _debug value and and _debugRemoveComment values
     * if _debug is equal to zero and _debugRemoveComment is true then
     * tasks copy:debug_nc, clean:compiled, remove_comments:debug_nc
     * and copy:debug_nc_clean are run: see below
     */
    'if:debug_remove_comments',
    /*
     * Task replace: header_build
     * replace the @PLACEHOLDERS@ in the header text with values from package.json
     * the source file is /src/main/text/header.txt
     * the dest file is /scratch/text/header.txt
     */
    'replace:header_build',
    /*
     * Task concat
     * combine the /scratch/text/header.txt file with 
     * /scratch/compiled/< pkg._name >.user.js
     * outputs to /dist/< pkg._name >.user.js
     */
    'concat',
    /*
     * Task replace: readme_build
     * replace the @PLACEHOLDERS@ in the readme.md with values from package.json
     * the source file is /src/main/text/Readme.md
     * the dest file is /Readme.md
     */
    'replace:readme_build'  // generate new Readme.md
  ]);
};
/*
 * Task replace: debug_comments
 * Finds all #regon [debug] blocks and removes them
 * source file: /scratch/build_ops/< pkg._name >.user.js
 * dest file: /scratch/nodebug/< pkg._name >.user.js
 */

/*
 * Task remove_comments: js
 * Removes debug comments from javascript file.
 * source file: /scratch/nodebug/< pkg._name >.user.js
 * dest file: /scratch/compiled/< pkg._name >.user.js
 */

/*
 * Task copy: debug_nc
 * Debug No Comment
 * simple file copy frim source to dest
 * source file: /scratch/compiled/< pkg._name >.user.js
 * dest file: /scratch/NoDebugComment/< pkg._name >.user.js
 */

/*
 * Task clean: compiled
 * Clears the directory /scratch/compiled/
 */

 /*
  * Task remove_comments: debug_nc
  * Removes debug comments from javascript file.
  * source file: /scratch/NoDebugComment/< pkg._name >.user.js
  * dest file: /scratch/debug_nc/< pkg._name >.user.js
  */

/*
 * Task copy: debug_nc_clean
 * Debug No Comment Clean
 * simple file copy frim source to dest
 * source file: /scratch/debug_nc/< pkg._name >.user.js
 * dest file: /scratch/compiled/< pkg._name >.user.js
 */