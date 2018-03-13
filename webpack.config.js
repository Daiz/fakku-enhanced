const { CheckerPlugin } = require("awesome-typescript-loader");
const { resolve, join, dirname, basename } = require("path");
const { DefinePlugin } = require("webpack");
const pkg = require("./package.json");
const dir = dirname(pkg.main);
const file = basename(pkg.main);

module.exports = {
  entry: {
    main: "./src/index.ts"
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

  plugins: [
    new CheckerPlugin(),
    new DefinePlugin({
      VERSION: JSON.stringify(pkg.version),
      STORE_KEY: JSON.stringify(pkg.name)
    })
  ]
};
