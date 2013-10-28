module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // jshint custom spa and api javascript files
    jshint: {
      spa: {
        src: ['./public/javascripts/*.js']
      },
      api: {
        src: ['./lib/app.js']
      }
    },
    // copy bower install javascript files and css over
    copy: {
      deps: { 
        expand: true, flatten: true, src: 'public/components/jquery/jquery.min.js', dest: 'public/javascripts/', filter: 'isFile' 
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> v1 */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  

  // Default task(s).
  grunt.registerTask('default', ['jshint:spa']);

};