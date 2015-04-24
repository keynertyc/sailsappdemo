// io.socket.post('/articles/create', {
//   title: $('#title').val(),
//   body: $('#body').val()
// }, function (resData) {
//   // console.log(resData);
//   // $("#tableArticles").append('<tr><td>' + resData.title + '</td><td>' + resData.body + '</td></tr>');
// });

$(document).ready(function() {

  $("#createUser").submit(function (event) {
    $.ajax ({
      url: "/users/create",
      type: "POST",
      data: $('#createUser').serializeArray()
    }).done(function (result){
      if (result.message == 'ok'){
        $(location).attr('href', '/users/show_all');
      } else {
        alert('Error Login');
      }
    }).fail(function() {
      alert('Error');
    });

    $("#createUser")[0].reset();
    event.preventDefault();
  });

  $("#loginUser").submit(function (event) {
    $.ajax ({
      url: "/users/login",
      type: "POST",
      data: $('#loginUser').serializeArray()
    }).done(function (result){
      if (result.message == 'ok'){
        $(location).attr('href', '/users/show_all');
      } else {
        alert(result.message);
      }
    }).fail(function() {
      alert('Error');
    });

    $("#loginUser")[0].reset();
    event.preventDefault();
  });

  usersSubscribe();
  chatSubscribe();

});

function chatSubscribe (){
  if ($('#currentUserId').val() != '' && typeof $('#currentUserId').val() != 'undefined'){
    var user_id = $('#currentUserId').val();
    io.socket.get('/users/chat_subscribe?user_id='+user_id, {}, function (data) {});

    io.socket.on('chat_private_message', function (data) {
      // console.log('Socket mesage received :: ', data);
      if (data.message != '' && data.from != '' && typeof data.from != 'undefined') {
        $("#chatUserMessage").append('<div id="spanMessage'+data.id+'"><span class="label label-success">'+data.from+' sent a message: '+data.message+'</span><br><br></div>')
        $("#spanMessage"+data.id).fadeIn(1000);
        $("#spanMessage"+data.id).fadeOut(5000, function(){
          $("#spanMessage"+data.id).remove();
        });
      }
    });

    io.socket.on('chat_all_message', function (data) {
      // console.log('Socket mesage received :: ', data);
      if (data.message != '' && data.from != '' && typeof data.from != 'undefined') {
        $("#chatUserMessage").append('<div id="spanMessage'+data.id+'"><span class="label label-success">'+data.from+' sent a message: '+data.message+'</span><br><br></div>')
        $("#spanMessage"+data.id).fadeIn(1000);
        $("#spanMessage"+data.id).fadeOut(5000, function(){
          $("#spanMessage"+data.id).remove();
        });

      }
    });
  }
}

function chatSendMessage(userId) {

  if ($('#txtMessage').val() == "") {
    alert('Error. Empty message.');
    $('#txtMessage').focus();
  } else {
    var userId = userId;
    var fromUserId = $('#currentUserId').val();
    var message = $('#txtMessage'+userId).val();
    io.socket.get('/users/chat_send_message?user_id='+userId+'&from_user_id='+fromUserId+'&message='+message, {}, function (data) {});
    alert('Message Sent.');
    $('#txtMessage'+userId).val("");
  }

}

function chatSendAllMessage() {

  if ($('#txtAllMessage').val() == "") {
    alert('Error. Empty message.');
    $('#txtAllMessage').focus();
  } else {
    var fromUserId = $('#currentUserId').val();
    var message = $('#txtAllMessage').val();
    io.socket.get('/users/chat_send_all_message?from_user_id='+fromUserId+'&message='+message, {}, function (data) {});
    alert('Message Sent.');
    $('#txtAllMessage').val("");
  }

}

function usersSubscribe(){
  if ($('#currentUserId').val() != '' && typeof $('#currentUserId').val() != 'undefined'){
    io.socket.get('/users/subscribe', {}, function (users) {});

    io.socket.on('users', function (event) {
      // console.log('Socket mesage received :: ', event);
      if (event.verb == "created") {
        $("#tableUsers").append("<tr><td><img id=\"imgUserLogged"+event.id+"\" src=\"/images/ok.png\" /></td><td>"+event.data.name+"</td><td>"+event.data.email+"</td><td><div id=\"tdUserLogged"+event.id+"\"><div class=\"col-xs-8\"><input type=\"text\" id=\"txtMessage"+event.id+"\" class=\"form-control\" placeholder=\"Enter Message\"></div><button id=\"btnMessage\" class=\"btnMessage btn btn-danger\" onClick=\"chatSendMessage('"+event.id+"')\" >Send Message</button></div></td></tr>");
      } else if (event.verb == "updated") {
        if(event.data.isLoggedIn == true) {
          $("#imgUserLogged"+event.id).attr("src", "/images/ok.png");
          $("#tdUserLogged"+event.id).html("<div class=\"col-xs-8\"><input type=\"text\" id=\"txtMessage"+event.id+"\" class=\"form-control\" placeholder=\"Enter Message\"></div><button id=\"btnMessage\" class=\"btnMessage btn btn-danger\" onClick=\"chatSendMessage('"+event.id+"')\" >Send Message</button>");
        }else if(event.data.isLoggedIn == false) {
          $("#imgUserLogged"+event.id).attr("src", "/images/error.png");
          $("#tdUserLogged"+event.id).html('');
        }
      }
    });
  }
}
