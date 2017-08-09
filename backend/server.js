    var app = require('express')(),
       http = require('http').Server(app),
         io = require('socket.io')(http),
serveStatic = require('serve-static'),
       path = require('path'),
MongoClient = require('mongodb').MongoClient,
 bodyParser = require('body-parser');

var __rootPath = '/home/tudor/Documents/Coding/ChatBot/',
       __dbUrl = 'mongodb://localhost:27017/chat-messages';


// Serve index.html
app.get('/', function( req, res ){

  //redirect on root to index.html
  app.use(serveStatic(path.join(__dirname, '../frontend')));

  // Serve index.html
  res.sendFile( __rootPath + 'frontend/index.html', function(){
    console.log('Finished serving index.html...');
  });

  console.log('Serving index.html...');
});


// Socket connection
io.on('connection', function(socket){

  console.log("A user has just connected");

    socket.on('user connected', function( username, room ){
      socket.join(room);
      // Db get messages
      MongoClient.connect( __dbUrl, function( err, db ){
        if(err) {
          console.log("Error: " + err);
        } else {
          console.log("Db connection established, retriving chat for " + room);
        }

        var collection = db.collection('messages');

        collection.find({"chatroom" : room}).limit(10).toArray(function( error, result){
          if ( error ) {
              console.log(error);
          } else if( result.length ){
                    socket.emit('get messages', result)
                  } else {
                    console.log("No documents found.");
                  }
          db.close();
        });
      });
      // End Db get messages
    });


  socket.on('chat message', function(msg, username, room){

    io.to(room).emit('chat message', msg, username, room);

    //  Post messages to mongodb
    MongoClient.connect( __dbUrl, function( err, db ) {
      if(!err) {
        console.log("Db connection established");
      }
      var collection = db.collection('messages');

      collection.insert({ user: username, chatroom: room, content: msg }, function( err, o ){
          if ( err ) {
            console.warn(err.message);
          } else {
            console.log("chat message inserted into db: " + msg);
          }
          db.close();
      });
    });
    //End DB connection
  });

  socket.on('disconnect', function(){
    console.log("A user has disconnected");
  });
});

// Listening on port 3000
http.listen( 3000, function(){
  console.log('listening on *: 3000');
});
