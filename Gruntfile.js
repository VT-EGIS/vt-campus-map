module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options : {
        curly : true,
        eqeqeq: true,
        eqnull: true,
        browser: true,
        newcap: false,
        undef: true,
        unused: true,
        expr: true,
        latedef: true,
        nonbsp: true,
        dojo: true,
        predef: ['module', 'alert', 'esri', '__gaTracker', 'annyang']
      },
      all: [
        'Gruntfile.js',
        'js/**/*.js',
        'tests/**/*.js'
      ]
    },
    esri_slurp: {
      options: {
        version: '3.13',
      },
      dev: {
        dest: 'lib/esri'
      }
    },
    intern: {
      prod: {
        options: {
          runType: 'runner',
          config: 'tests/intern',
          reporters: ['console'],
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('intern');
  
  //Esri slurp causes annoying error
  //to: wrong arguments
  //
  //toEnd: wrong arguments
  //
  grunt.loadNpmTasks('grunt-esri-slurp');

  grunt.registerTask('slurp', ['esri_slurp:dev']);
  grunt.registerTask('test', ['jshint', 'intern:prod']);
  grunt.registerTask('default', ['jshint', 'test']);
};
