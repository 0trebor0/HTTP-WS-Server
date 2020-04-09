const app = require("./simpleHTTP.js");
const server = app( {"port":80,"docroot":"./htdocs","ssl":{"cert":"./cert","key":"./key"},"websocket":{"origin":["http://localhost"]}} );
app.get( '/', ( req, res )=>{
    // console.log( req.url.query );
    console.log( "cookie "+JSON.stringify(req.cookie) );
    res.setHeader('Set-Cookie', res.cookieSerialize('msg', String("HELLO"), {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7 // 1 week
    }));
    res.json( {"type":"msg","msg":"hello"} );
} );

app.post( '/', ( req, res, form )=>{
    console.log( req.url.query );
    // //res.json( {"status":"hello"} );
    console.log( form );
} );
app.websocket( '/', ( connection, req )=>{
    connection.on( 'message', ( message )=>{
        console.log( message );
    } );
    connection.on( 'close', ( message )=>{
        console.log( req.connection.remoteAddress+" left" );
    } );
} );
console.log( server.http );
console.log( server.websocket );