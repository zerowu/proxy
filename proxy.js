var http=require('http');
var url=require('url');
var queryString=require('querystring');
var path=require('path');
var conf=require('./config/conf');
var mime=require('./config/mime');

var server=new http.Server();
server.on('request',function(req,res){
    var urlParsed=url.parse(req.url);
    var queryParsed=queryString.parse(urlParsed.query);
    var remoteUrl='';
    if(queryParsed.url){
        remoteUrl=decodeURIComponent(queryParsed.url);
    }else{
        remoteUrl=conf.remoteHost+urlParsed.path;  
    }
    remoteUrl=remoteUrl+(/\?/.test(remoteUrl)?('&__t='+(+new Date())):('?__t='+(+new Date())));
    var extname=path.extname(urlParsed.pathname).slice(1)||'html';
    var remoteUrlParsed=url.parse(remoteUrl);
    var headers={
        'host':req.headers.host,   
        'user-agent':req.headers['user-agent'],
        'accept':'*/*'
    };
    var remoteRequestOptions={
        hostname:remoteUrlParsed.hostname,
        port:remoteUrlParsed.port,
        path:remoteUrlParsed.path,
        headers:headers
    };
    http.get(remoteRequestOptions,function(remoteRes){
        res.writeHead(200,{'Content-Type':mime[extname]});       
        remoteRes.on('data',function(data){
            res.write(data); 
        });
        remoteRes.on('end',function(){
            res.end();    
        });
    });
});
server.listen(conf.port);
