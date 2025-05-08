const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', (ws, req) => {
  console.log('Client connected:', req.socket.remoteAddress);
  ws.isAlive = true;

  ws.on('message', (message) => {
    console.log('Received from client:', message.toString());
  });

  ws.on('close', (code, reason) => {
    console.log(`Client disconnected. Code: ${code}, Reason: ${reason}`);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  ws.on('ping', () => {
    console.log('Received ping from client');
  });

  ws.on('pong', () => {
    console.log('Received pong from client');
    heartbeat.call(ws);
  });

  try {
    ws.send(JSON.stringify({ message: 'Connected to the WebSocket server' }));
  } catch (error) {
    console.error('⚠️ Failed to send connection message:', error);
    ws.terminate();
  }
});


const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      console.log('Terminating inactive client');
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(interval);
});

wss.on('error', (error) => {
  console.error('WebSocket server error:', error);
});

server.listen(8080, () => {
  console.log('WebSocket server is running on port 8080');
});