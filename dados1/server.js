
const WebSocket = require("ws");
const http = require("http");
const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static("public"));
let connectedClients = [];

wss.on("connection", (ws) => {
  console.log("Cliente conectado");
  connectedClients.push(ws);

  // Envía un mensaje al cliente para indicar que está conectado
  ws.send("Estás conectado. Esperando a otro jugador...");

  ws.on("message", (message) => {
      console.log("Mensaje del cliente: " + message);

      // Si hay dos clientes conectados, permite que tiren el dado
      if (connectedClients.length === 2) {
          // Simula el lanzamiento del dado para ambos clientes
          const diceResult = Math.floor(Math.random() * 6) + 1;

          // Envía el resultado del dado a ambos clientes
          connectedClients.forEach((client) => {
              client.send("Resultado del dado: " + diceResult);
          });

          // Determina el resultado del juego
          const resultMessage = determineGameResult(diceResult);
          connectedClients.forEach((client) => {
              client.send(resultMessage);
          });

          // Reinicia el array de clientes para el próximo juego
          connectedClients = [];
      } else {
          // Si no hay suficientes clientes, envía un mensaje de espera
          ws.send("Esperando a otro jugador...");
      }
  });
});

function determineGameResult(diceResult) {
  const resultMessage = `Resultado del dado: ${diceResult}. `;
  if (diceResult % 2 === 0) {
      return resultMessage + "¡Ganaste!";
  } else {
      return resultMessage + "¡Perdiste!";
  }
}

server.listen(3000, () => {
  console.log("Servidor escuchando en el puerto 3000");
});