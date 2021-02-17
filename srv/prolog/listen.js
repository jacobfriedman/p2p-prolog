const dgram = require('dgram');
const server = dgram.createSocket({type:'udp4', reuseAddr: true});

// How come this doesnt work on instantiation BEFORE prolog?
// May have to use tcp_setopt(S, reuseaddr)

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

var connected = false;

server.on('message', (msg, rinfo) => {
 if(!connected) {
	server.connect(rinfo.port, rinfo.address, (err) => {
		server.send(msg, (err) => {});
		connected = true
	});
  } else {
		server.send(msg, (err) => {});	
  }
  
});

server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(20005);