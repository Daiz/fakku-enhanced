import { AttributeStore } from "./attributes";
import reorderContentPage from "./reorder";

const attributes = new AttributeStore();
document.addEventListener("DOMContentLoaded", () => {
  attributes.init();
  reorderContentPage();
});
