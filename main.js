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