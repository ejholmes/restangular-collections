'use strict';

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: require('./bower.json'),
    release: {
      options: {
        npm: false,
        file: 'bower.json'
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: process.env.CI
      }
    },
    ngmin: {
      dist: {
        src: ['src/restangular-collections.js'],
        dest: '.tmp/restangular-collections.js'
      }
    },
    concat: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %> */'
      },
      dist: {
        src: ['.tmp/restangular-collections.js'],
        dest: 'dist/restangular-collections.js'
      }
    },
    uglify: {
      options: {
        preserveComments: 'some'
      },
      dist: {
        files: {
          'dist/restangular-collections.min.js': 'dist/restangular-collections.js'
        }
      }
    },
    jshint: {
      all: ['src/**/*.js', 'spec/**/*.js']
    }
  });

  grunt.registerTask('test', ['jshint', 'karma:unit'])
  grunt.registerTask('build', ['ngmin', 'concat', 'uglify']);
  grunt.registerTask('default', ['test']);
};
