#!/usr/bin/env python3
"""Update critical CSS across all HTML files from a single source."""

import os
import re
from pathlib import Path


def main():
    root_dir = Path(__file__).parent
    critical_file = root_dir / "_critical.css"

    html_files = [
        root_dir / "index.html",
        root_dir / "hem" / "index.html",
        root_dir / "pris" / "index.html",
        root_dir / "om" / "index.html",
        root_dir / "kontakt" / "index.html",
        root_dir / "integritet" / "index.html",
    ]

    if not critical_file.exists():
        print(f"ERROR: {critical_file.name} not found!")
        return 1

    # Read critical CSS
    css_content = critical_file.read_text(encoding="utf-8")

    # Indent CSS for HTML
    indented_css = "\n".join(f"    {line}" for line in css_content.split("\n"))
    new_style_tag = f"    <style>\n{indented_css}\n    </style>"

    updated = 0
    skipped = 0

    for html_file in html_files:
        if not html_file.exists():
            print(f"✗ {html_file.name} - Not found")
            continue

        content = html_file.read_text(encoding="utf-8")

        # Replace style tag - more flexible regex
        new_content = re.sub(
            r"\s*<style>.*?</style>",
            "\n" + new_style_tag,
            content,
            count=1,
            flags=re.DOTALL,
        )

        if new_content != content:
            html_file.write_text(new_content, encoding="utf-8")
            print(f"✓ {html_file.name}")
            updated += 1
        else:
            print(f"⊘ {html_file.name} (already current)")
            skipped += 1

    print(f"\nDone! Updated: {updated} | Skipped: {skipped}")
    return 0


if __name__ == "__main__":
    exit(main())
