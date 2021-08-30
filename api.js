const wsServer = require("ws").Server;
const http = require("http");

const server = http.createServer().listen(8080);
const ws = new wsServer({ server: server });

/** @type {Object<string, WebSocket} */
const clients = {};

ws.on("connection", (socket, req) => {
  let id = generateId(10);
  clients[id] = socket;

  socket.send(JSON.stringify({ type: "id", id: id }));

  socket.on("message", (data) => {
    data = JSON.parse(data);
    console.log(data.type);

    if (!(data.to && clients[data.to])) return;

    switch (data.type) {
      case "join-request":
        clients[data.to].send(JSON.stringify({ type: data.type, offer: data.offer, from: id }));
        break;
      case "join-response":
        clients[data.to].send(JSON.stringify({ type: data.type, answer: data.answer, from: id }));
        break;
      case "ice-candidate":
        clients[data.to].send(JSON.stringify({ type: data.type, candidate: data.candidate, from: id }));
        break;
    }
  });

  socket.on("error", (code, reason) => {
    socket.close();
    delete clients[id];
  });

  socket.on("close", (code, reason) => {
    delete clients[id];
  });
});

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function generateId(length) {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";
  let id = "";

  for (let i = 0; i < length; ++i)
    id += characters[randomNumber(0, characters.length - 1)];

  return id;
}