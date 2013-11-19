'use strict';

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: process.env.CI
      }
    }
  });

  grunt.registerTask('test', ['karma:unit'])

  grunt.registerTask('default', [
    'test'
  ]);
};
