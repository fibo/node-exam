#!/usr/bin/env node

var fs = require('fs');
var readline = require('readline');

/**
 * Get results from cache or compute tags count.
 *
 * @param {Array} tags
 */

function count (tags) {
  var cache = {};
  var cacheFilename = 'cache.json';

  // Slurp cache or init it.
  try {
    cache = require('./' + cacheFilename);
  } catch (err) {
    fs.writeFile(cacheFilename, '{}', 'utf8');
  }

  // If some tag is not cached we will need to process all files.
  var someTagIsNotCached = false;

  tags.forEach(function (tag) {
    if (someTagIsNotCached) {
      return;
    }

    if (typeof cache[tag] === 'undefined') {
      someTagIsNotCached = true;
    }
  });

  function outputCached (tag) {
    console.log(tag + '\t' + cache[tag]);
  }

  if (someTagIsNotCached) {
    var data = {};

    // Read all data files.
    fs.readdir('data', function (err, files) {
      if (err) {
        throw err;
      }

      files.forEach(function (filename) {
        try {
          var json = require('./data/' + filename);
          data[filename] = json;
        } catch (err) {
          if (/Unexpected token/.test(err.message)) {
            console.error('Invalid JSON: ' + filename);
          }
        }
      });

      tags.forEach(function (tag) {
        var computedCount = 0;

        /**
        * Look for tags recursively.
        *
        * @param {String} tag
        * @return {Function}
        */

        function compute (tag) {
          return function (maybeObj) {
            var isArrayOrObject = (typeof maybeObj === 'object') && (maybeObj !== null);

            if (isArrayOrObject) {
              // If it is an array, compute tag count for each element.
              if (Array.isArray(maybeObj)) {
                maybeObj.forEach(compute(tag)); // <-- recursion here
              } else {
                // Else it is an object, loop on every prop.
                Object.keys(maybeObj).forEach(function (prop) {
                  var objectHasAnArrayOfTags = Array.isArray(maybeObj.tags) && prop === 'tags';

                  if (objectHasAnArrayOfTags) {
                    maybeObj.tags.forEach(function (entry) {
                      if (entry === tag) {
                        computedCount += 1;
                      }
                    });
                  } else {
                    compute(tag)(maybeObj[prop]); // <-- recursion here
                  }
                });
              }
            }
          };
        }

        //
        if (typeof cache[tag] === 'number') {
          outputCached(tag);
        } else {
          compute(tag)(data);
          cache[tag] = computedCount;
          outputCached(tag);
        }
      });

      // Finally, write cache.
      fs.writeFile(cacheFilename, JSON.stringify(cache), 'utf8');
    });
  } else {
    // No proces required, just output cache content.
    tags.forEach(outputCached);
  }
}

/**
 * Parse argument or read from tags.txt
 *
 * @param {String} [arg]
 */

function getInput (arg) {
  var tags = [];

  function pushTag (tag) {
    tags.push(tag);
  }

  // Read tags from argument, if any.
  if (typeof arg === 'string') {
    arg.split(',').forEach(pushTag);

    count(tags);
  } else {
  // Or from tags.txt file.
    var inputFilestream = fs.createReadStream('tags.txt');

    var readTags = readline.createInterface({input: inputFilestream});

    readTags.on('line', pushTag);

    readTags.on('close', function () {
      count(tags);
    });
  }
}

getInput(process.argv[2]);

