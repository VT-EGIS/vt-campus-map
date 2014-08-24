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
        predef: ['module', 'alert', 'esri']
      },
      all: [
        'Gruntfile.js',
        'js/**/*.js'
      ]
    }
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('default', ['test']);
};
