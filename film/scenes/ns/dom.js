/* Shared DOM helpers for several chapters. Colours and type come from tokens. */
(function (root) {
  function el(tag, parent) {
    const node = document.createElement(tag);
    if (parent) parent.appendChild(node);
    return node;
  }

  function svg(tag, parent) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    if (parent) parent.appendChild(node);
    return node;
  }

  function place(node, x, y, w, h) {
    node.style.position = "absolute";
    node.style.left = x + "px";
    node.style.top = y + "px";
    if (w != null) node.style.width = w + "px";
    if (h != null) node.style.height = h + "px";
    return node;
  }

  function layer(parent) {
    const node = el("div", parent || document.body);
    node.className = "layer";
    return node;
  }

  root.NSDOM = { el: el, svg: svg, place: place, layer: layer };
})(typeof globalThis !== "undefined" ? globalThis : this);
