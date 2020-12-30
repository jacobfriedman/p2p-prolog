const dgram = require('dgram');
const server = dgram.createSocket({type:'udp4', reuseAddr: true});

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

var connected = false;

server.on('message', (msg, rinfo) => {
  console.log(`\n${msg}\n${rinfo.address}:${rinfo.port}`);

 if(!connected) {
	
	server.connect(rinfo.port, rinfo.address, (err) => {

		console.log(msg.includes('self'),'INCLUDESSELF')

		server.send(msg, (err) => {
			
		});

		

		
		connected = true

	});



  } else {
		server.send(msg, (err) => {
			// server.close();
		});
		
  }
  
  
  



});

server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(20005);
// Prints: server listening 0.0.0.0:41234