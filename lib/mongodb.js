var spawn = require('child_process').spawn,
    Deferred = require("promised-io/promise").Deferred;

var prefix = 'mongodb://';

module.exports = {
  parse: function(url) {
    if (url.indexOf(prefix) != 0) throw Error('Invalid mongodb URL');
    url = url.replace(prefix, '');

    var parsed = {};

    // Get the database
    var split = url.split('/');
    url = split[0];
    parsed.database = split[1];

    // Split out username/password
    var split = url.split('@');
    if (split.length > 1) {
      url = split[1];
      var split = split[0].split(':');
      parsed.username = split[0];
      parsed.password = split[1];
    }

    // Split out host/port
    var split = url.split(':');
    parsed.host = split[0];
    parsed.port = split[1];

    return parsed;
  }
}