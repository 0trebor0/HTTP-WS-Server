# Simple-HTTP-Server

# EXAMPLE 1

const server = require("./simplehttp.js");

server.start({"port":"80","docroot":"./htdocs/"});

home = ( res )=>{

    server.streamFile( res, "index.html");
    
}

server.watchForFile( "/", home );

# EXAMPLE 2

const server = require("./simplehttp.js");

server.start({"port":"80","docroot":"./htdocs/"});

home = ( res )=>{

    server.send( res, "HELLO" )
    
}

server.watchForFile( "/", home );
