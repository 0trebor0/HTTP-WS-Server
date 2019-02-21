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
const server = require("./simplehttp.js");
server.start({"port":"80","docroot":"./htdocs/"});
home = ()=>{
    //server.streamFile( res, "index.html");
    //server.send( res, "HEY" );
    if( server.query().test){
        server.send( "<center><h1>QUERY "+server.query().test+"</h1></center>" );
    }else{
        server.send("BAD");
    }
}
test = ()=>{
    server.streamFile( "index.html");
}
server.watch( "/", home );
server.watch( "/test", test );
