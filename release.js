require("shelljs/global");
const semver = require("semver");
const webpack = require("webpack");
const pretty = require("prettier-package-json");
const pkg = require("./package.json");
const header = require("./us-header");
const config = require("./webpack.config.js");
const { promisify } = require("util");
const { resolve } = require("path");
const path = resolve(pkg.main);
const compile = promisify(webpack);
const args = process.argv.slice(2);
delete config.devtool;
config.mode = "production";

async function build(version = pkg.version) {
  await compile(config);
  const script = cat(path);
  const head = header(version);
  ShellString(`${head}\n${script}`).to(path);
}

(async function() {
  try {
    const version = pkg.version;
    const bump = args[0];
    const update = semver.inc(version, bump);
    if (update) {
      pkg.version = update;
      const dist = pkg.main;
      const ver = update;
      const package = "package.json";
      ShellString(pretty.format(pkg)).to("package.json");
      await build(update);
      exec(`git add ${dist} ${package} && git commit -m "Release ${ver}"`);
      exec(`git tag -a v${ver} -m "${ver}" && git tag -af stable -m "${ver}"`);
      exec(`git push && git push --tags --force`);
    } else {
      await build();
      console.log("Compiled successfully.");
    }
  } catch (e) {
    console.error(e);
  }
})();
