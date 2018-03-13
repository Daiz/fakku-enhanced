const d = document;
interface Queryable {
  querySelector: typeof d.querySelector;
  querySelectorAll: typeof d.querySelectorAll;
}

export function $(selector: string, root: Queryable = d) {
  return root.querySelector(selector);
}

export function $$(selector: string, root: Queryable = d): Element[] {
  return Array.prototype.slice.call(root.querySelectorAll(selector));
}

export function cleanEl(el: Element) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

export function log(...args: any[]) {
  console.log.apply(null, args);
}

const DEBUG = true;
export const debug = {
  log: (...args: any[]) => DEBUG && console.log.apply(console, args),
  error: (...args: any[]) => DEBUG && console.error.apply(console, args),
  trace: (...args: any[]) => DEBUG && console.trace.apply(console, args)
};

export type Maybe<T> = T | undefined;
