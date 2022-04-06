const WebSocket = require("ws");
const express = require("express");
const app = express();
const path = require("path");

app.use("/", express.static(path.resolve(__dirname, "../client")));

const port = process.env.PORT; // 9876
const myServer = app.listen(port); // regular http server using node express which serves your webpage

const wsServer = new WebSocket.Server({
  // noServer: true,
  server: myServer,
}); // a websocket server

wsServer.on("connection", function (ws) {
  // what should a websocket do on connection
  ws.on("message", function (msg) {
    // what to do on message event
    wsServer.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        // check if client is ready
        const input = msg.toString();
        let output = input;
        if (input === 'ping') output = 'pong';
        if (input === 'tic') output = 'tac';
        if (input === 'big') output = 'bang';
        if (input === 'chrome') output = 'devtools';
        client.send(output);
      }
    });
  });
});

myServer.on("upgrade", async function upgrade(request, socket, head) {
  //handling upgrade(http to websocket) event

  // accepts half requests and rejects half. Reload browser page in case of rejection

  if (Math.random() > 0.5) {
    return socket.end("HTTP/1.1 401 Unauthorized\r\n", "ascii"); //proper connection close in case of rejection
  }

  //emit connection when request accepted
  wsServer.handleUpgrade(request, socket, head, function done(ws) {
    wsServer.emit("connection", ws, request);
  });
});
