module.exports = function(host = "localhost", port = 8080) {
  return `
const SERVER = "ws://${host}:${port}";
const TIMEOUT = 10;
let socket;
let reload = false;
let connected = false;
let timer = null;
let attempts = 0;

function init() {
  socket = new WebSocket(SERVER);
  socket.onopen = (event) => {
    connected = true;
    if (timer) clearInterval(timer);
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
  if (attempts++ < TIMEOUT) {
    console.log("Attempting to reconnect...");
    init();
  } else {
    console.log("Timed out on reconnect attemption.");
    clearInterval(timer);
  }
}

function close() {
  console.error("Disconnected from reload server.");
  if (connected) {
      timer = setInterval(reconnect, 2500);
      connected = false;
  }
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && connected && reload) {
    location.reload();
  }
});

init();
`;
};
