const config = require("./webpack.config.dev.js");
const header = require("./us-header");
const { BannerPlugin } = require("webpack");
config.plugins.push(
  new BannerPlugin({
    banner: header(true),
    raw: true,
    entryOnly: true
  })
);
module.exports = config;
