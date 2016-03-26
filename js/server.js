var http = require('http');

var server = http.createServer(function(req, res) {
  res.writeHead(200, {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "text/plain"
  });
  // var st = new Date().getTime();
  // while (new Date().getTime() < st + 3000);
  res.write('node js');
  res.end();
});

server.on('request', function(req, res) {
  console.log(req.url + ' "' + req.headers['user-agent'] + '"');
});

server.listen(3000);
