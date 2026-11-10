#!/usr/bin/env python3
"""Builds every page of libretta.app from the texts in i18n/<code>.json.

English lives at / and /privacy/; every other language at /<code>/ and /<code>/privacy/.
Run from the repository root: python3 tools/build.py
"""

import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://libretta.app"

# URL code, HTML lang, name in its own language, direction. The order is the order of the menu.
LANGUAGES = [
    ("en", "en", "English", "ltr"),
    ("es", "es", "Español", "ltr"),
    ("ca", "ca", "Català", "ltr"),
    ("cs", "cs", "Čeština", "ltr"),
    ("da", "da", "Dansk", "ltr"),
    ("de", "de", "Deutsch", "ltr"),
    ("el", "el", "Ελληνικά", "ltr"),
    ("fi", "fi", "Suomi", "ltr"),
    ("fr", "fr", "Français", "ltr"),
    ("hr", "hr", "Hrvatski", "ltr"),
    ("hu", "hu", "Magyar", "ltr"),
    ("id", "id", "Bahasa Indonesia", "ltr"),
    ("it", "it", "Italiano", "ltr"),
    ("ms", "ms", "Bahasa Melayu", "ltr"),
    ("nl", "nl", "Nederlands", "ltr"),
    ("no", "nb", "Norsk", "ltr"),
    ("pl", "pl", "Polski", "ltr"),
    ("pt-br", "pt-BR", "Português (Brasil)", "ltr"),
    ("pt-pt", "pt-PT", "Português (Portugal)", "ltr"),
    ("ro", "ro", "Română", "ltr"),
    ("ru", "ru", "Русский", "ltr"),
    ("sk", "sk", "Slovenčina", "ltr"),
    ("sv", "sv", "Svenska", "ltr"),
    ("tr", "tr", "Türkçe", "ltr"),
    ("uk", "uk", "Українська", "ltr"),
    ("vi", "vi", "Tiếng Việt", "ltr"),
    ("ar", "ar", "العربية", "rtl"),
    ("he", "he", "עברית", "rtl"),
    ("hi", "hi", "हिन्दी", "ltr"),
    ("th", "th", "ไทย", "ltr"),
    ("ja", "ja", "日本語", "ltr"),
    ("ko", "ko", "한국어", "ltr"),
    ("zh-hans", "zh-Hans", "简体中文", "ltr"),
    ("zh-hant", "zh-Hant", "繁體中文", "ltr"),
]


def path(code, page):
    base = "/" if code == "en" else f"/{code}/"
    return base + ("privacy/" if page == "privacy" else "")


# Picks the visitor's language on the English pages, unless they chose one in the menu.
REDIRECT = """<script>
(function () {
  var codes = %CODES%;
  var here = document.documentElement.getAttribute("data-code");
  var page = document.documentElement.getAttribute("data-page");
  var chosen = null;
  try { chosen = localStorage.getItem("lang"); } catch (e) {}
  function match(tag) {
    tag = tag.toLowerCase();
    if (tag.indexOf("zh") === 0) return /hant|-tw|-hk|-mo/.test(tag) ? "zh-hant" : "zh-hans";
    if (tag.indexOf("pt") === 0) return tag === "pt-br" || tag === "pt" ? "pt-br" : "pt-pt";
    var primary = tag.split("-")[0];
    if (primary === "nb" || primary === "nn") primary = "no";
    return codes.indexOf(primary) >= 0 ? primary : null;
  }
  var want = chosen && codes.indexOf(chosen) >= 0 ? chosen : null;
  if (!want) {
    var tags = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"];
    for (var i = 0; i < tags.length && !want; i++) want = match(tags[i]);
  }
  if (here === "en" && want && want !== "en") {
    location.replace("/" + want + "/" + (page === "privacy" ? "privacy/" : "") + location.hash);
  }
  window.librettaPick = function (code) {
    try { localStorage.setItem("lang", code); } catch (e) {}
    location.href = (code === "en" ? "/" : "/" + code + "/") + (page === "privacy" ? "privacy/" : "");
  };
})();
</script>"""


def head(t, code, lang, direction, page, title, description):
    alternates = "\n".join(
        f'  <link rel="alternate" hreflang="{l}" href="{SITE}{path(c, page)}">' for c, l, _, _ in LANGUAGES
    )
    codes = json.dumps([c for c, _, _, _ in LANGUAGES])
    return f"""<!doctype html>
<html lang="{lang}" dir="{direction}" data-code="{code}" data-page="{page}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{description}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Libretta">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:url" content="{SITE}{path(code, page)}">
  <meta property="og:locale" content="{lang.replace("-", "_")}">
  <meta property="og:image" content="{SITE}/assets/og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Libretta">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="{SITE}{path(code, page)}">
{alternates}
  <link rel="alternate" hreflang="x-default" href="{SITE}{path("en", page)}">
  <link rel="icon" type="image/png" href="/assets/favicon.png">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <link rel="preload" href="/assets/instrument-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/style.css">
  {REDIRECT.replace("%CODES%", codes)}
</head>"""


def menu(code, t):
    options = "\n".join(
        f'        <option value="{c}" lang="{l}"{" selected" if c == code else ""}>{n}</option>'
        for c, l, n, _ in LANGUAGES
    )
    return f"""      <select class="lang" aria-label="{t["language_label"]}" onchange="librettaPick(this.value)">
{options}
      </select>"""


def wordmark_small():
    return (
        '<picture><source srcset="/assets/wordmark-pequeno-negativo.svg" media="(prefers-color-scheme: dark)">'
        '<img class="wm" src="/assets/wordmark-pequeno.svg" alt="Libretta" width="78" height="18"></picture>'
    )


def home(code, lang, direction, t):
    return f"""{head(t, code, lang, direction, "home", "Libretta", t["home_description"])}
<body>
  <div class="wrap">
    <main class="hero">
      <img class="icon" src="/assets/icon-512.png" alt="" width="120" height="120">
      <h1 class="wordmark">
        <picture>
          <source srcset="/assets/wordmark-negativo.svg" media="(prefers-color-scheme: dark)">
          <img src="/assets/wordmark.svg" alt="Libretta" width="320" height="74">
        </picture>
      </h1>
      <p class="lede">{t["home_lede"]}</p>
      <p class="label">{t["home_soon"]}</p>
    </main>

    <footer>
      <span>© 2026 Chubby Studio</span>
      <a href="{path(code, "privacy")}">{t["privacy_link"]}</a>
{menu(code, t)}
    </footer>
  </div>
</body>
</html>
"""


def privacy(code, lang, direction, t):
    summary = "\n".join(f"          <li>{item}</li>" for item in t["summary"])
    sections = "\n\n".join(f"      <h2>{s['h']}</h2>\n      {s['html']}" for s in t["sections"])
    return f"""{head(t, code, lang, direction, "privacy", f'{t["privacy_title"]} · Libretta', t["privacy_description"])}
<body>
  <div class="wrap">
    <header class="bar">
      <a class="home" href="{path(code, "home")}"><img src="/assets/icon-512.png" alt="" width="28" height="28">{wordmark_small()}</a>
    </header>

    <article>
      <p class="label">{t["updated"]}</p>
      <h1>{t["privacy_title"]}</h1>
      <p>{t["intro"]}</p>

      <div class="summary">
        <ul>
{summary}
        </ul>
      </div>

{sections}
    </article>

    <footer>
      <span>© 2026 Chubby Studio</span>
      <a href="{path(code, "home")}">{t["home_link"]}</a>
{menu(code, t)}
    </footer>
  </div>
</body>
</html>
"""


def write(rel, text):
    out = ROOT / rel.lstrip("/") / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(text, encoding="utf-8")


def main():
    global LANGUAGES
    LANGUAGES = [entry for entry in LANGUAGES if (ROOT / f"i18n/{entry[0]}.json").exists()]
    reference = json.loads((ROOT / "i18n/en.json").read_text(encoding="utf-8"))
    built = []
    for code, lang, _, direction in LANGUAGES:
        source = ROOT / f"i18n/{code}.json"
        if not source.exists():
            print(f"missing {source.name}, skipped")
            continue
        t = json.loads(source.read_text(encoding="utf-8"))
        missing = [k for k in reference if k not in t]
        if missing or len(t["sections"]) != len(reference["sections"]) or len(t["summary"]) != len(reference["summary"]):
            raise SystemExit(f"{code}: does not match en.json ({missing or 'section count'})")
        write(path(code, "home"), home(code, lang, direction, t))
        write(path(code, "privacy"), privacy(code, lang, direction, t))
        built.append(code)
    # The first Spanish policy URL keeps working.
    write("/es/privacidad/", '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=/es/privacy/">'
          '<link rel="canonical" href="https://libretta.app/es/privacy/"><a href="/es/privacy/">libretta.app/es/privacy</a>\n')
    print(f"built {len(built)} languages: {' '.join(built)}")


if __name__ == "__main__":
    main()
