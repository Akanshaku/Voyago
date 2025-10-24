// sockets/sockets.js 
const jwt = require("jsonwebtoken"); 
const adminSockets = new Map(); // adminId -> Set of socketIds 
 
/** 
 * Middleware to authenticate socket connections 
 */ 
function authenticateSocket(socket, next) { 
  try { 
    const token = socket.handshake.auth?.token; 
    if (!token) { 
      return next(new Error("Authentication token missing")); 
    } 
 
    // Verify JWT (use same secret as your Express app) 
    const payload = jwt.verify(token, process.env.JWT_SECRET || "mysupersecretcode"); 
 
    // Attach user info to socket 
    socket.data.userId = payload.id; 
    socket.data.role = payload.role; 
 
    return next(); 
  } catch (err) { 
    console.error("Socket authentication failed:", err.message); 
    return next(new Error("Unauthorized socket connection")); 
  } 
} 
 
/** 
 * Socket.IO setup 
 */ 
function setupSocketIO(io) { 
  io.use(authenticateSocket); // apply auth middleware to all sockets 
 
  io.on("connection", (socket) => { 
    console.log(` Socket connected: ${socket.id} [Role: ${socket.data.role}]`); 
 
    // --- ADMIN REGISTRATION --- 
    if (socket.data.role === "admin") { 
      const adminId = socket.data.userId; 
      if (!adminSockets.has(adminId)) { 
        adminSockets.set(adminId, new Set()); 
      } 
      adminSockets.get(adminId).add(socket.id); 
 
      console.log(` Admin registered: ${adminId} -> ${socket.id}`); 
    } 
 
    // --- GENERIC EVENTS --- 
    socket.on("pingServer", () => { 
      socket.emit("pongServer", { message: "Server is alive" }); 
    }); 
 
    // Example: Notify admin when a new booking is created 
    socket.on("newBooking", (bookingData) => { 
      if (!bookingData.adminId) return; 
      const sockets = adminSockets.get(bookingData.adminId); 
      if (sockets) { 
        sockets.forEach((sid) => { 
          io.to(sid).emit("bookingNotification", { 
            msg: "New booking received!", 
            booking: bookingData, 
          }); 
        }); 
      } 
    }); 
 
    // --- DISCONNECT --- 
    socket.on("disconnect", () => { 
      if (socket.data.role === "admin") { 
        const adminId = socket.data.userId; 
        const s = adminSockets.get(adminId); 
        if (s) { 
          s.delete(socket.id); 
          if (s.size === 0) adminSockets.delete(adminId); 
        } 
        console.log(` Admin disconnected: ${adminId} <- ${socket.id}`); 
      } else { 
        console.log(` Socket disconnected: ${socket.id}`); 
      } 
    }); 
 
    // --- ERROR HANDLER --- 
    socket.on("error", (err) => { 
      console.error(` Socket error [${socket.id}]:`, err.message); 
    }); 
  }); 
} 
 
module.exports = { setupSocketIO, adminSockets }; 