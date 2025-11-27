import { html, render } from "lit";

const servers = {
  iceServers: [
    {
      urls: [
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302",
      ],
    },
  ],
  iceCandidatePoolSize: 10,
};

const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 0,
  voiceActivityDetection: false,
};

let peerConnection = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;

const start = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  remoteStream = new MediaStream();

  console.log("STARTING SHIT");

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  document.getElementById("remoteAudio").srcObject = remoteStream;

  const callDoc = 
};

render(
  html`<button @click=${() => start()}>start</button>
    <audio id="remoteAudio" autoplay controls muted></audio>`,
  document.body
);
