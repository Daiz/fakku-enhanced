require("shelljs/global");
const semver = require("semver");
const pretty = require("prettier-package-json");
const pkg = require("./package.json");
const oldVersion = pkg.version;
const args = process.argv.slice(2);
const bump = args[0];
const version = semver.inc(oldVersion, bump);
if (version) {
  pkg.version = version;
  ShellString(pretty.format(pkg)).to("package.json");
  exec("npm run build");
  exec(`git add ${pkg.main} && git commit -m "${version}"`);
  exec(`git tag -a v${version} -m "${version}"`);
  exec(`git tag -af stable -m "${version}"`);
  exec(`git push && git push --tags --force`);
}
