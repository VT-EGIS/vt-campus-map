module.exports = function(grunt) {
  "use strict";
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options : {
        curly : true,
        eqeqeq: true,
        eqnull: true,
        browser: true,
        camelcase: true,
        strict: true,
        newcap: false,  
        maxlen: 80
      },
      all: [
        "Gruntfile.js",
        "js/**/*.js"
      ]
    }
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('default', ['test']);
};
