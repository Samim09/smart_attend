// server.js
const os = require("os");
const express = require("express");
const http = require("http");;
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const WebSocket = require("ws");
const connectDB = require("./db"); // your MongoDB connection
const app = express();

// Load SSL certificates (generate with openssl if not available)
const options = {
  key: fs.readFileSync(path.join(__dirname, "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "cert.pem")),
};
app.use(cors({
  origin: '*', // allow all origins (use specific origin in production)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
// Create HTTPS server
const server = http.createServer(app);

// WebSocket server for location tracking
const wss = new WebSocket.Server({ server, path: "/ws/location/" });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
// Connect to database
connectDB();
// API Routes
app.use("/api/admin", require("./routes/admin"));
app.use("/api/admin/teachers", require("./routes/teacher"));
app.use("/api/admin/students", require("./routes/student"));

// Root route
app.get("/", (req, res) => {
  res.redirect("/login.html");
});

// WebSocket connections
wss.on("connection", (ws, req) => {
  console.log("Client connected");

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      // If it's a location message from a device
      if (data?.type === "location" && data.role === "device" && data.payload) {
        const outgoing = JSON.stringify({
          type: "location",
          from: data.from || data.payload.id || "unknown",
          payload: data.payload,
          ts: Date.now(),
        });

        // Broadcast location to all clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) client.send(outgoing);
        });
      } else {
        // Broadcast other messages to all clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) client.send(msg);
        });
      }
    } catch (e) {
      console.warn("Invalid message:", e);
    }
  });

  ws.on("close", () => console.log("Client disconnected"));
});

// Helper: get local IP
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
