import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';
import { handleAdvisorAILogic } from './services/advisorAiService.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import tradingRoutes from './routes/tradingRoutes.js';
import scamRoutes from './routes/scamRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import expertRoutes from './routes/expertRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import predictionRoutes from './ai/prediction.routes.js';
import advisorRoutes from './routes/advisorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import cryptoRoutes from './routes/cryptoRoutes.js';

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
app.use(cors({ origin: true, credentials: true })); // Allow all origins dynamically with credentials
app.use(express.json());
app.use(cookieParser());

// Main API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/scam', scamRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/advisors', advisorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/crypto', cryptoRoutes);

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
  socket.on('send_message', async (data) => {
    // Expected data format: { room: '...', senderId: '...', senderModel: '...', username: '...', message: '...', timestamp: ... }
    
    // Broadcast message to everyone in the room except the sender
    socket.to(data.room).emit('receive_message', data);
    
    // Save message to MongoDB for persistence
    try {
      if (data.senderId && data.message) {
        const Message = (await import('./models/messageModel.js')).default;
        await Message.create({
          senderId: data.senderId,
          senderModel: data.senderModel || 'User',
          username: data.username,
          message: data.message,
          room: data.room || 'general',
          timestamp: data.timestamp || Date.now()
        });
        
        // Trigger AI Advisor logic asynchronously (fire and forget)
        handleAdvisorAILogic(io, data);
      }
    } catch (err) {
      console.error('Failed to save chat message:', err);
    }
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
