import { createServer } from "node:http";

const port = Number(process.env.PORT || 4000);

const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "http-server" }));
    return;
  }

  if (req.url === "/api/hello") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ message: "Hello from the HTTP server" }));
    return;
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: "Route not found" }));
});

server.listen(port, () => {
  console.log(`HTTP server running on http://localhost:${port}`);
});
