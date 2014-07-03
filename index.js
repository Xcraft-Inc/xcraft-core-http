
var moduleName = 'http';

var fs   = require ('fs');
var path = require ('path');

var zogLog = require ('zogLog') (moduleName);

exports.get = function (fileUrl, outputFile)
{
  var url   = require ('url');
  var zogFs = require ('zogFs');

  var protocol = 'http';
  urlObj = url.parse (fileUrl);
  if (url.protocol == 'https:')
    protocol = 'https';

  var http = require (protocol);

  var options =
  {
    host: urlObj.host,
    port: urlObj.port,
    path: urlObj.pathname
  };

  zogFs.mkdir (path.dirname (outputFile));

  var file = fs.createWriteStream (outputFile);

  http.get (options, function (res)
  {
    res.on ('data', function (data)
    {
      file.write (data);
    });

    res.on ('end', function ()
    {
      file.end ();
    });
  });
}
