#!/usr/bin/env python3
"""Compares two builds of the site: the addresses they serve, and per page the SEO tags and the text.

Usage: python3 tools/compare.py <old site folder> <new site folder>
"""

import html.parser
import pathlib
import re
import sys


class Page(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.text, self.in_title, self.title, self.skip = set(), [], False, "", 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "meta" and ("property" in a or "name" in a):
            self.tags.add(("meta", a.get("property") or a.get("name"), a.get("content")))
        elif tag == "link" and a.get("rel") in ("canonical", "alternate") and "hreflang" in a or a.get("rel") == "canonical":
            self.tags.add(("link", a.get("rel"), a.get("hreflang"), a.get("href")))
        elif tag == "title":
            self.in_title = True
        elif tag == "html":
            self.tags.add(("html", a.get("lang"), a.get("dir")))
        if tag in ("script", "style", "select"):
            self.skip += 1

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag in ("script", "style", "select"):
            self.skip -= 1

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        elif not self.skip:
            self.text.append(data)


def read(path):
    p = Page()
    p.feed(path.read_text(encoding="utf-8"))
    p.tags.add(("title", p.title.strip()))
    return p.tags, re.sub(r"\s+", " ", " ".join(p.text)).strip()


def pages(root):
    return {str(p.relative_to(root).parent): p for p in root.rglob("index.html") if "node_modules" not in p.parts and "dist" not in p.relative_to(root).parts}


old, new = (pathlib.Path(a) for a in sys.argv[1:3])
a, b = pages(old), pages(new)
print(f"old {len(a)} pages, new {len(b)} pages")
for gone in sorted(set(a) - set(b)):
    print("MISSING in new:", gone)
for added in sorted(set(b) - set(a)):
    print("added in new:", added)
differences = 0
for key in sorted(set(a) & set(b)):
    (ta, xa), (tb, xb) = read(a[key]), read(b[key])
    for tag in sorted(ta - tb, key=str):
        print(f"{key}: lost {tag}")
        differences += 1
    for tag in sorted(tb - ta, key=str):
        print(f"{key}: gained {tag}")
        differences += 1
    if xa != xb:
        print(f"{key}: text differs\n  old: {xa[:300]}\n  new: {xb[:300]}")
        differences += 1
print(f"{differences} differences")
