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
    const data = JSON.parse(event.data);
    if (data.success) {
      if (!document.hidden) {
        location.reload();
      } else {
        reload = true;
      }
    } else {
      if (data.error) console.error(data.error);
      if (data.errorDetails) console.error(data.errorDetails);
      if (data.errors) console.error(data.errors);
      if (data.warnings) console.warn(data.warnings);
      console.log("Not reloaded due to errors or warnings.");
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

if (!PRODUCTION) {
  init();
}
`;
};
