const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8083/ws');

ws.on('open', function open() {
  ws.send('something');
});

ws.on('message', function incoming(data) {
  console.log(data);
});