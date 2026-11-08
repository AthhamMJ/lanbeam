const status = document.getElementById("status");

const screen = document.getElementById("screen");

const pcControls = document.getElementById("pcControls");

let socket;
let peerConnection;
let pendingIceCandidates = [];

// Hide PC controls
pcControls.style.display = "none";

// Connect WebSocket
function connectWebSocket() {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";

  socket = new WebSocket(`${protocol}//${location.host}`);

  socket.addEventListener("open", () => {
    status.textContent = "Client Connected";

    socket.send(
      JSON.stringify({
        type: "ipad",
      }),
    );
  });

  socket.addEventListener("message", async (event) => {
    const data = JSON.parse(event.data);

    // Receive screen offer
    if (data.type === "offer") {
      console.log("Screen offer received");

      createPeerConnection();

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.offer),
      );

      await flushPendingIceCandidates();

      // Create answer
      const answer = await peerConnection.createAnswer();

      await peerConnection.setLocalDescription(answer);

      socket.send(
        JSON.stringify({
          type: "answer",

          answer: peerConnection.localDescription,
        }),
      );

      status.textContent = "Connecting to PC...";
    }

    // Receive ICE candidate
    if (data.type === "ice") {
      if (peerConnection?.remoteDescription) {
        await peerConnection.addIceCandidate(data.candidate);
      } else {
        pendingIceCandidates.push(data.candidate);
      }
    }
  });

  socket.addEventListener("close", () => {
    status.textContent = "Disconnected";
  });

  socket.addEventListener("error", (error) => {
    console.error("Signaling error:", error);
    status.textContent = "Unable to connect to the signaling server";
  });
}

// Create WebRTC connection
function createPeerConnection() {
  peerConnection?.close();

  peerConnection = new RTCPeerConnection({
    iceServers: [],
  });

  // Receive PC video
  peerConnection.addEventListener("track", (event) => {
    console.log("Screen stream received");

    screen.srcObject = event.streams[0];

    screen.play().catch((error) => {
      console.log("Video play:", error);
    });

    status.textContent = "LIVE • PC SCREEN";
  });

  // Send ICE candidates to PC
  peerConnection.addEventListener("icecandidate", (event) => {
    if (event.candidate) {
      socket.send(
        JSON.stringify({
          type: "ice",

          target: "pc",

          candidate: event.candidate,
        }),
      );
    }
  });

  peerConnection.addEventListener("connectionstatechange", () => {
    console.log("WebRTC:", peerConnection.connectionState);

    if (peerConnection.connectionState === "failed") {
      status.textContent =
        "Connection failed - check that both devices share a network";
    }
  });
}

async function flushPendingIceCandidates() {
  const candidates = pendingIceCandidates;

  pendingIceCandidates = [];

  for (const candidate of candidates) {
    await peerConnection.addIceCandidate(candidate);
  }
}

connectWebSocket();
