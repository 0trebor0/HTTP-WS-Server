const http = require('http'),
https = require('https'),
url = require('url'),
fs = require('fs'),
mime = require('mime-types'),
WebSocket = require('ws'),
formidable = require('formidable'),
cookie = require('cookie');
var app = {};
app.port = 8080;
app.htdocs = null;
app.ssl = null;
app.http = null;
app.debug = true;
app.method = {};
app.method.get = {};
app.method.post = {};
app.websocket = null;
app.originAllowed = {};
app.pathConnections = {};
// app.on = ( method, path, callback )=>{
//     app.method[method][ path ] = callback; //DISABLED
// };
app.get = ( path, callback )=>{
    app.method.get[ path ] = callback;
};
app.post = ( path, callback )=>{
    app.method.post[ path ] = callback;
};
app.onconnect = ( path, callback )=>{
    app.pathConnections[ path ] = callback;
}

module.exports = (config = {})=>{
    try{
        if( !fs.existsSync( './uploads' ) ){
            fs.mkdirSync( './uploads' );
        }
        if( "port" in config ){
            app.port = config.port;
        }
        if( "docroot" in config ){
            if( fs.existsSync( config.docroot ) ){
                app.htdocs = config.docroot
            }
        }
        if( "ssl" in config && "cert" in config.ssl && "key" in config.ssl ){
            if( fs.existsSync( config.ssl.cert ) && fs.existsSync( config.ssl.key ) ){
                app.ssl = config.ssl;
            }
        }
        if( "debug" in config && config.debug === true ){
            app.debug = true;
        }
        if( "websocket" in config ){
            //app.websocket = true;
            if( "origin" in config.websocket ){
                config.websocket.origin.forEach((d)=>{
                    app.originAllowed[ d ] = {};
                });
            }
        } else {
            app.websocket = false;
        }
        let server;
        if( app.ssl === null ){
			server = http.createServer();
		} else {
			server = https.createServer( {
				cert: fs.readFileSync( app.ssl.cert ),
				key: fs.readFileSync( app.ssl.key )
			} );
        }
        server.listen( app.port );
        server.on( 'listening', ()=>{
            if( app.debug == true ){
                if( app.ssl === null ){
                    console.log( "http started on Port:"+app.port );
                } else {
                    console.log( "https started on Port:"+app.port );
                }
            }
        } );
        server.on( 'request', ( req, res )=>{
            if( app.debug == true ){
                console.log( "[HTTP][IpAddress"+req.connection.remoteAddress+"][Method: "+req.method+"]"+req.url );
            }
            req.url = url.parse( req.url, true );
            if( typeof req.headers.cookie !== 'undefined' ){
                req.headers.cookie = cookie.parse( req.headers.cookie );
            } else {
                req.headers.cookie = {};
            }
            res.cookieSerialize = cookie.serialize;
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
            if( req.method === 'GET' && app.method.get[ req.url.pathname ] ){
                app.method.get[ req.url.pathname ]( req, res );
            } else if( req.method === 'POST' && app.method.post[ req.url.pathname ] ){
                let form = formidable({ multiples: true, uploadDir:'./uploads' });
                form.parse(req, (err, fields, files) => {
                    app.method.post[ req.url.pathname ]( req, res, {'fields':fields,'files':files} );
                    //TODO: Add Timeout for uploaded file to auto delete
                });
            } else if( app.method[ req.method ] && app.method[ req.method ][ req.url.pathname ] !== 'undefined' ){
                app.method[ req.method ][ req.url.pathname ]( req, res );
            } else if( app.htdocs !== null && fs.existsSync( app.htdocs+req.url.pathname ) && fs.statSync(app.htdocs+req.url.pathname).isFile() ){
                res.file( app.htdocs+req.url.pathname );
            } else {
                res.notfound();
            }
        });
        if( app.websocket !== false ){
            app.websocket = new WebSocket.Server({server});
            console.log( "websocket started on port: "+app.port );
            app.websocket.on( 'connection', ( connection, req )=>{
                if( app.debug == true ){
                    console.log( "[NEW][WEBSOCKET]["+req.connection.remoteAddress+"]"+req.url );
                }
                req.url = url.parse( req.url, true );
                if( typeof req.headers.cookie !== 'undefined' ){
                    req.headers.cookie = cookie.parse( req.headers.cookie );
                } else {
                    req.headers.cookie = {};
                }
                if( app.originAllowed[req.headers.origin] && app.pathConnections[ req.url.pathname ] ){
                    if( app.debug == true ){
                        console.log( "[ACCEPTED][WEBSOCKET][IpAddress:"+req.connection.remoteAddress+"][ORIGIN: "+req.headers.origin+"][PATH: "+req.url.pathname+"]" );
                    }
                    app.pathConnections[ req.url.pathname ]( connection, req );
                } else {
                    if( app.debug == true ){
                        console.log( "[DENIED][WEBSOCKET][IpAddress:"+req.connection.remoteAddress+"][ORIGIN: "+req.headers.origin+"][PATH: "+req.url.pathname+"]" );
                    }
                    connection.terminate();
                }
            } );
        }
        app.http = server;
        return app;
    }catch( err ){
        console.log( err );
    }
}
module.exports.get = ( path, callback )=>{
    app.method.get[ path ] = callback;
};
module.exports.post = ( path, callback )=>{
    app.method.post[ path ] = callback;
};
module.exports.onconnect = ( path, callback )=>{
    app.pathConnections[ path ] = callback;
}