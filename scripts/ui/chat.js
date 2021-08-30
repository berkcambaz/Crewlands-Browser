import { game } from "../game.js";
import { network } from "../network/network.js";

function Chat() {
  const panel = document.getElementById("chat");

  const chatContainer = document.getElementById("chat_container");
  const chatInput = document.getElementById("chat_input");

  const messageLimit = 50;
  const messages = [];

  const historyLimit = 50;
  const history = [];
  let historyIndex = 0;

  this.init = function () {
    this.show();

    chatInput.addEventListener("keydown", (ev) => {
      switch (ev.key) {
        case "Enter":
          const message = chatInput.value;
          chatInput.value = "";
          this.insertMessage(message, true)

          if (message.startsWith("/"))
            this._parseCommand(message.substr(1));

          // Add the message to history since it's written by the user
          history.push(message);
          if (history.length > historyLimit)
            history.shift().remove();
          break;
        case "ArrowUp":
          ev.preventDefault(); // To put the cursor to the end of the string
          if (--historyIndex < 0) ++historyIndex;
          if (history[historyIndex]) chatInput.value = history[historyIndex];
          break;
        case "ArrowDown":
          ev.preventDefault(); // To put the cursor to the end of the string
          if (++historyIndex > history.length - 1) --historyIndex;
          if (history[historyIndex]) chatInput.value = history[historyIndex];
          break;
      }
    });
  }

  this.show = function () {
    panel.classList.remove("hide");
  }

  this.hide = function () {
    panel.classList.add("hide");
  }

  this.insertMessage = function (message, scrollToBottom, color) {
    const messageElem = document.createElement("div");
    if (color) messageElem.style.color = color;
    messageElem.textContent = message;
    chatContainer.appendChild(messageElem);

    if (scrollToBottom)
      chatContainer.scrollTop = chatContainer.scrollHeight;

    messages.push(messageElem);
    historyIndex = messages.length;
    if (messages.length > messageLimit)
      messages.shift().remove();
  }

  // --- COMMANDS --- \\
  /**
   * 
   * @param {string} command 
   */
  this._parseCommand = function (command) {
    command = command.split(" ");

    switch (command[0]) {
      case "genmap":
        this._genmapCommand(command.slice(1));
        break;
      case "host":
        this._hostCommand();
        break;
      case "join":
        this._joinCommand(command.slice(1));
        break;
      case "start":
        this._startCommand();
        break;
      default:
        break;
    }
  }

  this._genmapCommand = function (parameters) {
    const countryCount = parseInt(parameters[0]);
    const width = parseInt(parameters[1]);
    const height = parseInt(parameters[2]);

    if (countryCount < 2 || countryCount > 4) {
      this.insertMessage("Error: Country count must be 2-4!", true, "red");
      return;
    }

    //if (width < 10 || width > 25) {
    //  this.insertMessage("Error: World width must be 10-25!", true, "red");
    //  return;
    //}
    //
    //if (height < 10 || height > 25) {
    //  this.insertMessage("Error: World height must be 10-25!", true, "red");
    //  return;
    //}

    game.generate(countryCount, width, height);
  }

  this._hostCommand = function () {
    network.host();
  }

  this._joinCommand = function (id) {
    network.join(id);
  }

  this._startCommand = function () {
    game.start();
  }
}

export const chat = new Chat();