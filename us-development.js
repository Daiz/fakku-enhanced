module.exports = function(host = "localhost", port = 8080) {
  return `
const SERVER = "ws://${host}:${port}";
let socket;
let reload = false;
let connected = false;
let timer = null;

function init() {
  socket = new WebSocket(SERVER);
  socket.onopen = (event) => {
    connected = true;
    clearInterval(timer);
    if (reload) {
      console.log("Reconnected to reload server.");
      if (!document.hidden) {
        location.reload();
      }
    } else {
      console.log("Connected to reload server.");
    }
  };
  socket.onmessage = (event) => {
    if (event.data === "reload") {
      if (!document.hidden) {
        location.reload();
      } else {
        reload = true;
      }
    }
  };
  socket.onclose = close;
}

function reconnect() {
  console.log("Attempting to reconnect...");
  init();
}

function close() {
  connected = false;
  console.error("Disconnected from reload server.");
  timer = setInterval(reconnect, 2500);
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && connected && reload) {
    location.reload();
  }
});

init();
`;
};
