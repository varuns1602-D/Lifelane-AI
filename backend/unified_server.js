import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// In-memory storage for the prototype
const emergencies = [];

app.use(cors());
app.use(express.json());

/**
 * GET /
 * Verification route
 */
app.get('/', (req, res) => {
  res.send('LifeLane Backend Running');
});

/**
 * GET /api/emergency
 * Returns all active emergencies
 */
app.get('/api/emergency', (req, res) => {
  res.json(emergencies);
});

/**
 * POST /api/emergency
 * Trigger a new emergency from the mobile app
 */
app.post('/api/emergency', (req, res) => {
  const { userId, name, location, status } = req.body;

  const newEmergency = {
    id: `EMG-${Date.now()}`,
    userId: userId || 'anonymous',
    name: name || 'Unknown Patient',
    location: location || { lat: 12.9716, lng: 77.5946 },
    status: status || 'EMERGENCY',
    timestamp: new Date().toISOString()
  };

  emergencies.push(newEmergency);
  
  console.log(`\n🚨 EMERGENCY ALERT RECEIVED`);
  console.log(`👤 User: ${newEmergency.name} (${newEmergency.userId})`);
  console.log(`📍 Location: ${newEmergency.location.lat}, ${newEmergency.location.lng}`);

  // Emit event to dashboard via Socket.IO
  io.emit('new_emergency', newEmergency);

  res.status(201).json({
    message: 'Emergency stored and broadcasted',
    emergency: newEmergency
  });
});

/**
 * (Legacy/Bridge Support) POST /api/location
 * Basic location tracking for ambulance markers
 */
app.post('/api/location', (req, res) => {
  const { ambulance_id, lat, lng, speed } = req.body;
  
  // Future: Store in-memory location state if needed
  // For now, just broadcast to dashboard
  io.emit('location_update', { ambulance_id, lat, lng, speed });
  
  res.json({ success: true });
});

io.on('connection', (socket) => {
  console.log(`\n💻 Dashboard connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`❌ Dashboard disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`\n🚀 LifeLane Unified Backend running at http://localhost:${PORT}`);
  console.log(`🌐 Dashboard CORS enabled for ports 5173 and 5174`);
  console.log(`📡 Socket.IO server active\n`);
  
  console.log(`Example Fetch for Dashboard:`);
  console.log(`fetch("http://localhost:5000/api/emergency")\n`);
});
