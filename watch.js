require("shelljs/global");
const header = require("./us-header");
const development = require("./us-development");
const webpack = require("webpack");
const { resolve } = require("path");
const WebSocket = require("ws");
const pkg = require("./package.json");
const config = require("./webpack.config.js");
config.mode = "development";
config.plugins.push(
  new webpack.BannerPlugin({
    banner: "var PRODUCTION = false;",
    raw: true
  })
);

const HOST = process.env.npm_package_config_host || pkg.config.host;
const PORT = process.env.npm_package_config_port || pkg.config.port;
const FILE = pkg.main;
const DEV = "development.user.js";

let filePath = resolve(FILE).replace(/\\/g, "/");
if (filePath[0] !== "/") filePath = "/" + filePath;
filePath = encodeURI("file://" + filePath).replace(/[?#]/g, encodeURIComponent);

ShellString(`
${header("DEVELOPMENT", filePath)}
${development(HOST, PORT)}
`).to(DEV);
function cleanup() {
  if (test("-e", DEV)) rm(DEV);
}
function cleanupAndExit() {
  cleanup();
  process.exit();
}
process.on("exit", cleanup);
process.on("SIGINT", cleanupAndExit);
process.on("uncaughtException", cleanupAndExit);

const wss = new WebSocket.Server({
  host: HOST,
  port: PORT
});

const compiler = webpack(config);
compiler.watch(
  {
    ignored: /node_modules/
  },
  (err, stats) => {
    let data = { success: true };
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      data.error = err.stack || err;
      if (err.details) data.errorDetails = err.details;
      data.success = false;
    }
    const info = stats.toJson();

    if (stats.hasErrors()) {
      console.error(info.errors);
      data.errors = info.errors;
      data.success = false;
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings);
      data.warnings = info.warnings;
      data.success = false;
    }

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
);
