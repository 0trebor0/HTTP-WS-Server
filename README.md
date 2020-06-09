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
const app = require("./simpleHTTP.js");
let server = app({"port":80,"docroot":"./uploads","ssl":{"cert":"./cert","key":"./key"},"websocket":{"origin":["http://localhost"]}});
server.get( '/', ( req, res )=>{
    console.log( "cookie: "+JSON.stringify(req.headers.cookie) );
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
server.onconnect( '/', ( connection, req )=>{
    connection.on( 'message', ( message )=>{
        console.log( message );
    } );
    connection.on( 'close', ( message )=>{
        console.log( req.connection.remoteAddress+" left" );
    } );
} );
//
//app();
//app.get( '/', ( req, res )=>{}
//app.post( '/', ( req, res )=>{}
//app.onconnect( '/', ( req, res )=>{}
```
