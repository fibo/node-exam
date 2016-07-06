var fs = require('fs');
var readline = require('readline');

/**
 * Parse argument or read from tags.txt
 *
 * @param {String} tagsPath
 * @param {Fuction} callback
 * @param {String} [arg]
 * @return {Fuction} tags
 */

var getInput = function(tagsPath, callback, arg) {
  var tags = [];

  function pushTag (tag) {
    tags.push(tag);
  }

  // Read tags from argument, if any.
  if (typeof arg === 'string') {
    arg.split(',').forEach(pushTag);

    callback(tags)
  } else {
  // Or from tags.txt file.
    var inputFilestream = fs.createReadStream(tagsPath);

    var readTags = readline.createInterface({ input: inputFilestream });

    readTags.on('line', pushTag);

    readTags.on('close', function () {
      callback(tags)
    });
  }
};

module.exports = getInput;
