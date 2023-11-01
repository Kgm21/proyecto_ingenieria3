const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

app.use(express.static('public', { 
  setHeaders: (res, path) => {
      if (path.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css');
      }
  }
}));

let players = {};
let readyPlayers = 0; // Contador de jugadores listos para empezar el juego

wss.on('connection', (ws) => {
    // Asignar un identificador único al jugador
    const playerId = Object.keys(players).length + 1;
    players[playerId] = ws;

    // Enviar mensaje al cliente con su identificador
    ws.send(JSON.stringify({ type: 'playerId', playerId }));

    // Manejar mensajes desde el cliente
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'ready') {
            readyPlayers++;
            if (readyPlayers === 2) {
                // Cuando hay dos jugadores listos, enviar mensaje para empezar el juego
                for (const id in players) {
                    players[id].send(JSON.stringify({ type: 'startGame' }));
                }
            }
        }
        // Broadcasting de mensajes a otros jugadores
        for (const id in players) {
            if (id !== playerId && players[id].readyState === WebSocket.OPEN) {
                players[id].send(message);
            }
        }
    });

    // Eliminar jugador cuando se desconecta
    ws.on('close', () => {
        delete players[playerId];
        readyPlayers = Math.max(0, readyPlayers - 1); // Decrementar el contador si un jugador se desconecta
    });
});

server.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});
