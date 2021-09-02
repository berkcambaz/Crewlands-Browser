import { network } from "./network.js";
import { dataHandler } from "./data_handler.js";
import { game } from "../game.js";
import { chat } from "../ui/chat.js";

function Packet() {
  this.SENDING = 0;
  this.RECEIVING = 1;

  let packetId = 0;
  this.PLAYER_JOINED = packetId++;
  this.PLAYER_LEFT = packetId++;
  this.SYNC_WORLD = packetId++;

  this.handle = function (packet) {
    dataHandler.push(packet);
    packet = dataHandler.getData();
    if (!packet) return;
    console.log(packet);

    switch (packet.id) {
      case this.PLAYER_JOINED:
        this.playerJoined(packet.data, this.RECEIVING);
        break;
      case this.PLAYER_LEFT:
        this.playerLeft(packet.data, this.RECEIVING);
        break;
      case this.SYNC_WORLD:
        this.syncWorld(packet.data, this.RECEIVING);
        break;
    }
  }

  /**
   * 
   * @param {{id: string}} data 
   * @param {*} state 
   */
  this.playerJoined = function (data, state, exceptId) {
    switch (state) {
      case this.SENDING:
        network.sendToExcept({ id: this.PLAYER_JOINED, data: data }, exceptId);
        break;
      case this.RECEIVING:
        chat.insertMessage(`Player ${data.id} has joined.`);
        break;
    }
  }

  /**
   * 
   * @param {{id: string}} data 
   * @param {*} state 
   */
  this.playerLeft = function (data, state, exceptId) {
    switch (state) {
      case this.SENDING:
        network.sendToExcept({ id: this.PLAYER_LEFT, data: data }, exceptId);
        break;
      case this.RECEIVING:
        chat.insertMessage(`Player ${data.id} has left.`);
        break;
    }
  }

  /**
   * 
   * @param {{countries: any, provinces: any, countryCount: number, width: number, height: number}} data
   * @param {number} state 
   * @param {string} id Id of the player to send the packet.
   */
  this.syncWorld = function (data, state, id) {
    switch (state) {
      case this.SENDING:
        data = {
          countries: game.countries,
          provinces: game.provinces,
          countryCount: game.changeCountry,
          width: game.width,
          height: game.height
        };

        if (id === undefined)
          network.sendToAll({ id: this.SYNC_WORLD, data: data });
        else
          network.sendTo({ id: this.SYNC_WORLD, data: data }, id);
        break;
      case this.RECEIVING:
        game.display(data.countries, data.provinces, data.countryCount, data.width, data.height);
        break;
    }
  }
}

export const packet = new Packet();