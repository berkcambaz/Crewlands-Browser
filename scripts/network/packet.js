import { network } from "./network.js";
import { dataHandler } from "./data_handler.js";
import { game } from "../game.js";

function Packet() {
  this.SENDING = 0;
  this.RECEIVING = 1;

  let packetId = 0;
  this.SYNC_WORLD = packetId++;

  this.handle = function (packet) {
    dataHandler.push(packet);
    packet = dataHandler.getData();
    if (!packet) return;

    switch (packet.id) {
      case this.SYNC_WORLD:
        this.syncWorld(packet.data, this.RECEIVING);
        break;
    }
  }

  this.syncWorld = function (data, state) {
    switch (state) {
      case this.SENDING:
        network.sendToAll({ id: this.SYNC_WORLD, data: data });
        break;
      case this.RECEIVING:
        game.display(data.countries, data.provinces, data.countryCount, data.width, data.height);
        break;
    }
  }
}

export const packet = new Packet();