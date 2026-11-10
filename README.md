# LANBeam

**Share your screen. Not your internet.**

LANBeam is an open-source, local network screen-sharing platform that lets you stream a computer screen to another device on the same Wi-Fi or LAN network.

It uses browser-based screen capture, WebRTC for real-time media transmission, and WebSockets for signaling. The application is designed to work over a local network without requiring a cloud streaming service.

## Features

- Local network screen sharing
- Browser-based screen capture
- WebRTC peer-to-peer media transmission
- WebSocket signaling between host and client
- Automatic local IPv4 address discovery
- Lightweight Node.js server
- Docker support

## How It Works

LANBeam uses three main technologies:

| Technology | Responsibility |
|---|---|
| Express | Serves the web application |
| WebSocket | Exchanges WebRTC signaling messages |
| WebRTC | Transmits screen media between devices |

The host starts screen sharing through the browser. The client connects using the host computer's local network address.

The server coordinates the connection, while WebRTC handles the media stream.

## Requirements

- Node.js 24 or newer (for native installation)
- A host and client connected to the same local network
- A modern browser with screen-capture and WebRTC support
- Docker Desktop (optional, for containerized deployment)

## Installation

Clone the repository:

```bash
git clone https://github.com/AthhamMJ/lanbeam.git
cd lanbeam
```

Install dependencies:

```bash
npm install
```

Start the application:

```bash
npm start
```

For development with automatic server restarts:

```bash
npm run dev
```

## Usage

### Host

On the computer you want to share:

1. Start the LANBeam server.
2. Open `http://localhost:3000/?role=host`.
3. Select **Share screen** in the browser.
4. Choose the screen or window you want to share.

### Client

On the receiving device:

1. Connect to the same local network as the host.
2. Open the host computer's LAN address, using port `3000` and the `/?role=client` path.
3. Wait for the WebRTC connection to establish.

Example:

```text
http://192.168.1.10:3000/?role=client
```

Replace `192.168.1.10` with the actual LAN IPv4 address of the host computer.

If the client cannot connect, check the host firewall and ensure both devices can communicate over the local network.

## Docker Setup

LANBeam includes a Dockerfile for containerized deployment.

### Build the image

From the project root directory, run:

```bash
docker build -t lanbeam .
```

This creates a local Docker image named `lanbeam`.

### Run the container

```bash
docker run --rm -p 3000:3000 lanbeam
```

The application will be accessible through port `3000` on the host computer.

### Run in the background

Alternatively, start the container in detached mode:

```bash
docker run -d --name lanbeam -p 3000:3000 lanbeam
```

### Stop the container

If running in the foreground, press `Ctrl + C`.

If running in detached mode:

```bash
docker stop lanbeam
```

To remove the stopped container:

```bash
docker rm lanbeam
```

### Access LANBeam

Open the host interface:

```text
http://localhost:3000/?role=host
```

On the receiving device, use the host computer's LAN IP:

```text
http://HOST_LAN_IP:3000/?role=client
```

Example:

```text
http://192.168.1.10:3000/?role=client
```

**Important Docker networking note:**

- Use the Windows host's LAN IPv4 address when connecting from another device.
- Do not use the Docker container's internal `172.x.x.x` address.
- Docker forwards host port `3000` to container port `3000`.
- The application server must listen on `0.0.0.0` inside the container to accept forwarded connections.

Docker runs the application server and signaling service. Screen capture still takes place in the host browser.

### Docker image publishing

The Docker image is currently built locally. Anyone cloning the repository can build their own image using the instructions above.

Publishing a prebuilt image to GitHub Container Registry (GHCR) can be added in a future release.

## Limitations

- The current signaling implementation supports one host and one client at a time.
- The application is designed for local network use.
- No STUN or TURN infrastructure is currently configured for connections across different networks.
- Network isolation, firewall rules and VPN configurations may prevent connections.
- Screen capture requires explicit permission from the host user.
- Browser security-context requirements may affect access to screen-capture APIs.

## Project Structure

```text
LANBeam/
├── public/          # Frontend application
├── src/
│   ├── server.js    # HTTP and application server
│   ├── network.js   # LAN IPv4 discovery
│   └── signaling.js # WebSocket signaling
├── docs/            # Project documentation
├── server.js        # Application entry point
├── Dockerfile
├── .dockerignore
├── package.json
├── package-lock.json
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

## Contributing

Contributions, suggestions and bug reports are welcome.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

## License

LANBeam is released under the [MIT License](LICENSE).