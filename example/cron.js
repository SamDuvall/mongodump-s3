var config = require('./config');

var AWS = require('aws-sdk');
AWS.config.update(config.aws);

var Dump = require('../index').Dump;
var dump = new Dump(config.mongodb, config.bucket);

// Dumps out every minute
var CronJob = require('cron').CronJob;
var job = new CronJob('0 * * * * *', function(){
  console.log('mongodump started...')
  dump.exec().then(function(config) {
    console.log('...mongodump complete', config.basename)
  });
}, null, true);