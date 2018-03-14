import { $$, $, Maybe, cleanEl, debug, Queryable } from "./util";

const d = document;
const w = window;
export const ATTRIBUTE = /\/(magazines|publishers|artists|tags|events|circles|series|developers)\/([^\/]*)$/;
export const IS_MAGAZINE = /comic-bavel|comic-europa|comic-kairakuten|comic-x-eros|girls-form/;
const CATEGORY_TAG = /hentai|uncensored|book|subscription|doujin|anime|ecchi|non-h|dubbed|subbed|censored|illustration|spread|interview|western/;

export enum Color {
  Green = "#0A9D54",
  Turquoise = "#16a085",
  Blue = "#2980b9",
  Purple = "#8e44ad",
  Black = "#2c3e50",
  Yellow = "#f39c12",
  Orange = "#d35400",
  Red = "#9D0A0A",
  White = "#bdc3c7",
  Gray = "#7f8c8d",
  Null = ""
}

interface Attr {
  type: string;
  name: string;
  following: boolean;
  color: Color;
}
type Store = Attr[];
type SortableEl = [string, Element];
type SortableEls = SortableEl[];

function sortEls(a: SortableEl, b: SortableEl) {
  return a[0].toLowerCase() > b[0].toLowerCase() ? 1 : -1;
}

function parseAttr(match: RegExpMatchArray): [string, string] {
  const type = match[1];
  const magazine = match[2].match(IS_MAGAZINE);
  const name = magazine ? magazine[0] : match[2];
  return [type, name];
}

function createList(title: string) {
  const frag = d.createDocumentFragment();
  const li = d.createElement("li");
  li.id = `header-${title.toLowerCase()}`;
  li.style.border = "0";
  li.style.padding = "0";
  li.innerHTML = `<h2>${title}</h2>`;
  frag.appendChild(li);
  return frag;
}

interface FragMap {
  [key: string]: DocumentFragment;
}

type SortableFrag = [number, DocumentFragment];
type SortableFrags = SortableFrag[];

function sortFrags(a: SortableFrag, b: SortableFrag) {
  return a[0] - b[0];
}

const STORE_LOCATION = `${STORE_KEY}-followed`;

const FOLLOW_PAGE = "https://www.fakku.net/account/following";
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const UPDATE_INTERVAL = WEEK;

export class AttributeStore {
  store: Attr[] = [];
  queuedStoreUpdate: boolean = false;
  queuedStoreSave: boolean = false;
  queuedPageEnhance: boolean = false;
  queuedFollowingPageUpdate: boolean = false;
  queuedAttributePageUpdate: boolean = false;
  initialStoreLoad: boolean = true;
  initialPageEnhance: boolean = true;

  init = () => {
    this.storeLoad();
    w.addEventListener("storage", this.storeLoad);
    const match = location.href.match(ATTRIBUTE);
    if (match) {
      const [type, name] = parseAttr(match);
      this.attributePageInit(type, name);
    } else if (location.href === FOLLOW_PAGE) this.followingPageInit();
  };

  attributePageInit = (type: string, name: string) => {
    const el = $(".attribute-follow > a");
    if (el) {
      const mo = new MutationObserver(this.attributePageObserver);
      debug.log("Monitoring attribute page follow button");
      mo.observe(el, { attributes: true });
      if (el.classList.contains("js-unsubscribe")) {
        if (this.setAttr(type, name, true)) {
          this.queuePageEnhance();
        }
      } else if (el.classList.contains("js-subscribe")) {
        if (this.setAttr(type, name, false)) {
          this.queuePageEnhance();
        }
      }
    }
  };

  attributePageUpdate = () => {
    this.queuedAttributePageUpdate = false;
    const el = $(".attribute-follow > a");
    const match = location.href.match(ATTRIBUTE);
    if (el && match) {
      const [type, name] = parseAttr(match);
      const attr = this.getAttr(type, name);
      const icon = $("i", el)!;
      if (attr && attr.following === true) {
        el.classList.remove("js-subscribe");
        el.classList.remove("light");
        el.classList.add("js-unsubscribe");
        el.classList.add("pushed");
        icon.classList.remove("bt-bell");
        icon.classList.add("bt-check");
      } else {
        el.classList.remove("js-unsubscribe");
        el.classList.remove("pushed");
        el.classList.add("js-subscribe");
        el.classList.add("light");
        icon.classList.remove("bt-check");
        icon.classList.add("bt-bell");
      }
      this.queuePageEnhance();
    }
  };

  attributePageObserver = (ms: MutationRecord[]) => {
    ms.forEach(m => {
      const a = m.target as HTMLAnchorElement;
      const match = location.href.match(ATTRIBUTE);
      if (match) {
        const [type, name] = parseAttr(match);
        if (a.classList.contains("js-unsubscribe")) {
          if (this.setAttr(type, name, true)) {
            this.queuePageEnhance();
          }
        } else if (a.classList.contains("js-subscribe")) {
          if (this.setAttr(type, name, false)) {
            this.queuePageEnhance();
          }
        }
      }
    });
  };

  followingPageInit = () => {
    const lists: FragMap = {
      publishers: createList("Publishers"),
      developers: createList("Developers"),
      magazines: createList("Magazines"),
      series: createList("Series"),
      tags: createList("Tags"),
      artists: createList("Artists"),
      circles: createList("Circles"),
      events: createList("Events")
    };

    const order: SortableFrags = [];

    const followList = $(".following-list");
    if (followList) {
      this.followingPageParser(d, lists);
      for (let name in lists) {
        const list = lists[name];
        const len = list.children.length;
        if (len > 1) {
          order.push([len, list]);
        }
      }
      order.sort(sortFrags).forEach(frag => {
        followList.appendChild(frag[1]);
      });
      const mo = new MutationObserver(this.followingPageObserver);
      mo.observe(followList, { childList: true });
    }
  };

  followingPageParser = (doc: Queryable, lists?: FragMap) => {
    const list = $(".following-list", doc);
    if (list) {
      const follows = $$("li", list);
      const followed: string[] = [];
      follows.forEach(el => {
        const a = $("a", el);
        const match = a ? (a as HTMLAnchorElement).href.match(ATTRIBUTE) : null;
        if (match) {
          const [type, name] = parseAttr(match);
          followed.push(`${type}/${name}`);
          const attr = this.getAttr(type, name);
          const color = attr ? attr.color : Color.Null;
          this.setAttr(type, name, true, color);
          if (lists) lists[type].appendChild(el);
        } else {
          if (lists) {
            // remove headers on reruns
            list.removeChild(el);
          }
        }
      });
      this.store.forEach(attr => {
        if (followed.indexOf(`${attr.type}/${attr.name}`) === -1) {
          // we do not outright remove stored attributes in order
          // to keep their color in store if later refollowed
          this.setAttr(attr.type, attr.name, false);
        }
      });
      debug.log("Store updated");
      return true;
    } else {
      debug.error("Unable to parse following list");
      return false;
    }
  };

  followingPageUpdate = () => {
    this.queuedFollowingPageUpdate = false;
    const changes = {
      removed: [] as [string, string][],
      added: [] as [string, string][],
      removedTypes: {} as { [key: string]: true }
    };

    const store = this.store;
    const followList = $(".following-list")!;
    const entries: string[] = $$("li", followList)
      .filter(el => {
        return $("a", el);
      })
      .map(el => {
        const a = $("a", el)! as HTMLAnchorElement;
        const match = a.href.match(ATTRIBUTE)!;
        const [type, name] = parseAttr(match);
        const attr = this.getAttr(type, name);
        if (!attr || attr.following === false) {
          changes.removed.push([type, name]);
        }
        return type + "/" + name;
      });
    store.forEach(attr => {
      const isListed = entries.indexOf(`${attr.type}/${attr.name}`) === -1;
      if (attr.following === true && isListed) {
        changes.added.push([attr.type, attr.name]);
      }
    });

    if (changes.added.length > 0) {
      // if attributes added, reload
      location.reload();
    } else if (changes.removed.length > 0) {
      // if attributes removed, remove them from the list
      changes.removed.forEach(attr => {
        const [type, name] = attr;
        const el = $(`a[href="/${type}/${name}"]`, followList);
        changes.removedTypes[type] = true;
        if (el) {
          const li = el.parentNode!;
          followList.removeChild(li);
        }
      });

      // remove type header if entries in attribute type hit 0 after removals
      for (let type in changes.removedTypes) {
        const count = this.getAttrTypeFollowedCount(type);
        if (count === 0) {
          const el = $(`#header-${type}`, followList);
          if (el) {
            followList.removeChild(el);
          }
        }
      }
    }
  };

  followingPageObserver = (ms: MutationRecord[]) => {
    ms.forEach(m => {
      Array.prototype.slice.call(m.removedNodes).forEach((el: Element) => {
        const a = $("a", el) as HTMLAnchorElement;
        const match = a ? a.href.match(ATTRIBUTE) : "";
        if (match) {
          const [type, name] = parseAttr(match);
          this.setAttr(type, name, false);
          const count = this.getAttrTypeFollowedCount(type);
          if (count === 0) {
            debug.log("removing header for", type);
            const header = $(`#header-${type}`);
            if (header) {
              const parent = header.parentElement;
              if (parent) parent.removeChild(header);
            }
          }
        }
      });
    });
  };

  storeSave = () => {
    this.queuedStoreSave = false;
    localStorage.setItem(
      STORE_LOCATION,
      JSON.stringify({
        store: this.store,
        updated: Date.now()
      })
    );
    debug.log("Saved store to localStorage");
  };

  storeLoad = () => {
    const stored = localStorage.getItem(STORE_LOCATION);
    let update = true;
    if (stored) {
      debug.log("Loaded store from localStorage");
      const { store, updated } = JSON.parse(stored);
      const date = new Date(updated);
      const now = Date.now();
      this.store = store;
      if (date.getTime() >= now - UPDATE_INTERVAL) update = false;
    }
    if (update) {
      this.queueStoreUpdate();
    }
    if (!this.initialStoreLoad) {
      if (location.href === FOLLOW_PAGE) {
        this.queueFollowingPageUpdate();
      } else if (ATTRIBUTE.test(location.href)) {
        this.queueAttributePageUpdate();
      }
    } else {
      this.queuePageEnhance();
    }
    this.initialStoreLoad = false;
  };

  setAttr = (
    type: string,
    name: string,
    following: boolean,
    color = Color.Null
  ): boolean => {
    let save = true;
    const attr = this.getAttr(type, name);
    if (attr) {
      const followUpdate = attr.following !== following;
      const colorUpdate =
        attr.color === Color.Null ||
        (color !== Color.Null && attr.color !== color);
      if (!followUpdate && !colorUpdate) {
        // debug.log(`Attribute "${type}/${name}": Nothing changed:`, attr);
        save = false; // nothing changed, no need to save
      } else {
        if (attr.color === Color.Null && color === attr.color) {
          // Null is not a valid stored color
          color = Color.Green;
        }
        debug.log(
          `Attribute "${type}/${name}": ${
            followUpdate
              ? `Changed 'following': ${attr.following} -> ${following} | `
              : ""
          } ${colorUpdate ? `Changed 'color': ${attr.color} -> ${color}` : ""}`
        );
        if (followUpdate) attr.following = following;
        if (colorUpdate) attr.color = color;
      }
    } else {
      color = color === Color.Null ? Color.Green : color;
      debug.log(
        `Attribute "${type}/${name}": Added with 'following': ${following} and 'color': ${color}`
      );
      this.store.push({
        type,
        name,
        following,
        color
      });
    }
    if (save) this.queueStoreSave();
    return save;
  };

  getAttr = (type: string, name: string): Maybe<Attr> => {
    const store = this.store;
    for (let i = 0; i < store.length; ++i) {
      const attr = store[i];
      if (attr.type === type && attr.name === name) {
        return attr;
      }
    }
  };

  getAttrTypeFollowedCount = (type: string): number => {
    const store = this.store;
    let count = 0;
    for (let i = 0; i < store.length; ++i) {
      const attr = store[i];
      if (attr.type === type && attr.following === true) ++count;
    }
    return count;
  };

  storeUpdate = async () => {
    this.queuedStoreUpdate = false;
    debug.log("Updating store via Following page fetch");
    try {
      const res = await fetch(FOLLOW_PAGE, { credentials: "include" });
      const doc = d.createElement("html");
      doc.innerHTML = await res.text();
      const success = this.followingPageParser(doc);
      if (success) this.queuePageEnhance();
    } catch (e) {
      debug.error(e);
    }
  };

  queueStoreSave = () => {
    // debug.log("Queueing Store Save");
    if (!this.queuedStoreSave) {
      this.queuedStoreSave = true;
      requestAnimationFrame(this.storeSave);
    }
  };

  queueStoreUpdate = () => {
    debug.log("Queuing Store Update");
    if (!this.queuedStoreUpdate) {
      this.queuedStoreUpdate = true;
      requestAnimationFrame(this.storeUpdate);
    }
  };

  queuePageEnhance = () => {
    debug.log("Queuing Page Enhance");
    if (!this.queuedPageEnhance) {
      this.queuedPageEnhance = true;
      requestAnimationFrame(this.pageEnhance);
    }
  };

  queueFollowingPageUpdate = () => {
    debug.log("Queuing Following Page Update");
    if (!this.queuedFollowingPageUpdate) {
      this.queuedFollowingPageUpdate = true;
      requestAnimationFrame(this.followingPageUpdate);
    }
  };

  queueAttributePageUpdate = () => {
    debug.log("Queuing Attribute Page Update");
    if (!this.queuedAttributePageUpdate) {
      this.queuedAttributePageUpdate = true;
      requestAnimationFrame(this.attributePageUpdate);
    }
  };

  pageEnhance = () => {
    this.queuedPageEnhance = false;
    debug.log("Enhancing page");
    const metadata = $$(".content-meta");
    const metablock = $(".content-right");
    if (metablock) metadata.push(metablock);

    metadata.forEach((meta: Element) => {
      $$(".row").forEach(row => {
        const rowType = $(".row-left", row)!.textContent || "";
        // skip pagecount and description fields
        if (!rowType || rowType.match(/pages|description/i)) return;
        const attrs = $$(".row-right > a", row);
        // highlight followed attributes with defined colors
        attrs.forEach(el => {
          const a = el as HTMLAnchorElement;
          const match = a.href.match(ATTRIBUTE);
          if (match) {
            const [type, name] = parseAttr(match);
            const isTag = type === "tags";
            const attr = this.getAttr(type, name);
            if (isTag && this.initialPageEnhance) {
              const backendFollow = a.classList.contains("subscribed");
              const storedFollow = attr ? attr.following : false;
              if (backendFollow !== storedFollow) {
                // discrepancy detected between stored state and backend state,
                // so we do a full update of store based on the following page
                console.log("discrepancy update", type, name, backendFollow);
                this.setAttr(type, name, backendFollow);
                // this.queueStoreUpdate();
              }
            }
            if (attr && attr.following === true) {
              a.classList.add("subscribed");
              if (isTag) {
                a.style.backgroundColor = attr.color;
                a.style.borderColor = attr.color;
              } else {
                a.style.color = attr.color;
                a.style.fontWeight = "bold";
              }
            } else {
              a.classList.remove("subscribed");
              a.removeAttribute("style");
            }
            // additional styles for category tags
            if (isTag && CATEGORY_TAG.test(name)) {
              a.style.opacity = "0.75";
              a.style.borderStyle = "dashed";
            }
          }
        });
        this.initialPageEnhance = false;
        // sort tags into categories
        if (rowType === "Tags") {
          const tagList = $(".tags", row)!;
          const followed: SortableEls = [];
          const content: SortableEls = [];
          const back: SortableEls = [];
          attrs.forEach(el => {
            const a = el as HTMLAnchorElement;
            const match = a.href.match(ATTRIBUTE);
            if (match) {
              const type = "tags";
              const name = match[2];
              const isBack = CATEGORY_TAG.test(name);
              const attr = this.getAttr(type, name);
              if (isBack) {
                back.push([name, a]);
              } else if (attr && attr.following) {
                followed.push([name, a]);
              } else {
                content.push([name, a]);
              }
            }
          });
          cleanEl(tagList);
          followed.sort(sortEls);
          content.sort(sortEls);
          back.sort(sortEls);
          followed
            .concat(content)
            .concat(back)
            .forEach(tag => {
              tagList.appendChild(tag[1]);
              tagList.appendChild(d.createTextNode(" "));
            });
        }
      });
    });
  };
}
