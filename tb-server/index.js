const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const NodesInstance = require("./utils/nodes");
const CryptoJS = require("crypto-js");

const secretKey = "mySecretKey";

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const nodes = new NodesInstance();
const connectionsLimit = 4;

app.get("/", (req, res) => {
  res.send("working");
});

io.on("connection", (socket) => {
  if (io.engine.clientsCount > connectionsLimit) {
    socket.emit("err", { message: "reach the limit of connections" });
    socket.disconnect();
    console.log("Limit reached so Disconnected");
    return;
  }

  //add socket to nodeInstance
  nodes.add(socket.id);

  //balance id's among clients
  socket.emit("id", nodes.get().length);

  socket.on("ping", (data) => {
    const bytes = CryptoJS.AES.decrypt(data.message, secretKey);
    var decryptedMessage = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    const message = CryptoJS.AES.encrypt(
      JSON.stringify(decryptedMessage + "::Verified"),
      secretKey
    ).toString();
    const node = nodes.getWithId(data.client);
    if (node) {
      io.to(node).emit("pong", {
        ...data,
        message,
      });
    } else {
      socket.emit("pong", `No client with id ${data.client} exists`);
    }
  });

  console.log("a user connected", nodes.get());

  socket.on("disconnect", (s, id) => {
    //disconnect node and balance id's
    nodes.disconnect(socket.id, io);

    console.log("user disconnected", nodes.get());
  });
});

const PORT = 1880;
server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
