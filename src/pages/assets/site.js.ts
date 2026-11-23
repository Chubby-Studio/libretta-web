// The script of every page: the cookie notice for Google Analytics, the language menu, and a notice
// offering the visitor's language when the page exists in it. Nothing redirects on its own, and
// Tag Manager loads only after the visitor accepts.
import type { APIRoute } from "astro";
import { LANGUAGES, texts } from "../../lib/i18n";
import { GTM_ID } from "../../lib/analytics";

export const GET: APIRoute = () => {
  const strings = Object.fromEntries(
    LANGUAGES.map((l) => {
      const t = texts(l.code);
      return [l.code, [l.hreflang, l.direction, t.notice_link, t.notice_close, t.cookie_text, t.cookie_accept, t.cookie_reject]];
    }),
  );
  const script = `(function () {
  var S = ${JSON.stringify(strings)};
  var GTM = ${JSON.stringify(GTM_ID)};
  var here = document.documentElement.getAttribute("data-code");
  function get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function set(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }
  function alternate(code) {
    var link = document.querySelector('link[rel="alternate"][hreflang="' + S[code][0] + '"]');
    return link ? new URL(link.href).pathname : null;
  }
  function box(code, extra) {
    var el = document.createElement("div");
    el.className = "notice" + (extra ? " " + extra : "");
    el.lang = S[code][0];
    el.dir = S[code][1];
    return el;
  }
  function button(label, onClick, className) {
    var b = document.createElement("button");
    b.type = "button";
    if (className) b.className = className;
    b.textContent = label;
    b.addEventListener("click", onClick);
    return b;
  }

  window.librettaPick = function (code) {
    set("lang", code);
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
  function languageNotice() {
    var want = get("lang");
    if (!want || !S[want]) {
      want = null;
      var tags = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"];
      for (var i = 0; i < tags.length && !want; i++) want = match(tags[i]);
    }
    if (!want || want === here) return;
    var href = alternate(want);
    if (!href) return;
    var el = box(want);
    var link = document.createElement("a");
    link.href = href + location.hash;
    link.textContent = S[want][2];
    link.addEventListener("click", function () { set("lang", want); });
    var close = button("\\u00D7", function () { set("lang", here); el.remove(); });
    close.setAttribute("aria-label", S[want][3]);
    el.appendChild(link);
    el.appendChild(close);
    document.body.appendChild(el);
  }

  function loadTagManager() {
    if (!GTM || window.librettaTagManager) return;
    window.librettaTagManager = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtm.js?id=" + GTM;
    document.head.appendChild(s);
  }
  function clearAnalyticsCookies() {
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (name.indexOf("_ga") === 0 || name.indexOf("_gid") === 0) {
        ["", "; domain=" + location.hostname, "; domain=." + location.hostname].forEach(function (d) {
          document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + d;
        });
      }
    });
  }
  function cookieNotice() {
    var old = document.querySelector(".notice");
    if (old) old.remove();
    var el = box(here, "consent");
    var text = document.createElement("p");
    text.textContent = S[here][4];
    var actions = document.createElement("div");
    actions.appendChild(button(S[here][6], function () {
      var was = get("consent");
      set("consent", "denied");
      el.remove();
      if (was === "granted") { clearAnalyticsCookies(); location.reload(); return; }
      languageNotice();
    }));
    actions.appendChild(button(S[here][5], function () {
      set("consent", "granted");
      el.remove();
      loadTagManager();
      languageNotice();
    }, "primary"));
    el.appendChild(text);
    el.appendChild(actions);
    document.body.appendChild(el);
  }
  window.librettaCookies = cookieNotice;

  var consent = get("consent");
  if (consent === "granted") loadTagManager();
  if (GTM && consent !== "granted" && consent !== "denied") cookieNotice();
  else languageNotice();
})();
`;
  return new Response(script, { headers: { "Content-Type": "text/javascript; charset=utf-8" } });
};
