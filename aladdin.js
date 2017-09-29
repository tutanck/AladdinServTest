var args = process.argv.splice(process.execArgv.length + 2);

console.log(args)

var db = args[0]?args[0]:'localhost:3009';
var port = args[1]?args[1]:1210;

//express http server
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var client_socket = require('socket.io-client')(db);


//Home page
app
.get('/', function(req, res){
    res.status(200).send('$_-'); 
});


io.on('connection', function (socket) {
    console.log('Aladdin : socket \''+socket.id+'\' just connected');
    
    socket.on('disconnect', function(){
        console.log('Aladdin : socket \''+socket.id+'\' just disconnected');
    });
    
    
    
    /**
    * aggregate  */
    socket.on('getUserReputation',(coll, p, opt, meta, ack) => {
            
            let ctx = {"op":R.aggregate.toCRUD,"coll":coll,"p":p,"opt":opt,"meta":meta}
            
            if(!status.valid)
                return reply(R.aggregate.toString,ack,status.error,null,ctx)
            
            regina.get(coll).aggregate(p,opt)
            .then((res) => {
                reply(R.aggregate.toString,ack,null,res,ctx)
                //  ||
                notifyFollowers(socket,res,ctx)
            }).catch((e) =>{
                reply(R.aggregate.toString,ack,e,null,ctx)
            });
            //end : socket.on('aggregate
        });    
        
        //end : io.on('connection'
    });
    
    
    
    
    //utilities
    const reply=(method,ack,err,res,ctx) => {
        ack(err,res,ctx);
        if(debug)
            console.log("<- '"+method+"'","replied :[\n",err,res,ctx,"\n]")
    }

    const emitNoackCallbackError = (socket) => {
        console.log("Invalid request : ack callback is not defined.")
        socket.emit(
            'regina_noack_callback_error',
            "Error : no ack callback provided. "
            +"Can't send request acknoledgement : request canceled."
        );
    }
    
    
    
    //server config

    app
    .use(function(req, res, next){
        res.status(404).send('Not Found !'); 
    });
    
    server
    .listen(port, function(){
        console.log("Aladdin is listening on port '"+port+"' !");
    });
    