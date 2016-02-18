
	var getNode = function(s) {
		return document.querySelector(s);
	};
    
    //returns current time
	var current_time = function() {
		var d = new Date(Date.now());
		var datestring = d.toLocaleDateString();
		var timestring = d.toLocaleTimeString();
		return datestring.concat(" ", timestring);
	};

	//try {
	var socket = io.connect("http://127.0.0.1:3000");
	//} catch(e) {
	//	console.log("Can't connect...");
	//}
    socket.on("newuser", function(data) {
    	getNode(".login-div").style.display = "none";
       	getNode(".chat-div").style.display = "none";
       //	getNode(".signup-div").style.display = "none";
    });
   


   
	socket.on("login-result", function(data) {
		//console.log(data);
		if(data.pass) {
       		getNode(".login-div").style.display = "none";
       		getNode(".chat-div").style.display = "block";
       		//getNode(".signup-div").style.display = "block";

       		

    		console.log("Name = " + data.name);
   	  		execute_chatroom(data.name);
		} else {
			location.reload();
		//	getNode(".login-status").textContent = data.message;
		}
	});



    // Listen for keydown
    var user_name = getNode(".user-name");
    var user_password = getNode(".user-password");

    var new_user_name = getNode(".new-user-name");
    var new_user_password = getNode(".new-user-password"); 

    var signup = getNode(".signup-div");
    var login = getNode(".login_button");


    var logout = getNode(".logout_button");
    /*
    signup.addEventListener("click",function(event){
    	var new_name = new_user_name.value;
    	var new_password = new_user_password.value;
    	socket.emit("initialize-login",  {name:new_name, password:new_password});
    });
     */
     
    logout.addEventListener("click",function(event){
    	location.reload();
    });

   /*
    user_name.addEventListener("keydown", function(event) {
    	if(event.which == 13 && socket != undefined) { // 13 = Enter
			socket.emit("initialize-login", user_name.value);
    	}
    });*/

    login.addEventListener("click",function(event){
    	var name = user_name.value;
    	var password = user_password.value;
    	socket.emit("initialize-login",  {name:name, password:password});
    });

    var execute_chatroom = function(name) {
		// Get required nodes
		status = getNode(".chat-status span");
		messages = getNode(".chat-messages");
		textarea = getNode('.chat-textarea');
		statusDefault = status.textContent;

		setStatus = function(s) {
			status.textContent = s;
			if (s !== statusDefault) {
				var delay = setTimeout(function() {
					setStatus(statusDefault);
					clearInterval(delay);
				}, 3000); // After 3 seconds, revert back to 'Idle'
			}
		};

		if(socket !== undefined) {
			socket.on("user_connected", function(data) {
				var connected_message = document.createElement('div');
				connected_message.setAttribute('class', 'chat-announcement');
				connected_message.textContent = data + " has connected.";
				var connected_timestamp = document.createElement('div');
				connected_timestamp.setAttribute('class', 'chat-announce-timestamp');
				connected_timestamp.textContent = current_time();
				messages.appendChild(connected_message);
				messages.appendChild(connected_timestamp);
				messages.scrollTop = messages.scrollHeight;
			});

			socket.on("user_disconnected", function(data) {
				var connected_message = document.createElement('div');
				connected_message.setAttribute('class', 'chat-announcement');
				connected_message.textContent = data + " has left.";
				var connected_timestamp = document.createElement('div');
				connected_timestamp.setAttribute('class', 'chat-announce-timestamp');
				connected_timestamp.textContent = current_time();
				messages.appendChild(connected_message);
				messages.appendChild(connected_timestamp);
				messages.scrollTop = messages.scrollHeight;
			});

			// Listen for output (either from initial connection or later message)
			// data should be an array of messages
			socket.on("output", function(data) {
				console.log(data);
				if(data.length) {
					// Loop through results if data is not empty
					for(var x = data.length-1; x > -1; x = x - 1) {
						var message_name = document.createElement('div');
						message_name.setAttribute('class', 'chat-message-name');
						message_name.textContent = data[x].name;
						var message_timestamp = document.createElement('div');
						message_timestamp.setAttribute('class', 'chat-message-timestamp');
						message_timestamp.textContent = data[x].timestamp;
						var message = document.createElement('div');
						message.setAttribute('class', 'chat-message');
						message.textContent = data[x].message;
						messages.appendChild(message_name);
						messages.appendChild(message_timestamp);
						messages.appendChild(message);
						messages.scrollTop = messages.scrollHeight;
					}
				}
			});
            
            
			// Listen for a status
			socket.on("status", function(data) {
				setStatus((typeof data === "object") ? data.message : data);
				// If successful (noted by 'clear' flag), clear the textarea
				if (data.clear === true) {
					textarea.value = "";
				}
			});
             

			// Listen for keydown
			textarea.addEventListener("keydown", function(event) {
				var self = this;

				 //13 is the ASCII value for <enter>
				if(event.which === 13 && event.shiftKey === false) {
					socket.emit("input", {
						name: name,
						message: self.value,
						timestamp: current_time()
					});
					event.preventDefault(); // prevents default behavior from executing
				}
			});

			console.log("Ok!");
			socket.emit("initialize-chatroom", name);
			chat_name = getNode(".chat-name span");
			chat_name.textContent = name;
		}
    }
