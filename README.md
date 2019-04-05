# Simple-HTTP-Server

# EXAMPLE 1
```
const server = require("./simplehttp.js");
server.start({"port":"80","docroot":"./htdocs/"});
home = ()=>{
    if( !server.getQuery("username") == false || !server.getQuery("email") ){
        server.send( "<center>username:"+server.getQuery("username")+" email:"+server.getQuery("email")+"</center>" );
    }
}
server.watch( "/", home );
```
# EXAMPLE 2
```
    const server = require("./simplehttp.js");

    server.start({"port":"80","docroot":"./htdocs/"});

    home = ()=>{

        server.streamFile( "index.html");
    
    }

server.watch( "/", home );
```
