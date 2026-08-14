
// services/socketService.js

let socketSusano = null;

export function guardarSocket(socket) {
  socketSusano = socket;

  console.log("🟢 Socket de Susano guardado");
}

export function obtenerSocket() {
  return socketSusano;
}

export function limpiarSocket(socket) {
  if (socketSusano === socket) {
    socketSusano = null;
    console.log("🔴 Socket de Susano eliminado");
  }
}

