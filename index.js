var express = require("express");
var app = express();
var server = app.listen(3000);
var client = require("socket.io").listen(server).sockets;

var router = express.Router();

var fs = require("fs");
var sqlite3 = require("sqlite3").verbose();
//var file = "messages.db";
var db_msg = new sqlite3.Database("messages.db");
//var db_user = new sqlite3.Database("user.db");

//var users = []; //store socket.id in users, dont know why 
var whitespacePattern = /^\s*$/;
var validPattern = /[^a-zA-Z0-9_-]/;

client.on("connection", function(socket) {
    
    //create UserData table to store username and password
    db_msg.serialize(function() {
			db_msg.run("CREATE TABLE IF NOT EXISTS UserData (" + 
				"Password TEXT NOT NULL, " + 
				"User TEXT NOT NULL)" );
	});

	socket.on("initialize-login", function(data) {
		/*if (whitespacePattern.test(data)){
			var message = "Username musn't be empty.";
			socket.emit("login-result", {pass:false, message:message});
		} else if (data.length > 15) {
			var message = "Username must be 15 characters or less";
			socket.emit("login-result", {pass:false, message:message});
		} else if (validPattern.test(data)) {
			var message = "Name must contain only letters, numbers, '-' or '_'.";
			socket.emit("login-result", {pass:false, message:message});
		} else if (users[data] !== undefined) {
			var message = "That username is already in use.";
			socket.emit("login-result", {pass:false, message:message});
		} else {*/
			//console.log("No user name collision found.");
			//users[data] = socket.id;
            /*
			if (){
			
		    } else{

		    }*/
		    
		    var name = data.name;
		    var password = data.password;
/*
            db.all("SELECT * from UserData where User ="+ name,
            	function(err,rows){



            });

*/

             
            var stmt = "SELECT User FROM UserData WHERE User=?";
            db_msg.all(stmt, name, function(err, rows) {

                if (err) throw err;
                if (rows.length == 0) {
                	socket.emit("login-result", {pass:true, name:data.name});
                	//socket.emit("login-result", {pass:true, name:data.name});
                	//location.path('/signup');
                	
                	db_msg.serialize(function() {
			           db_msg.run("INSERT INTO UserData VALUES(?, ?)", 
			           password, name);
		            });
                }
                else {
                	
                	//socket.emit("login-result", {pass:true, name:data.name});
                	db_msg.all("SELECT User, Password FROM UserData WHERE User=? and Password=?", 
                		name, password, function(err, rows) {
                		if (rows.length == 0) {
                			socket.emit("login-result", {pass:false, name:data.name});
                		} else {
                			socket.emit("login-result", {pass:true, name:data.name});
                		}
                	});
                }
               // db_msg.close();
            });

            //verify if new then 



			//socket.emit("login-result", {pass:true, name:data.name});
			console.log(data.password);
		//}
	});
     
	socket.on("initialize-chatroom", function(data) {
		var name = data;
		//console.log(name + " has connected " );//+ socket.id);

		//var exists = fs.existsSync("messages.db");
		if(fs.existsSync("messages.db") == false) {
			console.log("Creating DB file.");
			fs.openSync("messages.db","w");
		}
        
		// Send current status to user
		var sendStatus = function(status) {
			socket.emit("status", status);
		};
        
   
		db_msg.serialize(function() {
			db_msg.run("CREATE TABLE IF NOT EXISTS Messages (" + 
				"Timestamp TEXT NOT NULL, " + 
				"User TEXT NOT NULL, " + 
				"Message TEXT NOT NULL)");
		});

        /*
		db_user.serialize(function() {
			db_user.run("CREATE TABLE IF NOT EXISTS Messages (" + 
				"Password TEXT NOT NULL, " + 
				"User TEXT NOT NULL)" );
		});*/

		// Emit all messages in database (or just top 100 anyway) as an array
		// Do only if database is not empty
		var select_query = "SELECT * FROM Messages ORDER BY ROWID DESC LIMIT 100"
		
		var db_messages = []
		var db_users = []

		db_msg.each(select_query, function(err, row) {
			if (row !== undefined) {
				db_message = {
					name: row.User,
					timestamp: row.Timestamp,
					message: row.Message
				};

                /*
				db_user = {
					name: row.User,
					password: row.Password
				};
				*/

				db_messages[db_messages.length] = db_message;
			}
		},function(err, rows) { // "rows" = number of rows retrieved
			if (rows > 0) {
				socket.emit("output", db_messages);
			}
			client.emit("user_connected", name);
		});

		// Wait for input
		socket.on("input", function(data) {

			console.log(data);
			var message = data.message;
			var timestamp = data.timestamp;
			if (whitespacePattern.test(message)) {
				sendStatus("Message musn't be empty.");
			} else {
				client.emit("output", [data]); // Emit latest message to ALL clients
				sendStatus({
					message: "Message sent",
					clear: true
				});
				db_msg.serialize(function() {
					db_msg.run("INSERT INTO Messages VALUES(?, ?, ?)", 
						timestamp, name, message);
				});
			}
		});

		// Detect disconnect (special function that gets called automatically)
		socket.on("disconnect", function(){
			//users[name] = undefined;
			client.emit("user_disconnected", name);
			console.log(name + " disconnected");
		});

	});


});

app.get("/", function(req, res) {
	res.sendFile(__dirname + "/public/index.html");
});
/*
app.get('/signup', function(req, res){
  res.sendfile(__dirname + '/signup/signup.html');
});
/*
app.get("/index.htm", function(req, res) {
	res.sendFile(__dirname + "/public/index.html");
});
*/
app.use(express.static("public"));