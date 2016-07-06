var expect = require('chai').expect;
var path = require('path');

var getInput = require('../src/getInput');

describe('', function() {
  it('Parse argument or read from tags.txt', function(done) {

    getInput('tags.txt', function(tags) {
      
      expect(tags).to.eql([ 'lorem', 'ipsum', 'dolor', 'sit', 'amet' ]);
      done();
    });

  });
});
