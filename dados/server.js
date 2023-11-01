var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);


let players = [];
let diceResults = {};
let connectedPlayers = 0;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', (socket) => {
  connectedPlayers++;
  
  if (connectedPlayers === 1) {
    socket.emit('message', 'Esperando al segundo jugador...');
  } else if (connectedPlayers === 2) {
    socket.emit('message', 'Ambos jugadores están conectados. Puedes lanzar el dado.');
  } else {
    socket.emit('message', 'Ya hay dos jugadores. Por favor, intenta más tarde.');
    socket.disconnect(); // Desconectar al jugador si hay demasiados jugadores.
    return;
  }

  players.push(socket);


  // Lanza el dado y almacena el resultado en el objeto diceResults.
  diceResults[socket] = Math.floor(Math.random() * 6) + 1;

  // Cuando un jugador envía un mensaje, reenvía ese mensaje a todos los jugadores.
  socket.on('message', (message) => {
    // Implementa lógica adicional aquí si es necesario.
  });

  // Cuando un jugador se desconecta, elimínalo de la lista de jugadores.
  socket.on('close', () => {
    players = players.filter((player) => player !== socket);
    delete diceResults[socket];
  });
});

// Función para determinar al ganador y enviar el mensaje correspondiente a todos los jugadores.
function determineWinner() {
  const playersArray = Object.keys(diceResults);
  if (playersArray.length === 2) {
    const player1 = playersArray[0];
    const player2 = playersArray[1];

    const result1 = diceResults[player1];
    const result2 = diceResults[player2];

    let winner;
    if (result1 > result2) {
      winner = player1;
    } else if (result1 < result2) {
      winner = player2;
    } else {
      winner = 'Empate';
    }

    players.forEach((player) => {
      player.send(`¡${winner} gana con un resultado de ${diceResults[winner]}!`);
    });
  }
}

// Llama a la función determineWinner después de un cierto período de tiempo (por ejemplo, 5 segundos).
setTimeout(determineWinner, 5000);

server.listen(8080, function(){
  console.log("servidor corriendo en http://localhost:8080");
});
