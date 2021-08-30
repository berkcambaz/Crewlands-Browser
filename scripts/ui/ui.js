import { panelTop } from "./panel_top.js";
import { panelSide } from "./panel_side.js";
import { chat } from "./chat.js";

function UI() {
  this.init = function () {
    panelTop.init();
    panelSide.init();
    chat.init();
  }
}

export const ui = new UI();