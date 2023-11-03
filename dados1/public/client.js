const socket = new WebSocket("ws://localhost:3000");

socket.onopen = (event) => {
    console.log("Conectado al servidor");
};

socket.onmessage = (event) => {
    const message = event.data;
    console.log("Mensaje del servidor: " + message);
    displayResult(message);
};

socket.onclose = (event) => {
    if (event.wasClean) {
        console.log(`Conexión cerrada limpiamente, código=${event.code}, motivo=${event.reason}`);
    } else {
        console.error("Conexión rota"); 
    }
};

socket.onerror = (error) => {
    console.error("Error en la conexión: " + error.message);
};

document.getElementById("rollButton").addEventListener("click", () => {
    // Envía un mensaje al servidor para tirar el dado
    socket.send("Tirar el dado");
});

function displayResult(message) {
    const resultElement = document.getElementById("result");
    if (resultElement) {
        resultElement.textContent = message;
    } else {
        console.error("Elemento result no encontrado en el DOM.");
    }
}