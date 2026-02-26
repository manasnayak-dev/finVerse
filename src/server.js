import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import tradingRoutes from './routes/tradingRoutes.js';
import scamRoutes from './routes/scamRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import expertRoutes from './routes/expertRoutes.js';
import newsRoutes from './routes/newsRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Create HTTP server for returning both Express & Socket.io traffic
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Adjust appropriately for production security
    methods: ['GET', 'POST'],
  },
});

// Make socket.io accessible to our routers/controllers
app.set('io', io);

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true })); // Needs credentials: true for cookies across origins if you run a frontend
app.use(express.json());
app.use(cookieParser());

// Main API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/scam', scamRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/news', newsRoutes);

// Basic connection test
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Attach Socket.io Logic
io.on('connection', (socket) => {
  console.log(`Socket Connected: ${socket.id}`);

  // When a user joins a specific community room
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  // When a user sends a message
  socket.on('send_message', (data) => {
    // Expected data format: { room: 'general', username: 'jay', message: 'hello', timestamp: ... }
    
    // Broadcast message to everyone in the room except the sender
    socket.to(data.room).emit('receive_message', data);
    
    // NOTE: For persistence, you'd save this message to MongoDB (Message model) here
  });

  socket.on('disconnect', () => {
    console.log(`Socket Disconnected: ${socket.id}`);
  });
});

// Centralized Error Handling Middlewares (Must be after routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
