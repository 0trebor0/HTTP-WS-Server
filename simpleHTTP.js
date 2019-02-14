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
            this.watching = {};
            this.loadConfig( config );
            const server = http.createServer();
            server.listen(this.port);
            server.on('listening', ()=>{
                this.greenColour("listening on port:"+this.port+" | docroot:"+this.docroot);
            });
            this.urlQuery;
            server.on('request', ( req, res )=>{
                this.parsedUrl = this.parseUrl( req );
                this.urlQuery = this.parsedUrl.query;
                this.greenColour(req.connection.remoteAddress+" REQUEST:"+JSON.stringify(this.parsedUrl));
                if( this.watching[this.parsedUrl.pathname] ){
                    this.watching[this.parsedUrl.pathname]( res );
                } else if( this.docroot !== null || fs.existsSync( this.docroot+'/'+this.parsedUrl.pathname ) ){
                    this.streamFile( res, this.parsedUrl.pathname );
                }else{
                    this.redColour( "File: "+this.parsedUrl.pathname+" not found" );
                    this.notFoundError( res, this.parsedUrl.pathname );
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
    watchForFile:function( file, name ){
        this.watching[file] = name;
    },
    send:function( res, file ){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write( file );
        res.end();
    },
    streamFile:function( res, file ){
        try{
            if( fs.existsSync(this.docroot+file) ){
                if( fs.statSync(this.docroot+file).isFile() ){
                    res.writeHead(200, {'Content-Type': mime.lookup(this.docroot+file) });
                    this.fileStream = fs.createReadStream( this.docroot+file );
                    this.fileStream.pipe( res );
                    this.fileStream.on('close', ()=>{
                        res.end();
                    });
                }else{
                    this.notFoundError( res, file );
                }
            }else{
                this.redColour( "File:"+file+" not found" );
                this.notFoundError( res, file );
            }
        }catch(err){
            this.redColour( err );
            this.serverIternalServerError( res, err );
        }
    },
    serverIternalServerError:function( res, error ){
        res.writeHead(500, {'Content-Type': 'text/html'});
        res.write( "<center><h1>500 Internal Server Error<h1><p>"+error+"</p></center>" );
        res.end();
    },
    notFoundError:function( res, file){
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.write( "<center><h1>404 Not Found</h1><p>"+file+" not found</p></center>" );
        res.end();
    },
    watchForQuery:function( query, name ){
        //this.watching[query] = name;
        console.log("Function Disabled");
    },
    getQuery:function(){
        return this.urlQuery;
    }
}


