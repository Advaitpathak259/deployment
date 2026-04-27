import { WebSocketServer } from "ws";
import { prisma } from "@repo/db";

const port = Number(process.env.PORT || 4001);

const server = new WebSocketServer({
  port,
});

server.on("connection", async (socket) => {
  try {
    const user = await prisma.user.create({
      data: {
        username: `ws-user-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        password: Math.random().toString(36),
      },
      select: {
        id: true,
        username: true,
      },
    });

    socket.send(`Hi there from ws. Created user ${user.username}`);
  } catch (error) {
    console.error(error);
    socket.send("Hi there from ws, but database create failed");
  }
});

server.on("listening", () => {
  console.log(`WebSocket server running on ws://localhost:${port}`);
});
