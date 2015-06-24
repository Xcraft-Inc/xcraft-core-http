'use strict';

var fs   = require ('fs');
var path = require ('path');

var request = require ('request');

exports.get = function (fileUrl, outputFile, callback, callbackProgress) {
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
    .on ('error', callback)
    .pipe (file)
    .on ('finish', function () {
      /* HACK: It's a workaround in order to be sure that the handle is closed
       *       on the downloaded file. Otherwise it's possible that an external
       *       command can not access the file.
       *
       * This problem exists (on some systems) with for example the use of
       * 7za.exe after the download of a .7z file.
       */
      var fd = fs.openSync (outputFile, 'r');
      fs.closeSync (fd);

      callback ();
    });
};
