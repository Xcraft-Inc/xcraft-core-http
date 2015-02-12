'use strict';

var fs   = require ('fs');
var path = require ('path');

var request = require ('request');

exports.get = function (fileUrl, outputFile, callbackEnd, callbackProgress) {
  var xFs = require ('xcraft-core-fs');

  xFs.mkdir (path.dirname (outputFile));

  var total = 0;
  var progress = 0;
  var file = fs.createWriteStream (outputFile);

  request
    .get ({
      url: fileUrl,
      rejectUnauthorized: false
    })
    .on ('response', function (res) {
      if (res.headers.hasOwnProperty ('content-length')) {
        total = res.headers['content-length'];
      }
    })
    .on ('data', function (data) {
      if (!callbackProgress) {
        return;
      }

      progress += data.length;
      callbackProgress (progress, total);
    })
    .pipe (file)
    .on ('finish', function () {
      if (callbackEnd) {
        callbackEnd ();
      }
    });
};
