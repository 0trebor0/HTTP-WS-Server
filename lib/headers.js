const cookie = require('cookie');

module.exports = ( req, res = {} )=>{
    if( typeof req.headers.cookie !== 'undefined' ){
        req.headers.cookie = cookie.parse( req.headers.cookie );
    } else {
        req.headers.cookie = {};
    }
    res.cookieSerialize = cookie.serialize;
}