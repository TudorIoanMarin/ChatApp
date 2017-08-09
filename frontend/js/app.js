$(function(){
  var socket = io();

  var username, room;

    $('.btn-info').click(function(){
      $('body').addClass('logged')
      username = $('form input').val();
      room = $('select').val();

      socket.emit('user connected', username, room)

      socket.on('get messages', function( messages ){
          for( var i = 0; i < messages.length; i++ ){
            var message = messages[i];
            $('#messages').append('<li><b>'+ message.user + '</b>:<br/>' + message.content + '<li/>');
          }
       });
       $('h4').html("Welcome, you entered " + room);
  });
      $('.send-msg').click(function(){
        socket.emit('chat message', $('.msg').val(), username, room);
        $('.msg').val('');
        return false;
      });

      socket.on('chat message', function(msg, username, room) {
        $('#messages').append('<li><b>'+ username + '</b>:<br/>' + msg + '<li/>');
      });
});
