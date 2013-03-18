/*global module:false, require:true, console:true */
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  var banner = [
        '/*! <%= pkg.name %> - v<%= pkg.version %> - ',
        '<%= grunt.template.today("yyyy-mm-dd") %> - <%= pkg.homepage %> */\n'
      ].join('');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      withExtensions: {
        options: {
          banner: banner
        },
        src: [
          'src/rekapi.license.js',
          'src/rekapi.intro.js',
          'src/rekapi.const.js',
          'src/rekapi.core.js',
          'src/rekapi.actor.js',
          'src/rekapi.keyframeprops.js',
          'ext/canvas/rekapi.canvas.context.js',
          'ext/canvas/rekapi.canvas.actor.js',
          'ext/dom/rekapi.dom.actor.js',
          'ext/to-css/rekapi.to-css.js',
          'src/rekapi.init.js',
          'src/rekapi.outro.js'
        ],
        dest: 'dist/rekapi.js'
      },
      withExtensionsDebug: {
        options: {
          banner: banner
        },
        src: [
          'src/rekapi.license.js',
          'src/rekapi.intro.js',
          'src/rekapi.core.js',
          'src/rekapi.actor.js',
          'src/rekapi.keyframeprops.js',
          'ext/canvas/rekapi.canvas.context.js',
          'ext/canvas/rekapi.canvas.actor.js',
          'ext/dom/rekapi.dom.actor.js',
          'ext/to-css/rekapi.to-css.js',
          'src/rekapi.init.js',
          'src/rekapi.outro.js'
        ],
        dest: 'dist/rekapi.js'
      },
      minimal: {
        options: {
          banner: banner
        },
        src: [
          'src/rekapi.license.js',
          'src/rekapi.intro.js',
          'src/rekapi.const.js',
          'src/rekapi.core.js',
          'src/rekapi.actor.js',
          'src/rekapi.keyframeprops.js',
          'src/rekapi.init.js',
          'src/rekapi.outro.js'
        ],
        dest: 'dist/rekapi.js'
      },
      minimalDebug: {
        options: {
          banner: banner
        },
        src: [
          'src/rekapi.license.js',
          'src/rekapi.intro.js',
          'src/rekapi.core.js',
          'src/rekapi.actor.js',
          'src/rekapi.keyframeprops.js',
          'src/rekapi.init.js',
          'src/rekapi.outro.js'
        ],
        dest: 'dist/rekapi.js'
      }
    },
    copy: {
      dist: {
        files: [
        {src: ['components/underscore/underscore-min.js'], dest: 'dist/underscore-min.js'},
        {src: ['components/shifty/dist/shifty.min.js'], dest: 'dist/shifty.min.js'},
        {src: ['components/jquery/jquery.min.js'], dest: 'dist/asset/jquery.js'},
        {src: ['components/ace-builds/src-min/ace.js'], dest: 'dist/asset/ace.js'},
        {src: ['components/ace-builds/src-min/theme-textmate.js'], dest: 'dist/asset/theme-textmate.js'},
        {src: ['components/ace-builds/src-min/mode-javascript.js'], dest: 'dist/asset/mode-javascript.js'},
        {src: ['components/ace-builds/src-min/worker-javascript.js'], dest: 'dist/asset/worker-javascript.js'},
        {src: ['components/requirejs/require.js'], dest: 'dist/asset/require.js'},
        {src: ['components/rekapi-controls/dist/jquery.dragon-slider.css'], dest: 'dist/asset/jquery.dragon-slider.css'},
        {src: ['components/rekapi-controls/dist/rekapi-controls.css'], dest: 'dist/asset/rekapi-controls.css'},
        {expand: true, flatten: true, src: ['components/rekapi-controls/lib/font-awesome/font/*'], dest: 'dist/font/'},
        {src: ['components/rekapi-controls/lib/font-awesome/css/font-awesome.css'], dest: 'dist/asset/font-awesome.css'},
        {src: ['components/rekapi-controls/dist/dragon-bundle.js'], dest: 'dist/asset/dragon-bundle.js'},
        {src: ['components/rekapi-controls/dist/rekapi-controls.min.js'], dest: 'dist/asset/rekapi-controls.min.js'}
        ]
      }
    },
    uglify: {
      standardTarget: {
        files: {
          'dist/rekapi.min.js': ['dist/rekapi.js']
        }
      },
      underscoreBundle: {
        files: {
          'dist/rekapi-underscore-shifty.min.js': [
            'components/underscore/underscore.js',
            'components/shifty/dist/shifty.js',
            'dist/rekapi.js']
        }
      },
      options: {
        banner: banner
      }
    },
    qunit: {
      files: ['tests/qunit*.html']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint qunit'
    },
    jshint: {
      all_files: [
        'grunt.js',
        'src/rekapi.!(intro|outro|const)*.js',
        'ext/**/**.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    }
  });

  // Default task.
  grunt.registerTask('default', ['jshint', 'qunit']);
  grunt.registerTask('build', [
      'copy:dist',
      'concat:withExtensions',
      'uglify:standardTarget',
      'uglify:underscoreBundle',
      'concat:withExtensionsDebug',
      'doc']);

  grunt.registerTask('doc', 'Generate API documentation.', function () {
    var fs = require('fs');
    var exec = require('child_process').exec;
    var exportToPath = 'dist/doc/';

    if (!fs.existsSync(exportToPath)) {
      fs.mkdirSync(exportToPath);
    }

    var modules = [
      { src: 'src/rekapi.intro.js', dest: 'index.html', header: 'Rekapi' },
      { src: 'src/rekapi.core.js', dest: 'core.html', header: 'Rekapi - Core' },
      { src: 'src/rekapi.actor.js', dest: 'actor.html', header: 'Rekapi - Actor' },
      { src: 'src/rekapi.keyframeprops.js', dest: 'keyframeprops.html', header: 'Rekapi - Keyframe Properties' },
      { src: 'ext/canvas/rekapi.canvas.context.js', dest: 'canvas.context.html', header: 'Rekapi - Canvas Renderer' },
      { src: 'ext/canvas/rekapi.canvas.actor.js', dest: 'canvas.actor.html', header: 'Rekapi - Canvas Actor' },
      { src: 'ext/dom/rekapi.dom.actor.js', dest: 'dom.actor.html', header: 'Rekapi - DOM Actor' },
      { src: 'ext/to-css/rekapi.to-css.js', dest: 'to-css.html', header: 'Rekapi - Export to CSS @keyframes' }
    ];

    function generate (module) {
      var child = exec(
        'dox-foundation -t "' + module.header +  '" < ' + module.src + ' > ' + exportToPath + module.dest,

        function (error, stdout, stderr) {
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
          if (error !== null) {
            console.log('exec error: ' + error);
          }
      });
    }

    modules.forEach(generate);

  });

};
