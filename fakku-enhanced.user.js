// ==UserScript==
// @name         Fakku Enhanced
// @author       Daiz
// @namespace    daiz
// @version      1.0.0
// @description  Better Fakku tag sorting and additional field highlighting.
// @match        https://www.fakku.net/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

/*
  TODO: Update tag listing status on follow
  TODO: window.postMessage across tabs to update attribute listing status
  TODO: Customizable highlight colors (editable on attribute page & following list)
*/

(function() {
  "use strict";
  const d = document;
  const w = window;
  const storage = w.localStorage;
  const location = d.location.href;
  const IS_MAGAZINE = /comic-bavel|comic-europa|comic-kairakuten|comic-x-eros|girls-form/;
  const IS_ATTRIBUTE = /\/(magazines|publishers|artists)\/([^\/]*)$/;
  const FOLLOW_PAGE = "https://www.fakku.net/account/following";
  const STORE_KEY = "fakku-enhanced-subscribed";
  const metadata = [].slice.call(d.querySelectorAll(".content-meta"));

  //#region Sort tags by followed first
  function sortTags(meta) {
    const tags = meta.querySelector(".tags");
    const subbed = [];
    const rest = [];
    const back = [];
    const frag = d.createDocumentFragment();
    const backTag = /hentai|uncensored|book|subscription|doujin/;

    function createTag(name, subscribed, back) {
      const a = d.createElement("a");
      a.href = "/tags/" + name.replace(/\s/g, "-");
      a.textContent = name;
      if (subscribed) a.className = "subscribed";
      if (back) {
        a.style.opacity = 0.75;
        a.style.borderStyle = "dashed";
      }
      return a;
    }

    function cleanEl(el) {
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
    }

    [].slice.call(tags.children).forEach(tag => {
      if (backTag.test(tag.textContent)) {
        back.push([tag.textContent, tag.className === "subscribed", true]);
      } else if (tag.className === "subscribed") {
        subbed.push([tag.textContent, true, false]);
      } else {
        rest.push([tag.textContent, false, false]);
      }
    });

    subbed.sort();
    rest.sort();
    back.sort();

    subbed
      .concat(rest)
      .concat(back)
      .forEach(([tag, subscribed, back]) => {
        frag.appendChild(createTag(tag, subscribed, back));
        frag.appendChild(d.createTextNode(" "));
      });

    cleanEl(tags);
    tags.appendChild(frag);
  }
  metadata.forEach(sortTags);
  //#endregion
  //#region Highlight followed artist/publisher/magazine attributes
  const stored = storage.getItem(STORE_KEY);
  const followed = stored ? JSON.parse(stored) : [];
  const match = location.match(IS_ATTRIBUTE);

  if (match) {
    const type = match[1];
    const magazine = match[2].match(IS_MAGAZINE);
    const attribute = magazine ? magazine[0] : match[2];
    const mo = new MutationObserver(observeFollowButton);
    const el = d.querySelector(".attribute-follow > a");
    mo.observe(el, { attributes: true });
    if (el.classList.contains("js-unsubscribe")) {
      addFollowed(type, attribute);
    } else if (el.classList.contains("js-subscribe")) {
      removeFollowed(type, attribute);
    }
  }

  function findFollowed(sType, sAttribute) {
    for (let i = 0; i < followed.length; ++i) {
      const [type, attribute] = followed[i];
      if (type === sType && attribute === sAttribute) {
        return i;
      }
    }
    return -1;
  }

  function addFollowed(type, attribute) {
    if (findFollowed(type, attribute) === -1) {
      followed.push([type, attribute]);
      storage.setItem(STORE_KEY, JSON.stringify(followed));
      console.log("[FE] added to followed attributes:", type, "/", attribute);
    }
  }

  function removeFollowed(type, attribute) {
    const index = findFollowed(type, attribute);
    if (index > -1) {
      followed.splice(findFollowed(type, attribute), 1);
      storage.setItem(STORE_KEY, JSON.stringify(followed));
      console.log(
        "[FE] removed from followed attributes:",
        type,
        "/",
        attribute
      );
    }
  }

  function observeFollowButton(ms) {
    const type = match[1];
    const magazine = match[2].match(IS_MAGAZINE);
    const attribute = magazine ? magazine[0] : match[2];
    ms.forEach(m => {
      const classes = m.target.classList;
      if (classes.contains("js-unsubscribe")) {
        addFollowed(type, attribute);
        metadata.forEach(highlightFollowed);
      } else if (classes.contains("js-subscribe")) {
        removeFollowed(type, attribute);
        metadata.forEach(highlightFollowed);
      }
    });
  }

  function highlightFollowed(meta) {
    [].slice.call(meta.querySelectorAll(".row")).forEach(row => {
      const rowType = row.querySelector(".row-left").textContent.toLowerCase();
      if (!rowType || rowType.match(/pages|tags|description/)) return;
      const attrs = row.querySelector(".row-right").children;
      [].slice.call(attrs).forEach(a => {
        const match = a.href.match(IS_ATTRIBUTE);
        if (match) {
          const type = match[1];
          const magazine = match[2].match(IS_MAGAZINE);
          const attribute = magazine ? magazine[0] : match[2];
          if (findFollowed(type, attribute) > -1) {
            a.style.fontWeight = "bold";
            a.style.color = "#0A9D54";
          } else {
            a.style.fontWeight = "";
            a.style.color = "";
          }
        }
      });
    });
  }
  metadata.forEach(highlightFollowed);
  //#endregion
  //#region Following page sorting by attribute type
  const followPage = location === FOLLOW_PAGE;
  function createList(title) {
    const frag = d.createDocumentFragment();
    const li = d.createElement("li");
    li.style.border = 0;
    li.style.padding = 0;
    li.innerHTML = `<h2>${title}</h2>`;
    frag.appendChild(li);
    return frag;
  }
  const lists = {
    publishers: createList("Publishers"),
    magazines: createList("Magazines"),
    artists: createList("Artists"),
    tags: createList("Tags"),
  };

  if (followPage) {
    const followList = d.querySelector(".following-list");
    const follows = [].slice.call(d.querySelectorAll(".following-list li"));
    const mo = new MutationObserver(observeFollowed);
    follows.forEach(follow => {
      const a = follow.querySelector("a");
      const match = a.href.match(IS_ATTRIBUTE);
      if (match) {
        const type = match[1];
        const magazine = match[2].match(IS_MAGAZINE);
        const attribute = magazine ? magazine[0] : match[2];
        addFollowed(type, attribute);
        lists[type].appendChild(follow);
      } else {
        lists.tags.appendChild(follow);
      }
    });
    for (let name in lists) {
      if (lists[name].children.length > 1) followList.appendChild(lists[name]);
    }
    mo.observe(followList, { childList: true });
  }

  function observeFollowed(ms) {
    ms.forEach(m => {
      [].slice.call(m.removedNodes).forEach(el => {
        const a = el.querySelector("a");
        const match = a.href.match(IS_ATTRIBUTE);
        if (match) {
          const type = match[1];
          const magazine = match[2].match(IS_MAGAZINE);
          const attribute = magazine ? magazine[0] : match[2];
          removeFollowed(type, attribute);
        }
      });
    });
  }
  //#endregion
})();
