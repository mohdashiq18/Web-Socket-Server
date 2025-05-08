const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const HEARTBEAT_INTERVAL = 3000; 

wss.on('connection', (ws) => {
  console.log('Client connected');

  const heartbeatInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, HEARTBEAT_INTERVAL);


  ws.on('message', (message) => {
    console.log('Received:', message);
  });


  ws.on('close', () => {
    clearInterval(heartbeatInterval); 
    console.log('Client disconnected');
  });

  
  ws.send(JSON.stringify({ message: 'Connected to the WebSocket server' }));
});

server.listen(8080, () => {
  console.log('Server is listening on port 8080');
});
