import { network } from "./network.js";
import { dataHandler } from "./data_handler.js";

function Packet() {
  this.SENDING = 0;
  this.RECEIVING = 1;

  let packetId = 0;
  this.SYNC_WORLD = packetId++;

  this.handle = function (packet) {
    dataHandler.push(packet);
    if (packet) packet = dataHandler.getData();
    console.log(packet);
  }

  this.syncWorld = function (data, state) {
    switch (state) {
      case this.SENDING:
        network.sendToAll({ id: this.SYNC_WORLD, data: data });
        break;
      case this.RECEIVING:
        break;
    }
  }
}

export const packet = new Packet();