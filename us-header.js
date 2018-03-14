const pkg = require("./package.json");
const URL = pkg.repository.url.replace(".git", "/raw/stable/" + pkg.main);
const NAME = pkg.config.name;
const AUTHOR = pkg.author;
const NAMESPACE = pkg.name;
const DESCRIPTION = pkg.description;
const YEAR = new Date().getUTCFullYear();
module.exports = function(VERSION = "DEVELOPMENT", LOCAL) {
  const PRODUCTION = VERSION !== "DEVELOPMENT";
  return `// ==UserScript==
// @name         ${NAME}
// @author       ${AUTHOR}
// @namespace    ${NAMESPACE}
// @version      ${VERSION}
// @description  ${DESCRIPTION}
// @match        https://www.fakku.net/*
${
    PRODUCTION
      ? `// @updateURL    ${URL}
// @downloadURL  ${URL}`
      : `// @require      ${LOCAL}`
  }
// @grant        none
// @run-at       document-start
// ==/UserScript==
/*!
  ${NAME} - ${DESCRIPTION}
  Copyright (C) ${YEAR} ${AUTHOR}

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as
  published by the Free Software Foundation, either version 3 of the
  License, or (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
${PRODUCTION ? "var PRODUCTION = true;" : ""}`;
};
