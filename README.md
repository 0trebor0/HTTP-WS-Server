# Simple-HTTP-Server
## Built With
* [cookie](https://www.npmjs.com/package/cookie)
* [formidable](https://www.npmjs.com/package/formidable)
* [http](https://www.npmjs.com/package/http)
* [https](https://www.npmjs.com/package/https)
* [mime-types](https://www.npmjs.com/package/mime-types)
* [url](https://www.npmjs.com/package/url)
* [ws](https://www.npmjs.com/package/ws)
# Example
```
const server = require("./simpleHTTP.js");
server( {"port":80,"docroot":"./htdocs","ssl":{"cert":"./cert","key":"./key"},"websocket":{"origin":["http://localhost"]}} );
server.get( '/', ( req, res )=>{
    // console.log( req.url.query );
    console.log( "cookie "+JSON.stringify(req.cookie) );
    res.setHeader('Set-Cookie', res.cookieSerialize('msg', String("HELLO"), {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7 // 1 week
    }));
    res.json( {"type":"msg","msg":"hello"} );
} );

server.post( '/', ( req, res, form )=>{
    console.log( req.url.query );
    // //res.json( {"status":"hello"} );
    console.log( form );
} );
server.websocket( '/', ( connection, req )=>{
    connection.on( 'message', ( message )=>{
        console.log( message );
    } );
    connection.on( 'close', ( message )=>{
        console.log( req.connection.remoteAddress+" left" );
    } );
} );
```
