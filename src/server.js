import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(express.json());

const rooms = new Map();

app.post("/api/rooms", (req, res) => {
  const { videoUrl } = req.body;
  if (!videoUrl) return res.status(400).json({ error: "videoUrl required" });

  const roomId = uuidv4();
  rooms.set(roomId, {
    id: roomId,
    videoUrl,
    createdAt: new Date(),
    host: null,
    viewers: new Set()
  });

  console.log(`🎬 Created room: ${roomId} (${videoUrl})`);
  res.json({ roomId, videoUrl });
});

app.get("/api/rooms/:roomId", (req, res) => {
  const room = rooms.get(req.params.roomId);
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json({ id: room.id, videoUrl: room.videoUrl });
});

io.on("connection", socket => {
  console.log(`🟢 Client connected: ${socket.id}`);

  socket.on("joinRoom", ({ roomId, userId }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit("error", "Room not found");
      return;
    }

    socket.join(roomId);
    room.viewers.add(userId);
    console.log(`👥 User ${userId} joined ${roomId}`);

    socket.to(roomId).emit("userJoined", { userId });
  });

  socket.on("videoEvent", ({ roomId, type, currentTime }) => {
    socket.to(roomId).emit("videoEvent", { type, currentTime });
  });

  socket.on("disconnect", () => {
    console.log(`🔴 Client disconnected: ${socket.id}`);
  });
});

server.listen(4000, () => {
  console.log("✅ WatchParty Room server running on http://localhost:4000");
});
