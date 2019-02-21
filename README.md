# Simple-HTTP-Server

# EXAMPLE 1
```
const server = require("./simplehttp.js");
server.start({"port":"80","docroot":"./htdocs/"});
home = ()=>{
    if( server.query().test){
        server.send( "<center><h1>QUERY "+server.query().test+"</h1></center>" );
    }else{
        server.send("BAD");
    }
}
server.watch( "/", home );
```
# EXAMPLE 2
```
    const server = require("./simplehttp.js");

    server.start({"port":"80","docroot":"./htdocs/"});

    home = ()=>{

        server.send( "HELLO" )
    
    }

server.watch( "/", home );
```
