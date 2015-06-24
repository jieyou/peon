/*
 * grunt-runtask
 * https://github.com/salsita/grunt-runtask
 *
 * Copyright (c) 2013 Salsita Software
 * Licensed under the MIT license.
 */

 /* 
 * modified : k3karthic
 */

'use strict';

module.exports = function (grunt) {

  /**                                                                                           @
   * The `userev` task updates references to assets versioned with `filerev`.
   *
   * It uses `grunt.filerev.summary`.
   */
  function reEscape(s) { // http://stackoverflow.com/a/18620139/899047
    return s.replace(/[$-\/?[-^{|}]/g, '\\$&');
  }

  function endsWith(s, suffix) { // http://stackoverflow.com/a/2548133/899047
    return s.indexOf(suffix, s.length - suffix.length) !== -1;
  }

  function replaceFirstGroup(s, pattern, replacement) {
    var match = pattern.exec(s);
    if (match) {
      return s.replace(pattern, match[0].replace(match[1] || match[0], replacement));
    } else {
      return s;
    }
  }

  grunt.task.registerMultiTask('userev', 'Update versioned assets references.', function() {
    var path = require('path');
    var sep = '/';
    var options = this.options();
    var versioned = grunt.filerev && grunt.filerev.summary;

    if (versioned && path.sep !== sep) {
      var re = new RegExp(reEscape(path.sep), 'g');
      for (var assetpath in versioned) {
        versioned[assetpath.replace(re, sep)] = versioned[assetpath].replace(re, sep);
        delete versioned[assetpath];
      }
    }

    grunt.log.debug(this.nameArgs + ': ' + JSON.stringify(this.files, null, 4) +
      JSON.stringify(options, null, 4));
    grunt.log.debug('filerev.summary: ' + JSON.stringify(versioned, null, 4));

    if (versioned) {
      this.files.forEach(function(file) {
        file.src.filter(function(filepath) {
          if (!grunt.file.exists(filepath)) {
            grunt.log.warn('Source file "' + filepath + '" not found.');
            return false;
          } else {
            return true;
          }
        }).forEach(function(filepath) {
          var content = grunt.file.read(filepath);
          var updated = false;
          var replacement, lastLink, baseLink, hashLink, index;

          for (var label in options.patterns) {
            var match,match_pos;
            var pattern = options.patterns[label];
            var matches = content.match(pattern);

            for (index in matches) {
              var match = matches[index];
              if (match) {
                grunt.log.debug('Matching ' + [filepath, pattern, JSON.stringify(match)].join(': '));
                replacement = match;
                lastLink = match;
                baseLink = options.hash ? replaceFirstGroup(lastLink, options.hash, '') : lastLink;
                for (var assetpath in versioned) {
                  if (endsWith(assetpath, baseLink)) {
                    if (!updated) {
                      grunt.log.writeln('Updating ' + filepath.cyan +
                        (file.dest ? ' -> ' + file.dest.cyan : '.'));
                    }
                    hashLink = versioned[assetpath].slice(assetpath.length - baseLink.length);
                    if (lastLink !== hashLink) {
                      grunt.log.writeln('Linking ' + label + ': ' + lastLink +
                        (baseLink !== lastLink ? ' -> ' + baseLink : '') + ' -> ' + hashLink.green);
                      replacement = replacement.replace(lastLink, hashLink);
                      content = content.replace(match, replacement);
                      updated = true;
                    } else {
                      grunt.log.writeln('Already linked ' + label + ': ' +
                        baseLink + ' -> ' + hashLink.green);
                    }
                    break;
                  } else {
                    grunt.log.debug('No match: ' + lastLink +
                      (baseLink !== lastLink ? ' -> ' + baseLink : '') + ' <> ' + assetpath);
                  }
                }
              } else {
                grunt.log.debug('Not matching ' + filepath + ': ' + pattern);
              }
            }
          }
          if (updated) {
            grunt.file.write(file.dest || filepath, content);
          }
        });
      });
    }
  });
};