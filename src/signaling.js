import { WebSocketServer } from "ws";

export function attachSignaling(server) {
  const wss = new WebSocketServer({ server });

  let host = null;
  let client = null;

  wss.on("connection", (socket) => {
    console.log("New WebSocket connection");

    socket.on("message", (message) => {
      let data;

      try {
        data = JSON.parse(message.toString());
      } catch {
        console.warn("Ignoring invalid WebSocket message");
        return;
      }

      if (data.type === "host") {
        host = socket;
        console.log("host connected");
        socket.send(JSON.stringify({ type: "registered", role: "host" }));

        return;
      }

      if (data.type === "client") {
        client = socket;
        console.log("client connected");
        socket.send(JSON.stringify({ type: "registered", role: "client" }));

        if (host?.readyState === 1) {
          host.send(JSON.stringify({ type: "client-ready" }));
        }

        return;
      }

      if (data.type === "offer" && client?.readyState === 1) {
        client.send(JSON.stringify(data));
        return;
      }

      if (data.type === "answer" && host?.readyState === 1) {
        host.send(JSON.stringify(data));
        return;
      }

      if (data.type === "ice") {
        const target = data.target === "client" ? client : data.target === "host" ? host : null;

        if (target?.readyState === 1) {
          target.send(JSON.stringify(data));
        }
      }
    });

    socket.on("close", () => {
      if (socket === host) {
        host = null;
        console.log("host disconnected");
      }

      if (socket === client) {
        client = null;
        console.log("client disconnected");
      }
    });
  });
}
