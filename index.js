
var moduleName = 'http';

var fs   = require ('fs');
var path = require ('path');

var zogLog = require ('zogLog') (moduleName);

exports.get = function (fileUrl, outputFile)
{
  var http  = require ('http');
  var url   = require ('url');
  var zogFs = require ('./zogFs.js');

  var options =
  {
    host: url.parse (fileUrl).host,
    port: 80,
    path: url.parse (fileUrl).pathname
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
