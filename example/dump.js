var config = require('./config');

var AWS = require('aws-sdk');
AWS.config.update(config.aws);

var Dump = require('../index').Dump;
var dump = new Dump(config.mongodb, config.bucket);
dump.exec();