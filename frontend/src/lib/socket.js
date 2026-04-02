import { io } from "socket.io-client";

let socket = null;

/**
 * Connect to Socket.io server with auth token
 */
export function connectSocket(token) {
    if (socket?.connected) return socket;

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
        console.log("🔌 Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
        console.log("🔌 Socket disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
        console.warn("🔌 Socket error:", err.message);
    });

    return socket;
}

/**
 * Get current socket instance
 */
export function getSocket() {
    return socket;
}

/**
 * Disconnect and cleanup
 */
export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

/**
 * Join a group room for real-time chat
 */
export function joinGroup(groupId) {
    if (socket?.connected) socket.emit("group:join", groupId);
}

/**
 * Leave a group room
 */
export function leaveGroup(groupId) {
    if (socket?.connected) socket.emit("group:leave", groupId);
}

/**
 * Send a message to a group
 */
export function sendGroupMessage(groupId, message) {
    if (socket?.connected) socket.emit("message:send", { groupId, message });
}

/**
 * Send location update for trip tracking
 */
export function updateLocation(tripId, lat, lng) {
    if (socket?.connected) socket.emit("location:update", { tripId, lat, lng });
}

/**
 * Join a trip room for live collaboration
 */
export function joinTrip(tripId) {
    if (socket?.connected) socket.emit("trip:join", tripId);
}

/**
 * Leave a trip room
 */
export function leaveTrip(tripId) {
    if (socket?.connected) socket.emit("trip:leave", tripId);
}
