#!/usr/bin/env python3
"""Build: inline shared partials into static HTML pages.

Usage: python3 build.py
  Reads _header.html, _footer.html, _pricing.html
  Inlines them into each page, writes final output.
  Run before committing to gh-pages.
"""
import os, re

SITE = os.path.dirname(os.path.abspath(__file__))
PAGES = ['index.html', 'services.html', 'instructors.html', 'contact.html', '404.html']

partials = {}
for name in ['_header.html', '_footer.html', '_pricing.html']:
    with open(os.path.join(SITE, name)) as f:
        partials[name] = f.read().strip()

id_map = {
    'site-header': '_header.html',
    'site-footer': '_footer.html',
    'site-pricing': '_pricing.html',
}

for page in PAGES:
    path = os.path.join(SITE, page)
    with open(path) as f:
        html = f.read()

    for el_id, partial_name in id_map.items():
        tag = f'<div id="{el_id}"></div>'
        if tag in html:
            html = html.replace(tag, partials[partial_name])

    with open(path, 'w') as f:
        f.write(html)

print(f'Built {len(PAGES)} pages with {len(partials)} partials')
