import { game } from "../game.js";

function Chat() {
  const panel = document.getElementById("chat");

  const chatContainer = document.getElementById("chat_container");
  const chatInput = document.getElementById("chat_input");

  const messageLimit = 50;
  const messages = [];

  this.init = function () {
    this.show();

    chatInput.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        const message = chatInput.value;
        chatInput.value = "";
        this.insertMessage(message, true)

        if (message.startsWith("/"))
          this._parseCommand(message.substr(1));
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
      default:
        break;
    }
  }

  this._genmapCommand = function (command) {
    const countryCount = parseInt(command[0]);
    const width = parseInt(command[1]);
    const height = parseInt(command[2]);

    if (countryCount < 2 || countryCount > 4) {
      this.insertMessage("Error: Country count must be 2-4!", true, "red");
      return;
    }

    if (width < 10 || width > 25) {
      this.insertMessage("Error: World width must be 10-25!", true, "red");
      return;
    }

    if (height < 10 || height > 25) {
      this.insertMessage("Error: World height must be 10-25!", true, "red");
      return;
    }

    game.generate(countryCount, width, height);
  }
}

export const chat = new Chat();