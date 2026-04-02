const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Group = require('../models/Group');

/**
 * Socket.io setup — real-time location tracking, group chat, notifications
 * Auth is optional: anonymous users get limited features
 */
const setupSockets = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    // Auth middleware — attach user if token present
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.user = await User.findById(decoded.id).select('-password');
            }
        } catch (_) {
            // Continue without auth — anonymous connection allowed
        }
        next();
    });

    io.on('connection', (socket) => {
        const userId = socket.user?._id?.toString();
        console.log(`🔌 Socket connected: ${userId || 'anonymous'} (${socket.id})`);

        // Join user's personal room for targeted notifications
        if (userId) {
            socket.join(`user:${userId}`);
        }

        // ─── Location Tracking ───
        socket.on('location:update', (data) => {
            if (!userId) return;
            const { lat, lng, tripId } = data;
            // Broadcast to group members on the same trip
            if (tripId) {
                socket.to(`trip:${tripId}`).emit('location:updated', {
                    userId,
                    name: socket.user.name,
                    lat,
                    lng,
                    timestamp: new Date(),
                });
            }
        });

        // ─── Group Chat ───
        socket.on('group:join', async (groupId) => {
            if (!userId) return socket.emit('error', { message: 'Login required to join groups' });
            try {
                const group = await Group.findById(groupId);
                if (!group) return socket.emit('error', { message: 'Group not found' });

                const isMember = group.members.some(
                    (m) => m.user.toString() === userId && m.status === 'accepted'
                );
                if (!isMember && group.creator.toString() !== userId) {
                    return socket.emit('error', { message: 'Not a member of this group' });
                }

                socket.join(`group:${groupId}`);
                socket.to(`group:${groupId}`).emit('group:userJoined', {
                    userId,
                    name: socket.user.name,
                });
            } catch (err) {
                socket.emit('error', { message: 'Failed to join group room' });
            }
        });

        socket.on('group:leave', (groupId) => {
            socket.leave(`group:${groupId}`);
            socket.to(`group:${groupId}`).emit('group:userLeft', {
                userId,
                name: socket.user?.name,
            });
        });

        socket.on('message:send', (data) => {
            if (!userId) return socket.emit('error', { message: 'Login required to send messages' });
            const { groupId, message } = data;
            io.to(`group:${groupId}`).emit('message:received', {
                userId,
                name: socket.user.name,
                message,
                timestamp: new Date(),
            });
        });

        // ─── Trip Room (for live collaboration) ───
        socket.on('trip:join', (tripId) => {
            socket.join(`trip:${tripId}`);
        });

        socket.on('trip:leave', (tripId) => {
            socket.leave(`trip:${tripId}`);
        });

        // ─── Disconnect ───
        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${userId || 'anonymous'} (${socket.id})`);
        });
    });

    // Expose io instance for use in controllers (e.g., notifications)
    return io;
};

module.exports = { setupSockets };
