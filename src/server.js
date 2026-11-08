import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import express from "express";
import { getLanAddresses } from "./network.js";
import { attachSignaling } from "./signaling.js";

const PORT = 3000;
const publicDirectory = fileURLToPath(new URL("../public/", import.meta.url));

export function startServer() {
  const app = express();
  app.use(express.static(publicDirectory));

  const server = createServer(app);
  attachSignaling(server);

  server.listen(PORT, "0.0.0.0", () => {
    const lanAddresses = getLanAddresses();

    console.log("");
    console.log("=================================");
    console.log("       LAN SCREEN SERVER");
    console.log("=================================");
    console.log(`host sharing (on this computer): http://localhost:${PORT}/?role=host`);

    if (lanAddresses.length > 0) {
      console.log("Open one of these on the client (same Wi-Fi/network):");
      lanAddresses.forEach((address) => {
        console.log(`  http://${address}:${PORT}/?role=client`);
      });
    } else {
      console.log(
        "No LAN IPv4 address found. Check that the host is connected to Wi-Fi or Ethernet.",
      );
    }

    console.log("=================================");
    console.log("");
  });
}
