'use strict';

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: process.env.CI
      }
    },
    jshint: {
      all: ['src/**/*.js', 'spec/**/*.js']
    }
  });

  grunt.registerTask('test', ['jshint', 'karma:unit'])
  grunt.registerTask('default', ['test']);
};
