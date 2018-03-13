module.exports = function(host = "localhost", port = 8080) {
  return `
const socket = new WebSocket("ws://${host}:${port}");
let reload = false;
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && reload) {
    window.reload();
  }
})
socket.onmessage = (event) => {
  if (event.data === "reload") {
    if (!document.hidden) {
      window.reload();
    } else {
      reload = true;
    }
  }
}
`;
}
