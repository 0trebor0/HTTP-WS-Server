const http = require('http'),
https = require('https'),
fs = require('fs'),
WebSocket = require('ws'),
headers = require(__dirname+'/headers.js'),
reqJS = require(__dirname+'/request.js'),
formidable = require('formidable');
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
            reqJS( req, res );
            headers( req, res );
            if( app.method[ req.method ] && app.method[ req.method ][ req.url.pathname ] ){
                if( req.method == 'post' ){
                    if( !fs.existsSync( './uploads' ) ){
                        fs.mkdirSync( './uploads' );
                    }
                    let form = formidable({ multiples: true, uploadDir:'./uploads' });
                    form.parse(req, (err, fields, files) => {
                        setTimeout(()=>{
                            //Delete File after 1 min
                            for( t in files ){
                                if( fs.existsSync( files[t].path ) ){
                                    fs.unlinkSync( files[t].path );
                                }
                            }
                        },60000);
                        app.method[ req.method ][ req.url.pathname ]( req, res, {'fields':fields,'files':files} );
                    });
                }
                app.method[ req.method ][ req.url.pathname ]( req, res );
            } else if( app.htdocs !== null && fs.existsSync( app.htdocs+req.url.pathname ) ){
                if( fs.statSync(app.htdocs+req.url.pathname).isFile() ){
                    res.file( app.htdocs+req.url.pathname );
                } else if( fs.statSync(app.htdocs+req.url.pathname).isDirectory() ){
                    if( fs.existsSync( app.htdocs+req.url.pathname+"/index.html" ) ){
                        res.file( app.htdocs+req.url.pathname+"/index.html" );
                    } else {
                        res.notfound();
                    }
                }
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
                reqJS( req );
                headers( req );
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