#!/usr/bin/env python3
"""Build: inline shared partials into static HTML pages (idempotent).

Each page marks shared regions with comment markers:
  <!--@header-->  ...  <!--/@header-->
  <!--@footer-->  ...  <!--/@footer-->
  <!--@pricing--> ...  <!--/@pricing-->

build.py replaces the content between each marker pair with the
current partial, so re-running it always refreshes from the partials.

Usage: python3 build.py   (run before committing / previewing)
"""
import os, re

SITE = os.path.dirname(os.path.abspath(__file__))
PAGES = ['index.html', 'services/index.html', 'instructors/index.html', 'contact/index.html', '404.html']

PARTIALS = {
    'header': '_header.html',
    'footer': '_footer.html',
    'pricing': '_pricing.html',
}

def load(name):
    with open(os.path.join(SITE, name)) as f:
        return f.read().strip()

partials = {k: load(v) for k, v in PARTIALS.items()}

# Regex to match a marker block: <!--@name--> ... <!--/@name--> (content optional)
pattern = re.compile(
    r'<!--@(?P<name>[a-z]+)-->\n(.*?)\n?<!--/@(?P=name)-->',
    re.DOTALL,
)

changed = 0
for page in PAGES:
    path = os.path.join(SITE, page)
    with open(path) as f:
        html = f.read()

    def repl(m):
        name = m.group('name')
        if name in partials:
            return '<!--@%s-->\n%s\n<!--/@%s-->' % (name, partials[name], name)
        return m.group(0)

    new_html = pattern.sub(repl, html)
    if new_html != html:
        changed += 1
        with open(path, 'w') as f:
            f.write(new_html)

print(f'Rebuilt {changed} page(s) (of {len(PAGES)} total)')
