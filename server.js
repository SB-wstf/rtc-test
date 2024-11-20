const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Enable CORS for all requests (for development purposes)
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// WebSocket Connection
io.on('connection', (socket) => {
    console.log('A user connected');

    // WebRTC signaling
    socket.on('signal', (data) => {
        console.log('Signaling data received:', data);
        socket.broadcast.emit('signal', data); // Send signal to all other clients
    });

    // Chat message
    socket.on('chatMessage', ({ chatId, message }) => {
        console.log('Chat message received:', { chatId, message });
        socket.broadcast.emit('chatMessage', { chatId, message }); // Broadcast chatId with message to others
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server on port 3000 (or environment variable PORT)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
