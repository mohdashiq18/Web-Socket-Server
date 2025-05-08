const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

const PORT = process.env.PORT || 8080;

// Create HTTP server for Render health check
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('WebSocket server is up and running');
});

// Initialize WebSocket server
const wss = new WebSocket.Server({ server });

// Heartbeat logic to detect dead connections
function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log(`Client connected: ${clientIP}`);
  ws.isAlive = true;

  ws.on('pong', heartbeat);

  ws.on('message', (message) => {
    console.log('Received:', message.toString());
  });

  ws.on('close', (code, reason) => {
    console.log(`Client disconnected. Code: ${code}, Reason: ${reason}`);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
  });

  ws.on('ping', () => {
    console.log('Received ping from client');
    ws.pong(); 
  });

  try {
    ws.send(JSON.stringify({ message: 'Connected to the WebSocket server' }));
  } catch (error) {
    console.error('Failed to send connection message:', error);
    ws.terminate();
  }
});


const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
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
  console.error('WebSocket server error:', error.message);
});

server.listen(PORT, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
});
