// ==UserScript==
// @name         FAKKU Experiments
// @author       Daiz
// @namespace    fakku-experiments
// @version      1.1.4
// @description  Experimental frontend features for FAKKU.
// @match        https://www.fakku.net/*
// @updateURL    https://github.com/Daiz/fakku-experiments/raw/stable/dist/fakku-experiments.user.js
// @downloadURL  https://github.com/Daiz/fakku-experiments/raw/stable/dist/fakku-experiments.user.js
// @grant        none
// @run-at       document-end
// ==/UserScript==
/*!
  FAKKU Experiments - Experimental frontend features for FAKKU.
  Copyright (C) 2018 Daiz

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
var PRODUCTION = true;
!function(e){var t={};function r(o){if(t[o])return t[o].exports;var n=t[o]={i:o,l:!1,exports:{}};return e[o].call(n.exports,n,n.exports,r),n.l=!0,n.exports}r.m=e,r.c=t,r.d=function(e,t,o){r.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:o})},r.r=function(e){Object.defineProperty(e,"__esModule",{value:!0})},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="/",r(r.s=0)}([function(e,t,r){"use strict";var o=document,n=window.localStorage,c=/comic-bavel|comic-europa|comic-kairakuten|comic-x-eros|girls-form/,a=/\/(magazines|publishers|artists)\/([^\/]*)$/,i="fakku-experiments-followed",s=[].slice.call(o.querySelectorAll(".content-meta")),l=o.querySelector(".content-right");l&&s.push(l),s.forEach(function(e){var t=e.querySelector(".tags");if(t){var r=[],n=[],c=[],a=o.createDocumentFragment(),i=/hentai|uncensored|book|subscription|doujin|anime|ecchi|non-h|dubbed|subbed|censored|illustration|spread|interview|western/;[].slice.call(t.children).forEach(function(e){var t=e.textContent||"";i.test(t)?c.push([t,"subscribed"===e.className,!0]):"subscribed"===e.className?r.push([t,!0,!1]):n.push([t,!1,!1])}),r.sort(),n.sort(),c.sort(),r.concat(n).concat(c).forEach(function(e){var t=e[0],r=e[1],n=e[2];a.appendChild(function(e,t,r){var n=o.createElement("a");return n.href="/tags/"+e.replace(/\s/g,"-"),n.textContent=e,t&&(n.className="subscribed"),r&&(n.style.opacity="0.75",n.style.borderStyle="dashed"),n}(t,r,n)),a.appendChild(o.createTextNode(" "))}),function(e){for(;e.firstChild;)e.removeChild(e.firstChild)}(t),t.appendChild(a)}});var u=n.getItem(i),f=u?JSON.parse(u):[],h=location.href.match(a);if(h){var d=h[1],p=h[2].match(c),m=p?p[0]:h[2],b=new MutationObserver(function(e){var t=h[1],r=h[2].match(c),o=r?r[0]:h[2];e.forEach(function(e){var r=e.target.classList;r.contains("js-unsubscribe")?(y(t,o),s.forEach(S)):r.contains("js-subscribe")&&(w(t,o),s.forEach(S))})}),v=o.querySelector(".attribute-follow > a");b.observe(v,{attributes:!0}),v.classList.contains("js-unsubscribe")?y(d,m):v.classList.contains("js-subscribe")&&w(d,m)}function g(e,t){for(var r=0;r<f.length;++r){var o=f[r],n=o[0],c=o[1];if(n===e&&c===t)return r}return-1}function y(e,t){-1===g(e,t)&&(f.push([e,t]),n.setItem(i,JSON.stringify(f)),console.log("[FE] added to followed attributes:",e+"/"+t))}function w(e,t){g(e,t)>-1&&(f.splice(g(e,t),1),n.setItem(i,JSON.stringify(f)),console.log("[FE] removed from followed attributes:",e+"/"+t))}function S(e){[].slice.call(e.querySelectorAll(".row")).forEach(function(e){var t=e.querySelector(".row-left").textContent||"";if(t&&!t.match(/pages|tags|description/i)){var r=e.querySelectorAll(".row-right > a");[].slice.call(r).forEach(function(e){var t=e.href.match(a);if(t){var r=t[1],o=t[2].match(c);g(r,o?o[0]:t[2])>-1?(e.style.fontWeight="bold",e.style.color="#0A9D54"):(e.style.fontWeight="",e.style.color="")}})}})}s.forEach(S);var E="https://www.fakku.net/account/following"===location.href;function q(e){var t=o.createDocumentFragment(),r=o.createElement("li");return r.style.border="0",r.style.padding="0",r.innerHTML="<h2>"+e+"</h2>",t.appendChild(r),t}var C={publishers:q("Publishers"),magazines:q("Magazines"),tags:q("Tags"),artists:q("Artists")};if(E){var x=o.querySelector(".following-list"),O=[].slice.call(o.querySelectorAll(".following-list li"));b=new MutationObserver(function(e){e.forEach(function(e){[].slice.call(e.removedNodes).forEach(function(e){var t=e.querySelector("a"),r=t.href.match(a);if(r){var o=r[1],n=r[2].match(c),i=n?n[0]:r[2];w(o,i)}})})});for(var j in O.forEach(function(e){var t=e.querySelector("a").href.match(a);if(t){var r=t[1],o=t[2].match(c);y(r,o?o[0]:t[2]),C[r].appendChild(e)}else C.tags.appendChild(e)}),C)C[j].children.length>1&&x.appendChild(C[j]);b.observe(x,{childList:!0})}var N=o.querySelector("#content-collections"),k=o.querySelector("#chapters"),A=o.querySelector("#comments"),M=N||k;M&&A&&A.parentElement.insertBefore(M,A)}]);