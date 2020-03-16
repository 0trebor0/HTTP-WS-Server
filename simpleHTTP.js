/* 
 * Copyright 2019 0trebor0.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const http = require('http'),
https = require('https'),
url = require('url'),
fs = require('fs'),
mime = require('mime-types'),
WebSocket = require('ws'),
formidable = require('formidable');

const app = {};
app.port = 8080;
app.htdocs = null;
app.ssl = null;
app.server = null;
app.get = {},
app.websocket = null,
app.websocketAllowedOrigin = null
app.websocketConnection = {},
app.post = {},
app.load = ( server )=>{
    try{
        server.listen( app.port );
        server.on( 'listening', ()=>{
            if( app.ssl === null ){
                console.log( "http started on Port:"+app.port );
            } else {
                console.log( "https started on Port:"+app.port );
            }
        } );
        server.on( 'request', ( req, res )=>{
            console.log( "["+req.connection.remoteAddress+"]["+req.method+"]"+req.url );
            req.url = url.parse( req.url, true );
            res.file = ( filename )=>{
                res.writeHead(200, {'Content-Type': mime.lookup( filename )});
                let filestream = fs.createReadStream( filename );
                filestream.pipe( res );
                filestream.on( 'close', ()=>{
                    res.end();
                } );
            }
            res.json = ( d )=>{
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end( JSON.stringify( d ) );
            }
            res.notfound = ()=>{
                res.writeHead(404, {'Content-Type': 'text/html'});
                res.end();
            };
            if( req.method === 'GET' && app.get[ req.url.pathname ] ){
                app.get[ req.url.pathname ]( req, res );
            } else if( req.method === 'POST' && app.post[ req.url.pathname ] ){
                let form = formidable({ multiples: true, uploadDir:'./uploads' });
                form.parse(req, (err, fields, files) => {
                    app.post[ req.url.pathname ]( req, res, {'fields':fields,'files':files} );
                });
            } else if( app.htdocs !== null ){
                if(fs.existsSync( app.htdocs+req.url.pathname ) && fs.statSync( app.htdocs+req.url.pathname ).isDirectory()){
                    if( fs.existsSync( app.htdocs+req.url.pathname+"/index.html" ) ){
                        res.file( app.htdocs+req.url.pathname+"/index.html" );
                    } else {
                        res.notfound();
                    }
                } else {
                    res.file( app.htdocs+req.url.pathname );
                }

            } else {
                res.notfound();
            }
        });
        if( app.websocketAllowedOrigin !== null ){
            app.websocket = new WebSocket.Server({ server });
            console.log( "websocket started on port: "+app.port );
            app.websocket.on( 'connection', ( connection, req )=>{
                req.url = url.parse( req.url, true );
                if( app.websocketAllowedOrigin[ req.headers.origin ] ){
                    if( app.websocketConnection[ req.url.pathname ] ){
                        app.websocketConnection[ req.url.pathname ]( connection, req );
                    } else {
                        console.log( "unwanted path connection "+req.connection.remoteAddress+" "+req.url.pathname );
                    }
                } else {
                    console.log( "unwanted origin connection "+req.connection.remoteAddress+" "+req.headers.origin );
                    connection.terminate();
                }
            } );
        }
    }catch( err ){
        console.log( err );
    }
}
if( app.ssl === null ){
    app.server = http.createServer();
} else {
    app.server = https.createServer( {
        cert: app.ssl.cert,
        key: app.ssl.key
    } );
}
module.exports = ( config )=>{
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
    if( "websocket" in config && config.websocket.origin.length > 0 ){
        app.websocketAllowedOrigin = {};
        config.websocket.origin.forEach( ( origin )=>{
            app.websocketAllowedOrigin[ origin ] = "allowed";
        } );
    }
    app.load( app.server );
    return app.server;
}
module.exports.websocket = ( path, callback )=>{
    app.websocketConnection[ path ] = callback;
}
module.exports.get = ( path, callback )=>{
    app.get[ path ] = callback;
}
module.exports.post = ( path, callback )=>{
    app.post[ path ] = callback;
}