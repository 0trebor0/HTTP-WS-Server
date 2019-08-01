# Simple-HTTP-Server

# EXAMPLE 1
```
const server = require("./simplehttp.js");
server.start({"port":"80","docroot":"./htdocs/"});
server.get( "/", ()=>{
    if( !server.query("username") == false || !server.getQuery("email") == false){
        server.send( "<center>username:"+server.query("username")+" email:"+server.query("email")+"</center>" );
    }
});
```
# EXAMPLE 2
```
    const server = require("./simplehttp.js");

    server.start({"port":"80","docroot":"./htdocs/"});

    server.get( "/", ()=>{
        server.streamFile( "index.html");
    });
```
