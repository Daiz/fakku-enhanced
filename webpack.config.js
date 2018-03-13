const { CheckerPlugin } = require("awesome-typescript-loader");
const { resolve, join, dirname, basename } = require("path");
const main = process.env.npm_package_main
const dir = dirname(main);
const file = basename(main);

module.exports = {
  entry: {
    loader: "./src/index.ts"
  },

  output: {
    filename: file,
    path: join(__dirname, dir),
    publicPath: "/"
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "awesome-typescript-loader",
        exclude: resolve(__dirname, "node_modules"),
        include: resolve(__dirname, "src")
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader"
      }
    ]
  },

  plugins: [new CheckerPlugin()]
};
