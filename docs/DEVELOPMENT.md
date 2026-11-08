# Development

## Structure

```text
server.js          Small application entry point
src/
  server.js        HTTP server and static files
  network.js       LAN IPv4 address lookup
  signaling.js     WebSocket signaling between the host and client
public/
  index.html       Role selection and page markup
  host.js            Screen capture and WebRTC offer
  client.js          WebRTC answer and remote video playback
  style.css        Page styling
```

The browser clients exchange WebRTC offers, answers, and ICE candidates through the WebSocket server. The video stream itself is sent directly between browsers; it does not pass through Express.

## Signaling messages

| Type | Sender → receiver | Purpose |
| --- | --- | --- |
| `host` | host → server | Register the screen-sharing browser |
| `client` | client → server | Register the viewing browser |
| `registered` | Server → client | Confirm the client's role |
| `client-ready` | Server → host | Tell the host to send or resend its offer |
| `offer` | host → client | Start a WebRTC connection |
| `answer` | client → host | Reply to the offer |
| `ice` | Either client → other client | Exchange connection candidates; includes a `target` |

## Local development

```sh
npm install
npm run dev
```

Then follow the local setup instructions in the project [README](../README.md).

## Manual check

There is no automated test suite yet. To check changes:

1. Run `node --check server.js`, `node --check src/server.js`, `node --check src/network.js`, and `node --check src/signaling.js`.
2. Run `node --check public/host.js` and `node --check public/client.js`.
3. Start the server and test screen sharing with a host browser and client on the same network.

When changing signaling messages, keep the message `type` and `target` values consistent across `src/signaling.js`, `public/host.js`, and `public/client.js`.
