function response(req, res) {
  function responseHTML(err, html) {
    if (err) {
      res.writeHead(404, {"Content-type": "text/plain"});
      res.write("File not found.");
      res.end();
    } else {
      res.writeHead(200, {"Content-type": "text/html"});
      res.write(html);
      res.end();
    }
  }
 
  fs.readFile("res.js", "utf-8", responseHTML);
}
 
var http = require("http");
var fs = require("fs");
var server = http.createServer();
server.on("request", response);
server.listen(3000);
console.log("server started.");
