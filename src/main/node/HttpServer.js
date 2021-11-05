const process = require('process')

const PORT= process.env.PORT || 8081;
const SERVER=`http://localhost:${PORT}/`;
const NODE_SHOW_HOST = (process.env.NODE_SHOW_HOST || "http://localhost:8080") +"/news.html"

console.log(`Configured NewsStand redirect server with`)
console.log(`Server config: ${SERVER}`)
console.log(`NodeShot @ ${NODE_SHOW_HOST}`)
//HTTP
const http = require('http');
const url = require('url');

//This is temporary...
class HttpRedirectServer {
    constructor(resolvePidByUid) {
        this.resolve = resolvePidByUid

        const server = http.createServer((request, response) => {
            console.log(`${request.method} - ${request.url}`)
            try {
              this.handle(request, response);
            } catch(err) {
              console.log(err.stack);
            }
        });

        server.listen(PORT, function(){
            console.log("Server listening port: %s", PORT);
        });
    }

    handle(req, res) {
        const queryObject = url.parse(req.url,true).query;
        let userId = queryObject["uid"];
        let prezzoId = this.resolve(userId)

        if (prezzoId) {
            let url = `${NODE_SHOW_HOST}?pid=${prezzoId}`
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(`<html><body><h3>Your news feed:</h3><a href="${url}"><span>${url}</span></a>`);
        } else {
            res.writeHead(404, {'Content-Type': 'text/html'});
        }
        res.end();
    }
}
module.exports = HttpRedirectServer