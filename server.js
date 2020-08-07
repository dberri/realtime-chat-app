const fs = require('fs');
const http = require('http');
const SocketIO = require('socket.io');

// Prepares HTML file to be served
const content = fs.readFileSync(__dirname + '/index.html', 'utf8');
const httpServer = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Length', Buffer.byteLength(content));
  res.end(content);
})

const animals = [
  'fish',
  'cat',
  'tiger',
  'bear',
  'bull',
  'fox'
]

const colors = [
  'red',
  'green',
  'blue',
  'yellow',
  'purple',
  'pink'
]

/**
 * Generates a random name based on an animal and a color
 * 
 * @return {String}
 */
function randomName() {
  const color = colors[Math.floor(Math.random() * colors.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]

  return `${color}-${animal}`;
}

// Creates socket.io connection
const io = SocketIO(httpServer);

// Stores the names and ids of connected clients
const sockets = {}

// Handles "connect" event
io.on('connect', socket => {
  sockets[socket.id] = randomName();
  socket.emit('name-generated', sockets[socket.id]);
  io.emit('update-peers', Object.values(sockets));

  // Handles "message" event sent by client
  socket.on('message', data => {

    // Emits new message to every connected client
    io.emit('newMessage', {
      sender: sockets[socket.id],
      message: data
    })
  });

  // Handles "disconnect" event
  socket.on('disconnect', () => {
    delete sockets[socket.id]
    io.emit('update-peers', Object.values(sockets))
  })
})

// Starts up server
httpServer.listen(3000, () => {
  console.log("🔥 Listening on http://localhost:3000");
})