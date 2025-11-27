import { html, render, nothing } from "lit-html";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "",
  authDomain: "webrtc-2fc05.firebaseapp.com",
  projectId: "webrtc-2fc05",
  storageBucket: "webrtc-2fc05.appspot.com",
  messagingSenderId: "111579420462",
  appId: "1:111579420462:web:cf93bd78ba455b40a30cbf",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const servers = {
  iceServers: [
    {
      urls: ["stun:stun3.l.google.com:19302", "stun:stun4.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const peerConnection = new RTCPeerConnection(servers);

let localStream = null;
let remoteStream = null;
const webcamButtonClicked = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  remoteStream = new MediaStream();

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };
  renderApp();
};

let callId;
const callButtonClicked = async () => {
  const callDoc = doc(collection(firestore, "calls"));
  const offerCandidates = collection(callDoc, "offerCandidates");
  const answerCandidates = collection(callDoc, "answerCandidates");

  peerConnection.addEventListener("icecandidate", ({ candidate }) => {
    candidate && addDoc(offerCandidates, candidate.toJSON());
  });

  callId = callDoc.id;

  const offerDescription = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offerDescription);

  const offer = { sdp: offerDescription.sdp, type: offerDescription.type };

  setDoc(callDoc, { offer });

  onSnapshot(callDoc, (snapshot) => {
    const data = snapshot.data();
    if (!peerConnection.currentLocalDescription && data?.answer) {
      peerConnection.setRemoteDescription(data.answer);
    }
  });

  onSnapshot(answerCandidates, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const candidate = new RTCIceCandidate(change.doc.data());
        peerConnection.addIceCandidate(candidate);
      }
    });
  });

  renderApp();
};

const answerButtonClicked = async () => {
  callId = document.getElementById("callInput").value.trim();
  const callDoc = doc(collection(firestore, "calls"), callId);
  const answerCandidates = collection(callDoc, "answerCandidates");

  peerConnection.addEventListener("icecandidate", ({ candidate }) => {
    candidate && addDoc(answerCandidates, candidate.toJSON());
  });

  const { offer } = (await getDoc(callDoc)).data();

  await peerConnection.setRemoteDescription(offer);

  const answerDescription = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answerDescription);

  const answer = { sdp: answerDescription.sdp, type: answerDescription.type };

  await updateDoc(callDoc, { answer });

  onSnapshot(answerCandidates, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const data = change.doc.data();
        peerConnection.addIceCandidate(new RTCIceCandidate(data));
      }
    });
  });
  renderApp();
};

const renderApp = () => {
  render(
    html`<div>
        <button @click=${() => webcamButtonClicked()}>Start webcam</button>
        <button @click=${() => callButtonClicked()}>Call</button>
        <button @click=${() => answerButtonClicked()}>Answer</button>
        <input id="callInput" />

        <div>${callId ? `call ID: ${callId}` : nothing}</div>
      </div>
      <div>
        <video
          autoplay
          playsinline
          .muted=${true}
          .srcObject=${localStream || nothing}
        ></video>
        <video
          autoplay
          playsinline
          .srcObject=${remoteStream || nothing}
        ></video>
      </div>`,
    document.body
  );
};

renderApp();
