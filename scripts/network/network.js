import { chat } from "../ui/chat.js";
import { packet } from "./packet.js";

function Network() {
  const ws = new WebSocket("ws://localhost:8080");
  /** @type {Object<string, {connection: RTCPeerConnection, channel: RTCDataChannel}>} */
  let peers = {}; // Used by the host
  /** @type {{connection: RTCPeerConnection, channel: RTCDataChannel}} */
  const peer = { connection: undefined, channel: undefined }; // Used by the user

  let ownId = undefined;

  this.isServer = false;
  this.isClient = false;

  ws.onmessage = async function (ev) {
    const data = JSON.parse(ev.data);
    console.log(data);

    switch (data.type) {
      case "id":
        ownId = data.id;
        chat.insertMessage(`Your id is: ${ownId}`, true);
        break;
      case "join-request":
        // If there are already 4 peers connected, there's no room for another peer
        if (!(Object.keys(peers).length < 4)) return;

        peers[data.from] = { connection: new RTCPeerConnection(), channel: undefined };
        peers[data.from].connection.ondatachannel = (ev) => {
          console.log(ev);
          peers[data.from].channel = ev.channel;
          peers[data.from].channel.onopen = (ev) => { console.log(ev); }
          peers[data.from].channel.onclose = (ev) => { console.log(ev); }
          peers[data.from].channel.onmessage = (ev) => { packet.handle(ev.data); }
        }

        await peers[data.from].connection.setRemoteDescription(data.offer);
        const answer = await peers[data.from].connection.createAnswer();
        await peers[data.from].connection.setLocalDescription(answer);

        ws.send(JSON.stringify({ type: "join-response", answer: answer, to: data.from }));
        break;
      case "join-response":
        await peer.connection.setRemoteDescription(data.answer);
        break;
      case "ice-candidate":
        peers[data.from].connection.addIceCandidate(data.candidate);
        break;
    }
  }

  this.host = function () {
    peers = {};
    this.isServer = true;
    this.isClient = false;
  }

  this.join = async function (id) {
    this.isServer = false;
    this.isClient = true;

    peer.connection = new RTCPeerConnection();
    peer.connection.onicecandidate = (ev) => {
      if (ev.candidate) ws.send(JSON.stringify({ type: "ice-candidate", candidate: ev.candidate, to: id }))
    }
    peer.channel = peer.connection.createDataChannel("channel", { ordered: true });
    peer.channel.onopen = (ev) => { console.log(ev); }
    peer.channel.onclose = (ev) => { console.log(ev); }
    peer.channel.onmessage = (ev) => { packet.handle(ev.data); }

    const offer = await peer.connection.createOffer();
    await peer.connection.setLocalDescription(offer);

    ws.send(JSON.stringify({ type: "join-request", offer: offer, to: id }));
  }

  this.sendToServer = function (packet) {
    packet = JSON.stringify(packet);
    peer.channel.send(packet);
  }

  this.sendTo = function (packet, id) {

  }

  this.sendToExcept = function (packet, exceptId) {

  }

  this.sendToAll = function (packet) {
    packet = JSON.stringify(packet);

    for (const id in peers) {
      peers[id].channel.send(packet);
    }
  }
}

export const network = new Network();