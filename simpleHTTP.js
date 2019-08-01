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
        url = require('url'),
        fs = require('fs'),
        mime = require('mime-types');
module.exports = {
    start:function( config ){
        try{
            this.port;
            this.docroot;
            this.GET = {};
            this.POST = {};
            this.loadConfig( config );
            this.response;
            this.urlQuery;
            const server = http.createServer();
            server.listen(this.port);
            server.on('listening', ()=>{
                this.greenColour("listening on port:"+this.port+" | docroot:"+this.docroot);
            });
            server.on('request', ( req, res )=>{
                this.parsedUrl = this.parseUrl( req , true);
                this.urlQuery = this.parsedUrl.query;
                this.response = res;
                this.greenColour(req.connection.remoteAddress+" "+req.method+": "+req.url);
                if( req.method === 'GET' ){
                    if( this.GET[ this.parsedUrl.pathname ] ){
                        this.GET[ this.parsedUrl.pathname ]( req, res );
                    } else {
                        this.notFoundError( this.parsedUrl.pathname );
                    }
                } else if( req.method === 'POST' ){
                    if( this.POST[ this.parsedUrl.pathname ] ){
                        this.POST[ this.parsedUrl.pathname ]( req, res );
                    } else {
                        this.notFoundError( this.parsedUrl.pathname );
                    }
                } else {
                    if( this.GET[ this.parsedUrl.pathname ] ){
                        this.GET[ this.parsedUrl.pathname ]( req, res );
                    } else {
                        this.notFoundError( this.parsedUrl.pathname );
                    }
                }
            });
        }catch(error){
            this.redColour( error );
            this.serverIternalServerError( res, error );
        }
    },
    greenColour:function( text ){
        console.log("\x1b[32m",text);
    },
    redColour:function( text ){
        console.log("\x1b[31m",text);
    },
    parseUrl:function( req ){
        return url.parse( req.url, true);
    },
    loadConfig:function( config ){
        if("docroot" in config){
            if( fs.existsSync(config.docroot) ){
                this.docroot = config.docroot;
            }else{
                this.docroot = null;
                //console.log("File: "+config.docroot+" not found\r\nCreate the folder/file before starting again");
                //process.exit();
            }
        }
        if( "port" in config ){
            this.port = config.port;
        } else {
            this.port = 8000;
            console.log("Port not set \r\n Using default port:8000");
        }
    },
    get:function( url, callback ){
        this.GET[ url ] = callback;
    },
    post:function( url, callback ){
        this.POST[ url ] = callback;
    },
    send:function( file ){
        this.response.writeHead(200, {'Content-Type': 'text/html'});
        this.response.write( file );
        this.response.end();
    },
    streamFile:function( file ){
        try{
            if( fs.existsSync(this.docroot+file) ){
                if( fs.statSync(this.docroot+file).isFile() ){
                    this.response.writeHead(200, {'Content-Type': mime.lookup(this.docroot+file) });
                    this.fileStream = fs.createReadStream( this.docroot+file );
                    this.fileStream.pipe( this.response );
                    this.fileStream.on('close', ()=>{
                        this.response.end();
                    });
                }else{
                    this.notFoundError( file );
                }
            }else{
                this.redColour( "File:"+file+" not found" );
                this.notFoundError( file );
            }
        }catch(err){
            this.redColour( err );
            this.serverIternalServerError( err );
        }
    },
    serverIternalServerError:function( error ){
        this.response.writeHead(500, {'Content-Type': 'text/html'});
        this.response.write( "<center><h1>500 Internal Server Error<h1><p>"+error+"</p></center>" );
        this.response.end();
    },
    notFoundError:function( file){
        this.response.writeHead(404, {'Content-Type': 'text/html'});
        this.response.write( "<center><h1>404 Not Found</h1><p>"+file+" not found</p></center>" );
        this.response.end();
    },
    query:function( id ){
        if( this.urlQuery[id] ){
            return this.urlQuery[id];
        } else {
            return false;
        }
    }
}


