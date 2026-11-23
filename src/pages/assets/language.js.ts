// The language menu, and a notice offering the visitor's language when the page exists in it.
// Nothing redirects on its own: search engines and visitors always get the page they asked for.
import type { APIRoute } from "astro";
import { LANGUAGES, texts } from "../../lib/i18n";

export const GET: APIRoute = () => {
  const strings = Object.fromEntries(
    LANGUAGES.map((l) => [l.code, [l.hreflang, l.direction, texts(l.code).notice_link, texts(l.code).notice_close]]),
  );
  const script = `(function () {
  var S = ${JSON.stringify(strings)};
  var here = document.documentElement.getAttribute("data-code");
  function store(code) { try { localStorage.setItem("lang", code); } catch (e) {} }
  function alternate(code) {
    var link = document.querySelector('link[rel="alternate"][hreflang="' + S[code][0] + '"]');
    return link ? new URL(link.href).pathname : null;
  }
  window.librettaPick = function (code) {
    store(code);
    location.href = alternate(code) || (code === "en" ? "/" : "/" + code + "/");
  };
  function match(tag) {
    tag = tag.toLowerCase();
    if (tag.indexOf("zh") === 0) return /hant|-tw|-hk|-mo/.test(tag) ? "zh-hant" : "zh-hans";
    if (tag.indexOf("pt") === 0) return tag === "pt-br" || tag === "pt" ? "pt-br" : "pt-pt";
    var primary = tag.split("-")[0];
    if (primary === "nb" || primary === "nn") primary = "no";
    return S[primary] ? primary : null;
  }
  var want = null;
  try { want = localStorage.getItem("lang"); } catch (e) {}
  if (!want || !S[want]) {
    want = null;
    var tags = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"];
    for (var i = 0; i < tags.length && !want; i++) want = match(tags[i]);
  }
  if (!want || want === here) return;
  var href = alternate(want);
  if (!href) return;
  var box = document.createElement("div");
  box.className = "notice";
  box.lang = S[want][0];
  box.dir = S[want][1];
  var link = document.createElement("a");
  link.href = href + location.hash;
  link.textContent = S[want][2];
  link.addEventListener("click", function () { store(want); });
  var close = document.createElement("button");
  close.type = "button";
  close.setAttribute("aria-label", S[want][3]);
  close.textContent = "\\u00D7";
  close.addEventListener("click", function () { store(here); box.remove(); });
  box.appendChild(link);
  box.appendChild(close);
  document.body.appendChild(box);
})();
`;
  return new Response(script, { headers: { "Content-Type": "text/javascript; charset=utf-8" } });
};
