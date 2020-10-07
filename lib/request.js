const url = require('url'),
mime = require('mime-types'),
fs = require('fs');
module.exports = ( req = null, res = {} )=>{
    req.url = url.parse( req.url, true );
    req.method = req.method.toLowerCase();
    res.json = ( d )=>{
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end( JSON.stringify( d ) );
    };
    res.notfound = ()=>{
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end();
    };
    res.file = ( filename )=>{
        res.writeHead(200, {'Content-Type': mime.lookup( filename )});
        let filestream = fs.createReadStream( filename );
        filestream.pipe( res );
        filestream.on( 'close', ()=>{
            res.end();
        } );
    };
}