import { createHash } from "node:crypto";
import { createServer } from "node:http";

const port = Number(process.env.PORT || 4001);
const websocketGuid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

function createAcceptKey(key) {
  return createHash("sha1")
    .update(key + websocketGuid)
    .digest("base64");
}

function readMessage(buffer) {
  const length = buffer[1] & 0x7f;
  const maskStart = 2;
  const dataStart = maskStart + 4;
  const mask = buffer.subarray(maskStart, dataStart);
  const data = buffer.subarray(dataStart, dataStart + length);

  return Buffer.from(data.map((byte, index) => byte ^ mask[index % 4])).toString(
    "utf8",
  );
}

function createTextFrame(message) {
  const payload = Buffer.from(message);
  return Buffer.concat([Buffer.from([0x81, payload.length]), payload]);
}

const server = createServer((req, res) => {
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({ ok: true, service: "websocket-server" }));
});

server.on("upgrade", (req, socket) => {
  const key = req.headers["sec-websocket-key"];

  if (!key) {
    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
    return;
  }

  socket.write(
    [
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${createAcceptKey(key)}`,
      "",
      "",
    ].join("\r\n"),
  );

  socket.write(createTextFrame("Connected to the WebSocket server"));

  socket.on("data", (buffer) => {
    const message = readMessage(buffer);
    socket.write(createTextFrame(`Echo: ${message}`));
  });
});

server.listen(port, () => {
  console.log(`WebSocket server running on ws://localhost:${port}`);
});
