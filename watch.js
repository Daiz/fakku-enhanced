require("shelljs/global");
const header = require("./us-header");
const development = require("./us-development");
const webpack = require("webpack");
const { resolve } = require("path");
const WebSocket = require("ws");
const config = require("./webpack.config.dev.js");

const HOST = process.env.npm_package_config_host || "localhost";
const PORT = process.env.npm_package_config_port || 8080;
const FILE = process.env.npm_package_config_main;

let filePath = resolve(FILE).replace(/\\/g, "/");
if (path[0] !== "/") filePath = "/" + filePath;
filePath = encodeURI("file://" + filePath).replace(/[?#]/g, encodeURIComponent);

ShellString(`
${header(false, filePath)}
${development(HOST, PORT)}
`).to("development.user.js");
process.on("exit", () => {
  rm("development.user.js");
});

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
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
    }
    const info = stats.toJson();

    if (stats.hasErrors()) {
      console.error(info.errors);
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings);
    }

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send("reload");
      }
    });
  }
);
