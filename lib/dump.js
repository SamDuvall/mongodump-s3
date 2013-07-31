var fs = require('fs'),
    _ = require('underscore'),
    spawn = require('child_process').spawn,
    Deferred = require("promised-io/promise").Deferred,
    AWS = require('aws-sdk');
    mongodb = require('./mongodb');

var steps = [function mongodump() {
  
  var deferred = new Deferred();

  var config = this;
  var mongo = config.mongo;

  // Determine the command line arguments for the dump
  var args = [];
  args.push('--host', mongo.host + ':' + mongo.port);
  args.push('--db', mongo.database);
  args.push('-o', config.tmpDirectory);
  if (mongo.username && mongo.password) {
    args.push('-u', mongo.username);
    args.push('-p', mongo.password);
  }

  var mongodump = spawn('mongodump', args);
  mongodump.on('exit', function (code) {
    config.dumpDirectory = config.tmpDirectory + '/' + mongo.database;
    return deferred.resolve();
  });

  return deferred.promise;

}, function zip() {

  var deferred = new Deferred();

  var config = this;
  var timestamp = new Date().toISOString().replace(/\..+/g, '').replace(/[-:]/g, '').replace(/T/g, '-');
  var basename = this.mongo.database + '-' + timestamp + '.tar.gz';
  var filename = config.tmpDirectory + '/' + basename;

  var args = ['-zcvf', filename, '-C', config.dumpDirectory, '.'];
  var tar = spawn('tar', args);
  tar.on('exit', function (code) {
    config.basename = basename;
    config.filename = filename;
    deferred.resolve();
  });

  return deferred.promise;

}, function cleanDump() {

  var deferred = new Deferred();

  var args = ['-r', this.dumpDirectory];
  var rm = spawn('rm', args);
  rm.on('exit', function (code) {
    deferred.resolve();
  });

  return deferred.promise;

}, function uploadToAws() {

  var deferred = new Deferred();

  var bucket = new AWS.S3({params: {Bucket: this.bucket}})
  bucket.putObject({
    Key: 'db-backups/' + this.basename,
    Body: fs.createReadStream( this.filename )
  }, function(err, data) {
    deferred.resolve();
  });

  return deferred.promise;

}, function cleanZip() {

  var deferred = new Deferred();

  var args = [this.filename];
  var rm = spawn('rm', args);
  rm.on('exit', function (code) {
    deferred.resolve();
  });

  return deferred.promise;
}]

var Dump = function(mongoUrl, bucket) {
  this.mongo = mongodb.parse(mongoUrl);
  this.bucket = bucket;
}

_.extend(Dump, {
  tmpDirectory: '/tmp'
});

_.extend(Dump.prototype, {
  exec: function() {
    var config = {
      mongo: this.mongo,
      bucket: this.bucket,
      tmpDirectory: Dump.tmpDirectory
    }

    var boundSteps = _.map(steps, function(step) {
      return _.bind(step, config);
    });

    return require("promised-io/promise").seq(boundSteps);
  }
});

module.exports = {
  Dump: Dump
}