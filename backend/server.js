require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { connectNeo4j } = require('./config/neo4j');
const { connectPinecone } = require('./config/pinecone');
const { connectRedis } = require('./config/redis');
const { setupSockets } = require('./sockets');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const tripRoutes = require('./routes/trips');
const chatRoutes = require('./routes/chat');
const locationRoutes = require('./routes/locations');
const groupRoutes = require('./routes/groups');
const externalRoutes = require('./routes/external');
const adminRoutes = require('./routes/admin');
const communityRoutes = require('./routes/community');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
    res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/community', communityRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Socket.io
setupSockets(server);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    // Connect to MongoDB (required)
    await connectDB();

    // Connect to optional services (graceful degradation)
    await connectNeo4j();
    await connectPinecone();
    await connectRedis();

    server.listen(PORT, () => {
        console.log(`\n🚀 Server running on port ${PORT}`);
        console.log(`📡 API: http://localhost:${PORT}/api`);
        console.log(`🔌 Socket.io: http://localhost:${PORT}\n`);
    });
};

startServer();
