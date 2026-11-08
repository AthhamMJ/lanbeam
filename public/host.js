const status = document.getElementById("status");
const shareScreen = document.getElementById("shareScreen");

let socket;
let peerConnection;
let screenStream;
let pendingIceCandidates = [];

// Connect to signaling server
function connectWebSocket() {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  socket = new WebSocket(`${protocol}//${location.host}`);

  socket.addEventListener("open", () => {
    status.textContent = "Host Connected";

    socket.send(
      JSON.stringify({
        type: "pc",
      }),
    );
  });

  socket.addEventListener("message", async (event) => {
    const data = JSON.parse(event.data);

    // iPad is ready
    if (data.type === "ipad-ready") {
      status.textContent = "iPad connected - Ready";

      console.log("iPad is ready");

      if (screenStream) {
        await sendScreenOffer();
      }
    }

    // Receive WebRTC answer
    if (data.type === "answer") {
      console.log("Answer received");

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.answer),
      );
      await flushPendingIceCandidates();
    }

    // Receive ICE candidate
    if (data.type === "ice") {
      if (peerConnection) {
        if (peerConnection.remoteDescription) {
          await peerConnection.addIceCandidate(data.candidate);
        } else {
          pendingIceCandidates.push(data.candidate);
        }
      }
    }
  });

  socket.addEventListener("close", () => {
    status.textContent = "Signaling disconnected";
  });

  socket.addEventListener("error", (error) => {
    console.error("Signaling error:", error);
    status.textContent = "Unable to connect to the signaling server";
  });
}

// Create WebRTC connection
function createPeerConnection() {
  peerConnection?.close();
  pendingIceCandidates = [];

  peerConnection = new RTCPeerConnection({
    iceServers: [],
  });

  // Send ICE candidates to iPad
  peerConnection.addEventListener("icecandidate", (event) => {
    if (event.candidate) {
      socket.send(
        JSON.stringify({
          type: "ice",

          target: "ipad",

          candidate: event.candidate,
        }),
      );
    }
  });

  peerConnection.addEventListener("connectionstatechange", () => {
    console.log("WebRTC:", peerConnection.connectionState);

    if (peerConnection.connectionState === "connected") {
      status.textContent = "Screen connected to iPad";
    } else if (peerConnection.connectionState === "failed") {
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

async function sendScreenOffer() {
  if (!screenStream || socket.readyState !== WebSocket.OPEN) {
    return;
  }

  createPeerConnection();
  screenStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, screenStream);
  });

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  socket.send(
    JSON.stringify({
      type: "offer",
      offer: peerConnection.localDescription,
    }),
  );
  status.textContent = "Connecting to iPad...";
}

// Start screen sharing
shareScreen.addEventListener("click", async () => {
  try {
    status.textContent = "Selecting screen...";

    screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        frameRate: {
          ideal: 30,
          max: 30,
        },
      },

      audio: false,
    });

    status.textContent = "Screen captured";
    await sendScreenOffer();

    // Stop if user stops screen sharing
    screenStream.getVideoTracks()[0].addEventListener("ended", () => {
      peerConnection?.close();
      peerConnection = null;
      screenStream = null;
      status.textContent = "Screen sharing stopped";
    });
  } catch (error) {
    console.error(error);

    status.textContent = `Screen sharing failed: ${error.message}`;
  }
});

connectWebSocket();
