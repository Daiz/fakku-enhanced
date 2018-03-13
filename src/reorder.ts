export default function reorderContentPage() {
  const d = document;

  const collection = d.querySelector("#content-collections");
  const chapters = d.querySelector("#chapters");
  const comments = d.querySelector("#comments");
  const content = collection || chapters;
  if (content && comments) {
    const parent = comments.parentElement;
    if (parent) parent.insertBefore(content, comments);
  }
}
