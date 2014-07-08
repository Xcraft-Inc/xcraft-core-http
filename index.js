
var moduleName = 'http';

var fs   = require ('fs');
var path = require ('path');

var zogLog = require ('zogLog') (moduleName);

exports.get = function (fileUrl, outputFile, callbackEnd)
{
  var url   = require ('url');
  var zogFs = require ('zogFs');

  var protocol = 'http';
  urlObj = url.parse (fileUrl);
  if (urlObj.protocol == 'https:')
    protocol = 'https';

  var http = require (protocol);

  var options =
  {
    host: urlObj.hostname,
    port: urlObj.port,
    path: urlObj.pathname,
    rejectUnauthorized: false
  };

  zogFs.mkdir (path.dirname (outputFile));

  var file = fs.createWriteStream (outputFile);

  http.get (options, function (res)
  {
    res.pipe (file);

    res.on ('end', function ()
    {
      file.end ();
      if (callbackEnd)
        callbackEnd ();
    });
  });
}
