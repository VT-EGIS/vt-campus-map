module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options : {
        curly : true,
        eqeqeq: true,
        eqnull: true,
        browser: true,
        camelcase: true,
        newcap: false,
        undef: true,
        unused: true,
        latedef: true,
        nonbsp: true,
        dojo: true,
        predef: ['module', 'alert', 'esri', '__gaTracker']
      },
      all: [
        'Gruntfile.js',
        'js/**/*.js'
      ]
    },
    mocha: {
      test: {
        options: {
          run: false,
          reporter: 'Spec',
          log: true
        },
        src: ['SpecRunner.html']
      }
    }
  });
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('test', ['jshint', 'mocha']);
  grunt.registerTask('default', ['test']);
};
