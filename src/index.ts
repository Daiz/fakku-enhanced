import { AttributeStore } from "./attributes";
import reorderContentPage from "./reorder";

const attributes = new AttributeStore();
attributes.init();
reorderContentPage();
