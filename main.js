const server = require("./simpleHTTP.js");
server( {"port":80,"docroot":"./htdocs","ssl":{"cert":"./cert","key":"./key"},"websocket":{"origin":["http://localhost"]}} );
server.get( '/', ( req, res )=>{
    console.log( req.url.query );
    res.json( {"type":"msg","msg":"hello"} );
} );
server.post( '/', ( req, res, form )=>{
    console.log( req.url.query );
    //res.json( {"status":"hello"} );
    console.log( form );
} );
server.websocket( '/', ( connection, req )=>{
    console.log( "new connection" );
    connection.on( 'message', ( message )=>{
        console.log( message );
    } );
} );
