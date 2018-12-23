socket = function(io){
	io.on('connection', function(socket){
		socket.emit('request', "Welcome"); // emit an event to the socket
		io.emit('broadcast', "hello"); // emit an event to all connected sockets
		socket.on('reply', function(){ /* */ }); // listen to the event
	});
}
module.exports=socket;