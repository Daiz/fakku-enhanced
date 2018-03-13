const URL = process.env.npm_package_repository_url.replace(".git", "/raw/stable/" + process.env_npm_package_main);
const VERSION = process.env.npm_package_version;
const NAME = process.env.npm_package_config_name
const AUTHOR = process.env.npm_package_author
const NAMESPACE = process.env.npm_package_name
const DESCRIPTION = process.env.npm_package_description;
const YEAR = (new Date()).getUTCFullYear();
module.exports = function (PRODUCTION, LOCAL) {
  return `
// ==UserScript==
// @name         ${NAME}
// @author       ${AUTHOR}
// @namespace    ${NAMESPACE}
// @version      ${PRODUCTION ? VERSION : "DEVELOPMENT"}
// @description  ${DESCRIPTION}
// @match        https://www.fakku.net/*
${PRODUCTION ? `// @updateURL    ${URL}` : ""}
${PRODUCTION ? `// @downloadURL  ${URL}` : ""}
${PRODUCTION ? "" : `// @require      ${LOCAL}`}
// @grant        none
// @run-at       document-end
// ==/UserScript==
/*
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
*/`;
}