var expect = require('expect.js'),
    mongodb = require('../lib/mongodb');

describe('mongodb', function() {
  describe('parse', function() {
    it('should throw and exception for an invalid URL', function() {
      expect(function() {
        mongodb.parse('invalid:url')
      }).to.throwException();
    });

    it('should parse a full expression', function() {
      var parsed = mongodb.parse('mongodb://username:password@host:1234/database');
      expect(parsed).to.eql({
        host: 'host',
        port: 1234,
        database: 'database',
        username: 'username',
        password: 'password'
      });
    });

    it('should parse a expression without username/password', function() {
      var parsed = mongodb.parse('mongodb://host:1234/database');
      expect(parsed).to.eql({
        host: 'host',
        port: 1234,
        database: 'database'
      });
    });
  });
});