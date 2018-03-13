module.exports = function(host = "localhost", port = 8080) {
  return `
const socket = new WebSocket("ws://${host}:${port}");
let reload = false;
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && reload) {
    location.reload();
  }
});
socket.onopen = (event) => {
  console.log("Connected to reload server.");
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
`;
};
