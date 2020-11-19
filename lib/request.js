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
        let range = req.headers.range;
        if( !range ){
            res.writeHead(200, {'Content-Type': mime.lookup( filename )});
            let filestream = fs.createReadStream( filename );
            filestream.pipe( res );
            filestream.on( 'close', ()=>{
                res.end();
            } );
        } else {
            let size = fs.statSync( filename ).size;
            let chunk_size = 10 ** 6;
            let start = Number(range.replace(/\D/g, ""));
            let end = Math.min(start + chunk_size, size - 1);
            let contentLength = end - start + 1;
            let headers = {
                "Content-Range": "bytes "+start+"-"+end+"/"+size,
                "Accept-Ranges": "bytes",
                "Content-Length": contentLength,
                "Content-Type": mime.lookup( filename ),
            };
            res.writeHead(206, headers);
            let filestream = fs.createReadStream( filename,{ start, end } );
            filestream.pipe( res );
            filestream.on( 'close', ()=>{
                res.end();
            } );
        }
    };
}