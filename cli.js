#!/usr/bin/env node

var getInput = require('./src/getInput');
var count = require('./src/count');

var fs = require('fs');
var readline = require('readline');
var path = require('path');
var tags = getInput(path.join(__dirname, 'tags.txt'), function(tags) {
  count(tags)
}, process.argv[2]);


//count(tags);
