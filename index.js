'use strict';

var fs   = require ('fs');
var path = require ('path');

exports.get = function (fileUrl, outputFile, callbackEnd, callbackProgress) {
  var url   = require ('url');
  var zogFs = require ('zogFs');

  var protocol = 'http';
  var urlObj = url.parse (fileUrl);
  if (urlObj.protocol === 'https:') {
    protocol = 'https';
  }

  var http = require (protocol);

  var options =
  {
    host: urlObj.hostname,
    port: urlObj.port,
    path: urlObj.pathname,
    rejectUnauthorized: false
  };

  zogFs.mkdir (path.dirname (outputFile));

  var progress = 0;
  var file = fs.createWriteStream (outputFile);

  http.get (options, function (res) {
    var total = 0;
    if (res.headers.hasOwnProperty ('content-length')) {
      total = res.headers['content-length'];
    }

    res.pipe (file);

    if (callbackProgress) {
      res.on ('data', function (data) {
        progress += data.length;
        callbackProgress (progress, total);
      });
    }

    res.on ('end', function () {
      file.end ();
      if (callbackEnd) {
        callbackEnd ();
      }
    });
  });
};
