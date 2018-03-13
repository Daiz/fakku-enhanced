const d = document;
const w = window;
const storage = w.localStorage;
const IS_MAGAZINE = /comic-bavel|comic-europa|comic-kairakuten|comic-x-eros|girls-form/;
const IS_ATTRIBUTE = /\/(magazines|publishers|artists)\/([^\/]*)$/;
const FOLLOW_PAGE = "https://www.fakku.net/account/following";
const STORE_KEY = "fakku-enhanced-subscribed";
const metadata = [].slice.call(d.querySelectorAll(".content-meta"));
const metablock = d.querySelector(".content-right");
if (metablock) {
  metadata.push(metablock);
}

//#region Sort tags by followed first
type Tag = [string, boolean, boolean];
function sortTags(meta: Element) {
  const tags = meta.querySelector(".tags");
  if (!tags) return;
  const subbed: Tag[] = [];
  const rest: Tag[] = [];
  const back: Tag[] = [];
  const frag = d.createDocumentFragment();
  const backTag = /hentai|uncensored|book|subscription|doujin|anime|ecchi|non-h|dubbed|subbed|censored|illustration|spread|interview|western/;

  function createTag(name: string, subscribed: boolean, back: boolean) {
    const a = d.createElement("a");
    a.href = "/tags/" + name.replace(/\s/g, "-");
    a.textContent = name;
    if (subscribed) a.className = "subscribed";
    if (back) {
      a.style.opacity = "0.75";
      a.style.borderStyle = "dashed";
    }
    return a;
  }

  function cleanEl(el: Element) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  [].slice.call(tags.children).forEach((tag: Element) => {
    const text = tag.textContent || "";
    if (backTag.test(text)) {
      back.push([text, tag.className === "subscribed", true]);
    } else if (tag.className === "subscribed") {
      subbed.push([text, true, false]);
    } else {
      rest.push([text, false, false]);
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
const match = location.href.match(IS_ATTRIBUTE);

if (match) {
  const type = match[1];
  const magazine = match[2].match(IS_MAGAZINE);
  const attribute = magazine ? magazine[0] : match[2];
  const mo = new MutationObserver(observeFollowButton);
  const el = d.querySelector(".attribute-follow > a")!;
  mo.observe(el, { attributes: true });
  if (el.classList.contains("js-unsubscribe")) {
    addFollowed(type, attribute);
  } else if (el.classList.contains("js-subscribe")) {
    removeFollowed(type, attribute);
  }
}

function findFollowed(sType: string, sAttribute: string) {
  for (let i = 0; i < followed.length; ++i) {
    const [type, attribute] = followed[i];
    if (type === sType && attribute === sAttribute) {
      return i;
    }
  }
  return -1;
}

function addFollowed(type: string, attribute: string) {
  if (findFollowed(type, attribute) === -1) {
    followed.push([type, attribute]);
    storage.setItem(STORE_KEY, JSON.stringify(followed));
    console.log("[FE] added to followed attributes:", `${type}/${attribute}`);
  }
}

function removeFollowed(type: string, attribute: string) {
  const index = findFollowed(type, attribute);
  if (index > -1) {
    followed.splice(findFollowed(type, attribute), 1);
    storage.setItem(STORE_KEY, JSON.stringify(followed));
    console.log(
      "[FE] removed from followed attributes:",
      `${type}/${attribute}`
    );
  }
}

function observeFollowButton(ms: MutationRecord[]) {
  const type = match![1];
  const magazine = match![2].match(IS_MAGAZINE);
  const attribute = magazine ? magazine[0] : match![2];
  ms.forEach(m => {
    const classes = (m.target as Element).classList;
    if (classes.contains("js-unsubscribe")) {
      addFollowed(type, attribute);
      metadata.forEach(highlightFollowed);
    } else if (classes.contains("js-subscribe")) {
      removeFollowed(type, attribute);
      metadata.forEach(highlightFollowed);
    }
  });
}

function highlightFollowed(meta: Element) {
  [].slice.call(meta.querySelectorAll(".row")).forEach((row: Element) => {
    const rowType = row.querySelector(".row-left")!.textContent || "";
    if (!rowType || rowType.match(/pages|tags|description/i)) return;
    const attrs = row.querySelectorAll(".row-right > a");
    [].slice.call(attrs).forEach((a: HTMLAnchorElement) => {
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
const followPage = location.href === FOLLOW_PAGE;
function createList(title: string) {
  const frag = d.createDocumentFragment();
  const li = d.createElement("li");
  li.style.border = "0";
  li.style.padding = "0";
  li.innerHTML = `<h2>${title}</h2>`;
  frag.appendChild(li);
  return frag;
}
interface FragMap {
  [key: string]: DocumentFragment;
}

const lists: FragMap = {
  publishers: createList("Publishers"),
  magazines: createList("Magazines"),
  tags: createList("Tags"),
  artists: createList("Artists")
};

if (followPage) {
  const followList = d.querySelector(".following-list")!;
  const follows = [].slice.call(d.querySelectorAll(".following-list li"));
  const mo = new MutationObserver(observeFollowed);
  follows.forEach((follow: Element) => {
    const a = follow.querySelector("a")!;
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

function observeFollowed(ms: MutationRecord[]) {
  ms.forEach(m => {
    [].slice.call(m.removedNodes).forEach((el: Element) => {
      const a = el.querySelector("a")!;
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
//#region Move collection/chapter listing above comments
const collection = d.querySelector("#content-collections");
const chapters = d.querySelector("#chapters");
const comments = d.querySelector("#comments");
const content = collection || chapters;
if (content && comments) {
  const parent = comments.parentElement!;
  parent.insertBefore(content, comments);
}
//#endregion
